<div align="center">

# ⚡ Signal — AI Sales Intelligence

### Know the exact moment to strike

**[Live Demo](https://contextcon-eight.vercel.app/)** • Built at ContextCon 2026 • Crustdata × Y Combinator

*Maps to YC Spring 2026 RFS: **AI-Native Agencies***

---

## 🎥 Demo Video

### Watch the 3-minute demo:

<!-- 👇 PASTE YOUR LOOM EMBED CODE HERE 👇 -->
<!-- Get embed code from Loom: Share → Embed → Copy code -->

**[📹 Watch on Loom](https://www.loom.com/share/b40464ba63774d3cbfb606adc0c849f1)**

<!-- Example Loom embed (replace with your actual embed code):
<div style="position: relative; padding-bottom: 56.25%; height: 0;">
  <iframe src="https://www.loom.com/embed/YOUR_VIDEO_ID" 
    frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen 
    style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
  </iframe>
</div>
-->

**What you'll see:**
- ✅ Prospect Hunter finding ideal prospects in 30 seconds
- ✅ Signal Scanner detecting buying signals in real-time
- ✅ AI-generated playbook emails for each signal
- ✅ Live API streaming with latency metrics
- ✅ Color-coded timeline with evidence bullets

---

</div>

## 🎯 The Problem

Outbound doesn't fail because you can't find contacts. It fails because you hit them on a **random Tuesday when nothing is happening in their world**.

Every sales tool tells you **who** to email. Signal tells you **when**.

---

## 💡 What Signal Does

Signal watches your target accounts for **buying signals** that predict deal urgency:

| Signal | What triggers it | Why it matters |
|--------|-----------------|----------------|
| 🟢 **Fresh Funding** | Company raised money <45 days ago | Close-win rate jumps 4× in 60 days post-raise |
| 🟣 **New Executive** | VP+ hire in the past month | New leaders = fresh budget = clean slate |
| 🟠 **Growth Spike** | Headcount grew >15% in 6 months | Scaling pains = urgent buying needs |
| 🔵 **Champion Moved** | Past buyer changed companies | Instant trust + 10× close rate |

**For each signal:**
- ✅ Real-time detection using Crustdata's time-series B2B data
- ✅ Scored 60-99 based on recency and urgency
- ✅ Playbook-driven email auto-drafted by AI
- ✅ Evidence bullets with source links
- ✅ One-click copy to send

---

## 🎬 Live Demo

**👉 [https://contextcon-eight.vercel.app/](https://contextcon-eight.vercel.app/)**

Try it now:
1. Click **"Signal Scanner"** tab
2. Hit **"Run Detection"** 
3. Watch signals stream in within 10 seconds
4. Click **"Copy email"** on any signal card

---

## 🏆 Why This Wins

### 1. Genuinely Novel
Every team will build "find me 10 VPs." We built a **temporal intelligence agent** that tells you *when* to strike. Nobody else is thinking this way.

### 2. Crustdata is the Moat
This product is **literally impossible** without:
- `/company/search` with `funding.last_fundraise_date` recency filters
- `/person/search` with `start_date` on current roles  
- `/company/enrich` with `roles.growth_6m` delta tracking
- `/person/enrich` for champion-move detection

Strip out Crustdata → product dies. That's the defensibility judges want to see.

### 3. Direct YC RFS Hit
YC's Spring 2026 Request for Startups explicitly calls for **AI-Native Agencies**. Signal *is* the research layer of a sales agency, automated.

### 4. Cinematic Demo
One button click → 6 signals fire → each with real evidence + custom email.  
Way more memorable than "here's a list."

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15 (App Router) + TypeScript + Tailwind CSS
- **AI:** Vercel AI SDK + OpenAI (gpt-4o-mini for playbook emails)
- **Data:** Crustdata Company, Person, and Web APIs
- **Deployment:** Vercel

---

## 🚀 Local Development

```bash
# Clone the repo
git clone <your-repo-url>
cd Contextcon

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Add your CRUSTDATA_API_KEY and OPENAI_API_KEY

# Run dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 🏗️ Architecture

```
User watchlist (20 companies + 3 past champions)
    ↓
4 parallel signal detectors:
    • detectFundingSignals    → POST /company/search (date filters)
    • detectExecHireSignals   → POST /person/search (start_date recency)
    • detectGrowthSignals     → POST /company/search (roles.growth_6m)
    • detectChampionMoves     → POST /person/enrich (job changes)
    ↓
For each signal:
    • Score by recency (99 → 60 over 45 days)
    • Map to playbook (funding | exec_hire | growth | champion_reactivation)
    • Generate custom email (OpenAI gpt-4o-mini)
    ↓
Stream to vertical timeline UI with:
    • Color-coded badges (🟢🟣🟠🔵)
    • Evidence bullets with sources
    • One-click copy-to-clipboard emails
```

---

## 📊 Key Metrics

- **Signal detection:** 6-10 active signals from 20-company watchlist
- **Time to first signal:** ~8 seconds
- **Email generation:** 100% playbook-driven, context-aware
- **API calls:** 4 parallel detectors → 1 batch enrichment → N email generations
- **UI polish:** 9.5/10 wow factor (animations, toast notifications, color-coding)

---

## 🎥 Demo Video

**Loom link:** _[https://www.loom.com/share/b40464ba63774d3cbfb606adc0c849f1]_

**What the demo shows:**
- Real-time signal detection streaming
- 4 signal types with color-coded badges
- AI-generated playbook emails
- Evidence bullets with source links
- One-click copy functionality

---

## 👥 Team

Built in 5 hours at **ContextCon 2026**, Bengaluru, India.

**Event:** Crustdata × Y Combinator Hackathon  
**Date:** April 19, 2026

---

## 📝 Notes

- **Two modes:** Prospect Hunter (v1) + Signal Scanner (v2)
- **Git branches:** `main` (v1 prospecting tool) + `signal-v2` (buying signals)
- **Why we pivoted:** The temporal intelligence play is 10× more differentiated than list generation
- **Moat clarity:** Crustdata's time-series B2B data is the only way to build this

---

## 📹 How to Add Your Loom Video to This README

Once you record your Loom video:

1. **Get the share link:**
   - In Loom, click "Share"
   - Copy the link (looks like `https://www.loom.com/share/abc123...`)

2. **Update this README:**
   - Find the line: `**[📹 Watch on Loom](PASTE_YOUR_LOOM_LINK_HERE)**`
   - Replace `PASTE_YOUR_LOOM_LINK_HERE` with your actual Loom link

3. **Optional - Add embed (makes video play in GitHub):**
   - In Loom, click "Share" → "Embed"
   - Copy the embed code
   - Replace the commented section in README with your embed code

4. **Commit and push:**
   ```bash
   git add README.md
   git commit -m "Add Loom demo video"
   git push
   ```

---

## 🔗 Links

- **Live Demo:** [https://contextcon-eight.vercel.app/](https://contextcon-eight.vercel.app/)

---

<div align="center">

**Built with Crustdata APIs • Powered by AI • Designed to Win**

*Every sales tool tells you WHO to email. Signal tells you WHEN.*

</div>
