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
} from "lucide-react";
import { useState } from "react";

import { Toast } from "@/components/Toast";
import type { BuyingSignal } from "@/lib/signal-types";
import { cn } from "@/lib/utils";

const SIGNAL_ICONS = {
  funding: DollarSign,
  exec_hire: UserPlus,
  growth: TrendingUp,
  champion_move: Zap,
};

const SIGNAL_COLORS = {
  funding: "border-emerald-500/40 bg-emerald-500/10 text-emerald-300",
  exec_hire: "border-purple-500/40 bg-purple-500/10 text-purple-300",
  growth: "border-orange-500/40 bg-orange-500/10 text-orange-300",
  champion_move: "border-blue-500/40 bg-blue-500/10 text-blue-300",
};

const SIGNAL_LABELS = {
  funding: "Fresh Funding",
  exec_hire: "New Executive",
  growth: "Growth Spike",
  champion_move: "Champion Moved",
};

export function SignalCard({ signal }: { signal: BuyingSignal }) {
  const [copied, setCopied] = useState(false);
  const [showToast, setShowToast] = useState(false);

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

  const Icon = SIGNAL_ICONS[signal.type];
  const colorClass = SIGNAL_COLORS[signal.type];
  const label = SIGNAL_LABELS[signal.type];

  const scoreTone =
    signal.score >= 90
      ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200"
      : signal.score >= 75
        ? "border-orange-500/50 bg-orange-500/15 text-orange-200"
        : "border-ink-600 bg-ink-800 text-ink-300";

  return (
    <div
      className={cn(
        "animate-in fade-in slide-in-from-top-8 duration-500 fill-mode-both",
        "group relative overflow-hidden rounded-xl border border-ink-700 bg-gradient-to-br from-ink-900/60 to-ink-900/30 backdrop-blur-sm transition-all hover:scale-[1.01] hover:border-ink-600 hover:shadow-xl hover:shadow-accent/5",
      )}
      style={{ animationDelay: `${Math.min(signal.score / 20, 8) * 50}ms` }}
    >
      {/* Signal type badge - top left */}
      <div className="absolute left-4 top-4 z-10">
        <div
          className={cn(
            "flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
            colorClass,
          )}
        >
          <Icon className="h-3.5 w-3.5" />
          {label}
        </div>
      </div>

      {/* Score badge - top right */}
      <div className="absolute right-4 top-4 z-10">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-full border font-mono text-lg font-bold",
            scoreTone,
          )}
          title={`Signal strength: ${signal.score}/99`}
        >
          {signal.score}
        </div>
      </div>

      {/* Main content */}
      <div className="px-4 pb-4 pt-16">
        {/* Company + Person */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-ink-100">
            {signal.company?.name ?? "Unknown Company"}
          </h3>
          {signal.person && (
            <div className="mt-1 flex items-center gap-2 text-sm text-ink-300">
              <span>{signal.person.name}</span>
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
                  className="text-accent hover:underline"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          )}
        </div>

        {/* Trigger */}
        <div className="mb-3 rounded-lg border border-accent/20 bg-accent/5 p-3">
          <div className="mb-1 text-sm font-medium text-accent">
            {signal.trigger.headline}
          </div>
          <div className="text-xs text-ink-400">{signal.trigger.detail}</div>
        </div>

        {/* Evidence */}
        {signal.evidence.length > 0 && (
          <div className="mb-4">
            <div className="mb-1.5 text-[10px] uppercase tracking-widest text-ink-500">
              Evidence
            </div>
            <ul className="space-y-1">
              {signal.evidence.map((e, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                  <div className="min-w-0 flex-1">
                    <span className="text-ink-400">{e.label}:</span>{" "}
                    <span className="text-ink-200">{e.value}</span>
                    {e.source?.url && (
                      <a
                        href={e.source.url}
                        target="_blank"
                        rel="noreferrer"
                        className="ml-1 inline-flex items-center gap-0.5 text-xs text-accent hover:underline"
                      >
                        {e.source.label}
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Email */}
        {signal.email && (
          <div className="border-t border-ink-800 pt-3">
            <div className="mb-2 flex items-center justify-between">
              <div className="text-[10px] uppercase tracking-widest text-ink-500">
                Playbook: {signal.playbook.replace(/_/g, " ")}
              </div>
              <button
                onClick={copyEmail}
                className={cn(
                  "flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs font-medium transition-all",
                  copied
                    ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-300"
                    : "border-ink-700 bg-ink-900 text-ink-300 hover:border-accent/60 hover:text-ink-100",
                )}
              >
                {copied ? (
                  <>
                    <Check className="h-3 w-3" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3" /> Copy email
                  </>
                )}
              </button>
            </div>
            <div className="rounded-lg border border-ink-800 bg-ink-950/50 p-3">
              <div className="mb-1.5 text-sm font-medium text-ink-100">
                {signal.email.subject}
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-ink-300">
                {signal.email.body}
              </p>
            </div>
          </div>
        )}
      </div>

      <Toast message="Email copied to clipboard!" show={showToast} />
    </div>
  );
}

export function EmptySignalState() {
  return (
    <div className="flex min-h-[360px] flex-col items-center justify-center gap-3 text-center">
      <div className="rounded-full border border-ink-800 bg-ink-900/60 p-4">
        <AlertCircle className="h-6 w-6 text-ink-500" />
      </div>
      <p className="text-sm text-ink-400">
        No buying signals detected in the past 45 days.
      </p>
      <p className="max-w-md text-xs text-ink-500">
        Try adding more companies or champions to your watchlist. Signals fire
        when a company raises funding, hires a key exec, grows headcount, or a
        past champion changes companies.
      </p>
    </div>
  );
}
