# Signal — Know When to Strike

> Every sales tool tells you **who** to email. That's a solved problem. Signal tells you **when**. That's the $10B unsolved problem — and Crustdata's data is the only way it's solvable.

**Built at ContextCon 2026 — Crustdata × Y Combinator.**  
Maps to YC Spring 2026 RFS: **AI-Native Agencies.**

---

## What it does

You maintain a watchlist of 50 target accounts + past champions. Signal watches them for **buying signals** that predict deal urgency:

| Signal | What fires it | Why it matters |
|---|---|---|
| 🟢 **Fresh Funding** | Company raised money <45 days ago | Close-win rate jumps 4× in the 60 days post-raise |
| 🟣 **New Executive** | Company hired VP+ in the past month | New leaders = fresh budget = clean slate |
| 🟠 **Growth Spike** | Headcount grew >15% in 6 months | Scaling pains = buying urgency |
| 🔵 **Champion Moved** | Past buyer changed companies | Instant trust + 10× close rate |

For every signal that fires, Signal drafts a **playbook-driven email** — the funding email is different from the exec-hire email is different from the champion re-activation.

The result: you know the exact moment to strike, with the perfect opener already written.

---

## Why it wins

**1. It's genuinely novel.**  
Every team at ContextCon will build some variant of "find me 10 VPs." Nobody will build a temporal agent that tells you *when* to strike. Memorability = first-place odds.

**2. Crustdata is the only way.**  
This product is literally impossible without:
- `/company/search` with `funding.last_fundraise_date` recency filters
- `/person/search` with `start_date` on current roles
- `/company/enrich` with `roles.growth_6m` delta tracking
- `/person/enrich` for champion-move detection

Strip out Crustdata and the product dies. That's the moat judges want to see.

**3. Direct YC RFS hit.**  
YC's Spring 2026 Request for Startups explicitly calls for **AI-Native Agencies**. Signal is the research layer of a sales agency, automated. Jon Xu will get it in 10 seconds.

**4. The demo is cinematic.**  
One button click → 4 signals fire → each has real evidence + a custom email. Way more memorable than "here's a list of prospects."

---

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind
- **Vercel AI SDK** + **OpenAI** (gpt-4o-mini for playbook emails)
- **Crustdata** Company, Person, and Web APIs

---

## Local development

```bash
cp .env.local.example .env.local
# add your CRUSTDATA_API_KEY and OPENAI_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click "Run Detection" and watch signals stream in.

---

## Architecture

```
User watchlist (companies + champions)
  → 4 parallel detectors:
     - detectFundingSignals (POST /company/search with date filter)
     - detectExecHireSignals (POST /person/search with start_date recency)
     - detectGrowthSignals (POST /company/search + roles.growth_6m)
     - detectChampionMoveSignals (POST /person/enrich + job-change detection)
  → For each signal:
     - Score by recency (99 → 60 over 45 days)
     - Map to playbook (funding | exec_hire | growth | champion_reactivation)
     - Generate playbook-specific email (OpenAI gpt-4o-mini)
  → Stream to vertical timeline UI with color-coded badges + copy-email buttons
```

Every signal includes:
- **Trigger headline** (e.g., "Uphold raised $50.6M Series Unknown 19 days ago")
- **Context** ("Budget cycles unlock immediately after fundraising")
- **Evidence bullets** (round type, amount, days since raise, total raised to date)
- **Playbook email** (subject + 3-sentence body ending with "— Gaurav")

---

## Loom demo script (≤3 minutes)

**Opening (15s):**
> "Outbound doesn't fail because you can't find contacts. It fails because you hit them on a random Tuesday when nothing is happening in their world. YC's Spring 2026 RFS calls for AI-Native Agencies. Meet Signal — it tells you the *exact moment* to strike."

**Live run (90s):**
1. Click "Run Detection" on the pre-loaded watchlist (20 companies + 3 champions).
2. Watch the status panel as detectors fire: *"Found 6 active signals in 8 seconds."*
3. As signals stream into the timeline, narrate:
   - *"Algo8 AI raised $2M corporate round 3 days ago — Signal already drafted the funding-playbook email: 'Congrats on the $2M raise. Budget cycles unlock fast. Can we chat?'"*
   - *"Uphold raised $50.6M 19 days ago — same playbook, different details."*
   - *"This champion moved from Stripe to Razorpay last month — Signal caught it and drafted the re-activation email."*
4. Click "Copy email" on one of the cards: *"One click, ready to send."*

**The moat (30s):**
> "Three layers of moat: (1) Crustdata's structured, time-series company + person data is the only way to build this. (2) The detector logic + playbook mapping is Signal's IP. (3) Temporal intelligence = the real product, not infrastructure."

**Close (15s):**
> "This is an AI-Native Agency — automating the research layer that every sales team burns 60% of their week on. Signal replaces 3 SDRs with 4 API calls. Thanks to Crustdata, Y Combinator, and ContextCon."

---

## Team

Built in 5 hours at ContextCon, Bengaluru, April 19 2026.

**Note:** This is v2, pivoted from a prospecting-list tool to a buying-signal agent after realizing the temporal play is 10× more differentiated. Both versions live in git history (`main` = v1 prospecting, `signal-v2` = buying signals).
