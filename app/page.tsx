"use client";

import { Activity, Database, Play, Sparkles } from "lucide-react";
import { useState } from "react";

import { EmptySignalState, SignalCard } from "@/components/SignalCard";
import type { BuyingSignal, DetectorEvent } from "@/lib/signal-types";
import { cn } from "@/lib/utils";

const DEMO_WATCHLIST = [
  // Recent funding (will fire funding signals)
  { type: "company" as const, domain: "algo8.ai" },
  { type: "company" as const, domain: "veear.com" },
  { type: "company" as const, domain: "hirequotient.com" },
  { type: "company" as const, domain: "promaxo.com" },
  { type: "company" as const, domain: "uphold.com" },
  { type: "company" as const, domain: "mojo.vision" },
  // High-growth companies (exec hire + growth signals)
  { type: "company" as const, domain: "retool.com" },
  { type: "company" as const, domain: "razorpay.com" },
  { type: "company" as const, domain: "postman.com" },
  { type: "company" as const, domain: "freshworks.com" },
  { type: "company" as const, domain: "chargebee.com" },
  { type: "company" as const, domain: "browserstack.com" },
  { type: "company" as const, domain: "notion.so" },
  { type: "company" as const, domain: "figma.com" },
  { type: "company" as const, domain: "vercel.com" },
  { type: "company" as const, domain: "stripe.com" },
  { type: "company" as const, domain: "linear.app" },
  // Champions (will fire if they moved recently)
  {
    type: "champion" as const,
    profileUrl: "https://www.linkedin.com/in/abhilashchowdhary",
  },
  {
    type: "champion" as const,
    profileUrl: "https://www.linkedin.com/in/patrickc",
  },
  {
    type: "champion" as const,
    profileUrl: "https://www.linkedin.com/in/guillaumecabane",
  },
];

export default function SignalPage() {
  const [running, setRunning] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [signals, setSignals] = useState<BuyingSignal[]>([]);

  async function runDetection() {
    setRunning(true);
    setStatus("Initializing signal detectors...");
    setSignals([]);

    try {
      const res = await fetch("/api/signals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ watchlist: DEMO_WATCHLIST }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        setStatus(`Error: ${err.error ?? "Request failed"}`);
        setRunning(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.trim()) continue;
          let ev: DetectorEvent | null = null;
          try {
            ev = JSON.parse(line) as DetectorEvent;
          } catch {
            continue;
          }
          if (!ev) continue;

          if (ev.kind === "status") {
            setStatus(ev.message);
          } else if (ev.kind === "signal") {
            setSignals((s) => [...s, ev.signal]);
          } else if (ev.kind === "error") {
            setStatus(`Error: ${ev.message}`);
          } else if (ev.kind === "done") {
            setStatus(
              ev.totalSignals > 0
                ? `Done — ${ev.totalSignals} active signal${ev.totalSignals === 1 ? "" : "s"} detected.`
                : "Done — no signals fired.",
            );
          }
        }
      }
    } catch (err) {
      setStatus(`Error: ${(err as Error).message}`);
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
      <Header />

      <section className="mt-10">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
          Know the <span className="text-accent">exact moment</span> to strike.
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-ink-400">
          Signal watches your target accounts for buying signals — fresh
          funding, new executives, growth spikes, champion moves — and drafts
          the perfect outreach the second a signal fires.
        </p>
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between rounded-xl border border-ink-700 bg-ink-900/40 p-4">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-ink-700 bg-ink-900 p-2">
              <Activity className="h-5 w-5 text-accent" />
            </div>
            <div>
              <div className="text-sm font-medium text-ink-100">
                Demo Watchlist
              </div>
              <div className="text-xs text-ink-500">
                {DEMO_WATCHLIST.filter((e) => e.type === "company").length}{" "}
                companies +{" "}
                {DEMO_WATCHLIST.filter((e) => e.type === "champion").length}{" "}
                champions
              </div>
            </div>
          </div>
          <button
            onClick={runDetection}
            disabled={running}
            className={cn(
              "flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
              "bg-accent text-ink-950 hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-ink-500",
            )}
          >
            {running ? (
              <>
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950 border-t-transparent" />
                Scanning
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Run Detection
              </>
            )}
          </button>
        </div>
      </section>

      <section className="mt-8 grid min-h-[480px] flex-1 grid-cols-1 gap-6 lg:grid-cols-[280px,1fr]">
        <aside className="rounded-2xl border border-ink-800 bg-ink-900/30 p-4">
          <StatusPanel status={status} running={running} signalCount={signals.length} />
        </aside>

        <div className="rounded-2xl border border-ink-800 bg-ink-900/20 p-4">
          {signals.length === 0 && !running ? (
            <EmptySignalState />
          ) : (
            <div className="space-y-4">
              {signals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
              {running && signals.length === 0 && <SkeletonCards />}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </main>
  );
}

function Header() {
  return (
    <header className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Sparkles className="h-6 w-6 text-accent" />
        <span className="text-xl font-semibold tracking-tight text-ink-100">
          Signal
        </span>
        <span className="rounded-full border border-ink-700 bg-ink-900 px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-ink-400">
          ContextCon &apos;26
        </span>
      </div>
      <div className="flex items-center gap-3 text-xs text-ink-400">
        <span className="hidden items-center gap-1 sm:inline-flex">
          <Database className="h-3.5 w-3.5 text-accent" />
          Powered by Crustdata
        </span>
      </div>
    </header>
  );
}

function StatusPanel({
  status,
  running,
  signalCount,
}: {
  status: string | null;
  running: boolean;
  signalCount: number;
}) {
  const isDone = status?.includes("Done —");
  
  return (
    <div className="flex h-full flex-col gap-3">
      <div className="flex items-center gap-2 border-b border-ink-800 pb-2">
        <Activity className={cn("h-4 w-4", running ? "animate-pulse text-accent" : "text-accent")} />
        <span className="text-xs uppercase tracking-widest text-ink-400">
          Detection Status
        </span>
      </div>

      {status && (
        <div className={cn("text-sm", isDone && signalCount > 0 ? "text-emerald-300" : "text-ink-300")}>
          {running ? (
            <div className="flex items-start gap-2">
              <div className="mt-1 h-2 w-2 animate-pulse rounded-full bg-accent" />
              <span>{status}</span>
            </div>
          ) : isDone && signalCount > 0 ? (
            <div className="flex items-start gap-2 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
                <Activity className="h-3 w-3 text-emerald-400" />
              </div>
              <span>{status}</span>
            </div>
          ) : (
            <span>{status}</span>
          )}
        </div>
      )}

      {signalCount > 0 && (
        <div className="mt-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 rounded-lg border border-accent/20 bg-accent/5 p-3">
          <div className="text-2xl font-bold text-accent">{signalCount}</div>
          <div className="text-xs text-ink-400">
            Active signal{signalCount === 1 ? "" : "s"}
          </div>
        </div>
      )}

      {!status && !running && (
        <p className="text-xs text-ink-500">
          Click &quot;Run Detection&quot; to scan your watchlist for buying
          signals.
        </p>
      )}
    </div>
  );
}

function SkeletonCards() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-64 animate-pulse rounded-xl border border-ink-800 bg-ink-900/40"
        />
      ))}
    </>
  );
}

function Footer() {
  return (
    <footer className="mt-10 flex flex-col items-center justify-between gap-2 border-t border-ink-800 pt-4 text-xs text-ink-500 sm:flex-row">
      <span>
        Built in 5 hours at ContextCon — Crustdata × Y Combinator, Bengaluru,
        April 2026.
      </span>
      <span className="font-mono">
        YC Spring &apos;26 RFS:{" "}
        <span className="text-accent">AI-Native Agencies</span>
      </span>
    </footer>
  );
}
