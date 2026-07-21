// Verified field-for-field against a live POST /marriage/match response.
// PoruthamItem/MatchDosham already live in utils/porutham.ts (ported from the
// website's lib/astrology.ts) — re-exported here rather than redeclared,
// since the backend's response uses the exact same shapes.
export type { PoruthamItem, MatchDosham } from '../utils/porutham';
import type { PoruthamItem, MatchDosham } from '../utils/porutham';

export interface SideChart {
  name: string;
  dobIso: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  lagna: string;
  lagnaRasi: number;
  rasi: string;
  rasiNum: number;
  nakshatra: string;
  pada: number;
  planets: Record<string, { rasi: number }>;
}

export interface MarriageMatchRequest {
  brideName: string;
  brideDob: string;
  brideBirthTime?: string;
  brideBirthPlace?: string;
  brideLatitude?: number;
  brideLongitude?: number;
  groomName: string;
  groomDob: string;
  groomBirthTime?: string;
  groomBirthPlace?: string;
  groomLatitude?: number;
  groomLongitude?: number;
}

export interface MarriageMatchResponse {
  matchId: string;
  bride: SideChart;
  groom: SideChart;
  porutthams: PoruthamItem[];
  totalScore: number;
  maxScore: number;
  percentage: number;
  doshams: MatchDosham[];
  recommendation: string;
}

export interface MarriageHistoryItem {
  id: string;
  brideName: string;
  groomName: string;
  totalScore: number;
  createdAt: string;
}

export interface MarriageHistoryResponse {
  matches: MarriageHistoryItem[];
}
