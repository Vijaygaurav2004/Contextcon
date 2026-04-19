export type FilterOp =
  | "="
  | "!="
  | "<"
  | ">"
  | "=<"
  | "=>"
  | "in"
  | "not_in"
  | "(.)"
  | "[.]"
  | "is_null"
  | "is_not_null";

export type FilterCondition = {
  field: string;
  type: FilterOp;
  value?: string | number | boolean | Array<string | number>;
};

export type FilterGroup = {
  op: "and" | "or";
  conditions: Array<FilterCondition | FilterGroup>;
};

export type Filter = FilterCondition | FilterGroup;

export type Sort = { column: string; order: "asc" | "desc" };

export type CompanyHit = {
  crustdata_company_id: number;
  basic_info?: {
    name?: string;
    primary_domain?: string;
    year_founded?: string;
    industries?: string[];
  };
  headcount?: { total?: number };
  funding?: {
    total_investment_usd?: number;
    last_round_type?: string;
    last_fundraise_date?: string;
  };
  locations?: { country?: string; hq_country?: string };
  taxonomy?: { professional_network_industry?: string };
};

export type PersonHit = {
  crustdata_person_id: number;
  basic_profile?: {
    name?: string;
    headline?: string;
    current_title?: string;
    location?: { raw?: string; full_location?: string; country?: string };
  };
  social_handles?: {
    professional_network_identifier?: { profile_url?: string };
  };
  experience?: {
    employment_details?: {
      current?: Array<{
        company_name?: string;
        name?: string;
        title?: string;
        start_date?: string;
        crustdata_company_id?: number;
      }>;
      past?: Array<{
        company_name?: string;
        name?: string;
        title?: string;
      }>;
    };
  };
};

export type EnrichedPerson = {
  matched_on: string;
  match_type: string;
  matches: Array<{
    confidence_score: number;
    person_data: PersonHit & {
      experience?: PersonHit["experience"] & {
        employment_details?: {
          current?: Array<Record<string, unknown>>;
          past?: Array<Record<string, unknown>>;
        };
      };
    };
  }>;
};

export type WebSearchResult = {
  source?: string;
  title: string;
  url: string;
  snippet: string;
  position?: number;
};

export type Prospect = {
  id: string;
  name: string;
  headline?: string;
  title?: string;
  companyName?: string;
  location?: string;
  profileUrl?: string;
  companyDomain?: string;
  score: number;
  scoreReasons: string[];
  evidence: Array<{
    label: string;
    detail: string;
    source?: { label: string; url?: string };
  }>;
  email?: { subject: string; body: string };
};

export type PlanSpec = {
  companyFilters: Filter | null;
  personTitleRegex: string;
  personLocationContains?: string;
  industryHint?: string;
  targetCount: number;
  webSignalQuery: string;
  rationale: string;
};

export type StepEvent =
  | { kind: "status"; message: string }
  | { kind: "plan"; plan: PlanSpec }
  | {
      kind: "api";
      name: string;
      method: string;
      endpoint: string;
      latencyMs?: number;
      resultCount?: number;
      note?: string;
    }
  | { kind: "prospect"; prospect: Prospect }
  | { kind: "error"; message: string }
  | { kind: "done"; totalProspects: number };
