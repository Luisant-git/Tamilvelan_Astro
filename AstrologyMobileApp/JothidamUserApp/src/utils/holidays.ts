// Important days: National, Tamil Nadu, International, and Optional observances.
// Mirrors frontend/src/lib/holidays.ts — kept in sync manually since the mobile
// app and website are separate codebases.
//
// Two kinds of entries:
// - FIXED_ANNUAL_DAYS: same month/day every year (most National/International/TN
//   observances — Republic Day, Independence Day, UN-designated days, etc.).
//   Generated for any requested year, not hardcoded to one year.
// - VARIABLE_DATE_EVENTS_BY_YEAR: lunar/Islamic-calendar festivals (Pongal,
//   Shivaratri, Eid, Diwali, ...) whose Gregorian date shifts every year. These
//   genuinely can't be computed without a lunar/Islamic calendar engine, so
//   they're listed per year — add the next year's dates here as they're published.

export type HolidayKind = 'national' | 'tamilnadu' | 'international' | 'optional';

export type Holiday = {
  isoDate: string;      // YYYY-MM-DD
  ta: string;
  en: string;
  kind: HolidayKind;
};

type FixedDay = { month: number; day: number; ta: string; en: string; kind: HolidayKind };

const FIXED_ANNUAL_DAYS: FixedDay[] = [
  // January
  { month: 1, day: 1,  ta: 'புத்தாண்டு தினம்',              en: "New Year's Day",              kind: 'optional' },
  { month: 1, day: 12, ta: 'தேசிய இளைஞர் தினம்',            en: 'National Youth Day',           kind: 'national' },
  { month: 1, day: 15, ta: 'திருவள்ளுவர் தினம்',            en: 'Thiruvalluvar Day',            kind: 'tamilnadu' },
  { month: 1, day: 16, ta: 'உழவர் திருநாள்',               en: 'Uzhavar Thirunal',             kind: 'tamilnadu' },
  { month: 1, day: 26, ta: 'குடியரசு தினம்',                en: 'Republic Day',                 kind: 'national' },
  // February
  { month: 2, day: 28, ta: 'தேசிய அறிவியல் தினம்',          en: 'National Science Day',         kind: 'national' },
  // March
  { month: 3, day: 8,  ta: 'சர்வதேச மகளிர் தினம்',          en: "International Women's Day",   kind: 'international' },
  { month: 3, day: 22, ta: 'உலக நீர் தினம்',                en: 'World Water Day',              kind: 'international' },
  // April
  { month: 4, day: 7,  ta: 'உலக சுகாதார தினம்',             en: 'World Health Day',             kind: 'international' },
  { month: 4, day: 14, ta: 'தமிழ் புத்தாண்டு / அம்பேத்கர் ஜெயந்தி', en: 'Tamil New Year / Dr. B.R. Ambedkar Jayanti', kind: 'tamilnadu' },
  { month: 4, day: 22, ta: 'புவி தினம்',                    en: 'Earth Day',                    kind: 'international' },
  // May
  { month: 5, day: 1,  ta: 'தொழிலாளர் தினம்',              en: 'International Labour Day',    kind: 'international' },
  { month: 5, day: 1,  ta: 'தொழிலாளர் தினம் (மே தினம்)',    en: 'May Day (Tamil Nadu Holiday)', kind: 'tamilnadu' },
  { month: 5, day: 31, ta: 'உலக புகையிலை எதிர்ப்பு தினம்',  en: 'World No Tobacco Day',         kind: 'international' },
  // June
  { month: 6, day: 5,  ta: 'உலக சுற்றுச்சூழல் தினம்',       en: 'World Environment Day',        kind: 'international' },
  { month: 6, day: 21, ta: 'சர்வதேச யோகா தினம்',            en: 'International Yoga Day',       kind: 'international' },
  // July
  { month: 7, day: 1,  ta: 'தேசிய மருத்துவர் தினம்',        en: "National Doctors' Day",        kind: 'national' },
  { month: 7, day: 11, ta: 'உலக மக்கள்தொகை தினம்',          en: 'World Population Day',         kind: 'international' },
  // August
  { month: 8, day: 15, ta: 'சுதந்திர தினம்',                en: 'Independence Day',             kind: 'national' },
  { month: 8, day: 29, ta: 'தேசிய விளையாட்டு தினம்',        en: 'National Sports Day',          kind: 'national' },
  // September
  { month: 9, day: 5,  ta: 'ஆசிரியர் தினம்',                en: "Teachers' Day",                kind: 'national' },
  { month: 9, day: 14, ta: 'இந்தி தினம்',                   en: 'Hindi Diwas',                  kind: 'national' },
  { month: 9, day: 27, ta: 'உலக சுற்றுலா தினம்',            en: 'World Tourism Day',            kind: 'international' },
  // October
  { month: 10, day: 2,  ta: 'காந்தி ஜெயந்தி',               en: 'Gandhi Jayanti',               kind: 'national' },
  { month: 10, day: 24, ta: 'ஐக்கிய நாடுகள் தினம்',         en: 'United Nations Day',           kind: 'international' },
  // November
  { month: 11, day: 14, ta: 'குழந்தைகள் தினம்',             en: "Children's Day",               kind: 'national' },
  { month: 11, day: 26, ta: 'அரசியலமைப்பு தினம்',           en: 'Constitution Day',             kind: 'national' },
  // December
  { month: 12, day: 1,  ta: 'உலக எய்ட்ஸ் தினம்',            en: 'World AIDS Day',               kind: 'international' },
  { month: 12, day: 10, ta: 'மனித உரிமைகள் தினம்',          en: 'Human Rights Day',             kind: 'international' },
  { month: 12, day: 25, ta: 'கிறிஸ்துமஸ்',                  en: 'Christmas',                     kind: 'national' }
];

// Lunar/Islamic-calendar festivals — Gregorian date changes every year.
// Dates for 2027+ aren't published yet; add each year's dates here once known.
const VARIABLE_DATE_EVENTS_BY_YEAR: Record<number, Array<{ isoDate: string; ta: string; en: string; kind: HolidayKind }>> = {
  2026: [
    { isoDate: '2026-01-14', ta: 'பொங்கல்',                  en: 'Pongal',                   kind: 'tamilnadu' },
    { isoDate: '2026-02-17', ta: 'மகா சிவராத்திரி',           en: 'Maha Shivaratri',          kind: 'optional' },
    { isoDate: '2026-03-04', ta: 'ஹோலி',                     en: 'Holi',                     kind: 'national' },
    { isoDate: '2026-03-21', ta: 'ஈத்-உல்-ஃபித்ர்',           en: 'Eid-ul-Fitr',              kind: 'national' },
    { isoDate: '2026-04-03', ta: 'குட் ஃபிரைடே',              en: 'Good Friday',              kind: 'national' },
    { isoDate: '2026-04-26', ta: 'ராம நவமி',                  en: 'Ram Navami',               kind: 'optional' },
    { isoDate: '2026-05-28', ta: 'பக்ரீத் (ஈத்-உல்-அழா)',    en: 'Bakrid (Eid-ul-Adha)',     kind: 'national' },
    { isoDate: '2026-06-26', ta: 'முஹர்ரம்',                  en: 'Muharram',                 kind: 'national' },
    { isoDate: '2026-08-27', ta: 'விநாயக சதுர்த்தி',          en: 'Vinayaka Chaturthi',       kind: 'optional' },
    { isoDate: '2026-09-04', ta: 'மிலாது-உன்-நபி',           en: 'Milad-un-Nabi',            kind: 'national' },
    { isoDate: '2026-10-20', ta: 'ஆயுத பூஜை',                en: 'Ayudha Pooja',             kind: 'tamilnadu' },
    { isoDate: '2026-10-21', ta: 'விஜயதசமி',                 en: 'Vijayadasami',             kind: 'tamilnadu' },
    { isoDate: '2026-11-08', ta: 'தீபாவளி',                  en: 'Deepavali',                kind: 'national' }
  ]
};

const TA_WEEKDAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

export function weekdayTaForIso(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  return TA_WEEKDAYS[new Date(y, m - 1, d).getDay()];
}

export function holidaysForMonth(year: number, monthZeroBased: number): Holiday[] {
  const month = monthZeroBased + 1;
  const mm = String(month).padStart(2, '0');

  const fixed: Holiday[] = FIXED_ANNUAL_DAYS
    .filter(f => f.month === month)
    .map(f => ({
      isoDate: `${year}-${mm}-${String(f.day).padStart(2, '0')}`,
      ta: f.ta,
      en: f.en,
      kind: f.kind
    }));

  const prefix = `${year}-${mm}-`;
  const variable: Holiday[] = (VARIABLE_DATE_EVENTS_BY_YEAR[year] ?? [])
    .filter(v => v.isoDate.startsWith(prefix));

  return [...fixed, ...variable].sort((a, b) => a.isoDate.localeCompare(b.isoDate));
}
