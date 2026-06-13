from __future__ import annotations

import json
from datetime import datetime, timezone

import anthropic
import structlog

from linkedin_agent.config import settings
from linkedin_agent.tone.prompts import (
    AUTHENTICITY_CHECK_PROMPT,
    INBOX_CLASSIFICATION_PROMPT,
    JOB_FIT_PROMPT,
    MESSAGE_DRAFT_PROMPT,
    REVIVAL_MESSAGE_PROMPT,
    STYLE_EXTRACTION_PROMPT,
)

log = structlog.get_logger(__name__)


class ToneEngine:
    def __init__(self) -> None:
        self._client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

    def _call_claude(self, prompt: str, model: str | None = None, max_tokens: int = 1024) -> str:
        model = model or settings.primary_model
        response = self._client.messages.create(
            model=model,
            max_tokens=max_tokens,
            messages=[{"role": "user", "content": prompt}],
        )
        return response.content[0].text.strip()

    def extract_style_profile(self, corpus: list[str]) -> dict:
        """Analyze a corpus of the owner's writing and return a style profile dict."""
        if not corpus:
            return self._default_style_profile()

        corpus_text = "\n---\n".join(corpus[:80])
        prompt = STYLE_EXTRACTION_PROMPT.format(corpus=corpus_text)

        try:
            raw = self._call_claude(prompt, max_tokens=1000)
            # Strip markdown code fences if present
            raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(raw)
        except (json.JSONDecodeError, Exception) as e:
            log.error("style_extraction_failed", error=str(e))
            return self._default_style_profile()

    def draft_message(
        self,
        style_profile: dict,
        recipient_name: str,
        recipient_title: str,
        recipient_company: str,
        relevance_reason: str,
        intent: str,
        recent_activity: str = "No recent posts found",
        mutual_connections: str = "None",
    ) -> tuple[str, str]:
        """Generate VERSION_A and VERSION_B of an outreach message. Returns (version_a, version_b)."""
        prompt = MESSAGE_DRAFT_PROMPT.format(
            style_profile=json.dumps(style_profile, indent=2),
            recipient_name=recipient_name,
            recipient_title=recipient_title,
            recipient_company=recipient_company,
            relevance_reason=relevance_reason,
            recent_activity=recent_activity,
            mutual_connections=mutual_connections,
            intent=intent,
        )

        try:
            raw = self._call_claude(prompt, max_tokens=800)
            version_a, version_b = self._parse_versions(raw)
            version_a = self._authenticity_check(version_a, style_profile)
            version_b = self._authenticity_check(version_b, style_profile)
            return version_a, version_b
        except Exception as e:
            log.error("draft_message_failed", error=str(e))
            return "", ""

    def _authenticity_check(self, message: str, style_profile: dict) -> str:
        """Run authenticity check and return fixed version if needed."""
        prompt = AUTHENTICITY_CHECK_PROMPT.format(
            message=message,
            style_profile=json.dumps(style_profile, indent=2),
        )
        try:
            raw = self._call_claude(prompt, model=settings.classifier_model, max_tokens=600)
            lines = raw.strip().split("\n")
            verdict = ""
            fixed_version = message

            for i, line in enumerate(lines):
                if line.startswith("VERDICT:"):
                    verdict = line.replace("VERDICT:", "").strip()
                elif line.startswith("FIXED_VERSION:"):
                    fixed_version = "\n".join(lines[i:]).replace("FIXED_VERSION:", "").strip()

            if verdict in ("BORDERLINE", "AI"):
                log.info("authenticity_check_rewrote_message", verdict=verdict)
                return fixed_version
            return message
        except Exception as e:
            log.error("authenticity_check_failed", error=str(e))
            return message

    def classify_conversation(
        self,
        conversation_excerpt: str,
        other_person_name: str,
        other_person_title: str,
        other_person_company: str,
        days_since_last: int,
        owner_sent_last: bool,
    ) -> dict:
        """Classify a LinkedIn conversation thread. Returns dict with classification, warmth, relevance, revival_hook."""
        prompt = INBOX_CLASSIFICATION_PROMPT.format(
            conversation_excerpt=conversation_excerpt,
            other_person_name=other_person_name,
            other_person_title=other_person_title,
            other_person_company=other_person_company,
            days_since_last=days_since_last,
            owner_sent_last=str(owner_sent_last),
        )
        try:
            raw = self._call_claude(prompt, model=settings.classifier_model, max_tokens=300)
            raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            return json.loads(raw)
        except Exception as e:
            log.error("conversation_classification_failed", error=str(e))
            return {
                "classification": "closed",
                "warmth": 1,
                "relevance": 1,
                "revival_hook": "",
            }

    def draft_revival_message(
        self,
        style_profile: dict,
        other_person_name: str,
        other_person_title: str,
        other_person_company: str,
        revival_hook: str,
        last_exchange_summary: str,
        days_since_last: int,
    ) -> str:
        """Draft a message to revive a dormant conversation."""
        prompt = REVIVAL_MESSAGE_PROMPT.format(
            style_profile=json.dumps(style_profile, indent=2),
            other_person_name=other_person_name,
            other_person_title=other_person_title,
            other_person_company=other_person_company,
            revival_hook=revival_hook,
            last_exchange_summary=last_exchange_summary,
            days_since_last=days_since_last,
        )
        try:
            raw = self._call_claude(prompt, max_tokens=400)
            return self._authenticity_check(raw, style_profile)
        except Exception as e:
            log.error("revival_draft_failed", error=str(e))
            return ""

    def score_job_fit(self, job_title: str, company: str, description: str, user) -> tuple[float, str]:
        """Score how well a job matches the user. Returns (fit_score, explanation)."""
        prompt = JOB_FIT_PROMPT.format(
            job_title=job_title,
            company=company,
            description_excerpt=description[:1500] if description else "Not available",
            target_roles=", ".join(user.target_roles or []),
            resume_text=user.resume_text[:2000] if user.resume_text else "Not provided",
        )
        try:
            raw = self._call_claude(prompt, model=settings.classifier_model, max_tokens=200)
            raw = raw.strip().removeprefix("```json").removeprefix("```").removesuffix("```").strip()
            result = json.loads(raw)
            return float(result.get("fit_score", 0.5)), result.get("fit_explanation", "")
        except Exception as e:
            log.error("job_fit_scoring_failed", error=str(e))
            return 0.5, "Scoring unavailable"

    def _parse_versions(self, raw: str) -> tuple[str, str]:
        """Parse VERSION_A and VERSION_B from Claude's response."""
        version_a = ""
        version_b = ""
        current = None
        lines_a = []
        lines_b = []

        for line in raw.split("\n"):
            if "VERSION_A" in line:
                current = "a"
            elif "VERSION_B" in line:
                current = "b"
            elif current == "a":
                lines_a.append(line)
            elif current == "b":
                lines_b.append(line)

        version_a = "\n".join(lines_a).strip()
        version_b = "\n".join(lines_b).strip()

        if not version_a and raw:
            version_a = raw[:500].strip()
        return version_a, version_b

    def _default_style_profile(self) -> dict:
        return {
            "formality_level": 3,
            "avg_sentence_length": "medium",
            "emoji_usage": "rare",
            "humor_level": 2,
            "vocabulary_complexity": 3,
            "signature_phrases": [],
            "phrases_to_avoid": ["I hope this finds you well", "circle back", "synergy"],
            "typical_openings": ["Hey", "Hi"],
            "typical_closings": ["Happy to chat.", "Would love to connect."],
            "paragraph_structure": "medium",
            "characteristic_description": "Professional but approachable. Keeps it concise.",
        }
