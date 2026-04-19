"use client";

import { AlertCircle, CheckCircle2, Loader2, Zap, Clock, Hash } from "lucide-react";

import type { PipelineEvent } from "@/lib/pipeline";
import { cn } from "@/lib/utils";

export type TraceEntry =
  | { kind: "status"; message: string }
  | { kind: "plan"; note: string }
  | {
      kind: "api";
      name: string;
      method: string;
      endpoint: string;
      latencyMs?: number;
      resultCount?: number;
      note?: string;
    }
  | { kind: "error"; message: string }
  | { kind: "done"; totalProspects: number };

export function traceEntryFromEvent(ev: PipelineEvent): TraceEntry | null {
  switch (ev.kind) {
    case "status":
      return { kind: "status", message: ev.message };
    case "plan":
      return {
        kind: "plan",
        note: `Interpreted: ${ev.plan.rationale}`,
      };
    case "api":
      return {
        kind: "api",
        name: ev.name,
        method: ev.method,
        endpoint: ev.endpoint,
        latencyMs: ev.latencyMs,
        resultCount: ev.resultCount,
        note: ev.note,
      };
    case "error":
      return { kind: "error", message: ev.message };
    case "done":
      return { kind: "done", totalProspects: ev.totalProspects };
    case "prospect":
      return null;
  }
}

export function ReasoningTrace({
  entries,
  running,
}: {
  entries: TraceEntry[];
  running: boolean;
}) {
  const apiCalls = entries.filter((e) => e.kind === "api").length;
  const totalLatency = entries
    .filter((e): e is Extract<TraceEntry, { kind: "api" }> => e.kind === "api")
    .reduce((sum, e) => sum + (e.latencyMs ?? 0), 0);

  return (
    <div className="flex h-full flex-col gap-2.5 pr-1 font-mono text-[12px] leading-relaxed">
      {/* Header */}
      <div className="flex items-center gap-2 pb-2 border-b border-ink-800/60">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
          <Zap className="h-3.5 w-3.5 text-accent" />
        </div>
        <div>
          <span className="text-xs font-semibold uppercase tracking-widest text-ink-300">
            Agent Trace
          </span>
          {apiCalls > 0 && (
            <div className="flex items-center gap-3 text-[10px] text-ink-500 mt-0.5">
              <span className="flex items-center gap-1">
                <Hash className="h-2.5 w-2.5" />
                {apiCalls} API calls
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-2.5 w-2.5" />
                {(totalLatency / 1000).toFixed(1)}s total
              </span>
            </div>
          )}
        </div>
        {running ? (
          <Loader2 className="ml-auto h-4 w-4 animate-spin text-accent" />
        ) : (
          entries.length > 0 && (
            <CheckCircle2 className="ml-auto h-4 w-4 text-emerald-400" />
          )
        )}
      </div>

      {entries.length === 0 && !running ? (
        <p className="text-ink-500 text-[11px]">
          Pipeline trace will stream here — every Crustdata call, with
          latency and hit counts.
        </p>
      ) : null}

      {entries.map((e, i) => (
        <TraceLine key={i} entry={e} index={i} />
      ))}

      {running ? <PulseDot /> : null}
    </div>
  );
}

function TraceLine({ entry, index }: { entry: TraceEntry; index: number }) {
  if (entry.kind === "status") {
    return (
      <div
        className="flex items-start gap-2 text-ink-300 animate-slide-up"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <span className="mt-0.5 text-accent/60 text-[10px]">›</span>
        <span>{entry.message}</span>
      </div>
    );
  }
  if (entry.kind === "plan") {
    return (
      <div
        className="rounded-lg border border-accent/20 bg-accent/5 px-3 py-2.5 text-ink-200 animate-slide-up"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="mb-1 text-[9px] uppercase tracking-wider text-accent font-bold">
          🧠 Plan
        </div>
        <span className="text-[11px]">{entry.note}</span>
      </div>
    );
  }
  if (entry.kind === "api") {
    const ok = !entry.note;
    return (
      <div
        className={cn(
          "rounded-lg border px-3 py-2.5 animate-slide-up",
          ok
            ? "border-emerald-900/40 bg-emerald-950/15"
            : "border-amber-900/40 bg-amber-950/15",
        )}
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="text-ink-200 font-medium text-[11px]">
            <span
              className={cn(
                "mr-1.5 rounded px-1.5 py-0.5 text-[9px] font-bold",
                ok
                  ? "bg-emerald-900/30 text-emerald-400"
                  : "bg-amber-900/30 text-amber-400",
              )}
            >
              {entry.method}
            </span>
            <span className="text-ink-400">{entry.endpoint}</span>
          </span>
          {entry.latencyMs != null ? (
            <span className="text-[10px] text-ink-500 font-mono">
              {entry.latencyMs}ms
            </span>
          ) : null}
        </div>
        <div className="mt-1 text-[10px] text-ink-400">
          {entry.name}
          {entry.resultCount != null
            ? ` → ${entry.resultCount} result${entry.resultCount === 1 ? "" : "s"}`
            : ""}
          {entry.note ? ` · ⚠ ${entry.note}` : ""}
        </div>
      </div>
    );
  }
  if (entry.kind === "error") {
    return (
      <div
        className="flex items-start gap-2 rounded-lg border border-red-900/40 bg-red-950/15 px-3 py-2.5 text-red-200 animate-slide-up"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="text-[11px]">{entry.message}</span>
      </div>
    );
  }
  if (entry.kind === "done") {
    return (
      <div
        className="mt-1 flex items-center gap-2 rounded-lg border border-emerald-900/40 bg-emerald-950/15 px-3 py-2.5 text-emerald-400 animate-slide-up"
        style={{ animationDelay: `${index * 30}ms` }}
      >
        <CheckCircle2 className="h-4 w-4" />
        <span className="text-[11px] font-medium">
          Pipeline complete — {entry.totalProspects} prospect
          {entry.totalProspects === 1 ? "" : "s"} scored & outreach drafted.
        </span>
      </div>
    );
  }
  return null;
}

function PulseDot() {
  return (
    <div className="flex items-center gap-1.5 pt-1 text-ink-500">
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent [animation-delay:400ms]" />
    </div>
  );
}
