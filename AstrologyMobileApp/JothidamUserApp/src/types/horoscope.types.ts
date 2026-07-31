// Verified field-for-field against a live POST /horoscope/generate response
// (and against the backend's own FullChart type in source/src/lib/astrology.ts).
// `JathagamScreen.tsx` re-exports these so JathagamForm/JathagamResult's
// existing `from './JathagamScreen'` imports keep working unchanged.

export interface BirthInfo {
  fullName: string;
  gender: string;
  dobFormatted: string;
  dobIso: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
}

export interface Planet {
  name: string;
  nameTamil: string;
  longitude: number;
  rasi: number;
  rasiNameTamil: string;
  degInRasi: number;
  degInRasiStr: string;
  nakshatra: number;
  nakshatraTamil: string;
  pada: number;
}

export interface DashaBhukti {
  lord: string;
  lordTamil: string;
  startDate: string;
  endDate: string;
  years: number;
  canonicalYears: number;
  isCurrent?: boolean;
}

export interface DashaPeriod extends DashaBhukti {
  bhukti?: DashaBhukti[];
}

export interface ChartData {
  chart: {
    birthInfo: BirthInfo;
    ayanamsa: number;
    ayanamsaName: string;
    lagna: { rasi: number; rasiTamil: string; lord: string; degInRasi: number };
    rasi: { num: number; nameTamil: string };
    nakshatra: { index: number; nameTamil: string; pada: number };
    tithi: { index: number; nameTamil: string; paksha: string };
    planets: Record<string, Planet>;
    navamsa: Record<string, { rasi: number; rasiTamil: string }>;
    navamsaLagna: number;
    dasha: {
      balanceYears: number;
      balanceLord: string;
      balanceLordTamil: string;
      mahadashas: DashaPeriod[];
    };
    currentMd?: DashaPeriod;
    currentBhukti?: DashaBhukti;
    dosham: {
      saniDosha: { present: boolean; templeUrl: string };
      chevvaiDosha: { present: boolean; templeUrl: string };
      sarpaDosha: { present: boolean; templeUrl: string };
      papaPercent: { lagna: number; moon: number; venus: number };
    };
  };
}

export interface GenerateHoroscopeRequest {
  fullName: string;
  gender?: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  latitude?: number;
  longitude?: number;
  timezoneOffsetHours?: number;
  chartStyle?: string;
  language?: string;
  profileId?: string;
  saveProfile?: boolean;
}

export interface GenerateHoroscopeResponse extends ChartData {
  success: true;
  profileId?: string | null;
  chartId?: string | null;
  meta: { chartStyle: string; language: string };
}

export interface DailyRasiResponse {
  rasi: number;
  rasiName: string;
  date: string;
  prediction: string;
  preview: string;
}

export interface HoroscopeHistoryItem {
  id: string;
  rasi: string;
  lagna: string;
  nakshatra: string;
  dashaLord: string;
  generatedAt: string;
  profile: { id: string; fullName: string; birthPlace: string; dob: string };
}

export interface HoroscopeHistoryResponse {
  charts: HoroscopeHistoryItem[];
}

export interface GeocodeSuggestion {
  label: string;
  latitude: number;
  longitude: number;
  country: string | null;
  state: string | null;
  timezone: string | null;
}

export interface GeocodeResponse {
  suggestions: GeocodeSuggestion[];
}
