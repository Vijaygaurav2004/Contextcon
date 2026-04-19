"use client";

import { ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

const KILLER_QUERIES = [
  "10 VP Sales or CROs at Series A B2B SaaS companies in India with 50–200 employees",
  "8 Head of Engineering at fintech companies in London with Series B funding",
  "10 CMOs at US software companies with over $20M raised, recently hiring growth marketers",
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
        className={cn(
          "group flex items-center gap-3 rounded-2xl border border-ink-700 bg-ink-900/60 px-4 py-3 transition-colors",
          "focus-within:border-accent/70 focus-within:bg-ink-900",
        )}
      >
        <Sparkles className="h-5 w-5 shrink-0 text-accent" />
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Describe your ideal prospects — who, where, what stage, what signal..."
          className="flex-1 bg-transparent text-base text-ink-100 placeholder:text-ink-500 focus:outline-none"
          autoFocus
          disabled={loading}
        />
        <button
          type="submit"
          disabled={loading || value.trim().length < 6}
          className={cn(
            "flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
            "bg-accent text-ink-950 hover:bg-accent-soft disabled:cursor-not-allowed disabled:bg-ink-700 disabled:text-ink-500",
          )}
        >
          {loading ? "Running" : "Run"}
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="text-xs uppercase tracking-wide text-ink-500">
          Try
        </span>
        {KILLER_QUERIES.map((q, i) => (
          <button
            key={i}
            type="button"
            disabled={loading}
            onClick={() => {
              setValue(q);
              submit(q);
            }}
            className="rounded-full border border-ink-700 bg-ink-900/50 px-3 py-1 text-xs text-ink-300 transition-colors hover:border-accent/60 hover:text-ink-100 disabled:opacity-40"
          >
            {q.length > 70 ? q.slice(0, 70) + "…" : q}
          </button>
        ))}
      </div>
    </div>
  );
}
