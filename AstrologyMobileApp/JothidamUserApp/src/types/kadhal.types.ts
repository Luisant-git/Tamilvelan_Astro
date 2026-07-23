// Verified against source/src/app/api/kadhal/match/route.ts — exact match
// to the screen's pre-existing local Result/Traits interfaces.

export interface KadhalMatchRequest {
  name1: string;
  name2: string;
}

export interface KadhalTraits {
  trust: number;
  communication: number;
  passion: number;
  stability: number;
}

export interface KadhalMatchResponse {
  name1: string;
  name2: string;
  percentage: number;
  verdict: string;
  traits: KadhalTraits;
}
