"use client";

import { DollarSign, TrendingUp, UserPlus, Zap } from "lucide-react";
import type { BuyingSignal } from "@/lib/signal-types";

const SIGNAL_COLORS: Record<string, string> = {
  funding: "#34d399",
  exec_hire: "#a78bfa",
  growth: "#fb923c",
  champion_move: "#60a5fa",
};

const SIGNAL_ICONS: Record<string, typeof DollarSign> = {
  funding: DollarSign,
  exec_hire: UserPlus,
  growth: TrendingUp,
  champion_move: Zap,
};

export function MetricsBar({
  signals,
  running,
  elapsedMs,
}: {
  signals: BuyingSignal[];
  running: boolean;
  elapsedMs: number;
}) {
  const signalsByType = {
    funding: signals.filter((s) => s.type === "funding").length,
    exec_hire: signals.filter((s) => s.type === "exec_hire").length,
    growth: signals.filter((s) => s.type === "growth").length,
    champion_move: signals.filter((s) => s.type === "champion_move").length,
  };

  const avgScore =
    signals.length > 0
      ? Math.round(signals.reduce((a, b) => a + b.score, 0) / signals.length)
      : 0;

  const highPriority = signals.filter((s) => s.score >= 85).length;

  return (
    <div className="mt-6 pt-6 border-t border-ink-600/30">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
        {/* Total Signals */}
        <MetricCard
          label="Total Signals"
          value={signals.length}
          color="hsl(160 80% 55%)"
          running={running}
        />

        {/* High Priority */}
        <MetricCard
          label="High Priority"
          value={highPriority}
          color="#f43f5e"
          running={running}
          suffix={signals.length > 0 ? `/${signals.length}` : ""}
        />

        {/* Avg Score */}
        <MetricCard
          label="Avg Score"
          value={avgScore}
          color="#fbbf24"
          running={running}
        />

        {/* Scan Time */}
        <MetricCard
          label="Scan Time"
          value={running ? (elapsedMs / 1000).toFixed(1) : signals.length > 0 ? (elapsedMs / 1000).toFixed(1) : "—"}
          color="#818cf8"
          running={running}
          suffix={signals.length > 0 || running ? "s" : ""}
        />

        {/* Signal Types Mini Bars */}
        <div className="col-span-2 rounded-xl border border-ink-600/50 bg-ink-900/30 p-3">
          <div className="text-[10px] uppercase tracking-[0.15em] text-ink-500 mb-2 font-medium">
            By Type
          </div>
          <div className="space-y-1.5">
            {Object.entries(signalsByType).map(([type, count]) => {
              const Icon = SIGNAL_ICONS[type];
              const maxCount = Math.max(...Object.values(signalsByType), 1);
              return (
                <div key={type} className="flex items-center gap-2">
                  <Icon className="h-3 w-3 shrink-0" style={{ color: SIGNAL_COLORS[type] }} />
                  <div className="flex-1 h-1.5 rounded-full bg-ink-700/30 overflow-hidden">
                    <div
                      className="h-full rounded-full metric-bar"
                      style={{
                        width: `${(count / maxCount) * 100}%`,
                        backgroundColor: SIGNAL_COLORS[type],
                        opacity: count > 0 ? 0.7 : 0.1,
                        animationDelay: "0.3s",
                      }}
                    />
                  </div>
                  <span
                    className="text-xs font-mono font-semibold min-w-[16px] text-right"
                    style={{ color: count > 0 ? SIGNAL_COLORS[type] : "#2a3240" }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
  running,
  suffix = "",
}: {
  label: string;
  value: number | string;
  color: string;
  running: boolean;
  suffix?: string;
}) {
  return (
    <div className="rounded-xl border border-ink-600/50 bg-ink-900/30 p-3 transition-all hover:border-ink-500/50 hover:bg-ink-900/50">
      <div className="text-[10px] uppercase tracking-[0.15em] text-ink-500 font-medium">
        {label}
      </div>
      <div className="mt-1 flex items-baseline gap-0.5">
        <span
          className="text-2xl font-bold stat-value"
          style={{ color }}
        >
          {running && typeof value === "number" && value === 0 ? (
            <span className="inline-block h-2 w-12 skeleton rounded" />
          ) : (
            value
          )}
        </span>
        {suffix && (
          <span className="text-xs text-ink-500">{suffix}</span>
        )}
      </div>
    </div>
  );
}
