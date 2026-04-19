"use client";

import {
  ArrowRight,
  Database,
  Play,
  Radar,
  Search,
  Sparkles,
  Target,
  Users,
  Zap,
  Activity,
  BarChart3,
  Mail,
  Clock,
} from "lucide-react";
import { useEffect, useState, useRef, useCallback } from "react";

import { SignalCard, EmptySignalState } from "@/components/SignalCard";
import { RadarVisualization } from "@/components/RadarViz";
import { MetricsBar } from "@/components/MetricsBar";
import { DetectorStatusPanel } from "@/components/DetectorStatus";
import { QueryInput } from "@/components/QueryInput";
import { ProspectCard } from "@/components/ProspectCard";
import {
  ReasoningTrace,
  traceEntryFromEvent,
} from "@/components/ReasoningTrace";
import type { TraceEntry } from "@/components/ReasoningTrace";
import type { BuyingSignal, DetectorEvent } from "@/lib/signal-types";
import type { PipelineEvent } from "@/lib/pipeline";
import type { Prospect } from "@/lib/types";
import { cn } from "@/lib/utils";

const DEMO_WATCHLIST = [
  { type: "company" as const, domain: "algo8.ai" },
  { type: "company" as const, domain: "veear.com" },
  { type: "company" as const, domain: "hirequotient.com" },
  { type: "company" as const, domain: "promaxo.com" },
  { type: "company" as const, domain: "uphold.com" },
  { type: "company" as const, domain: "mojo.vision" },
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

type Mode = "hunter" | "scanner";

export default function SignalPage() {
  const [mode, setMode] = useState<Mode>("hunter");

  // Scanner state
  const [scannerRunning, setScannerRunning] = useState(false);
  const [scannerHasRun, setScannerHasRun] = useState(false);
  const [scannerStatus, setScannerStatus] = useState<string | null>(null);
  const [signals, setSignals] = useState<BuyingSignal[]>([]);
  const [scannerElapsed, setScannerElapsed] = useState(0);
  const scannerTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Hunter state
  const [hunterRunning, setHunterRunning] = useState(false);
  const [hunterHasRun, setHunterHasRun] = useState(false);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [traceEntries, setTraceEntries] = useState<TraceEntry[]>([]);
  const [hunterElapsed, setHunterElapsed] = useState(0);
  const hunterTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (scannerRunning) {
      const start = Date.now();
      scannerTimerRef.current = setInterval(() => setScannerElapsed(Date.now() - start), 100);
    } else {
      if (scannerTimerRef.current) clearInterval(scannerTimerRef.current);
    }
    return () => { if (scannerTimerRef.current) clearInterval(scannerTimerRef.current); };
  }, [scannerRunning]);

  useEffect(() => {
    if (hunterRunning) {
      const start = Date.now();
      hunterTimerRef.current = setInterval(() => setHunterElapsed(Date.now() - start), 100);
    } else {
      if (hunterTimerRef.current) clearInterval(hunterTimerRef.current);
    }
    return () => { if (hunterTimerRef.current) clearInterval(hunterTimerRef.current); };
  }, [hunterRunning]);

  async function runDetection() {
    setScannerRunning(true);
    setScannerHasRun(true);
    setScannerStatus("Initializing signal detectors...");
    setSignals([]);
    setScannerElapsed(0);

    try {
      const res = await fetch("/api/signals", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ watchlist: DEMO_WATCHLIST }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        setScannerStatus(`Error: ${err.error ?? "Request failed"}`);
        setScannerRunning(false);
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
          try { ev = JSON.parse(line) as DetectorEvent; } catch { continue; }
          if (!ev) continue;

          if (ev.kind === "status") setScannerStatus(ev.message);
          else if (ev.kind === "signal") setSignals((s) => [...s, ev.signal]);
          else if (ev.kind === "error") setScannerStatus(`Error: ${ev.message}`);
          else if (ev.kind === "done") {
            setScannerStatus(
              ev.totalSignals > 0
                ? `Complete — ${ev.totalSignals} signal${ev.totalSignals === 1 ? "" : "s"} detected`
                : "Scan complete — no signals fired",
            );
          }
        }
      }
    } catch (err) {
      setScannerStatus(`Error: ${(err as Error).message}`);
    } finally {
      setScannerRunning(false);
    }
  }

  const runHunter = useCallback(async (query: string) => {
    setHunterRunning(true);
    setHunterHasRun(true);
    setProspects([]);
    setTraceEntries([]);
    setHunterElapsed(0);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        setTraceEntries((t) => [...t, { kind: "error", message: err.error ?? "Request failed" }]);
        setHunterRunning(false);
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
          let ev: PipelineEvent | null = null;
          try { ev = JSON.parse(line) as PipelineEvent; } catch { continue; }
          if (!ev) continue;

          if (ev.kind === "prospect") setProspects((p) => [...p, ev.prospect]);
          const entry = traceEntryFromEvent(ev);
          if (entry) setTraceEntries((t) => [...t, entry]);
        }
      }
    } catch (err) {
      setTraceEntries((t) => [...t, { kind: "error", message: (err as Error).message }]);
    } finally {
      setHunterRunning(false);
    }
  }, []);

  const companyCount = DEMO_WATCHLIST.filter((e) => e.type === "company").length;
  const championCount = DEMO_WATCHLIST.filter((e) => e.type === "champion").length;

  return (
    <div className="mx-auto min-h-screen max-w-[1280px] px-4 sm:px-6 lg:px-8">
      {/* ─── Header ──────────────────────────────── */}
      <header className="flex items-center justify-between py-5 border-b border-zinc-800/60">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="text-[15px] font-semibold text-zinc-100 tracking-tight">
              Signal
            </span>
          </div>

          {/* Nav tabs */}
          <nav className="flex items-center">
            <button
              onClick={() => setMode("hunter")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                mode === "hunter"
                  ? "text-zinc-100 bg-zinc-800"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Search className="h-3.5 w-3.5" />
              Prospect Hunter
            </button>
            <button
              onClick={() => setMode("scanner")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-[13px] font-medium rounded-md transition-colors",
                mode === "scanner"
                  ? "text-zinc-100 bg-zinc-800"
                  : "text-zinc-500 hover:text-zinc-300",
              )}
            >
              <Radar className="h-3.5 w-3.5" />
              Signal Scanner
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-3 text-xs text-zinc-500">
          <span className="hidden sm:flex items-center gap-1.5 border border-zinc-800 rounded-md px-2.5 py-1">
            <Database className="h-3 w-3 text-zinc-400" />
            Crustdata
          </span>
          <span className="hidden md:flex items-center gap-1.5 border border-zinc-800 rounded-md px-2.5 py-1">
            <Sparkles className="h-3 w-3 text-blue-400" />
            ContextCon 2026
          </span>
        </div>
      </header>

      <main className="py-6">
        {/* ═══════ HUNTER MODE ═══════════════════════ */}
        {mode === "hunter" && (
          <div className="animate-fade-in">
            {/* Query area */}
            <div className="surface p-5">
              <div className="flex items-center gap-2 mb-4">
                <h1 className="text-[15px] font-semibold text-zinc-100">
                  Find your ideal prospects
                </h1>
                {hunterRunning && (
                  <div className="flex items-center gap-1.5 ml-auto text-xs text-zinc-500 font-mono">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                    {(hunterElapsed / 1000).toFixed(1)}s
                  </div>
                )}
              </div>
              <QueryInput onSubmit={runHunter} loading={hunterRunning} />
            </div>

            {/* Results */}
            {hunterHasRun && (
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[300px,1fr] animate-slide-up">
                {/* Trace sidebar */}
                <div className="surface p-4 h-fit max-h-[75vh] overflow-y-auto lg:sticky lg:top-4">
                  <ReasoningTrace entries={traceEntries} running={hunterRunning} />
                </div>

                {/* Prospects */}
                <div className="min-w-0 space-y-3">
                  {prospects.length > 0 && (
                    <div className="flex items-center justify-between px-0.5 text-xs text-zinc-500">
                      <span>
                        <span className="text-zinc-200 font-medium">{prospects.length}</span> prospect{prospects.length === 1 ? "" : "s"}
                      </span>
                      <span className="font-mono">
                        avg score: {Math.round(prospects.reduce((a, p) => a + p.score, 0) / prospects.length)}
                      </span>
                    </div>
                  )}

                  {prospects.map((p, i) => (
                    <div key={p.id} className="animate-slide-up" style={{ animationDelay: `${i * 60}ms` }}>
                      <ProspectCard prospect={p} />
                    </div>
                  ))}

                  {hunterRunning && prospects.length === 0 && <SkeletonCards />}

                  {!hunterRunning && prospects.length === 0 && hunterHasRun && (
                    <div className="surface p-8 text-center">
                      <p className="text-sm text-zinc-500">No prospects matched. Try a broader query.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pre-run state */}
            {!hunterHasRun && (
              <div className="mt-10 flex flex-col items-center">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
                  {[
                    { icon: Database, title: "4 APIs", desc: "Company, Person, Enrich, Web Search" },
                    { icon: BarChart3, title: "AI Scoring", desc: "Each prospect scored 0-99 with evidence" },
                    { icon: Mail, title: "Auto Outreach", desc: "Context-aware emails drafted instantly" },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="surface p-4 text-center">
                      <Icon className="h-5 w-5 text-zinc-500 mx-auto" />
                      <div className="mt-2 text-sm font-medium text-zinc-200">{title}</div>
                      <div className="mt-1 text-xs text-zinc-500">{desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══════ SCANNER MODE ═══════════════════════ */}
        {mode === "scanner" && (
          <div className="animate-fade-in">
            {/* Control bar */}
            <div className="surface p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-[15px] font-semibold text-zinc-100">
                    Signal Scanner
                  </h1>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {companyCount} companies · {championCount} champions
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  {scannerRunning && (
                    <span className="flex items-center gap-1.5 text-xs text-zinc-500 font-mono">
                      <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                      {(scannerElapsed / 1000).toFixed(1)}s
                    </span>
                  )}
                  <button
                    id="run-detection-btn"
                    onClick={runDetection}
                    disabled={scannerRunning}
                    className="btn-primary"
                  >
                    {scannerRunning ? (
                      <>
                        <div className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Scanning...
                      </>
                    ) : (
                      <>
                        <Play className="h-3.5 w-3.5" fill="currentColor" />
                        Run Detection
                      </>
                    )}
                  </button>
                </div>
              </div>

              {scannerHasRun && (
                <MetricsBar signals={signals} running={scannerRunning} elapsedMs={scannerElapsed} />
              )}
            </div>

            {/* Scanner results */}
            {scannerHasRun && (
              <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[280px,1fr] animate-slide-up">
                <div className="space-y-4">
                  <div className="surface p-5 flex flex-col items-center">
                    <RadarVisualization running={scannerRunning} signalCount={signals.length} />
                  </div>
                  <DetectorStatusPanel
                    status={scannerStatus}
                    running={scannerRunning}
                    signalCount={signals.length}
                    signals={signals}
                  />
                </div>

                <div className="min-w-0">
                  {signals.length === 0 && !scannerRunning ? (
                    <div className="surface p-8"><EmptySignalState /></div>
                  ) : (
                    <div className="space-y-3">
                      {signals.map((signal, index) => (
                        <SignalCard key={signal.id} signal={signal} index={index} />
                      ))}
                      {scannerRunning && signals.length === 0 && <SkeletonCards />}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Pre-run */}
            {!scannerHasRun && (
              <div className="mt-10 flex flex-col items-center">
                <div className="surface max-w-lg w-full p-8 text-center">
                  <Radar className="h-8 w-8 text-zinc-600 mx-auto" />
                  <h3 className="mt-4 text-sm font-medium text-zinc-200">Ready to scan</h3>
                  <p className="mt-2 text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto">
                    Click Run Detection to scan {companyCount} companies and {championCount} champions
                    for funding events, executive hires, growth spikes, and champion moves.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-800/60 py-4 mt-8 flex items-center justify-between text-[11px] text-zinc-600">
        <span>Built at ContextCon 2026 · Crustdata × Y Combinator</span>
        <span className="font-mono">YC RFS: AI-Native Agencies</span>
      </footer>
    </div>
  );
}

function SkeletonCards() {
  return (
    <>
      {[0, 1, 2].map((i) => (
        <div key={i} className="surface p-5 space-y-3" style={{ animationDelay: `${i * 100}ms` }}>
          <div className="flex justify-between">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-10 w-10 rounded-full" />
          </div>
          <div className="skeleton h-4 w-48" />
          <div className="skeleton h-16 w-full" />
          <div className="space-y-2">
            <div className="skeleton h-3 w-full" />
            <div className="skeleton h-3 w-3/4" />
          </div>
        </div>
      ))}
    </>
  );
}
