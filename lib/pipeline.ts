import { openai } from "@ai-sdk/openai";
import { generateObject, generateText } from "ai";
import { z } from "zod";

import {
  companySearch,
  personEnrich,
  personSearch,
  webSearch,
} from "./crustdata";
import {
  EMAIL_WRITER_SYSTEM,
  QUERY_COMPILER_SYSTEM,
  emailWriterUser,
} from "./prompts";
import type {
  CompanyHit,
  EnrichedPerson,
  PersonHit,
  PlanSpec,
  Prospect,
  StepEvent,
  WebSearchResult,
} from "./types";

const planSchema = z.object({
  companyFilters: z.any().nullable(),
  personTitleRegex: z.string().min(1),
  personLocationContains: z.string().optional().nullable(),
  industryHint: z.string().optional().nullable(),
  targetCount: z.number().int().min(3).max(20),
  webSignalQuery: z.string().min(3),
  rationale: z.string().min(3),
});

const emailSchema = z.object({
  subject: z.string().min(3).max(90),
  body: z.string().min(10).max(500),
});

const COMPANY_FIELDS = [
  "crustdata_company_id",
  "basic_info.name",
  "basic_info.primary_domain",
  "basic_info.year_founded",
  "basic_info.industries",
  "headcount.total",
  "funding.last_round_type",
  "funding.total_investment_usd",
  "funding.last_fundraise_date",
  "locations.country",
  "taxonomy.professional_network_industry",
];

const PERSON_FIELDS = [
  "crustdata_person_id",
  "basic_profile.name",
  "basic_profile.headline",
  "basic_profile.current_title",
  "basic_profile.location.full_location",
  "basic_profile.location.country",
  "social_handles.professional_network_identifier.profile_url",
  "experience.employment_details.current",
  "experience.employment_details.past",
];

export type PipelineEvent = StepEvent;

function safeName(p: PersonHit): string {
  return p.basic_profile?.name ?? "Unknown";
}

function currentCompany(p: PersonHit): string | undefined {
  const first = p.experience?.employment_details?.current?.[0];
  return first?.company_name ?? first?.name;
}

function currentTitle(p: PersonHit): string | undefined {
  const first = p.experience?.employment_details?.current?.[0];
  return first?.title ?? p.basic_profile?.current_title;
}

function profileUrl(p: PersonHit): string | undefined {
  return p.social_handles?.professional_network_identifier?.profile_url;
}

function pickEnrichedMatch(enriched: EnrichedPerson[], url: string) {
  return enriched.find((e) => e.matched_on === url)?.matches?.[0]?.person_data;
}

function extractPast(enrichedPerson: unknown): string[] {
  const out: string[] = [];
  const data = enrichedPerson as {
    experience?: {
      employment_details?: {
        past?: Array<{ title?: string; name?: string; company_name?: string }>;
      };
    };
  };
  const past = data?.experience?.employment_details?.past ?? [];
  for (const role of past.slice(0, 5)) {
    const co = role.company_name ?? role.name;
    if (role.title && co) out.push(`${role.title} @ ${co}`);
    else if (co) out.push(`${co}`);
  }
  return out;
}

function scoreProspect({
  title,
  titleRegex,
  webHits,
  enriched,
}: {
  title?: string;
  titleRegex: string;
  webHits: WebSearchResult[];
  enriched: boolean;
}): { score: number; reasons: string[] } {
  const reasons: string[] = [];
  let score = 40;
  if (title) {
    const re = new RegExp(titleRegex, "i");
    if (re.test(title)) {
      score += 25;
      reasons.push(`Title match: "${title}"`);
    } else {
      reasons.push(`Title ${title} is adjacent but not a direct match`);
    }
  }
  if (enriched) {
    score += 15;
    reasons.push("Full profile enriched");
  }
  if (webHits.length >= 2) {
    score += 20;
    reasons.push(`${webHits.length} fresh web signals found`);
  } else if (webHits.length === 1) {
    score += 10;
    reasons.push("1 web signal found");
  } else {
    reasons.push("No fresh web signals — cold open");
  }
  return { score: Math.min(99, score), reasons };
}

function evidenceFromWeb(
  hits: WebSearchResult[],
): Prospect["evidence"] {
  return hits.slice(0, 2).map((h) => ({
    label: "Recent web signal",
    detail: h.snippet.slice(0, 220),
    source: { label: new URL(h.url).hostname.replace("www.", ""), url: h.url },
  }));
}

export async function* runPipeline(userQuery: string): AsyncGenerator<PipelineEvent> {
  yield { kind: "status", message: "Compiling your brief into a search plan..." };

  let plan: PlanSpec;
  try {
    const { object } = await generateObject({
      model: openai("gpt-4o-mini"),
      system: QUERY_COMPILER_SYSTEM,
      prompt: userQuery,
      schema: planSchema,
      temperature: 0.2,
    });
    plan = {
      companyFilters: (object.companyFilters ?? null) as PlanSpec["companyFilters"],
      personTitleRegex: object.personTitleRegex,
      personLocationContains: object.personLocationContains ?? undefined,
      industryHint: object.industryHint ?? undefined,
      targetCount: object.targetCount,
      webSignalQuery: object.webSignalQuery,
      rationale: object.rationale,
    };
  } catch (err) {
    yield {
      kind: "error",
      message: `Query compiler failed: ${(err as Error).message}`,
    };
    return;
  }

  yield { kind: "plan", plan };

  // ─────────────── Company search ───────────────
  let companies: CompanyHit[] = [];
  if (plan.companyFilters) {
    yield {
      kind: "status",
      message: "Searching Crustdata for matching companies...",
    };
    const t0 = Date.now();
    try {
      const res = await companySearch({
        filters: plan.companyFilters,
        fields: COMPANY_FIELDS,
        sorts: [{ column: "headcount.total", order: "desc" }],
        limit: 40,
      });
      companies = res.companies ?? [];
      yield {
        kind: "api",
        name: "Company search",
        method: "POST",
        endpoint: "/company/search",
        latencyMs: Date.now() - t0,
        resultCount: companies.length,
      };
    } catch (err) {
      yield {
        kind: "api",
        name: "Company search",
        method: "POST",
        endpoint: "/company/search",
        latencyMs: Date.now() - t0,
        note: (err as Error).message,
      };
    }
  }

  // ─────────────── Person search ───────────────
  // Sanitize the title regex up-front: the (.) operator rejects commas/slashes
  // and long alternations kill recall. Strip punctuation, clamp to 4 terms.
  const cleanTitleRegexEarly = plan.personTitleRegex
    .split("|")
    .map((t) => t.replace(/[,/]/g, "").trim())
    .filter((t) => t.length > 0)
    .slice(0, 4)
    .join("|");

  // NOTE: we deliberately search people by title + location (NOT by the 40
  // company names from company_search). Joining on current.company_name IN
  // [...] fails frequently due to indexed-name mismatches and drops all
  // matches to 0. Company context is still used for scoring + display.
  yield {
    kind: "status",
    message: "Finding decision-makers matching that profile...",
  };

  const personConditions: Array<Record<string, unknown>> = [
    {
      field: "experience.employment_details.title",
      type: "(.)",
      value: cleanTitleRegexEarly,
    },
  ];
  if (plan.personLocationContains) {
    personConditions.push({
      field: "basic_profile.location.full_location",
      type: "(.)",
      value: plan.personLocationContains,
    });
  }

  let profiles: PersonHit[] = [];
  const tPerson = Date.now();
  try {
    const res = await personSearch({
      filters:
        personConditions.length === 1
          ? (personConditions[0] as never)
          : { op: "and", conditions: personConditions as never },
      fields: PERSON_FIELDS,
      limit: Math.max(plan.targetCount * 4, 30),
    });
    profiles = res.profiles ?? [];
    yield {
      kind: "api",
      name: "Person search",
      method: "POST",
      endpoint: "/person/search",
      latencyMs: Date.now() - tPerson,
      resultCount: profiles.length,
    };
  } catch (err) {
    yield {
      kind: "api",
      name: "Person search",
      method: "POST",
      endpoint: "/person/search",
      latencyMs: Date.now() - tPerson,
      note: (err as Error).message,
    };
  }

  const cleanTitleRegex = cleanTitleRegexEarly;
  const primaryTitleTerm = cleanTitleRegex.split("|")[0] ?? plan.personTitleRegex;

  // ─────────────── Fallback 1: drop location if primary was empty ───────────────
  if (profiles.length < 3 && plan.personLocationContains) {
    yield {
      kind: "status",
      message: "Broadening search — relaxing location filter...",
    };
    const tFallback = Date.now();
    try {
      const res = await personSearch({
        filters: {
          field: "experience.employment_details.title",
          type: "(.)",
          value: cleanTitleRegex,
        } as never,
        fields: PERSON_FIELDS,
        limit: Math.max(plan.targetCount * 4, 30),
      });
      profiles = res.profiles ?? [];
      yield {
        kind: "api",
        name: "Person search (broadened)",
        method: "POST",
        endpoint: "/person/search",
        latencyMs: Date.now() - tFallback,
        resultCount: profiles.length,
      };
    } catch (err) {
      yield {
        kind: "api",
        name: "Person search (broadened)",
        method: "POST",
        endpoint: "/person/search",
        latencyMs: Date.now() - tFallback,
        note: (err as Error).message,
      };
    }
  }

  // ─────────────── Fallback 2: simplest-possible regex ───────────────
  if (profiles.length < 3) {
    yield {
      kind: "status",
      message: `Final broadening — searching for "${primaryTitleTerm}" only...`,
    };
    const tFinal = Date.now();
    try {
      const res = await personSearch({
        filters: {
          field: "experience.employment_details.title",
          type: "(.)",
          value: primaryTitleTerm,
        } as never,
        fields: PERSON_FIELDS,
        limit: Math.max(plan.targetCount * 4, 30),
      });
      profiles = res.profiles ?? [];
      yield {
        kind: "api",
        name: `Person search (title: ${primaryTitleTerm})`,
        method: "POST",
        endpoint: "/person/search",
        latencyMs: Date.now() - tFinal,
        resultCount: profiles.length,
      };
    } catch (err) {
      yield {
        kind: "api",
        name: "Person search (final fallback)",
        method: "POST",
        endpoint: "/person/search",
        latencyMs: Date.now() - tFinal,
        note: (err as Error).message,
      };
    }
  }

  if (!profiles.length) {
    yield {
      kind: "error",
      message:
        "No prospects matched those filters. Try broadening location, title, or industry.",
    };
    yield { kind: "done", totalProspects: 0 };
    return;
  }

  // Deduplicate by profile URL
  const seen = new Set<string>();
  const shortlist = profiles.filter((p) => {
    const u = profileUrl(p);
    if (!u || seen.has(u)) return false;
    seen.add(u);
    return true;
  });

  const topCandidates = shortlist.slice(0, plan.targetCount);

  // ─────────────── Enrich + web signals ───────────────
  yield {
    kind: "status",
    message: `Enriching top ${topCandidates.length} prospects and scanning the web for recent signals...`,
  };

  const urls = topCandidates
    .map((p) => profileUrl(p))
    .filter((u): u is string => Boolean(u));

  const tEnrich = Date.now();
  let enriched: EnrichedPerson[] = [];
  try {
    enriched = await personEnrich(urls);
    yield {
      kind: "api",
      name: "Person enrich (batch)",
      method: "POST",
      endpoint: "/person/enrich",
      latencyMs: Date.now() - tEnrich,
      resultCount: enriched.length,
    };
  } catch (err) {
    yield {
      kind: "api",
      name: "Person enrich",
      method: "POST",
      endpoint: "/person/enrich",
      latencyMs: Date.now() - tEnrich,
      note: (err as Error).message,
    };
  }

  // Stream prospects as they complete: launch all tasks in parallel,
  // push to a simple channel, and yield as results arrive.
  const channel: Prospect[] = [];
  let notify: (() => void) | null = null;
  let completed = 0;

  const tasks = topCandidates.map(async (person, idx) => {
    const name = safeName(person);
    const title = currentTitle(person);
    const company = currentCompany(person);
    const url = profileUrl(person);

    let webHits: WebSearchResult[] = [];
    try {
      const q = buildWebQuery(name, company, plan.webSignalQuery);
      webHits = await webSearch(q, 4);
    } catch {
      // web is optional; keep going
    }
    const enrichedPerson = url ? pickEnrichedMatch(enriched, url) : undefined;
    const pastRoles = extractPast(enrichedPerson ?? person);

    const { score, reasons } = scoreProspect({
      title,
      titleRegex: plan.personTitleRegex,
      webHits,
      enriched: Boolean(enrichedPerson),
    });

    const evidence: Prospect["evidence"] = [];
    if (company) {
      evidence.push({
        label: "Current role",
        detail: `${title ?? "—"} at ${company}`,
        source: url ? { label: "LinkedIn", url } : undefined,
      });
    }
    if (pastRoles.length) {
      evidence.push({
        label: "Career trajectory",
        detail: pastRoles.slice(0, 3).join(" → "),
      });
    }
    for (const e of evidenceFromWeb(webHits)) evidence.push(e);

    let email: Prospect["email"] | undefined;
    try {
      const { object } = await generateObject({
        model: openai("gpt-4o-mini"),
        system: EMAIL_WRITER_SYSTEM,
        prompt: emailWriterUser({
          name,
          title,
          company,
          headline: person.basic_profile?.headline,
          pastRoles,
          webSnippets: webHits.slice(0, 3).map((h) => ({
            title: h.title,
            snippet: h.snippet,
            url: h.url,
          })),
          userThesis: userQuery,
        }),
        schema: emailSchema,
        temperature: 0.6,
      });
      const body = object.body.trim().endsWith("— Gaurav")
        ? object.body.trim()
        : `${object.body.trim()}\n\n— Gaurav`;
      email = { subject: object.subject, body };
    } catch {
      email = undefined;
    }

    const prospect: Prospect = {
      id: `${person.crustdata_person_id ?? idx}`,
      name,
      headline: person.basic_profile?.headline,
      title,
      companyName: company,
      location:
        person.basic_profile?.location?.full_location ??
        person.basic_profile?.location?.raw,
      profileUrl: url,
      score,
      scoreReasons: reasons,
      evidence,
      email,
    };
    channel.push(prospect);
    completed += 1;
    notify?.();
  });

  const allSettled = Promise.allSettled(tasks).then(() => {
    notify?.();
  });

  while (completed < topCandidates.length || channel.length > 0) {
    if (channel.length === 0) {
      await new Promise<void>((r) => {
        notify = r;
      });
      notify = null;
      continue;
    }
    // Yield highest-scoring available next for dramatic effect
    channel.sort((a, b) => b.score - a.score);
    const next = channel.shift()!;
    yield { kind: "prospect", prospect: next };
  }
  await allSettled;
  yield { kind: "done", totalProspects: topCandidates.length };
  void generateText;
}

function buildWebQuery(
  name: string,
  company: string | undefined,
  signalQuery: string,
): string {
  const pieces = [name];
  if (company) pieces.push(company);
  // Slice signalQuery to ~6 tokens
  const signalTrim = signalQuery.split(/\s+/).slice(0, 6).join(" ");
  pieces.push(signalTrim);
  return pieces.join(" ");
}
