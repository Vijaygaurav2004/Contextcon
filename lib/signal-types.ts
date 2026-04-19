export type SignalType = "funding" | "exec_hire" | "growth" | "champion_move";

export type BuyingSignal = {
  id: string;
  type: SignalType;
  firedAt: Date;
  score: number;
  company?: {
    name: string;
    domain: string;
    crustdata_id?: number;
  };
  person?: {
    name: string;
    title?: string;
    profileUrl?: string;
    crustdata_id?: number;
  };
  trigger: {
    headline: string;
    detail: string;
  };
  evidence: Array<{
    label: string;
    value: string;
    source?: { label: string; url?: string };
  }>;
  playbook: "funding" | "exec_hire" | "growth" | "champion_reactivation";
  email?: {
    subject: string;
    body: string;
  };
};

export type WatchlistEntry =
  | { type: "company"; domain: string }
  | { type: "champion"; profileUrl: string; context?: string };

export type DetectorEvent =
  | { kind: "status"; message: string }
  | { kind: "signal"; signal: BuyingSignal }
  | { kind: "error"; message: string }
  | { kind: "done"; totalSignals: number };
