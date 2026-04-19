"use client";

import { useEffect, useRef } from "react";

export function RadarVisualization({
  running,
  signalCount,
}: {
  running: boolean;
  signalCount: number;
}) {
  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="text-[10px] uppercase tracking-[0.2em] text-ink-400 font-medium">
        Signal Radar
      </div>

      <div className="radar-container relative">
        {/* Static rings */}
        <div className="absolute inset-[15%] rounded-full border border-ink-600/20" />
        <div className="absolute inset-[30%] rounded-full border border-ink-600/15" />
        <div className="absolute inset-[45%] rounded-full border border-ink-600/10" />
        
        {/* Center dot */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-accent shadow-[0_0_12px_hsl(160_80%_55%/0.5)]" />

        {/* Crosshairs */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-ink-600/10 -translate-x-1/2" />
        <div className="absolute top-1/2 left-0 right-0 h-px bg-ink-600/10 -translate-y-1/2" />

        {/* Animated elements only when running */}
        {running && (
          <>
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-ring" />
            <div className="radar-sweep" />
          </>
        )}

        {/* Signal dots - appear as signals are detected */}
        {signalCount > 0 && (
          <>
            <div className="radar-dot" style={{ top: "25%", left: "65%" }} />
            {signalCount > 1 && (
              <div className="radar-dot" style={{ top: "60%", left: "30%", animationDelay: "0.5s" }} />
            )}
            {signalCount > 2 && (
              <div className="radar-dot" style={{ top: "35%", left: "20%", animationDelay: "1s" }} />
            )}
            {signalCount > 3 && (
              <div className="radar-dot" style={{ top: "70%", left: "70%", animationDelay: "1.5s" }} />
            )}
            {signalCount > 4 && (
              <div className="radar-dot" style={{ top: "15%", left: "45%", animationDelay: "0.3s" }} />
            )}
            {signalCount > 5 && (
              <div className="radar-dot" style={{ top: "55%", left: "80%", animationDelay: "0.8s" }} />
            )}
          </>
        )}

        {/* Count overlay */}
        {!running && signalCount > 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center bg-ink-950/80 rounded-full h-16 w-16 justify-center backdrop-blur-sm">
              <span className="text-2xl font-bold text-accent stat-value">
                {signalCount}
              </span>
              <span className="text-[8px] uppercase tracking-wider text-ink-400">
                signals
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Status label below radar */}
      <div className="text-xs text-ink-400 text-center">
        {running ? (
          <span className="flex items-center gap-1.5">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Scanning targets...
          </span>
        ) : signalCount > 0 ? (
          <span className="text-accent/80">
            {signalCount} signal{signalCount === 1 ? "" : "s"} locked
          </span>
        ) : (
          <span>Awaiting scan</span>
        )}
      </div>
    </div>
  );
}
