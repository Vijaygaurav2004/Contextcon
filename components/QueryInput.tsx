"use client";

import { ArrowRight, Loader2 } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const EXAMPLES = [
  "10 VP Sales at Series A SaaS companies in India with 50-200 employees",
  "Head of Engineering at fintech companies in London, Series B+",
  "CMOs at US software companies with $20M+ raised",
];

export function QueryInput({
  onSubmit,
  loading,
}: {
  onSubmit: (query: string) => void;
  loading: boolean;
}) {
  const [value, setValue] = useState("");

  function submit(v: string) {
    const trimmed = v.trim();
    if (trimmed.length < 6 || loading) return;
    onSubmit(trimmed);
  }

  return (
    <div className="w-full">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(value);
        }}
        className="flex gap-2"
      >
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe your ideal prospect..."
          className={cn(
            "flex-1 rounded-lg border border-zinc-800 bg-zinc-900/80 px-3.5 py-2.5 text-[13px] text-zinc-200",
            "placeholder:text-zinc-600",
            "focus:outline-none focus:border-zinc-600 focus:ring-1 focus:ring-zinc-700",
            "transition-colors",
          )}
          autoFocus
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || value.trim().length < 6}
          className="btn-primary whitespace-nowrap"
        >
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Running
            </>
          ) : (
            <>
              Run
              <ArrowRight className="h-3.5 w-3.5" />
            </>
          )}
        </button>
      </form>

      <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] text-zinc-600 mr-1">Try:</span>
        {EXAMPLES.map((q, i) => (
          <button
            key={i}
            type="button"
            disabled={loading}
            onClick={() => {
              setValue(q);
              submit(q);
            }}
            className={cn(
              "rounded-md border border-zinc-800 bg-transparent px-2 py-1 text-[11px] text-zinc-500",
              "transition-colors hover:border-zinc-700 hover:text-zinc-300",
              "disabled:opacity-40 disabled:cursor-not-allowed",
            )}
          >
            {q.length > 50 ? q.slice(0, 50) + "…" : q}
          </button>
        ))}
      </div>
    </div>
  );
}
