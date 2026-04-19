import type {
  CompanyHit,
  EnrichedPerson,
  Filter,
  PersonHit,
  Sort,
  WebSearchResult,
} from "./types";

const BASE_URL = "https://api.crustdata.com";
const API_VERSION = "2025-11-01";

function apiKey(): string {
  const key = process.env.CRUSTDATA_API_KEY;
  if (!key) {
    throw new Error(
      "CRUSTDATA_API_KEY is not set. Add it to .env.local and restart the dev server.",
    );
  }
  return key;
}

async function post<T>(path: string, body: unknown, retries = 1): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25_000);
      const res = await fetch(`${BASE_URL}${path}`, {
        method: "POST",
        headers: {
          authorization: `Bearer ${apiKey()}`,
          "x-api-version": API_VERSION,
          "content-type": "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
        signal: controller.signal,
      });
      clearTimeout(timeout);

      const text = await res.text();
      if (!res.ok) {
        let message = text;
        try {
          const parsed = JSON.parse(text);
          message =
            parsed?.error?.message ??
            parsed?.description ??
            parsed?.reason ??
            parsed?.message ??
            text;
        } catch {}
        // Retry on transient 5xx/429
        if ((res.status >= 500 || res.status === 429) && attempt < retries) {
          await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
          continue;
        }
        throw new Error(
          `Crustdata ${path} failed (${res.status}): ${message.slice(0, 400)}`,
        );
      }
      try {
        return JSON.parse(text) as T;
      } catch {
        throw new Error(`Crustdata ${path} returned non-JSON response`);
      }
    } catch (err) {
      lastErr = err;
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
        continue;
      }
    }
  }
  throw lastErr instanceof Error
    ? lastErr
    : new Error(`Crustdata ${path} failed`);
}

export type CompanySearchRequest = {
  filters?: Filter;
  fields?: string[];
  sorts?: Sort[];
  limit?: number;
  cursor?: string;
};

export type CompanySearchResponse = {
  companies: CompanyHit[];
  next_cursor: string | null;
  total_count: number | null;
};

export async function companySearch(
  req: CompanySearchRequest,
): Promise<CompanySearchResponse> {
  return post<CompanySearchResponse>("/company/search", req);
}

export type PersonSearchRequest = {
  filters: Filter;
  fields?: string[];
  sorts?: Sort[];
  limit?: number;
  cursor?: string;
};

export type PersonSearchResponse = {
  profiles: PersonHit[];
  next_cursor: string | null;
  total_count: number | null;
};

export async function personSearch(
  req: PersonSearchRequest,
): Promise<PersonSearchResponse> {
  return post<PersonSearchResponse>("/person/search", req);
}

export async function companyAutocomplete(
  field: string,
  query: string,
  limit = 10,
  filters?: Filter,
): Promise<string[]> {
  const body: Record<string, unknown> = { field, query, limit };
  if (filters) body.filters = filters;
  const res = await post<{ suggestions: Array<{ value: string }> }>(
    "/company/search/autocomplete",
    body,
  );
  return res.suggestions.map((s) => s.value).filter(Boolean);
}

export async function personAutocomplete(
  field: string,
  query: string,
  limit = 10,
): Promise<string[]> {
  const res = await post<{ suggestions: Array<{ value: string }> }>(
    "/person/search/autocomplete",
    { field, query, limit },
  );
  return res.suggestions.map((s) => s.value).filter(Boolean);
}

export async function personEnrich(
  profileUrls: string[],
): Promise<EnrichedPerson[]> {
  if (!profileUrls.length) return [];
  return post<EnrichedPerson[]>("/person/enrich", {
    professional_network_profile_urls: profileUrls,
  });
}

export async function webSearch(
  query: string,
  limit = 5,
): Promise<WebSearchResult[]> {
  const res = await post<{ success: boolean; results: WebSearchResult[] }>(
    "/web/search/live",
    { query, limit },
  );
  return res.results ?? [];
}
