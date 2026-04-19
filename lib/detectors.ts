import {
  companySearch,
  personEnrich,
  personSearch,
  webSearch,
} from "./crustdata";
import type { BuyingSignal, WatchlistEntry } from "./signal-types";

const RECENCY_DAYS = 45;

function daysAgo(dateStr: string | undefined): number {
  if (!dateStr) return Infinity;
  try {
    const d = new Date(dateStr);
    const now = new Date();
    return Math.floor((now.getTime() - d.getTime()) / 86400000);
  } catch {
    return Infinity;
  }
}

export async function detectFundingSignals(
  domains: string[],
): Promise<BuyingSignal[]> {
  if (!domains.length) return [];
  const signals: BuyingSignal[] = [];

  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RECENCY_DAYS);
  const cutoffISO = cutoff.toISOString().split("T")[0];

  try {
    const res = await companySearch({
      filters: {
        op: "and",
        conditions: [
          { field: "basic_info.primary_domain", type: "in", value: domains },
          {
            field: "funding.last_fundraise_date",
            type: "=>",
            value: cutoffISO,
          },
        ],
      },
      fields: [
        "crustdata_company_id",
        "basic_info.name",
        "basic_info.primary_domain",
        "funding.last_fundraise_date",
        "funding.last_round_type",
        "funding.last_round_amount_usd",
        "funding.total_investment_usd",
      ],
      limit: 50,
    });

    for (const co of res.companies ?? []) {
      const days = daysAgo(co.funding?.last_fundraise_date);
      if (days > RECENCY_DAYS) continue;

      const roundType =
        co.funding?.last_round_type?.replace(/_/g, " ").toUpperCase() ??
        "funding round";
      const amountUSD = co.funding?.last_round_amount_usd;
      const amountStr = amountUSD
        ? `$${(amountUSD / 1_000_000).toFixed(1)}M`
        : "";

      signals.push({
        id: `funding-${co.crustdata_company_id}-${Date.now()}`,
        type: "funding",
        firedAt: new Date(),
        score: Math.max(70, 99 - days * 0.5),
        company: {
          name: co.basic_info?.name ?? "Unknown",
          domain: co.basic_info?.primary_domain ?? "",
          crustdata_id: co.crustdata_company_id,
        },
        trigger: {
          headline: `${co.basic_info?.name} raised ${roundType} ${days} days ago`,
          detail: amountStr
            ? `${amountStr} raised • Close-win rate jumps 4× in the 60 days post-raise`
            : `Budget cycles unlock immediately after fundraising`,
        },
        evidence: [
          {
            label: "Round type",
            value: roundType,
          },
          ...(amountStr
            ? [{ label: "Amount", value: amountStr }]
            : []),
          {
            label: "Days since raise",
            value: `${days} days`,
          },
          {
            label: "Total raised to date",
            value: co.funding?.total_investment_usd
              ? `$${(co.funding.total_investment_usd / 1_000_000).toFixed(1)}M`
              : "Unknown",
          },
        ],
        playbook: "funding",
      });
    }
  } catch (err) {
    console.error("Funding signal detection failed:", err);
  }

  return signals;
}

export async function detectExecHireSignals(
  domains: string[],
): Promise<BuyingSignal[]> {
  if (!domains.length) return [];
  const signals: BuyingSignal[] = [];

  try {
    const companyRes = await companySearch({
      filters: {
        field: "basic_info.primary_domain",
        type: "in",
        value: domains.slice(0, 30),
      },
      fields: ["crustdata_company_id", "basic_info.name", "basic_info.primary_domain"],
      limit: 50,
    });

    const companyNames = (companyRes.companies ?? [])
      .map((c) => c.basic_info?.name)
      .filter((n): n is string => Boolean(n));

    if (!companyNames.length) return [];

    const personRes = await personSearch({
      filters: {
        op: "and",
        conditions: [
          {
            field: "experience.employment_details.current.company_name",
            type: "in",
            value: companyNames.slice(0, 40),
          },
          {
            field: "experience.employment_details.current.title",
            type: "(.)",
            value: "VP|Head of|Chief|CRO|CTO|CMO|CPO",
          },
        ],
      },
      fields: [
        "crustdata_person_id",
        "basic_profile.name",
        "basic_profile.headline",
        "experience.employment_details.current",
        "social_handles.professional_network_identifier.profile_url",
      ],
      limit: 40,
    });

    for (const person of personRes.profiles ?? []) {
      const currentRole = person.experience?.employment_details?.current?.[0];
      if (!currentRole?.start_date) continue;

      const days = daysAgo(currentRole.start_date);
      if (days > RECENCY_DAYS) continue;

      const companyName = currentRole.company_name ?? currentRole.name ?? "Unknown";

      signals.push({
        id: `exec-${person.crustdata_person_id}-${Date.now()}`,
        type: "exec_hire",
        firedAt: new Date(),
        score: Math.max(75, 99 - days * 0.6),
        company: {
          name: companyName,
          domain: "",
          crustdata_id: currentRole.crustdata_company_id,
        },
        person: {
          name: person.basic_profile?.name ?? "Unknown",
          title: currentRole.title,
          profileUrl:
            person.social_handles?.professional_network_identifier?.profile_url,
          crustdata_id: person.crustdata_person_id,
        },
        trigger: {
          headline: `${person.basic_profile?.name} joined ${companyName} as ${currentRole.title}`,
          detail: `${days} days ago • New execs = new budget = fresh buying window`,
        },
        evidence: [
          {
            label: "Title",
            value: currentRole.title ?? "Executive",
          },
          {
            label: "Days in role",
            value: `${days} days`,
          },
          {
            label: "Company",
            value: companyName,
          },
        ],
        playbook: "exec_hire",
      });
    }
  } catch (err) {
    console.error("Exec hire signal detection failed:", err);
  }

  return signals;
}

export async function detectGrowthSignals(
  domains: string[],
): Promise<BuyingSignal[]> {
  if (!domains.length) return [];
  const signals: BuyingSignal[] = [];

  try {
    const res = await companySearch({
      filters: {
        field: "basic_info.primary_domain",
        type: "in",
        value: domains,
      },
      fields: [
        "crustdata_company_id",
        "basic_info.name",
        "basic_info.primary_domain",
        "headcount.total",
        "roles.growth_6m",
      ],
      limit: 50,
    });

    for (const co of res.companies ?? []) {
      const sixMonthGrowth = co.roles?.growth_6m;
      if (!sixMonthGrowth || typeof sixMonthGrowth !== "object") continue;

      const totalGrowth = Object.values(sixMonthGrowth as Record<string, number>)
        .filter((v) => typeof v === "number")
        .reduce((sum, v) => sum + v, 0);

      const growthPct =
        co.headcount?.total && co.headcount.total > 0
          ? (totalGrowth / co.headcount.total) * 100
          : 0;

      if (growthPct < 15) continue;

      signals.push({
        id: `growth-${co.crustdata_company_id}-${Date.now()}`,
        type: "growth",
        firedAt: new Date(),
        score: Math.min(99, 60 + growthPct * 1.5),
        company: {
          name: co.basic_info?.name ?? "Unknown",
          domain: co.basic_info?.primary_domain ?? "",
          crustdata_id: co.crustdata_company_id,
        },
        trigger: {
          headline: `${co.basic_info?.name} grew headcount ${growthPct.toFixed(0)}% in 6 months`,
          detail: `${totalGrowth > 0 ? "+" : ""}${totalGrowth} employees • Rapid growth = scaling pains = buying urgency`,
        },
        evidence: [
          {
            label: "6-month growth",
            value: `${growthPct.toFixed(0)}%`,
          },
          {
            label: "Net new hires",
            value: `${totalGrowth > 0 ? "+" : ""}${totalGrowth}`,
          },
          {
            label: "Current headcount",
            value: `${co.headcount?.total ?? "Unknown"}`,
          },
        ],
        playbook: "growth",
      });
    }
  } catch (err) {
    console.error("Growth signal detection failed:", err);
  }

  return signals;
}

export async function detectChampionMoveSignals(
  profileUrls: string[],
): Promise<BuyingSignal[]> {
  if (!profileUrls.length) return [];
  const signals: BuyingSignal[] = [];

  try {
    const enriched = await personEnrich(profileUrls);

    for (const result of enriched) {
      const person = result.matches?.[0]?.person_data;
      if (!person) continue;

      const currentRole = person.experience?.employment_details?.current?.[0];
      if (!currentRole?.start_date) continue;

      const days = daysAgo(currentRole.start_date);
      if (days > RECENCY_DAYS) continue;

      const companyName = currentRole.company_name ?? currentRole.name ?? "Unknown";

      signals.push({
        id: `champion-${person.crustdata_person_id}-${Date.now()}`,
        type: "champion_move",
        firedAt: new Date(),
        score: Math.max(85, 99 - days * 0.4),
        company: {
          name: companyName,
          domain: "",
          crustdata_id: currentRole.crustdata_company_id,
        },
        person: {
          name: person.basic_profile?.name ?? "Unknown",
          title: currentRole.title,
          profileUrl:
            person.social_handles?.professional_network_identifier?.profile_url,
          crustdata_id: person.crustdata_person_id,
        },
        trigger: {
          headline: `${person.basic_profile?.name} moved to ${companyName} as ${currentRole.title}`,
          detail: `${days} days ago • Past champions = instant trust + 10× close rate`,
        },
        evidence: [
          {
            label: "New company",
            value: companyName,
          },
          {
            label: "New title",
            value: currentRole.title ?? "—",
          },
          {
            label: "Days since move",
            value: `${days} days`,
          },
        ],
        playbook: "champion_reactivation",
      });
    }
  } catch (err) {
    console.error("Champion move signal detection failed:", err);
  }

  return signals;
}

export async function runAllDetectors(
  watchlist: WatchlistEntry[],
): Promise<BuyingSignal[]> {
  const companyDomains = watchlist
    .filter((e) => e.type === "company")
    .map((e) => (e as { domain: string }).domain);

  const championUrls = watchlist
    .filter((e) => e.type === "champion")
    .map((e) => (e as { profileUrl: string }).profileUrl);

  const [funding, execs, growth, champions] = await Promise.all([
    detectFundingSignals(companyDomains),
    detectExecHireSignals(companyDomains),
    detectGrowthSignals(companyDomains),
    detectChampionMoveSignals(championUrls),
  ]);

  return [...funding, ...execs, ...growth, ...champions].sort(
    (a, b) => b.score - a.score,
  );
}
