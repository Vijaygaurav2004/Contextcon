"use client";

import { Activity, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import type { BuyingSignal } from "@/lib/signal-types";
import { cn } from "@/lib/utils";

export function DetectorStatusPanel({
  status,
  running,
  signalCount,
  signals,
}: {
  status: string | null;
  running: boolean;
  signalCount: number;
  signals: BuyingSignal[];
}) {
  const isDone = status?.includes("complete");
  const isError = status?.startsWith("Error:");

  return (
    <div className="glass-card p-5 flex flex-col gap-4 flex-1">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-ink-600/30">
        <Activity
          className={cn(
            "h-4 w-4",
            running ? "text-accent animate-pulse" : "text-accent/60",
          )}
        />
        <span className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-medium">
          Detection Log
        </span>
        {running && (
          <div className="ml-auto flex gap-1">
            <span className="h-1 w-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: "0ms" }} />
            <span className="h-1 w-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: "200ms" }} />
            <span className="h-1 w-1 rounded-full bg-accent animate-pulse" style={{ animationDelay: "400ms" }} />
          </div>
        )}
      </div>

      {/* Status Message */}
      {status && (
        <div
          className={cn(
            "status-text-appear text-sm leading-relaxed",
            isError
              ? "text-red-400"
              : isDone && signalCount > 0
                ? "text-accent"
                : "text-ink-300",
          )}
        >
          {isError ? (
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0 text-red-400" />
              <span>{status}</span>
            </div>
          ) : isDone ? (
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-accent" />
              <span>{status}</span>
            </div>
          ) : (
            <div className="flex items-start gap-2">
              {running && (
                <div className="mt-1.5 h-2 w-2 rounded-full bg-accent animate-pulse shrink-0" />
              )}
              <span>{status}</span>
            </div>
          )}
        </div>
      )}

      {/* Active Signals summary */}
      {signalCount > 0 && (
        <div className="mt-auto space-y-2.5">
          <div className="text-[10px] uppercase tracking-[0.15em] text-ink-500 font-medium">
            Detected Signals
          </div>
          {signals.slice(0, 5).map((s, i) => (
            <div
              key={s.id}
              className="animate-slide-left flex items-center gap-2 text-xs"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full shrink-0"
                style={{
                  backgroundColor:
                    s.type === "funding"
                      ? "#34d399"
                      : s.type === "exec_hire"
                        ? "#a78bfa"
                        : s.type === "growth"
                          ? "#fb923c"
                          : "#60a5fa",
                }}
              />
              <span className="text-ink-300 truncate">
                {s.company?.name ?? "Unknown"}
              </span>
              <span className="ml-auto font-mono text-ink-500">{s.score}</span>
            </div>
          ))}
          {signalCount > 5 && (
            <div className="text-[11px] text-ink-500 text-center">
              +{signalCount - 5} more
            </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {!status && !running && (
        <div className="flex flex-col items-center justify-center flex-1 gap-2 py-4">
          <Clock className="h-5 w-5 text-ink-500/50" />
          <p className="text-xs text-ink-500 text-center leading-relaxed">
            Click &quot;Run Detection&quot; to scan your watchlist for buying signals.
          </p>
        </div>
      )}
    </div>
  );
}
