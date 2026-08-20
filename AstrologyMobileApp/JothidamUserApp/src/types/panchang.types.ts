// Verified against source/src/app/api/panchang/today/route.ts.
export interface PanchangResponse {
  date: string;
  isoDate: string;
  varam: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  rahuKalam: string;
  yamagandam: string;
  shubhaMuhurtham: string;
  sunrise: string;
  sunset: string;
  nallaNeram: { morning: string; evening: string };
  gowriNeram: { morning: string; evening: string };
  specialDay: string;
}
