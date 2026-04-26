"use client";

import { Check, Copy, ExternalLink, MapPin, ChevronDown, ChevronUp, Send } from "lucide-react";
import { useState } from "react";

import type { Prospect } from "@/lib/types";
import { cn } from "@/lib/utils";

function ScoreIndicator({ score }: { score: number }) {
  const r = 18;
  const c = 2 * Math.PI * r;
  const fill = (score / 100) * c;
  const color =
    score >= 85
      ? "#22c55e"
      : score >= 70
        ? "#3b82f6"
        : score >= 50
          ? "#eab308"
          : "#71717a";

  return (
    <div className="relative flex h-11 w-11 items-center justify-center shrink-0">
      <svg width={44} height={44} className="-rotate-90">
        <circle cx={22} cy={22} r={r} fill="none" stroke="#27272a" strokeWidth={2.5} />
        <circle
          cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={2.5}
          strokeLinecap="round"
          strokeDasharray={`${fill} ${c - fill}`}
          className="transition-all duration-500"
        />
      </svg>
      <span className="absolute text-xs font-semibold text-zinc-200 font-mono">{score}</span>
    </div>
  );
}

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  async function copyEmail() {
    if (!prospect.email) return;
    const text = prospect.email.body; // Removed subject
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  async function sendViaLinkedIn(e: React.MouseEvent) {
    e.stopPropagation();
    if (!prospect.email) return;
    await navigator.clipboard.writeText(prospect.email.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
    if (prospect.profileUrl) {
      window.open(prospect.profileUrl, "_blank");
    }
  }

  return (
    <div className="surface-interactive overflow-hidden">
      {/* Header */}
      <div className="flex items-start gap-3 p-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-[13px] font-medium text-zinc-100 truncate">
              {prospect.name}
            </h3>
            {prospect.profileUrl && (
              <a
                href={prospect.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-zinc-600 hover:text-blue-400 transition-colors shrink-0"
              >
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          <p className="mt-0.5 text-xs text-zinc-500 truncate">
            {prospect.title ?? "—"}
            {prospect.companyName && (
              <> · <span className="text-zinc-400">{prospect.companyName}</span></>
            )}
          </p>

          {prospect.location && (
            <div className="mt-1 flex items-center gap-1 text-[11px] text-zinc-600">
              <MapPin className="h-2.5 w-2.5" />
              {prospect.location}
            </div>
          )}

          {prospect.scoreReasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {prospect.scoreReasons.map((r, i) => (
                <span key={i} className="text-[10px] text-zinc-500 bg-zinc-800/80 rounded px-1.5 py-0.5">
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        <ScoreIndicator score={prospect.score} />
      </div>

      {/* Evidence */}
      {prospect.evidence.length > 0 && (
        <div className="border-t border-zinc-800/60 px-4 py-3 bg-zinc-900/30">
          <div className="space-y-1.5">
            {prospect.evidence.map((e, i) => (
              <div key={i} className="flex items-start gap-2 text-[12px]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-zinc-600" />
                <div className="min-w-0">
                  <span className="text-zinc-400">{e.detail}</span>
                  {e.source?.url && (
                    <a
                      href={e.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-1.5 text-[11px] text-blue-400/80 hover:text-blue-400"
                    >
                      {e.source.label} ↗
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Email */}
      {prospect.email && (
        <div className="border-t border-zinc-800/60 px-4 py-2.5">
          <div
            role="button"
            tabIndex={0}
            onClick={() => setExpanded(!expanded)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpanded(!expanded); }}
            className="flex items-center justify-between cursor-pointer group"
          >
            <span className="text-[11px] text-zinc-500 group-hover:text-zinc-400 transition-colors">
              AI-generated outreach
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={sendViaLinkedIn}
                disabled={!prospect.profileUrl}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors",
                  copied
                    ? "text-green-400 bg-green-400/10"
                    : "text-zinc-200 hover:text-white bg-blue-600/80 hover:bg-blue-500/90 disabled:opacity-50 disabled:cursor-not-allowed",
                )}
              >
                <Send className="h-2.5 w-2.5" /> Send in LinkedIn
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); copyEmail(); }}
                className={cn(
                  "flex items-center gap-1 rounded px-2 py-0.5 text-[11px] transition-colors",
                  copied
                    ? "text-green-400 bg-green-400/10"
                    : "text-zinc-500 hover:text-zinc-300 bg-zinc-800/50",
                )}
              >
                {copied ? <><Check className="h-2.5 w-2.5" /> Copied</> : <><Copy className="h-2.5 w-2.5" /> Copy</>}
              </button>
              {expanded ? <ChevronUp className="h-3.5 w-3.5 text-zinc-600" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-600" />}
            </div>
          </div>

          {expanded && (
            <div className="mt-2 rounded-md border border-zinc-800 bg-zinc-900/60 p-3 animate-slide-up">
              <p className="whitespace-pre-wrap text-[12px] leading-relaxed text-zinc-300">
                {prospect.email.body}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
