from __future__ import annotations

"""
Usage:
  python -m linkedin_agent.cli setup      — first-time setup wizard
  python -m linkedin_agent.cli run        — start the agent (runs continuously)
  python -m linkedin_agent.cli inbox      — run inbox audit now
  python -m linkedin_agent.cli jobs       — scan for jobs now
  python -m linkedin_agent.cli once       — run one full pipeline cycle
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
    elif cmd == "once":
        asyncio.run(_once())
    else:
        print(__doc__)


async def _setup() -> None:
    from pathlib import Path
    import json
    from rich.console import Console
    from rich.prompt import Prompt

    from linkedin_agent.database import init_db
    from linkedin_agent.database import async_session
    from linkedin_agent.models import User

    console = Console()
    console.print("\n[bold cyan]LinkedIn Agent — Setup[/bold cyan]\n")

    # Init DB
    console.print("Initialising database...")
    await init_db()
    console.print("[green]✓ Database ready[/green]")

    # Collect user info
    linkedin_url = Prompt.ask("Your LinkedIn profile URL")
    email = Prompt.ask("Your email (for records)")
    roles = Prompt.ask(
        "Target roles (comma-separated)",
        default="Clinical Research Associate,Clinical Data Manager,Clinical Trial Coordinator"
    )
    locations = Prompt.ask("Preferred locations (comma-separated, or 'Remote')", default="Remote")

    resume_text = ""
    resume_path = Prompt.ask("Path to your resume PDF (press Enter to skip)", default="")
    if resume_path:
        try:
            import pdfplumber
            with pdfplumber.open(resume_path) as pdf:
                resume_text = "\n".join(p.extract_text() or "" for p in pdf.pages)
            console.print(f"[green]✓ Resume loaded ({len(resume_text)} chars)[/green]")
        except Exception as e:
            console.print(f"[yellow]Could not read resume: {e}[/yellow]")

    # Save user
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
        user.target_locations = [l.strip() for l in locations.split(",")]
        user.target_industries = []
        user.resume_text = resume_text or None
        await session.commit()
    console.print("[green]✓ Profile saved[/green]")

    # Check cookies
    cookies_path = Path("secrets/linkedin_cookies.json")
    if not cookies_path.exists():
        console.print(
            "\n[yellow]LinkedIn cookies not found.[/yellow]\n"
            "Export your LinkedIn session cookies using the 'Cookie-Editor' browser extension:\n"
            "  1. Log into LinkedIn in Chrome/Firefox\n"
            "  2. Open Cookie-Editor extension → Export as JSON\n"
            f"  3. Save the file to: [bold]{cookies_path}[/bold]\n"
        )
    else:
        console.print("[green]✓ LinkedIn cookies found[/green]")

    console.print("\n[bold green]Setup complete![/bold green]")
    console.print("Start the agent with: [bold]python -m linkedin_agent.cli run[/bold]")


async def _run() -> None:
    import asyncio
    from rich.console import Console
    from linkedin_agent.agents.orchestrator import Orchestrator
    from linkedin_agent.scheduler.jobs import start_scheduler

    console = Console()
    console.print("[bold cyan]LinkedIn Agent — Starting[/bold cyan]")

    orch = Orchestrator()

    # Run once immediately on start
    console.print("Running initial pipeline...")
    await orch.run_pipeline(run_type="manual")

    # Then schedule
    start_scheduler(orch.run_pipeline)
    console.print("[green]Agent running. Press Ctrl+C to stop.[/green]")

    try:
        while True:
            await asyncio.sleep(60)
    except KeyboardInterrupt:
        from linkedin_agent.scheduler.jobs import stop_scheduler
        stop_scheduler()
        console.print("\n[yellow]Agent stopped.[/yellow]")


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
