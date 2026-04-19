import { NextRequest } from "next/server";

import { runSignalDetection } from "@/lib/signal-pipeline";
import type { WatchlistEntry } from "@/lib/signal-types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const watchlist = Array.isArray(body.watchlist) ? body.watchlist : [];

  if (watchlist.length === 0) {
    return Response.json(
      { error: "Watchlist cannot be empty." },
      { status: 400 },
    );
  }

  const validEntries = watchlist.filter(
    (e: unknown) =>
      typeof e === "object" &&
      e !== null &&
      ("type" in e) &&
      (e.type === "company" || e.type === "champion"),
  ) as WatchlistEntry[];

  if (validEntries.length === 0) {
    return Response.json(
      { error: "No valid watchlist entries provided." },
      { status: 400 },
    );
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        try {
          controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
        } catch {}
      };

      try {
        for await (const event of runSignalDetection(validEntries)) {
          send(event);
        }
      } catch (err) {
        send({ kind: "error", message: (err as Error).message });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "application/x-ndjson; charset=utf-8",
      "cache-control": "no-cache, no-transform",
      "x-accel-buffering": "no",
    },
  });
}
