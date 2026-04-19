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
        "fixed bottom-8 right-8 z-50 flex items-center gap-2 rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-4 py-3 shadow-xl backdrop-blur-sm",
        "animate-in fade-in slide-in-from-bottom-4 duration-300",
      )}
    >
      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500/20">
        <Check className="h-3.5 w-3.5 text-emerald-300" />
      </div>
      <span className="text-sm font-medium text-emerald-100">{message}</span>
    </div>
  );
}
