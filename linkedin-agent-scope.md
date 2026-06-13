# LinkedIn Automation Agent — Project Scope of Work

**Version:** 1.0
**Date:** June 13, 2026
**Status:** Active Reference

---

## Vision

This project builds a LinkedIn AI agent that operates as a trusted delegate — not a bot. It researches people worth reaching out to, drafts messages that sound like the owner wrote them on a good day, waits for approval before touching anything that matters, and keeps a clean record of everything it does. The agent exists to extend the owner's attention and judgment, not to replace it. It will never send anything autonomously, never abuse LinkedIn's infrastructure, and never trade short-term volume for long-term account health. Success is measured in real conversations started, not messages sent.

---

## Table of Contents

1. [What This Is (and Is Not)](#1-what-this-is-and-is-not)
2. [Operating Modes](#2-operating-modes)
3. [Safety Design](#3-safety-design)
4. [What Makes This Different](#4-what-makes-this-different)
5. [Core Features — Shared](#5-core-features--shared)
   - [5.0 Inbox Intelligence — Existing Network Audit](#50-inbox-intelligence--existing-network-audit)
6. [Job Seeker Mode Features](#6-job-seeker-mode-features)
7. [Business Owner Mode Features](#7-business-owner-mode-features)
8. [Approval Workflow](#8-approval-workflow)
9. [Tone Engine](#9-tone-engine)
10. [Tech Stack](#10-tech-stack)
11. [Implementation Phases](#11-implementation-phases)
12. [Reporting](#12-reporting)
13. [Scope Gaps Addressed](#13-scope-gaps-addressed)
14. [What Success Looks Like at 90 Days](#14-what-success-looks-like-at-90-days)

---

## 1. What This Is (and Is Not)

### What it is

A Python-based automation agent that:

- Researches LinkedIn profiles and surfaces the highest-value people to connect with
- Drafts connection requests and messages that match the owner's personal writing style
- Holds all drafts in an approval queue — nothing sends without a human thumbs-up
- Runs on a randomized schedule to mimic natural human behavior
- Tracks every action and surfaces daily summaries so the owner stays informed without staying logged in

### What it is not

| Claim | Reality |
|---|---|
| Fully autonomous | Every outgoing message and connection request requires explicit owner approval |
| Spam tool | Hard daily limits are non-negotiable; the agent will refuse to exceed them |
| LinkedIn API user | No use of LinkedIn's official API (TOS constraints); all interaction is browser-based |
| Guaranteed results | LinkedIn outreach structurally yields 3–8% response rates; this tool optimizes within that ceiling |
| Set-and-forget | The owner stays in the loop via daily briefings and an approval queue |

---

## 2. Operating Modes

The agent supports two modes, switchable via a simple goal-state command. The owner sets their current objective and the agent reconfigures its targeting, research, and messaging accordingly.

### Job Seeker Mode

The agent acts as a proactive job search partner. It identifies decision-makers, recruiters, and connectors in the owner's target industry; monitors job listings for high-fit opportunities; and helps the owner build the right relationships before they need them.

### Business Owner Mode

The agent acts as a relationship development partner. It identifies ideal clients, monitors relationship temperature across the network, flags high-conversion moments (promotions, company changes, events), and supports a steady cadence of warm outreach.

### Mode Switching

The owner can issue a goal-state command at any time:

- `"hired"` — agent switches to Business Owner mode and pauses job-seeking logic
- `"back to search"` — agent returns to Job Seeker mode

The transition is logged, and in-flight follow-up sequences are preserved rather than abandoned mid-conversation.

---

## 3. Safety Design

Safety is not a feature — it is the foundation the entire system is built on. A flagged LinkedIn account is worse than no tool at all.

### Hard Daily Limits

| Action | Daily Limit | Notes |
|---|---|---|
| Connection requests sent | 5–8 | Randomized within range; never hits the same number twice in a week |
| Direct messages sent | 3–5 | Approved by owner before sending |
| Profile views | 15–25 | Spread across the active window; no bursts |
| Searches performed | 10–20 | Paced with random delays |
| Follow-up messages | Max 2 per person, ever | Only if no negative signal received |

### Timing Rules

- **Active window:** 7 AM – 9 PM local time only
- **Primary cadence:** Weekdays
- **Weekend behavior:** Reduced capacity (approximately 40% of weekday limits), skewed toward early-weekend timing
- **Run interval:** Randomized between 2.5 and 4.5 hours per cycle; never mechanical
- **Inter-action delay:** Random jitter between all actions within a run (12–45 seconds, occasionally longer)
- **No burst behavior:** Actions are spread across the full run window, not fired sequentially

### Anti-Detection Approach

- Playwright with playwright-stealth (fingerprint randomization, human-like mouse/scroll behavior)
- Session persistence across runs to mimic a real user staying logged in
- Browser fingerprint rotated periodically but not aggressively
- No headless mode in production — full browser instance

### Pause Triggers

The agent will pause outreach and alert the owner immediately if:

- A negative reply is detected (sentiment analysis flags hostility, discomfort, or a hard no)
- LinkedIn returns a rate-limit warning or unusual CAPTCHA
- Daily budget for any action category is exhausted
- An unexpected UI change is detected that could indicate a session issue

---

## 4. What Makes This Different

Most LinkedIn automation tools do one thing: send more messages faster. This is not that. Here is what actually differentiates this system.

### 1. Tone Matching That Sounds Human

The agent builds a style profile from the owner's existing LinkedIn content — posts, comments, messages — and uses it to draft outreach that reflects how the owner actually writes. Not "personalized templates." Not ChatGPT-default register. Every draft passes an authenticity check before the owner sees it. Owner edits feed back into the model, making drafts better over time.

### 2. Inbound + Outbound Strategy Together

Every other tool in this category is outbound-only. This system also generates weekly content topic suggestions designed to attract inbound attention from ideal clients or employers — so the owner's presence on LinkedIn is doing work between outreach cycles.

### 3. Warm Introduction Mapping

The single highest-converting LinkedIn move is an introduction through a mutual connection. This system finds the shortest path between the owner and any target contact, surfaces it explicitly, and suggests asking for an intro instead of going cold. No other tool does this well.

### 4. Safety-First Design

The account is protected, not used up. Hard limits, random timing, full audit trail, and a pause-on-warning system mean the owner's LinkedIn account is healthier after six months of using this tool than before.

### 5. Approval Workflow That Does Not Bury the Owner

The approval UX is designed for a person who has 90 seconds, not 15 minutes. Connection requests are batched into a single daily approval list. Follow-up drafts surface when they are timely, not as a constant stream. Maximum 3 drafts per run. Telegram-first delivery means the owner approves from their phone without opening a browser.

### 6. Honest Expectation Benchmarking

The dashboard shows the owner's response rate against industry benchmarks, tells them where they are in a normal adoption curve, and explains what "good" looks like for their specific context. This prevents churn from misaligned expectations — the most common reason people abandon outreach tools.

---

## 5. Core Features — Shared

These features are active in both modes.

### 5.0 Inbox Intelligence — Existing Network Audit

**This runs before anything else.** On first setup, and weekly thereafter, the agent reads through the owner's full LinkedIn message history to find opportunities that already exist — warm conversations that went cold, threads that need a reply, and contacts worth re-engaging. The best leads are already in the inbox.

#### What It Does

**Step 1: Full inbox scan**

The agent reads all existing LinkedIn message threads and classifies each one:

| Classification | Definition |
|---|---|
| Needs reply | The other person sent the last message and the owner hasn't responded |
| Warm — dormant | A positive conversation that ended with no clear follow-up; last message > 14 days ago |
| Cold — worth reviving | Connected but no meaningful conversation; contact is still relevant to current goals |
| Active | Conversation ongoing within the last 7 days — no action needed |
| Closed | Concluded naturally or contact is no longer relevant |

**Step 2: Opportunity scoring**

Each dormant or needs-reply thread is scored by:

- Recency of last interaction (more recent = easier to revive)
- Warmth of the conversation (did the other person engage positively? ask questions? offer help?)
- Relevance to current goals (does this person match the active mode's ICP or target role?)
- Whether there was an explicit next step mentioned that was never followed through

**Step 3: Surfacing to owner**

High-scoring threads surface in the morning briefing on day one, before any outbound activity begins:

```
Inbox audit complete — 4 conversations worth reviving

1. James Okafor, Engineering Manager @ Stripe
   Last message: 18 days ago — he asked about your availability for a call.
   You never replied.
   [View thread] [Draft reply]

2. Priya Nair, Recruiter @ Notion
   Last message: 32 days ago — she mentioned a role opening up in Q3.
   A follow-up now would be timely.
   [View thread] [Draft follow-up]

3. Tom Reyes, VP Product @ Linear
   Connected 6 weeks ago. No conversation started.
   He's active on LinkedIn and posted about hiring last week.
   [Draft intro message]

4. Aisha Mensah, Co-founder @ Daybreak
   Strong conversation 3 months ago about collaboration.
   No follow-up happened. She's still active.
   [Draft re-engagement]
```

The owner can act on these immediately or defer them to the queue. They are prioritized above outbound prospecting — a warm revival always outperforms a cold approach.

**Step 4: Ongoing monitoring**

After the initial audit, the agent monitors for:

- Any thread where the owner is the last sender and no reply has come in 7+ days (follow-up opportunity)
- Any thread where the other person sent a message the owner hasn't seen or replied to (needs reply alert — surfaces same day, not in the next morning briefing)

#### Why This Runs First

Cold outreach to strangers is the hardest form of networking. A person who already knows the owner, had a positive exchange, and is still active on LinkedIn is a far warmer lead. Reviving three dormant conversations typically produces better outcomes than sending thirty new connection requests. The inbox audit ensures the agent does the easy, high-value work before the hard, low-yield work.

---

### 5.1 Tone Engine

See Section 9 for full detail. Summary:

- Analyzes owner's existing LinkedIn content to extract style fingerprint
- Generates drafts using that fingerprint
- Runs authenticity check before surfacing to owner
- Improves from owner edits over time

### 5.2 Approval Gateway

See Section 8 for full detail. Summary:

- Telegram bot as primary interface (mobile-first)
- FastAPI web UI as fallback
- Owner can read, edit, and approve or reject inline
- Connection requests batched; messages surfaced individually with context

### 5.3 Activity Log

Every agent action is recorded with full context:

- Target person (name, title, company, LinkedIn URL)
- Why they were targeted (score, selection criteria)
- What was drafted, what was sent (with timestamps)
- Owner decision (approved / rejected / edited)
- Reply status and sentiment classification
- Any follow-up actions triggered

The log is queryable through the web UI and exported as CSV on request.

### 5.4 Safety Layer

- Daily budget tracker: per-action counters reset at midnight; hard refusal once limit is reached
- Random delay engine: no two consecutive actions are equally spaced
- Time-window enforcer: no actions outside 7 AM – 9 PM; verified against local time at run start
- Pause-on-warning: any anomaly triggers full stop and owner alert

### 5.5 Daily Morning Briefing

Delivered at 8 AM via Telegram:

- Who replied since yesterday (names, excerpts)
- Who accepted a connection request
- What is in the approval queue today
- Any pauses or alerts overnight
- One-line performance summary (e.g., "response rate this week: 5.1%")

Designed to take 60 seconds to read.

### 5.6 Connection Request Batch Approval

Once per day (typically morning), the agent compiles a proposed list of 5–8 connection requests. The owner receives a single Telegram message with the full list, each entry including:

- Name, title, company
- Why they were selected (one line)
- Whether a mutual connection exists
- One-tap approve / skip per entry

The owner can approve the whole batch at once or selectively. No connection request sends until an entry is explicitly approved.

### 5.7 Negative Reply Detection

After any message is sent and a reply is received:

- Sentiment classification runs immediately (Claude Haiku)
- Negative, hostile, or uncomfortable replies trigger: outreach paused to that person, flag added to their record (never contact again), owner alerted via Telegram with the reply text
- Neutral or positive replies surface in the next morning briefing or immediately if urgent

### 5.8 Response Rate Dashboard

Accessible via web UI:

| Metric | What It Shows |
|---|---|
| Overall response rate | Replies / messages sent, last 30 days |
| Connection acceptance rate | Accepted / requested, last 30 days |
| Industry benchmark | Typical range for outreach at this stage (3–8%) |
| Trend | Week-over-week direction |
| Top-performing message variants | If A/B testing is active |

Includes a plain-language interpretation ("Your rate is within the normal range. At this volume, expect 1–2 meaningful conversations per week.").

---

## 6. Job Seeker Mode Features

### 6.1 Prospect Research

The agent identifies people worth connecting with based on:

- Role relevance (decision-makers, hiring managers, connectors in target industry)
- Activity level (recently posted, commented, or engaged — signals they are reachable)
- Network proximity (second-degree connections weighted higher)
- Helpfulness signals (public history of responding to outreach, mentoring, referrals)

Each prospect gets a composite score. Only prospects above the threshold surface for approval.

### 6.2 Job Listing Monitor

Every run, the agent checks LinkedIn Jobs for new listings matching the owner's target roles. Each listing is scored by:

| Signal | Weight |
|---|---|
| Role fit to owner's profile | High |
| Time posted (fresher = higher) | High |
| Applicant count (lower = better odds) | Medium |
| Company size match | Medium |
| Company health signals | Modifier (see 6.7) |

High-fit listings surface in the morning briefing with urgency context ("Posted 4 hours ago, 12 applicants — apply today"). The owner can flag any listing as "pursue" to trigger the Application Co-pilot.

### 6.3 Warm Introduction Mapping

For any target person, the agent:

1. Identifies all mutual connections
2. Scores mutuals by: closeness to the owner, their relationship to the target, their perceived willingness to introduce
3. Surfaces the single best introduction path with a suggested ask draft

If a warm path exists, the agent defaults to recommending the introduction route over cold outreach. Cold outreach remains available but is labeled as the lower-conversion option.

### 6.4 Profile Gap Analysis

The agent compares the owner's current LinkedIn profile against a corpus of job descriptions in their target roles, then surfaces:

- Keywords present in most listings but absent from the owner's profile
- Skills and credentials that appear frequently in requirements
- Sections that are underdeveloped relative to competitive profiles
- Suggested edits (not auto-applied — owner-reviewed)

Runs weekly or on-demand when a new target role is added.

### 6.5 Application Co-pilot

When the owner flags a job listing as high-priority, the agent:

1. Drafts a tailored cover letter (tone-matched, not generic)
2. Identifies connections at that company who could refer or advocate
3. Drafts an introductory message to the most promising internal contact
4. Surfaces all three items for owner review in a single Telegram message

The owner approves, edits, or rejects each piece independently.

### 6.6 Follow-up Sequences

If a message is sent and no reply is received after 5–7 days:

- Agent drafts a polite, non-needy follow-up for owner approval
- Maximum 2 follow-ups per person, total, across the entire relationship
- Zero follow-ups if any negative signal was ever detected from that person
- Follow-up drafts surface in the morning briefing, not as a separate interrupt

### 6.7 Company Intel

Before surfacing any company to the owner (for outreach or job applications), the agent checks:

| Signal | Source | Flag Trigger |
|---|---|---|
| Headcount trend | LinkedIn company page | Shrinking >10% in 6 months |
| Recent funding | SerpAPI web search | None in 24 months (for growth-stage) |
| Job posting velocity | LinkedIn Jobs | Sudden drop in open roles |
| Recent news | SerpAPI web search | Layoffs, litigation, leadership exits |

If distress signals are present, the listing or outreach target is flagged with a warning rather than suppressed — the owner decides whether to proceed.

---

## 7. Business Owner Mode Features

All Job Seeker features apply in this mode except Profile Gap Analysis and Application Co-pilot, which are replaced by the features below.

### 7.1 Knowledge Base

The owner provides a one-time setup document containing:

- Business description and value proposition
- Ideal client profile (ICP): industry, company size, titles, pain points
- Services or products offered
- Topics the owner has expertise in
- Tone guidance or words/phrases to avoid

The agent uses this to contextualize all prospect scoring, message drafting, and content suggestions. The knowledge base can be updated at any time and takes effect on the next run.

### 7.2 Event Intelligence

When the agent detects that connections are attending a LinkedIn event:

1. Identifies which connections are attending
2. Pulls background on each relevant attendee (role, company, recent activity)
3. Generates a pre-event briefing for owner review including:
   - Who to prioritize meeting
   - Each person's background in two sentences
   - Three relevant conversation starters per priority contact
   - What to prepare or know before meeting them
   - One thing to avoid (e.g., a topic that could be sensitive)

The briefing is delivered 48 hours before the event.

### 7.3 Event ROI Scoring

Before recommending that the owner attend or engage with an event, the agent scores the event by:

- Decision-maker density relative to the owner's ICP
- Estimated reach (attendee count in target segment)
- Cost / time commitment
- Past engagement data if the event is recurring

Events above a threshold get a "recommended" flag with a brief rationale. Events below threshold are logged but not surfaced.

### 7.4 Inbound Content Strategy

Once per week, the agent generates 2–3 LinkedIn post topic suggestions designed to attract the owner's ideal clients. Each suggestion includes:

- The topic and a one-sentence rationale
- Why it is relevant to the ICP right now (based on industry signals)
- A suggested angle or hook
- Whether it plays to the owner's demonstrated expertise

The owner can approve a topic to trigger a full draft (tone-matched, owner-reviewed before posting), or skip it. No posts are published automatically.

### 7.5 Relationship Temperature Tracking

The agent classifies each connection by relationship temperature:

| Temperature | Definition |
|---|---|
| Hot | Engaged in the last 30 days (reply, comment, reaction, message) |
| Warm | Engaged in the last 90 days, or second-degree with strong mutual ties |
| Cold | No engagement in 90+ days, or never engaged |

Hot connections are prioritized for outreach. Cold connections surface as re-engagement opportunities when a relevant moment arises (their post, company news, shared event).

### 7.6 Title Change Alerts

When a connection changes jobs or gets promoted:

1. Alert fires within 24 hours of the change appearing on LinkedIn
2. Agent drafts a congratulations message with a relevant, non-generic hook
3. Owner approves and sends — or declines
4. These moments are flagged as high-conversion because the contact is visible, in a positive headspace, and often in a new role with new budget or new needs

This is one of the highest-return features in the system for Business Owner mode.

### 7.7 Competitor Intelligence Signals

When the agent detects that a connection is engaging with a competitor's content (commenting, sharing):

1. Logs the signal
2. Surfaces it as an outreach opportunity: "This connection recently engaged with [Competitor]. They may be in evaluation mode."
3. Optionally drafts a relevant message based on the owner's ICP and value proposition

The owner decides whether to act. The signal is never used to draft an aggressive counter-pitch — the tone remains relationship-first.

---

## 8. Approval Workflow

The approval system is designed around one constraint: the owner's time is limited, and approval fatigue kills usage.

### Primary Channel: Telegram Bot

The owner installs a private Telegram bot linked to the agent. All approval requests arrive there.

**Connection request batch (once daily):**

```
Morning approval — 6 prospects today

1. Sarah Chen, Head of Engineering @ Acme
   Why: Active in ML hiring, mutual: Jake Torres
   [Approve] [Skip]

2. Marcus Webb, VP Product @ Foundry
   Why: Posted about team expansion this week
   [Approve] [Skip]

... (up to 8 entries)

[Approve All] [Skip All]
```

**Message drafts (per draft, max 3 per run):**

```
Draft ready — reply to Marcus Webb

Marcus replied to your connection request and asked what you're working on.

---
Draft:
"Hey Marcus — thanks for connecting. I've been doing [X] for the last few years. Happy to share more if it's useful. What's your team focused on right now?"
---

[Send] [Edit] [Reject]
```

The `[Edit]` button opens an inline editor in Telegram so the owner can modify the draft before approving.

### Fallback Channel: Web UI

If Telegram is unavailable or the owner prefers a desktop view, the FastAPI web UI shows the same approval queue with richer context — full conversation history, prospect activity feed, company intel panel.

### Approval Rules

| Item | Approval Required | Batch or Individual |
|---|---|---|
| Connection requests | Yes, always | Daily batch |
| First messages | Yes, always | Individual |
| Follow-up messages | Yes, always | Individual |
| LinkedIn post drafts | Yes, always | Individual |
| Profile edits | Yes, always | Individual |
| Research and scoring | No | Runs silently |
| Morning briefing | No | Delivered automatically |

### Draft Limits Per Run

Maximum 3 drafts surface per agent run. This prevents the owner from opening Telegram to find 12 pending approvals and closing it without acting. Quality over volume, always.

---

## 9. Tone Engine

The tone engine is the core differentiator. Getting this right is what separates the agent from a mail-merge tool.

### Phase 1: Style Extraction

At setup, the agent ingests the owner's available LinkedIn content:

- Public posts (last 12 months)
- Comments on others' posts
- Any stored direct messages (owner provides voluntarily)

From this corpus, the engine extracts:

| Dimension | What It Measures |
|---|---|
| Sentence length distribution | Short and punchy vs. longer, more contextual |
| Vocabulary register | Formal, conversational, technical, casual |
| Punctuation patterns | Em-dashes, ellipses, serial commas, etc. |
| Opener patterns | How the owner starts messages and posts |
| Closer patterns | How they sign off |
| Topics and references | What they naturally talk about |
| Things they avoid | Detected by absence vs. industry baseline |

### Phase 2: Draft Generation

When generating a message, the agent:

1. Pulls the style profile
2. Constructs a prompt for Claude Sonnet that includes the profile, the target person's context, the outreach goal, and explicit constraints
3. Generates a draft
4. Scores it against the style profile (separate Claude call) for authenticity

### Phase 3: Authenticity Check

Before any draft reaches the owner, it runs through a checklist:

- Does it use hedging language the owner never uses? (e.g., "I hope this finds you well")
- Does it include generic openers that read as AI? (e.g., "I came across your profile and was impressed")
- Is the sentence rhythm consistent with the owner's writing?
- Does it make claims about the target that are not supported by research?
- Is the ask specific and natural, or vague and salesy?

A draft that fails authenticity goes back through generation with the failure reasons as additional constraints. If it fails twice, it is flagged for owner review with the authenticity issues disclosed.

### Phase 4: Style Model Improvement

Every time the owner edits a draft before approving:

- The original draft and the edited version are stored as a training pair
- Over time, the style model is updated to reflect the direction of edits
- After approximately 20–30 edits, draft quality measurably improves

### Cold Start Fallback

If the owner has fewer than 5 LinkedIn posts (insufficient corpus):

- An onboarding interview is triggered via Telegram
- 8–10 targeted questions about writing preferences, things they hate seeing, phrases they use
- Answers are used to construct an initial style profile
- The profile is replaced as real corpus accumulates

---

## 10. Tech Stack

| Component | Technology | Purpose |
|---|---|---|
| Language | Python 3.11+ | Core runtime |
| AI — primary | Claude Sonnet (claude-sonnet-4-6) | Drafting, prospect scoring, tone matching, authenticity checks |
| AI — classifier | Claude Haiku (claude-haiku-4-5) | Sentiment analysis, quick classification tasks |
| Browser automation | Playwright + playwright-stealth | LinkedIn interaction with anti-detection |
| Scheduling | APScheduler | Run scheduling with built-in jitter support |
| Database | PostgreSQL + SQLAlchemy + Alembic | Persistent storage; migration management |
| Approval notifications | python-telegram-bot | Telegram approval workflow |
| Web UI | FastAPI | Fallback approval interface, dashboard |
| Rate limiting / cache | Redis | Per-action counters, session cache |
| Configuration | pydantic-settings | Typed, validated config management |
| Open-web research | SerpAPI | Company intel, news signals |

---

## 11. Implementation Phases

### Phase 1 — Foundation (Weeks 1–3)

**Goal:** A safe, scheduled pipeline that can find and store LinkedIn profiles without triggering limits.

Deliverables:
- Project structure, environment, dependency management
- PostgreSQL schema with Alembic migrations (profiles, actions, drafts, settings, audit log)
- Playwright browser setup with playwright-stealth and session persistence
- LinkedIn session management (login, session health check, re-auth flow)
- Rate limiter: per-action daily counters backed by Redis, hard refusal on limit
- Safety layer: time-window enforcer, inter-action jitter engine, pause-on-warning handler
- APScheduler configuration with randomized 2.5–4.5 hour intervals
- Basic profile scraper: find, visit, and store a profile with full audit log entry

**Exit criteria:** Agent runs on schedule, finds profiles, stores them, and provably respects all safety limits under test conditions.

---

### Phase 2 — Intelligence (Weeks 4–6)

**Goal:** The agent can score prospects and generate drafts that pass an authenticity check.

Deliverables:
- Tone engine: style extraction pipeline, style profile schema, storage
- Cold-start onboarding interview (Telegram-based Q&A)
- Draft generation: Claude Sonnet integration with style-profile-aware prompts
- Authenticity checker: separate Claude call scoring drafts against style profile
- Prospect scoring algorithm: composite scorer using activity, relevance, proximity
- Company intel integration: SerpAPI calls for headcount trends, news, job velocity
- Prospecting pipeline: end-to-end from search → score → rank → queue

**Exit criteria:** Given a target role/industry, the agent surfaces ranked prospects and generates drafts that score above threshold on the authenticity check.

---

### Phase 3 — Approval Workflow (Weeks 7–8)

**Goal:** Full end-to-end loop from prospect to approved-and-sent message, with Telegram at the center.

Deliverables:
- Telegram bot: connection request batch approval, message draft approval, inline editing
- FastAPI web UI: approval queue, activity log viewer, basic dashboard
- Morning briefing: automated 8 AM Telegram summary
- Negative reply detection: sentiment analysis on all inbound messages, pause and alert on negative
- Activity log: queryable audit trail, CSV export
- End-to-end test: prospect → draft → Telegram approval → send → reply detected → log updated

**Exit criteria:** Owner can manage the full outreach loop from their phone. Everything is logged. Negative replies trigger an immediate pause.

---

### Phase 4 — Job Seeker Features (Weeks 9–10)

**Goal:** Job Seeker mode fully functional.

Deliverables:
- Job listing monitor: LinkedIn Jobs scraper with urgency scoring, morning briefing integration
- Follow-up sequence engine: 5–7 day timer, max 2 per person, negative-signal gate
- Warm introduction mapper: mutual connection finder, path scorer, intro-ask drafter
- Profile gap analyzer: keyword comparison engine, gap report, owner review UI
- Application co-pilot: cover letter drafter, internal contact identifier, batch approval card

**Exit criteria:** A job seeker can use the agent to monitor listings, prioritize applications, warm up connections, and send follow-ups without writing a single message from scratch.

---

### Phase 5 — Business Owner Features (Weeks 11–13)

**Goal:** Business Owner mode fully functional.

Deliverables:
- Knowledge base: setup flow, storage, integration with prospect scoring and draft generation
- Event intelligence: event detection, attendee research, pre-event briefing generator
- Event ROI scoring: decision-maker density calculator, recommendation engine
- Inbound content strategy: weekly topic suggestion pipeline, post draft flow
- Relationship temperature tracker: engagement classifier, temperature scores in prospect view
- Title change alert: LinkedIn change detection, congratulations draft flow
- Competitor engagement signals: engagement detection, outreach opportunity surfacing

**Exit criteria:** A business owner can manage their LinkedIn relationship pipeline, prepare for events, and run a steady cadence of inbound and outbound activity from the agent alone.

---

### Phase 6 — Refinement (Weeks 14+)

**Goal:** A self-improving system with measurable, honest outcomes.

Deliverables:
- Response rate dashboard with industry benchmark overlays
- Style model improvement loop: edit-pair ingestion, periodic model update
- A/B testing engine: variant tracking, statistical significance check, auto-promotion of winning variants
- Goal state management: mode switching, in-flight sequence preservation
- Performance tuning: latency, cost per run, reliability under long-running sessions

**Exit criteria:** The system surfaces its own performance data, improves drafts over time, and the owner can see whether the tool is working — in plain language.

---

## 12. Reporting

Four automated reports delivered without the owner asking for them.

### 12.1 Weekly Network Summary *(every Monday, 8 AM via Telegram + web)*

A one-page snapshot of the past 7 days:

| Metric | This Week | Last Week |
|---|---|---|
| Connection requests sent | 38 | 35 |
| Acceptance rate | 62% | 54% |
| Messages sent | 18 | 22 |
| Reply rate | 5.6% | 4.1% |
| Warm conversations started | 2 | 1 |
| Dormant threads revived | 1 | 3 |

Includes: top-performing message this week (the one with the highest reply rate), and one-line interpretation ("Acceptance rate improved — the targeting is getting sharper").

### 12.2 Monthly ROI Report *(first day of each month)*

Answers the question: is this actually working?

- Total actions taken by the agent
- Conversations that progressed past the first message
- Outcomes logged by owner (meeting booked, job application submitted, deal opened)
- Estimated time saved vs. doing this manually (based on avg. 8 min per manual outreach)
- Style model accuracy trend: are edits getting smaller and less frequent over time?

Owner logs outcomes manually via a simple Telegram command: `/outcome "met with James, call scheduled"`. These feed the ROI report.

### 12.3 Job Market Pulse *(job seeker mode — every Friday)*

A weekly radar of the hiring market in the owner's target roles:

- Companies actively posting roles this week (with headcount and urgency scores)
- New companies that appeared in the radar for the first time
- Companies that stopped posting (potential freeze — avoid)
- One "opportunity of the week": the single highest-fit, highest-urgency listing right now

### 12.4 Network Health Report *(monthly, same day as ROI report)*

The full temperature picture of the owner's network:

- Temperature breakdown: X hot, Y warm, Z cold (with trend vs last month)
- Who went cold this month (was warm, now cold — potential re-engagement)
- Who is warming up (cold last month, engaged this month)
- Top 5 connections to prioritize this week based on current temperature and relevance
- Any connections who changed jobs or got promoted that haven't been acknowledged yet

---

## 13. Scope Gaps Addressed

### 13.1 Multi-Target Support

The agent supports defining up to **two active target profiles simultaneously**:

- A job seeker can target two different role types (e.g., "Product Manager" and "Founding PM at a startup") with separate prospect pools and job listing filters
- A business owner can target two different ICPs (e.g., "Series A SaaS founders" and "HR Directors at mid-size companies")

Each target has its own scoring weights and message context. Drafts always disclose which target they were generated for.

### 13.2 Exports and Integrations

**CSV export:** The activity log, contact list, and job listings board are exportable as CSV at any time via the web UI.

**Google Sheets sync *(optional)*:** For business owners who manage pipeline in Sheets, the agent can write contact status updates (name, company, temperature, last contact date, next action) to a designated spreadsheet on a daily schedule.

**No CRM integration in v1.** This is out of scope until the core loop is validated.

---

## 14. What Success Looks Like at 90 Days

At 90 days, the agent has been running for roughly 12 weeks across Phases 1 through 5. The owner has approved several hundred connection requests and messages without writing most of them from scratch. Their response rate is somewhere in the 4–7% range — normal, and tracked honestly against benchmarks so they know it. The drafts sound like them, not like a tool, and the edit-pair feedback loop has tightened the style model to the point where most drafts need only minor adjustments before approval. No LinkedIn warnings have been received. The morning briefing takes less than a minute to read. The owner knows who is warm, who needs a follow-up, and who to prioritize this week — without logging into LinkedIn to figure it out. The tool has not replaced their judgment; it has made their judgment cheaper to exercise.

---

*This document is the authoritative reference for scope decisions. Features not described here require explicit scope addition. Ambiguities in implementation should default to the safer, more conservative interpretation.*
