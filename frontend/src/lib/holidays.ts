// Major Indian / Tamil Nadu government & festival holidays for the year.
// Dates for lunar/Islamic festivals are approximate (vary year to year).

export type Holiday = {
  isoDate: string;      // YYYY-MM-DD
  ta: string;
  en: string;
  kind: 'national' | 'tamilnadu' | 'optional';
};

export const HOLIDAYS_2026: Holiday[] = [
  { isoDate: '2026-01-01', ta: 'புத்தாண்டு தினம்',          en: "New Year's Day",          kind: 'optional' },
  { isoDate: '2026-01-14', ta: 'பொங்கல்',                  en: 'Pongal',                   kind: 'tamilnadu' },
  { isoDate: '2026-01-15', ta: 'திருவள்ளுவர் தினம்',        en: 'Thiruvalluvar Day',        kind: 'tamilnadu' },
  { isoDate: '2026-01-16', ta: 'உழவர் திருநாள்',           en: 'Uzhavar Thirunal',         kind: 'tamilnadu' },
  { isoDate: '2026-01-26', ta: 'குடியரசு தினம்',            en: 'Republic Day',             kind: 'national' },
  { isoDate: '2026-02-17', ta: 'மகா சிவராத்திரி',           en: 'Maha Shivaratri',          kind: 'optional' },
  { isoDate: '2026-03-04', ta: 'ஹோலி',                     en: 'Holi',                     kind: 'national' },
  { isoDate: '2026-03-21', ta: 'ஈத்-உல்-ஃபித்ர்',            en: 'Eid-ul-Fitr',              kind: 'national' },
  { isoDate: '2026-04-03', ta: 'குட் ஃபிரைடே',              en: 'Good Friday',              kind: 'national' },
  { isoDate: '2026-04-14', ta: 'தமிழ் புத்தாண்டு / அம்பேத்கர் ஜெயந்தி', en: 'Tamil New Year / Ambedkar Jayanti', kind: 'tamilnadu' },
  { isoDate: '2026-04-26', ta: 'ராம நவமி',                  en: 'Ram Navami',               kind: 'optional' },
  { isoDate: '2026-05-01', ta: 'தொழிலாளர் தினம்',          en: 'May Day',                  kind: 'tamilnadu' },
  { isoDate: '2026-05-28', ta: 'பக்ரீத் (ஈத்-உல்-அழா)',    en: 'Bakrid (Eid-ul-Adha)',     kind: 'national' },
  { isoDate: '2026-06-26', ta: 'முஹர்ரம்',                  en: 'Muharram',                 kind: 'national' },
  { isoDate: '2026-08-15', ta: 'சுதந்திர தினம்',            en: 'Independence Day',         kind: 'national' },
  { isoDate: '2026-08-27', ta: 'விநாயக சதுர்த்தி',          en: 'Vinayaka Chaturthi',       kind: 'optional' },
  { isoDate: '2026-09-04', ta: 'மிலாது-உன்-நபி',           en: 'Milad-un-Nabi',            kind: 'national' },
  { isoDate: '2026-10-02', ta: 'காந்தி ஜெயந்தி',            en: 'Gandhi Jayanti',           kind: 'national' },
  { isoDate: '2026-10-20', ta: 'ஆயுத பூஜை',                en: 'Ayudha Pooja',             kind: 'tamilnadu' },
  { isoDate: '2026-10-21', ta: 'விஜயதசமி',                 en: 'Vijayadasami',             kind: 'tamilnadu' },
  { isoDate: '2026-11-08', ta: 'தீபாவளி',                  en: 'Deepavali',                kind: 'national' },
  { isoDate: '2026-12-25', ta: 'கிறிஸ்துமஸ்',              en: 'Christmas',                kind: 'national' }
];

const TA_WEEKDAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

export function weekdayTaForIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return TA_WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export function holidaysForMonth(year: number, monthZeroBased: number): Holiday[] {
  const prefix = `${year}-${String(monthZeroBased + 1).padStart(2, '0')}-`;
  return HOLIDAYS_2026.filter(h => h.isoDate.startsWith(prefix));
}
