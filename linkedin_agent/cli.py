from __future__ import annotations

"""
Usage:
  python -m linkedin_agent.cli setup      — first-time setup wizard
  python -m linkedin_agent.cli run        — start the agent (runs continuously)
  python -m linkedin_agent.cli inbox      — run inbox audit now
  python -m linkedin_agent.cli jobs       — scan for jobs now
  python -m linkedin_agent.cli posts      — scan connections' posts, draft comments
  python -m linkedin_agent.cli prospects  — find new people to connect with
  python -m linkedin_agent.cli profile    — run profile gap analysis
  python -m linkedin_agent.cli once       — run one full pipeline cycle
  python -m linkedin_agent.cli restyle    — re-analyse your writing style
"""

import asyncio
import sys


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "help"

    if cmd == "setup":
        asyncio.run(_setup())
    elif cmd == "run":
        asyncio.run(_run())
    elif cmd == "inbox":
        asyncio.run(_inbox())
    elif cmd == "jobs":
        asyncio.run(_jobs())
    elif cmd == "posts":
        asyncio.run(_posts())
    elif cmd == "prospects":
        asyncio.run(_prospects())
    elif cmd == "profile":
        asyncio.run(_profile())
    elif cmd == "once":
        asyncio.run(_once())
    elif cmd == "restyle":
        asyncio.run(_restyle())
    else:
        print(__doc__)


# ── helpers ───────────────────────────────────────────────────────────────────

def _read_pdf(path: str) -> str:
    import pdfplumber
    with pdfplumber.open(path) as pdf:
        return "\n".join(p.extract_text() or "" for p in pdf.pages)


def _read_text(path: str) -> str:
    from pathlib import Path
    return Path(path).read_text(errors="replace")


def _load_document(path: str) -> str:
    """Load a PDF or text file and return its content."""
    p = path.strip()
    if not p:
        return ""
    if p.lower().endswith(".pdf"):
        return _read_pdf(p)
    return _read_text(p)


# ── style interview (cold-start fallback) ─────────────────────────────────────

STYLE_QUESTIONS = [
    ("opener_style",
     "How do you usually open a LinkedIn message to someone you haven't met?\n"
     "  e.g. 'Hey [name]', 'Hi [name]', 'Hello', something else"),
    ("closer_style",
     "How do you typically close/sign off a message?\n"
     "  e.g. 'Happy to chat', 'Let me know', 'Cheers', 'Best'"),
    ("formality",
     "How formal is your writing? (1 = very casual / 5 = very formal)\n"
     "  e.g. 2 = relaxed but professional"),
    ("sentence_length",
     "Do you prefer short punchy sentences, medium, or longer flowing ones?\n"
     "  Type: short / medium / long"),
    ("emoji_usage",
     "Do you use emojis in professional messages?\n"
     "  Type: never / rare / moderate / frequent"),
    ("phrases_to_avoid",
     "List any phrases or words you hate seeing in messages and would never write.\n"
     "  e.g. 'circle back, synergy, hope this finds you well' (comma-separated, or leave blank)"),
    ("signature_phrases",
     "Any phrases or words you naturally reach for?\n"
     "  e.g. 'happy to', 'worth a look', 'let me know' (comma-separated, or leave blank)"),
    ("humor",
     "Do you ever use light humour or banter in professional messages?\n"
     "  Type: never / occasionally / often"),
    ("sample_message",
     "Paste or type a real message you've sent to someone on LinkedIn, Slack, or email\n"
     "  (anything you actually wrote — even 1 sentence is fine, or press Enter to skip)"),
]


def _run_style_interview(console) -> dict:
    from rich.prompt import Prompt
    console.print(
        "\n[bold yellow]Style interview[/bold yellow] — "
        "I'll ask a few quick questions to learn how you write.\n"
        "This takes about 2 minutes and only runs once.\n"
    )
    answers = {}
    for key, question in STYLE_QUESTIONS:
        answer = Prompt.ask(f"  {question}", default="")
        answers[key] = answer.strip()

    # Build a style profile dict from answers
    formality_map = {"1": 1, "2": 2, "3": 3, "4": 4, "5": 5}
    try:
        formality = int(formality_map.get(answers.get("formality", "3"), 3))
    except Exception:
        formality = 3

    length_map = {"short": "short", "medium": "medium", "long": "long"}
    sentence_length = length_map.get(answers.get("sentence_length", "medium").lower(), "medium")

    emoji_map = {"never": "never", "rare": "rare", "moderate": "moderate", "frequent": "frequent"}
    emoji_usage = emoji_map.get(answers.get("emoji_usage", "rare").lower(), "rare")

    humor_map = {"never": 1, "occasionally": 2, "often": 4}
    humor_level = humor_map.get(answers.get("humor", "occasionally").lower(), 2)

    phrases_to_avoid = [p.strip() for p in answers.get("phrases_to_avoid", "").split(",") if p.strip()]
    signature_phrases = [p.strip() for p in answers.get("signature_phrases", "").split(",") if p.strip()]

    openers = [answers["opener_style"]] if answers.get("opener_style") else ["Hi"]
    closers = [answers["closer_style"]] if answers.get("closer_style") else ["Let me know"]

    sample = answers.get("sample_message", "")
    characteristic = (
        f"Writes at formality level {formality}/5. "
        f"Uses {sentence_length} sentences. "
        f"Emoji usage: {emoji_usage}. "
        + (f"Sample voice: '{sample[:120]}'" if sample else "")
    )

    return {
        "formality_level": formality,
        "avg_sentence_length": sentence_length,
        "emoji_usage": emoji_usage,
        "humor_level": humor_level,
        "vocabulary_complexity": 3,
        "signature_phrases": signature_phrases,
        "phrases_to_avoid": phrases_to_avoid or ["I hope this finds you well", "circle back", "synergy"],
        "typical_openings": openers,
        "typical_closings": closers,
        "paragraph_structure": sentence_length,
        "characteristic_description": characteristic,
    }


# ── style extraction ──────────────────────────────────────────────────────────

async def _extract_and_save_style(
    user, corpus: list[str], session, console, from_interview: bool = False
) -> None:
    import json
    from datetime import datetime, timezone
    from sqlalchemy import select
    from linkedin_agent.models import StyleProfile
    from linkedin_agent.tone.engine import ToneEngine

    if from_interview:
        # corpus is already a dict (profile from interview)
        profile_dict = corpus  # type: ignore[assignment]
        corpus_size = 0
    else:
        console.print(f"  Analysing {len(corpus)} writing samples...")
        tone = ToneEngine()
        profile_dict = tone.extract_style_profile(corpus)
        corpus_size = len(corpus)

    existing = await session.scalar(
        select(StyleProfile).where(StyleProfile.user_id == user.id)
    )
    if not existing:
        existing = StyleProfile(user_id=user.id)
        session.add(existing)

    existing.formality_level = profile_dict.get("formality_level")
    existing.avg_sentence_length = profile_dict.get("avg_sentence_length")
    existing.emoji_usage = profile_dict.get("emoji_usage")
    existing.humor_level = profile_dict.get("humor_level")
    existing.vocabulary_complexity = profile_dict.get("vocabulary_complexity")
    existing.signature_phrases = profile_dict.get("signature_phrases")
    existing.phrases_to_avoid = profile_dict.get("phrases_to_avoid")
    existing.typical_openings = profile_dict.get("typical_openings")
    existing.typical_closings = profile_dict.get("typical_closings")
    existing.paragraph_structure = profile_dict.get("paragraph_structure")
    existing.characteristic_description = profile_dict.get("characteristic_description")
    existing.corpus_size = corpus_size
    existing.is_active = True
    existing.refreshed_at = datetime.now(timezone.utc)
    await session.commit()
    console.print("[green]✓ Writing style profile saved[/green]")


# ── setup wizard ─────────────────────────────────────────────────────────────

async def _setup() -> None:
    from pathlib import Path
    from rich.console import Console
    from rich.prompt import Prompt, Confirm

    from linkedin_agent.database import init_db, async_session
    from linkedin_agent.models import User

    console = Console()
    console.print("\n[bold cyan]LinkedIn Agent — Setup[/bold cyan]\n")

    # ── 1. Database ───────────────────────────────────────────────────────────
    console.print("Initialising database...")
    await init_db()
    console.print("[green]✓ Database ready[/green]\n")

    # ── 2. Basic profile ──────────────────────────────────────────────────────
    console.print("[bold]Step 1 of 4 — Your profile[/bold]")
    linkedin_url = Prompt.ask("  LinkedIn profile URL")
    email = Prompt.ask("  Your email")
    roles = Prompt.ask(
        "  Target roles (comma-separated)",
        default="Clinical Research Associate,Clinical Data Manager,Clinical Trial Coordinator",
    )
    locations = Prompt.ask(
        "  Preferred locations (comma-separated, or 'Remote')", default="Remote"
    )
    countries = Prompt.ask(
        "  Target countries for outreach (comma-separated)",
        default="Australia",
    )

    # ── 3. Documents ──────────────────────────────────────────────────────────
    console.print("\n[bold]Step 2 of 4 — Documents[/bold]")
    console.print("  Upload your resume and any additional writing samples.")
    console.print("  Supported: PDF, .txt, .md — press Enter to skip any field.\n")

    resume_text = ""
    resume_path = Prompt.ask("  Resume PDF path", default="")
    if resume_path:
        try:
            resume_text = _load_document(resume_path)
            console.print(f"  [green]✓ Resume loaded ({len(resume_text):,} chars)[/green]")
        except Exception as e:
            console.print(f"  [yellow]Could not read resume: {e}[/yellow]")

    # Collect extra writing samples (cover letters, bios, anything)
    extra_corpus: list[str] = []
    console.print(
        "\n  Optional: add writing samples so the agent learns your voice faster.\n"
        "  These can be cover letters, bio drafts, emails — anything you wrote.\n"
        "  Enter one file path per prompt. Press Enter with no input when done.\n"
    )
    while True:
        extra_path = Prompt.ask("  Add writing sample (or Enter to continue)", default="")
        if not extra_path:
            break
        try:
            text = _load_document(extra_path)
            if text.strip():
                extra_corpus.append(text)
                console.print(f"  [green]✓ Added ({len(text):,} chars)[/green]")
        except Exception as e:
            console.print(f"  [yellow]Could not read file: {e}[/yellow]")

    # ── 4. Save user ──────────────────────────────────────────────────────────
    async with async_session() as session:
        from sqlalchemy import select
        user = await session.scalar(select(User).limit(1))
        if not user:
            user = User()
            session.add(user)
        user.linkedin_url = linkedin_url
        user.linkedin_profile_id = linkedin_url.rstrip("/").split("/")[-1]
        user.email = email
        user.mode = "job_seeker"
        user.target_roles = [r.strip() for r in roles.split(",")]
        user.target_locations = [loc.strip() for loc in locations.split(",")]
        user.target_countries = [c.strip() for c in countries.split(",")]
        user.target_industries = []
        user.resume_text = resume_text or None
        await session.commit()
    console.print("\n[green]✓ Profile saved[/green]")

    # ── 5. LinkedIn cookies ───────────────────────────────────────────────────
    console.print("\n[bold]Step 3 of 4 — LinkedIn session[/bold]")
    cookies_path = Path("secrets/linkedin_cookies.json")
    if cookies_path.exists():
        console.print("  [green]✓ LinkedIn cookies found[/green]")
    else:
        console.print(
            "  [yellow]LinkedIn cookies not found.[/yellow]\n\n"
            "  To connect your LinkedIn account:\n"
            "    1. Log into LinkedIn in Chrome or Firefox\n"
            "    2. Install the [bold]Cookie-Editor[/bold] browser extension\n"
            "    3. Click the extension → Export → Export as JSON\n"
            f"    4. Save the file to: [bold]{cookies_path.resolve()}[/bold]\n\n"
            "  Come back and run [bold]python -m linkedin_agent.cli restyle[/bold] "
            "after saving the cookies — the agent will then read your LinkedIn posts\n"
            "  to build your writing style profile automatically.\n"
        )

    # ── 6. Writing style ──────────────────────────────────────────────────────
    console.print("\n[bold]Step 4 of 4 — Writing style[/bold]")
    console.print(
        "  The agent needs to learn how you write so messages sound like you.\n"
        "  It will pull your LinkedIn posts automatically if cookies are ready.\n"
        "  Otherwise, a quick interview here builds the initial profile.\n"
    )

    async with async_session() as session:
        from sqlalchemy import select
        user = await session.scalar(select(User).limit(1))

        linkedin_corpus: list[str] = []

        if cookies_path.exists():
            console.print("  Connecting to LinkedIn to read your posts...")
            try:
                from linkedin_agent.scraper.linkedin_client import LinkedInClient
                client = LinkedInClient()
                linkedin_corpus = await client.get_own_posts(limit=50)
                console.print(f"  [green]✓ Found {len(linkedin_corpus)} LinkedIn posts[/green]")
            except Exception as e:
                console.print(f"  [yellow]Could not read LinkedIn posts: {e}[/yellow]")

        full_corpus = linkedin_corpus + extra_corpus

        if len(full_corpus) >= 3:
            await _extract_and_save_style(user, full_corpus, session, console)
        else:
            console.print(
                f"  [yellow]Only {len(full_corpus)} writing sample(s) found — "
                "not enough for automatic analysis.[/yellow]"
            )
            console.print("  Running style interview instead...\n")
            profile_dict = _run_style_interview(console)
            await _extract_and_save_style(user, profile_dict, session, console, from_interview=True)  # type: ignore[arg-type]

    # ── done ──────────────────────────────────────────────────────────────────
    console.print("\n[bold green]✓ Setup complete![/bold green]\n")
    console.print("What was collected:")
    console.print(f"  • Target roles: {roles}")
    console.print(f"  • Target countries: {countries}")
    console.print(f"  • Resume: {'loaded' if resume_text else 'not provided'}")
    console.print(f"  • Extra writing samples: {len(extra_corpus)}")
    console.print(f"  • LinkedIn posts: {len(linkedin_corpus) if cookies_path.exists() else 'pending (add cookies first)'}")
    console.print("\nStart the agent with: [bold]python -m linkedin_agent.cli run[/bold]")
    if not cookies_path.exists():
        console.print(
            "After saving LinkedIn cookies, run: [bold]python -m linkedin_agent.cli restyle[/bold] "
            "to refresh your style profile from your actual posts."
        )


# ── restyle (re-run style extraction any time) ────────────────────────────────

async def _restyle() -> None:
    from rich.console import Console
    from rich.prompt import Prompt

    from linkedin_agent.database import async_session
    from linkedin_agent.models import User

    console = Console()
    console.print("\n[bold cyan]LinkedIn Agent — Refresh writing style[/bold cyan]\n")

    async with async_session() as session:
        from sqlalchemy import select
        user = await session.scalar(select(User).where(User.is_active == True).limit(1))
        if not user:
            console.print("[red]No user found. Run setup first.[/red]")
            return

        linkedin_corpus: list[str] = []
        try:
            from linkedin_agent.scraper.linkedin_client import LinkedInClient
            console.print("Connecting to LinkedIn...")
            client = LinkedInClient()
            linkedin_corpus = await client.get_own_posts(limit=50)
            console.print(f"[green]✓ Found {len(linkedin_corpus)} posts[/green]")
        except Exception as e:
            console.print(f"[yellow]Could not read LinkedIn posts: {e}[/yellow]")

        # Optional extra samples
        extra_corpus: list[str] = []
        add_more = Prompt.ask("Add extra writing samples? (y/n)", default="n")
        if add_more.lower() == "y":
            while True:
                p = Prompt.ask("  File path (or Enter to finish)", default="")
                if not p:
                    break
                try:
                    text = _load_document(p)
                    if text.strip():
                        extra_corpus.append(text)
                        console.print(f"  [green]✓ Added ({len(text):,} chars)[/green]")
                except Exception as e:
                    console.print(f"  [yellow]Could not read: {e}[/yellow]")

        full_corpus = linkedin_corpus + extra_corpus

        if len(full_corpus) >= 3:
            await _extract_and_save_style(user, full_corpus, session, console)
        else:
            console.print("[yellow]Not enough samples — running style interview.[/yellow]\n")
            profile_dict = _run_style_interview(console)
            await _extract_and_save_style(user, profile_dict, session, console, from_interview=True)  # type: ignore[arg-type]


# ── run ───────────────────────────────────────────────────────────────────────

async def _run() -> None:
    import asyncio
    from rich.console import Console
    from linkedin_agent.agents.orchestrator import Orchestrator
    from linkedin_agent.scheduler.jobs import start_scheduler

    console = Console()
    console.print("[bold cyan]LinkedIn Agent — Starting[/bold cyan]")

    orch = Orchestrator()

    console.print("Running initial pipeline...")
    await orch.run_pipeline(run_type="manual")

    start_scheduler(orch.run_pipeline)
    console.print("[green]Agent running. Press Ctrl+C to stop.[/green]")

    try:
        while True:
            await asyncio.sleep(60)
    except KeyboardInterrupt:
        from linkedin_agent.scheduler.jobs import stop_scheduler
        stop_scheduler()
        console.print("\n[yellow]Agent stopped.[/yellow]")


async def _posts() -> None:
    from linkedin_agent.agents.orchestrator import Orchestrator
    await Orchestrator().run_post_scan_only()
    print("Post scan complete — comment drafts sent to Telegram.")


async def _prospects() -> None:
    from linkedin_agent.agents.orchestrator import Orchestrator
    await Orchestrator().run_prospect_scan_only()
    print("Prospect research complete — connection batch sent to Telegram.")


async def _profile() -> None:
    from linkedin_agent.agents.orchestrator import Orchestrator
    await Orchestrator().run_profile_analysis_only()
    print("Profile gap analysis complete — suggestions sent to Telegram.")


async def _inbox() -> None:
    from linkedin_agent.agents.orchestrator import Orchestrator
    await Orchestrator().run_inbox_audit_only()
    print("Inbox audit complete — check Telegram.")


async def _jobs() -> None:
    from linkedin_agent.agents.orchestrator import Orchestrator
    await Orchestrator().run_job_scan_only()
    print("Job scan complete — check Telegram.")


async def _once() -> None:
    from linkedin_agent.agents.orchestrator import Orchestrator
    await Orchestrator().run_pipeline(run_type="manual")
    print("Pipeline run complete — check Telegram.")


if __name__ == "__main__":
    main()
