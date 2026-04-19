"use client";

import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  TrendingUp,
  UserPlus,
  Zap,
  DollarSign,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useState } from "react";

import { Toast } from "@/components/Toast";
import type { BuyingSignal } from "@/lib/signal-types";
import { cn } from "@/lib/utils";

const SIGNAL_CONFIG = {
  funding: {
    icon: DollarSign,
    label: "Fresh Funding",
    color: "#34d399",
    bgGlow: "rgba(52, 211, 153, 0.04)",
    borderColor: "rgba(52, 211, 153, 0.15)",
    badgeClass: "badge-funding",
  },
  exec_hire: {
    icon: UserPlus,
    label: "New Executive",
    color: "#a78bfa",
    bgGlow: "rgba(167, 139, 250, 0.04)",
    borderColor: "rgba(167, 139, 250, 0.15)",
    badgeClass: "badge-exec_hire",
  },
  growth: {
    icon: TrendingUp,
    label: "Growth Spike",
    color: "#fb923c",
    bgGlow: "rgba(251, 146, 60, 0.04)",
    borderColor: "rgba(251, 146, 60, 0.15)",
    badgeClass: "badge-growth",
  },
  champion_move: {
    icon: Zap,
    label: "Champion Moved",
    color: "#60a5fa",
    bgGlow: "rgba(96, 165, 250, 0.04)",
    borderColor: "rgba(96, 165, 250, 0.15)",
    badgeClass: "badge-champion_move",
  },
};

export function SignalCard({
  signal,
  index = 0,
}: {
  signal: BuyingSignal;
  index?: number;
}) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [emailExpanded, setEmailExpanded] = useState(false);

  const config = SIGNAL_CONFIG[signal.type];
  const Icon = config.icon;

  async function copyEmail() {
    if (!signal.email) return;
    const text = `Subject: ${signal.email.subject}\n\n${signal.email.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setShowToast(true);
    setTimeout(() => {
      setCopied(false);
      setShowToast(false);
    }, 2000);
  }

  // Score ring calculation
  const radius = 20;
  const circumference = 2 * Math.PI * radius;
  const scorePercent = signal.score / 99;
  const dashOffset = circumference * (1 - scorePercent);

  const scoreColor =
    signal.score >= 90
      ? "#34d399"
      : signal.score >= 75
        ? "#fbbf24"
        : "#6b7280";

  return (
    <div
      className="animate-slide-up signal-card glass-card glow-border"
      style={{
        animationDelay: `${index * 120}ms`,
        borderColor: config.borderColor,
        background: `linear-gradient(135deg, ${config.bgGlow} 0%, rgba(12, 15, 19, 0.9) 100%)`,
      }}
    >
      <div className="p-5 sm:p-6">
        {/* ─── Top Row: Badge + Score ─────────────── */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            {/* Signal type icon */}
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
              style={{
                borderColor: config.borderColor,
                backgroundColor: `${config.color}08`,
              }}
            >
              <Icon className="h-5 w-5" style={{ color: config.color }} />
            </div>
            <div className="min-w-0">
              <div className={cn("badge", config.badgeClass)}>
                {config.label}
              </div>
            </div>
          </div>

          {/* Score Ring */}
          <div className="score-ring h-14 w-14 shrink-0">
            <svg viewBox="0 0 48 48">
              <circle
                cx="24"
                cy="24"
                r={radius}
                strokeWidth="3"
                stroke="rgba(255,255,255,0.05)"
              />
              <circle
                cx="24"
                cy="24"
                r={radius}
                strokeWidth="3"
                stroke={scoreColor}
                strokeDasharray={circumference}
                strokeDashoffset={dashOffset}
                style={{ filter: `drop-shadow(0 0 4px ${scoreColor}40)` }}
              />
            </svg>
            <div className="flex flex-col items-center">
              <span
                className="text-lg font-bold stat-value"
                style={{ color: scoreColor }}
              >
                {signal.score}
              </span>
            </div>
          </div>
        </div>

        {/* ─── Company + Person ───────────────────── */}
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-ink-50 tracking-tight">
            {signal.company?.name ?? "Unknown Company"}
          </h3>
          {signal.person && (
            <div className="mt-1 flex items-center gap-2 text-sm">
              <span className="text-ink-200">{signal.person.name}</span>
              {signal.person.title && (
                <>
                  <span className="text-ink-600">·</span>
                  <span className="text-ink-400">{signal.person.title}</span>
                </>
              )}
              {signal.person.profileUrl && (
                <a
                  href={signal.person.profileUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent hover:text-accent-soft transition-colors"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* ─── Trigger ───────────────────────────── */}
        <div
          className="mt-4 rounded-xl p-4 border"
          style={{
            borderColor: `${config.color}20`,
            background: `${config.color}05`,
          }}
        >
          <div className="text-sm font-semibold" style={{ color: config.color }}>
            {signal.trigger.headline}
          </div>
          <div className="mt-1.5 text-xs text-ink-400 leading-relaxed">
            {signal.trigger.detail}
          </div>
        </div>

        {/* ─── Evidence ──────────────────────────── */}
        {signal.evidence.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-ink-600/30" />
              <span className="text-[9px] uppercase tracking-[0.2em] text-ink-500 font-medium">
                Evidence
              </span>
              <div className="h-px flex-1 bg-ink-600/30" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {signal.evidence.map((e, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-ink-600/30 bg-ink-900/40 px-3 py-2"
                >
                  <div className="text-[9px] uppercase tracking-wider text-ink-500">
                    {e.label}
                  </div>
                  <div className="mt-0.5 text-sm font-medium text-ink-100">
                    {e.value}
                  </div>
                  {e.source?.url && (
                    <a
                      href={e.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-0.5 text-[10px] text-accent hover:underline"
                    >
                      {e.source.label}
                      <ExternalLink className="h-2.5 w-2.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── Email Playbook ────────────────────── */}
        {signal.email && (
          <div className="mt-4 border-t border-ink-600/30 pt-4">
            <div
              role="button"
              tabIndex={0}
              onClick={() => setEmailExpanded(!emailExpanded)}
              onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setEmailExpanded(!emailExpanded); }}
              className="flex w-full items-center justify-between text-left group cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-accent/60" />
                <span className="text-[10px] uppercase tracking-[0.15em] text-ink-400 font-medium">
                  Playbook: {signal.playbook.replace(/_/g, " ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    copyEmail();
                  }}
                  className={cn(
                    "copy-btn flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all",
                    copied
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-ink-600 bg-ink-800/50 text-ink-300 hover:border-accent/40 hover:text-ink-100",
                  )}
                >
                  {copied ? (
                    <>
                      <Check className="h-3 w-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3" /> Copy email
                    </>
                  )}
                </button>
                {emailExpanded ? (
                  <ChevronUp className="h-4 w-4 text-ink-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-ink-500" />
                )}
              </div>
            </div>

            {emailExpanded && (
              <div className="mt-3 animate-scale-fade rounded-xl border border-ink-600/30 bg-ink-950/50 p-4 shadow-inner-glow">
                <div className="text-sm font-semibold text-ink-100">
                  {signal.email.subject}
                </div>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-ink-300">
                  {signal.email.body}
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      <Toast message="Email copied to clipboard!" show={showToast} />
    </div>
  );
}

export function EmptySignalState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-4 text-center">
      <div className="rounded-full border border-ink-600/50 bg-ink-800/30 p-5">
        <AlertCircle className="h-7 w-7 text-ink-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-ink-300">
          No buying signals detected in the past 45 days.
        </p>
        <p className="mt-2 max-w-md text-xs text-ink-500 leading-relaxed">
          Try adding more companies or champions to your watchlist. Signals fire
          when a company raises funding, hires a key exec, grows headcount, or a
          past champion changes companies.
        </p>
      </div>
    </div>
  );
}
