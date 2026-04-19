import { openai } from "@ai-sdk/openai";
import { generateObject } from "ai";
import { z } from "zod";

import { runAllDetectors } from "./detectors";
import { SIGNAL_EMAIL_SYSTEM, signalEmailUser } from "./signal-prompts";
import type { BuyingSignal, DetectorEvent, WatchlistEntry } from "./signal-types";

const emailSchema = z.object({
  subject: z.string().min(3).max(90),
  body: z.string().min(10).max(500),
});

export async function* runSignalDetection(
  watchlist: WatchlistEntry[],
): AsyncGenerator<DetectorEvent> {
  yield {
    kind: "status",
    message: `Scanning ${watchlist.length} watchlist entries for buying signals...`,
  };

  const t0 = Date.now();
  let signals: BuyingSignal[] = [];

  try {
    signals = await runAllDetectors(watchlist);
    const elapsed = Date.now() - t0;
    yield {
      kind: "status",
      message: `Found ${signals.length} active signals in ${(elapsed / 1000).toFixed(1)}s`,
    };
  } catch (err) {
    yield {
      kind: "error",
      message: `Signal detection failed: ${(err as Error).message}`,
    };
    yield { kind: "done", totalSignals: 0 };
    return;
  }

  if (signals.length === 0) {
    yield {
      kind: "status",
      message:
        "No signals fired in the past 45 days. Try adding more companies or champions to your watchlist.",
    };
    yield { kind: "done", totalSignals: 0 };
    return;
  }

  yield {
    kind: "status",
    message: `Drafting playbook-driven emails for ${signals.length} signals...`,
  };

  const emailTasks = signals.map(async (signal) => {
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        system: SIGNAL_EMAIL_SYSTEM,
        prompt: signalEmailUser({
          signal: signal.playbook,
          companyName: signal.company?.name ?? "the company",
          personName: signal.person?.name,
          trigger: signal.trigger,
          evidence: signal.evidence,
        }),
        schema: emailSchema,
        temperature: 0.65,
      });
      const body = object.body.trim().endsWith("— Gaurav")
        ? object.body.trim()
        : `${object.body.trim()}\n\n— Gaurav`;
      signal.email = { subject: object.subject, body };
    } catch {
      signal.email = undefined;
    }
  });

  await Promise.all(emailTasks);

  for (const signal of signals) {
    yield { kind: "signal", signal };
  }

  yield { kind: "done", totalSignals: signals.length };
}
