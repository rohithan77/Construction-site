from __future__ import annotations

STYLE_EXTRACTION_PROMPT = """You are a writing style analyst. Analyze these LinkedIn posts and messages written by the same person and extract their writing style as JSON.

CORPUS:
{corpus}

Return ONLY a valid JSON object with exactly these fields:
{{
  "formality_level": <1-5, where 1=very casual, 5=very formal>,
  "avg_sentence_length": "<short|medium|long>",
  "emoji_usage": "<never|rare|moderate|frequent>",
  "humor_level": <1-5, where 1=no humor, 5=very playful>,
  "vocabulary_complexity": <1-5, where 1=simple, 5=complex>,
  "signature_phrases": ["phrase1", "phrase2"],
  "phrases_to_avoid": ["phrase1", "phrase2"],
  "typical_openings": ["opening1", "opening2"],
  "typical_closings": ["closing1", "closing2"],
  "paragraph_structure": "<short-punchy|medium|long-flowing>",
  "characteristic_description": "2-3 sentences describing their writing voice"
}}"""

MESSAGE_DRAFT_PROMPT = """You are ghostwriting a LinkedIn message for someone. Write EXACTLY in their voice.

THEIR WRITING STYLE:
{style_profile}

RECIPIENT CONTEXT:
Name: {recipient_name}
Title: {recipient_title}
Company: {recipient_company}
Why relevant: {relevance_reason}
Recent activity: {recent_activity}
Mutual connections: {mutual_connections}

MESSAGE INTENT: {intent}

STRICT RULES:
- Never say "I hope this message finds you well" or any variant
- Never say "I came across your profile and was impressed"
- Never use "synergy", "circle back", "touch base", "leverage", "value-add"
- No hollow compliments
- Write as if the person typed it personally on a busy day
- Match their exact formality level, sentence length, and opener style
- Keep it specific — reference something real about the recipient
- End with one clear, low-pressure ask

Write VERSION_A (shorter, 2-3 sentences) then VERSION_B (slightly longer, 1 short paragraph).
Label them clearly."""

AUTHENTICITY_CHECK_PROMPT = """Review this LinkedIn message. Does it read as genuinely human-written, or does it have AI tells?

MESSAGE:
{message}

AUTHOR'S STYLE PROFILE:
{style_profile}

Respond with exactly:
VERDICT: <HUMAN|BORDERLINE|AI>
ISSUES: <comma-separated list of specific phrases or patterns that feel off, or "none">
FIXED_VERSION: <rewritten version if BORDERLINE or AI, otherwise repeat the original>"""

INBOX_CLASSIFICATION_PROMPT = """Classify this LinkedIn conversation thread and assess its potential.

CONVERSATION (most recent messages, max 5):
{conversation_excerpt}

OTHER PERSON: {other_person_name}, {other_person_title} at {other_person_company}
DAYS SINCE LAST MESSAGE: {days_since_last}
OWNER SENT LAST MESSAGE: {owner_sent_last}

Classify the thread as one of:
- needs_reply: they sent the last message and owner hasn't responded
- warm_dormant: positive exchange that just stopped, worth reviving
- cold_worth_reviving: connected but barely spoke, person seems relevant
- active: ongoing conversation, no action needed
- closed: conversation ran its course, not worth reviving

Also rate: warmth (1-5), relevance_to_job_search (1-5)

Respond as JSON:
{{"classification": "...", "warmth": N, "relevance": N, "revival_hook": "one sentence about what to reference when reaching out again"}}"""

REVIVAL_MESSAGE_PROMPT = """Draft a message to revive a dormant LinkedIn conversation. Write in the owner's voice.

OWNER'S STYLE:
{style_profile}

OTHER PERSON: {other_person_name}, {other_person_title} at {other_person_company}
REVIVAL HOOK: {revival_hook}
LAST EXCHANGE SUMMARY: {last_exchange_summary}
DAYS SINCE LAST MESSAGE: {days_since_last}

Write a natural, warm revival message. It should:
- Reference something real from the last conversation or their recent activity
- Not mention how long it's been unless it's natural to do so
- Have one light ask or observation that invites a response
- Feel like the owner just thought of them, not like they're working through a list

Max 3 sentences."""

COMMENT_DRAFT_PROMPT = """You are ghostwriting a LinkedIn comment for someone. Write EXACTLY in their voice.

THEIR WRITING STYLE:
{style_profile}

POST BY {post_author}:
{post_text}

CONTEXT: The commenter ({commenter_name}) works in {commenter_context}.

STRICT RULES:
- Never say "Great post!", "Insightful!", "Love this!", "So true!", or any hollow opener
- Never start with the author's name
- Add real value — a specific observation, a related experience, a concrete question, or a data point
- Keep it under 3 sentences
- Match the commenter's exact formality and sentence rhythm
- Sound like something you'd text to a smart colleague, not a LinkedIn bot
- If you have nothing genuinely useful to add, output: SKIP

Write ONE comment only. No labels, no explanation."""

PROFILE_GAP_PROMPT = """You are a career coach analysing a LinkedIn profile against target job requirements.

CURRENT PROFILE:
{profile_text}

TARGET ROLES: {target_roles}
TARGET MARKET: {target_market}

SAMPLE JOB DESCRIPTIONS:
{job_descriptions}

Identify the top gaps between the profile and what employers in these roles are looking for.
Focus on:
1. Missing keywords and skills that appear repeatedly in job descriptions
2. Sections that are weak or absent (certifications, tools, methodologies)
3. Any phrasing that could be stronger or more specific

Respond as a JSON array of up to 6 gap items:
[
  {{
    "section": "<Profile section: Headline | Summary | Experience | Skills | Certifications>",
    "gap": "One sentence describing what is missing or weak",
    "suggestion": "Specific suggested text or addition (keep it authentic — written for this person, not generic)",
    "priority": "<high|medium|low>"
  }}
]"""

JOB_FIT_PROMPT = """Assess how well this job matches the candidate's profile.

JOB:
Title: {job_title}
Company: {company}
Description excerpt: {description_excerpt}

CANDIDATE:
Target roles: {target_roles}
Resume highlights: {resume_text}

Score fit from 0.0 to 1.0 and explain in one sentence why.
Respond as JSON: {{"fit_score": 0.X, "fit_explanation": "..."}}"""
