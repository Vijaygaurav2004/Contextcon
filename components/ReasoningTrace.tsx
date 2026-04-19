"use client";

import { AlertCircle, CheckCircle2, Loader2, Zap } from "lucide-react";

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
  return (
    <div className="flex h-full flex-col gap-2 overflow-y-auto pr-1 font-mono text-[12.5px] leading-relaxed">
      <div className="sticky top-0 flex items-center gap-2 bg-ink-950/90 pb-2 pt-1 backdrop-blur">
        <Zap className="h-4 w-4 text-accent" />
        <span className="text-xs uppercase tracking-widest text-ink-400">
          Agent trace
        </span>
        {running ? (
          <Loader2 className="ml-auto h-3.5 w-3.5 animate-spin text-ink-400" />
        ) : (
          entries.length > 0 && (
            <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-400" />
          )
        )}
      </div>

      {entries.length === 0 && !running ? (
        <p className="text-ink-500">
          The agent&apos;s pipeline will stream here — every Crustdata call,
          with latency and hit counts.
        </p>
      ) : null}

      {entries.map((e, i) => (
        <TraceLine key={i} entry={e} />
      ))}

      {running ? <PulseDot /> : null}
    </div>
  );
}

function TraceLine({ entry }: { entry: TraceEntry }) {
  if (entry.kind === "status") {
    return (
      <div className="text-ink-300">
        <span className="mr-2 text-ink-500">›</span>
        {entry.message}
      </div>
    );
  }
  if (entry.kind === "plan") {
    return (
      <div className="rounded-md border border-ink-800 bg-ink-900/50 px-3 py-2 text-ink-200">
        <div className="mb-1 text-[10px] uppercase tracking-wider text-accent">
          Plan
        </div>
        {entry.note}
      </div>
    );
  }
  if (entry.kind === "api") {
    const ok = !entry.note;
    return (
      <div
        className={cn(
          "rounded-md border px-3 py-2",
          ok
            ? "border-emerald-900/50 bg-emerald-950/20 text-ink-200"
            : "border-amber-900/60 bg-amber-950/20 text-amber-200",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="font-medium">
            <span className="mr-2 rounded bg-ink-900 px-1.5 py-0.5 text-[10px] font-semibold text-ink-300">
              {entry.method}
            </span>
            {entry.endpoint}
          </span>
          {entry.latencyMs != null ? (
            <span className="text-[11px] text-ink-500">{entry.latencyMs}ms</span>
          ) : null}
        </div>
        <div className="mt-1 text-[11.5px] text-ink-400">
          {entry.name}
          {entry.resultCount != null
            ? ` → ${entry.resultCount} result${entry.resultCount === 1 ? "" : "s"}`
            : ""}
          {entry.note ? ` · ${entry.note}` : ""}
        </div>
      </div>
    );
  }
  if (entry.kind === "error") {
    return (
      <div className="flex items-start gap-2 rounded-md border border-red-900/60 bg-red-950/20 px-3 py-2 text-red-200">
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{entry.message}</span>
      </div>
    );
  }
  if (entry.kind === "done") {
    return (
      <div className="mt-2 flex items-center gap-2 text-emerald-400">
        <CheckCircle2 className="h-4 w-4" />
        Done — {entry.totalProspects} prospect
        {entry.totalProspects === 1 ? "" : "s"}.
      </div>
    );
  }
  return null;
}

function PulseDot() {
  return (
    <div className="flex items-center gap-1 pt-1 text-ink-500">
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent [animation-delay:0ms]" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent [animation-delay:200ms]" />
      <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-accent [animation-delay:400ms]" />
    </div>
  );
}
