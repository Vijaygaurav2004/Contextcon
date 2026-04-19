"use client";

import { Database, Github, Sparkles } from "lucide-react";
import { useRef, useState } from "react";

import { ProspectCard } from "@/components/ProspectCard";
import { QueryInput } from "@/components/QueryInput";
import {
  ReasoningTrace,
  traceEntryFromEvent,
  type TraceEntry,
} from "@/components/ReasoningTrace";
import type { PipelineEvent } from "@/lib/pipeline";
import type { Prospect } from "@/lib/types";

export default function HomePage() {
  const [running, setRunning] = useState(false);
  const [trace, setTrace] = useState<TraceEntry[]>([]);
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [planSummary, setPlanSummary] = useState<string | null>(null);
  const [lastQuery, setLastQuery] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  async function runQuery(query: string) {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setRunning(true);
    setTrace([]);
    setProspects([]);
    setPlanSummary(null);
    setLastQuery(query);

    try {
      const res = await fetch("/api/agent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ query }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const err = await res.json().catch(() => ({}));
        setTrace((t) => [
          ...t,
          {
            kind: "error",
            message: err.error ?? `Request failed (${res.status})`,
          },
        ]);
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
          let ev: PipelineEvent | null = null;
          try {
            ev = JSON.parse(line) as PipelineEvent;
          } catch {
            continue;
          }
          if (!ev) continue;

          if (ev.kind === "plan") {
            setPlanSummary(ev.plan.industryHint ?? null);
          }
          if (ev.kind === "prospect") {
            setProspects((p) => [...p, ev.prospect]);
          } else {
            const entry = traceEntryFromEvent(ev);
            if (entry) setTrace((t) => [...t, entry]);
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== "AbortError") {
        setTrace((t) => [
          ...t,
          { kind: "error", message: (err as Error).message },
        ]);
      }
    } finally {
      setRunning(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
      <Header />

      <section className="mt-10">
        <h1 className="text-balance text-3xl font-semibold tracking-tight text-ink-100 sm:text-4xl">
          Deep research for <span className="text-accent">GTM</span>.
        </h1>
        <p className="mt-2 max-w-2xl text-pretty text-ink-400">
          Describe your ideal prospects in plain English. Signal chains
          Crustdata&apos;s Company, Person, and Web APIs to return a ranked,
          sourced, ready-to-send outreach list — in under a minute.
        </p>
      </section>

      <section className="mt-6">
        <QueryInput onSubmit={runQuery} loading={running} />
      </section>

      <section className="mt-8 grid min-h-[480px] flex-1 grid-cols-1 gap-6 lg:grid-cols-[320px,1fr]">
        <aside className="rounded-2xl border border-ink-800 bg-ink-900/30 p-4">
          <ReasoningTrace entries={trace} running={running} />
        </aside>

        <div className="rounded-2xl border border-ink-800 bg-ink-900/20 p-4">
          {lastQuery ? (
            <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full bg-ink-900 px-2 py-0.5 text-ink-400">
                Query
              </span>
              <span className="text-ink-300">{lastQuery}</span>
              {planSummary ? (
                <>
                  <span className="text-ink-600">·</span>
                  <span className="rounded-full border border-accent/40 bg-accent/10 px-2 py-0.5 text-accent">
                    {planSummary}
                  </span>
                </>
              ) : null}
            </div>
          ) : null}

          {prospects.length === 0 && !running ? (
            <EmptyState />
          ) : (
            <div className="grid gap-3 lg:grid-cols-2">
              {prospects.map((p) => (
                <ProspectCard key={p.id} prospect={p} />
              ))}
              {running && prospects.length === 0 ? <SkeletonCards /> : null}
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
        <div className="relative">
          <Sparkles className="h-6 w-6 text-accent" />
        </div>
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
        <a
          href="https://github.com"
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1 hover:text-ink-100 sm:inline-flex"
        >
          <Github className="h-3.5 w-3.5" />
          Source
        </a>
      </div>
    </header>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full min-h-[360px] flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full border border-ink-800 bg-ink-900/60 p-3">
        <Sparkles className="h-5 w-5 text-accent" />
      </div>
      <p className="text-sm text-ink-400">
        Type a prospecting thesis above — or try one of the killer queries.
      </p>
      <p className="max-w-md text-xs text-ink-500">
        Signal compiles your brief into structured filters, queries Crustdata
        for matching companies and decision-makers, enriches the top
        candidates, scans the web for fresh signals, and drafts a personalized
        opener for each.
      </p>
    </div>
  );
}

function SkeletonCards() {
  return (
    <>
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="h-40 animate-pulse rounded-xl border border-ink-800 bg-ink-900/40"
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
