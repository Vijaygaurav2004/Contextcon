"use client";

import { Check, Copy, ExternalLink, MapPin } from "lucide-react";
import { useState } from "react";

import type { Prospect } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ProspectCard({ prospect }: { prospect: Prospect }) {
  const [copied, setCopied] = useState(false);

  async function copyEmail() {
    if (!prospect.email) return;
    const text = `Subject: ${prospect.email.subject}\n\n${prospect.email.body}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const scoreTone =
    prospect.score >= 85
      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
      : prospect.score >= 70
        ? "border-accent/40 bg-accent/10 text-accent"
        : "border-ink-700 bg-ink-900 text-ink-300";

  return (
    <div className="overflow-hidden rounded-xl border border-ink-700 bg-ink-900/40 transition-colors hover:border-ink-600">
      <div className="flex items-start justify-between gap-4 p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-[15px] font-semibold text-ink-100">
              {prospect.name}
            </h3>
            {prospect.profileUrl ? (
              <a
                href={prospect.profileUrl}
                target="_blank"
                rel="noreferrer"
                className="text-ink-500 hover:text-accent"
              >
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
          <div className="mt-0.5 truncate text-sm text-ink-300">
            {prospect.title ?? "—"}
            {prospect.companyName ? (
              <>
                {" · "}
                <span className="text-ink-200">{prospect.companyName}</span>
              </>
            ) : null}
          </div>
          {prospect.location ? (
            <div className="mt-1 flex items-center gap-1 text-xs text-ink-500">
              <MapPin className="h-3 w-3" />
              <span className="truncate">{prospect.location}</span>
            </div>
          ) : null}
        </div>

        <div
          className={cn(
            "shrink-0 rounded-lg border px-2.5 py-1 text-center font-mono text-sm font-semibold",
            scoreTone,
          )}
          title={prospect.scoreReasons.join(" · ")}
        >
          {prospect.score}
          <div className="mt-0.5 text-[9px] font-normal uppercase tracking-wider opacity-70">
            score
          </div>
        </div>
      </div>

      {prospect.evidence.length > 0 ? (
        <div className="border-t border-ink-800 bg-ink-950/40 px-4 py-3">
          <div className="mb-2 text-[10px] uppercase tracking-widest text-ink-500">
            Evidence
          </div>
          <ul className="space-y-1.5">
            {prospect.evidence.map((e, i) => (
              <li key={i} className="flex items-start gap-2 text-[13px]">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                <div className="min-w-0">
                  <span className="text-ink-200">{e.detail}</span>
                  {e.source?.url ? (
                    <a
                      href={e.source.url}
                      target="_blank"
                      rel="noreferrer"
                      className="ml-2 inline-flex items-center gap-0.5 text-[11px] text-accent hover:underline"
                    >
                      {e.source.label}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : e.source?.label ? (
                    <span className="ml-2 text-[11px] text-ink-500">
                      · {e.source.label}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {prospect.email ? (
        <div className="border-t border-ink-800 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] uppercase tracking-widest text-ink-500">
              Suggested opener
            </div>
            <button
              onClick={copyEmail}
              className={cn(
                "flex items-center gap-1 rounded-md border px-2 py-1 text-[11px] transition-colors",
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
                  <Copy className="h-3 w-3" /> Copy
                </>
              )}
            </button>
          </div>
          <div className="mt-2 rounded-md border border-ink-800 bg-ink-950/50 p-3">
            <div className="text-[13px] font-medium text-ink-100">
              {prospect.email.subject}
            </div>
            <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-relaxed text-ink-300">
              {prospect.email.body}
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
