"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

export function Toast({ message, show }: { message: string; show: boolean }) {
  const [visible, setVisible] = useState(show);

  useEffect(() => {
    if (show) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [show]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-xl border border-emerald-500/30 bg-ink-900/90 px-5 py-3.5 shadow-2xl backdrop-blur-xl",
        "animate-slide-up",
      )}
    >
      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/30">
        <Check className="h-3.5 w-3.5 text-emerald-300" />
      </div>
      <span className="text-sm font-medium text-emerald-100">{message}</span>
    </div>
  );
}
