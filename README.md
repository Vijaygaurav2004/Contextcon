# Signal — Deep Research for GTM

> Describe your ideal prospects in plain English. Get a sourced, ranked list of decision-makers with personalized outreach in under 60 seconds.

**Built at ContextCon 2026 — Crustdata × Y Combinator.**
Maps to YC Spring 2026 RFS: **AI-Native Agencies.**

---

## What it does

You type a prospecting thesis:

> *"Find me 10 VP Sales at Series A B2B SaaS companies in India with 50–200 employees who recently posted publicly about outbound pain. Draft a personalized opener for each."*

Signal does the rest:

1. Translates your English into structured Crustdata filters (OpenAI).
2. Queries `POST /company/search` for matching accounts.
3. Queries `POST /person/search` for decision-makers at those accounts.
4. Enriches the top candidates via `POST /person/enrich`.
5. Scans the open web via `POST /web/search/live` for recent signals per prospect.
6. Writes a 3-sentence personalized cold email grounded in the evidence.
7. Streams every step live so you can *watch* the agent think.

## Why it wins

- **Replaces a workflow every judge lives daily** — SDR prospecting, VC sourcing, recruiter research.
- **Crustdata is the moat.** Strip the APIs and the product dies.
- **AI-Native Agency in one screen.** Direct YC Spring 2026 RFS hit.
- **60-second demo.** One text box → ranked, sourced, ready-to-send list.

## Stack

- Next.js 15 (App Router) + TypeScript + Tailwind
- Vercel AI SDK + OpenAI (`gpt-4o-mini` for query compilation, `gpt-4o` for email drafting)
- Crustdata Company, Person, and Web APIs

## Local development

```bash
cp .env.local.example .env.local
# add your CRUSTDATA_API_KEY and OPENAI_API_KEY
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Architecture

```
User query
  → OpenAI query compiler (NL → filter JSON)
    → Crustdata /company/search
      → Crustdata /person/search
        → Crustdata /person/enrich
          → Crustdata /web/search/live
            → OpenAI email writer
              → Streamed result cards
```

Every API call streams into a live reasoning trace on the left. Results populate cards on the right with clickable source links and copy-to-clipboard emails.

## Loom demo script (≤3 minutes)

**Opening (15s):**
> "SDR prospecting burns 60% of a rep's week on finding the right people. YC's Spring 2026 RFS calls for AI-Native Agencies. Meet Signal — describe your ideal prospects in English, get a sourced, personalized outreach list in under a minute."

**Live run (90s):**
1. Click the first killer-query chip ("10 VP Sales or CROs at Series A B2B SaaS companies in India…").
2. Narrate the left rail as events stream in:
   - *"The agent compiles the brief into Crustdata filter JSON — note ISO-3 country codes, the `=<` / `=>` operators, the funding-stage filter."*
   - *"It queries `/company/search`, gets 40 accounts, then `/person/search` finds decision-makers."*
   - *"Top 10 get enriched through `/person/enrich`, and the web is scanned for fresh signals on each."*
3. Hover over a 99-score card and read the personalized opener aloud: *"This is grounded in a real article the agent pulled from the web 10 seconds ago."*

**The moat (30s):**
> "Three layers of moat: Crustdata's API suite is the only way to do this at this quality; the compiler prompt + fallback logic is Signal's IP; the agent trace is product — not infrastructure."

**Close (15s):**
> "AI-Native Agencies that automate sales research. This is the wedge. Thanks to Crustdata, Y Combinator, and ContextCon."

## Team

Built in 5 hours at ContextCon, Bengaluru, April 19 2026.
