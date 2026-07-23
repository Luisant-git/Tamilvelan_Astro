// Auspicious-time (muhurtham) finder.
// Uses the same heuristic tithi/nakshatra formulas as /api/panchang/today so
// behaviour is consistent across the app. Not ephemeris-accurate.

import { HOLIDAYS_2026 } from './holidays';

export const NAKSHATRA = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்',
  'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்',
  'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி',
  'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்',
  'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
];

const TITHI = [
  'பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி',
  'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி',
  'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்தசி', 'அமாவாசை / பூர்ணிமை'
];

const NALLA_NERAM: Record<number, { morning: string; evening: string }> = {
  0: { morning: '08:00 - 09:00', evening: '03:00 - 04:00' },
  1: { morning: '09:30 - 10:30', evening: '04:30 - 05:30' },
  2: { morning: '07:00 - 08:00', evening: '02:00 - 03:00' },
  3: { morning: '09:30 - 10:30', evening: '04:30 - 05:30' },
  4: { morning: '08:00 - 09:00', evening: '03:00 - 04:00' },
  5: { morning: '10:30 - 11:30', evening: '05:30 - 06:30' },
  6: { morning: '06:30 - 07:30', evening: '01:30 - 02:30' }
};

export type Purpose =
  | 'wedding'
  | 'griha-pravesh'
  | 'vehicle'
  | 'business'
  | 'education'
  | 'travel';

export const PURPOSES: Array<{ key: Purpose; ta: string; en: string; icon: string }> = [
  { key: 'wedding',       ta: 'திருமணம்',           en: 'Wedding',           icon: '💍' },
  { key: 'griha-pravesh', ta: 'கிரகப்பிரவேசம்',    en: 'House Warming',     icon: '🏠' },
  { key: 'vehicle',       ta: 'வாகனம் வாங்குதல்',  en: 'Vehicle Purchase',  icon: '🚗' },
  { key: 'business',      ta: 'வியாபாரம் தொடங்க',  en: 'Business Launch',   icon: '💼' },
  { key: 'education',     ta: 'கல்வி தொடங்க',      en: 'Education Begin',   icon: '📚' },
  { key: 'travel',        ta: 'பயணம்',              en: 'Travel',            icon: '✈️' }
];

// Nakshatra preferences per purpose. Names match the NAKSHATRA list above.
const PREFERRED_NAKSHATRAS: Record<Purpose, string[]> = {
  wedding:        ['ரோகிணி', 'மிருகசீரிடம்', 'மகம்', 'உத்திரம்', 'அஸ்தம்', 'சுவாதி', 'அனுஷம்', 'மூலம்', 'ரேவதி'],
  'griha-pravesh':['ரோகிணி', 'மிருகசீரிடம்', 'சித்திரை', 'அனுஷம்', 'திருவோணம்', 'உத்திரம்', 'உத்திராடம்', 'ரேவதி'],
  vehicle:        ['அஸ்வினி', 'ரோகிணி', 'புனர்பூசம்', 'பூசம்', 'அஸ்தம்', 'சுவாதி', 'திருவோணம்', 'சதயம்', 'ரேவதி'],
  business:       ['அஸ்வினி', 'பூசம்', 'அஸ்தம்', 'சுவாதி', 'அனுஷம்', 'மூலம்', 'திருவோணம்', 'ரேவதி'],
  education:      ['ரோகிணி', 'மிருகசீரிடம்', 'பூசம்', 'ஆயில்யம்', 'மகம்', 'அஸ்தம்', 'சுவாதி', 'திருவோணம்', 'ரேவதி'],
  travel:         ['அஸ்வினி', 'புனர்பூசம்', 'பூசம்', 'அஸ்தம்', 'சுவாதி', 'அனுஷம்', 'மூலம்', 'ரேவதி']
};

// Weekdays to avoid per purpose (0 = Sunday).
const AVOID_WEEKDAYS: Record<Purpose, number[]> = {
  wedding:        [2, 6],    // avoid Tue, Sat
  'griha-pravesh':[2, 6],
  vehicle:        [6],
  business:       [6],
  education:      [6],
  travel:         [2]
};

const KARINAAL_TITHIS = new Set([7, 8, 13]);   // ashtami, navami, sathurthasi cluster
const AVOID_TITHIS = new Set([0]);             // pirathamai weaker

const TA_WEEKDAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

export type Slot = {
  isoDate: string;
  weekdayTa: string;
  weekday: number;
  tithi: string;
  nakshatra: string;
  score: number;
  nallaNeram: { morning: string; evening: string };
  isHoliday?: string;
};

function computeTithi(d: Date): { idx: number; name: string } {
  const idx = (d.getDate() - 1) % 15;
  return { idx, name: TITHI[idx] };
}

function computeNakshatra(d: Date): { idx: number; name: string } {
  const idx = (d.getDate() * 3 + d.getMonth()) % 27;
  return { idx, name: NAKSHATRA[idx] };
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

const HOLIDAY_BY_ISO: Record<string, string> = {};
HOLIDAYS_2026.forEach(h => { HOLIDAY_BY_ISO[h.isoDate] = h.ta; });

export function findMuhurthams(opts: {
  purpose: Purpose;
  startDate: Date;
  endDate: Date;
  limit?: number;
}): Slot[] {
  const { purpose, startDate, endDate } = opts;
  const limit = opts.limit ?? 10;
  const preferred = new Set(PREFERRED_NAKSHATRAS[purpose]);
  const avoidWeekdays = new Set(AVOID_WEEKDAYS[purpose]);
  const slots: Slot[] = [];

  const cursor = new Date(startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(endDate);
  end.setHours(0, 0, 0, 0);

  while (cursor <= end) {
    const weekday = cursor.getDay();
    const tithi = computeTithi(cursor);
    const nak = computeNakshatra(cursor);

    let score = 0;
    let skip = false;

    if (KARINAAL_TITHIS.has(tithi.idx)) skip = true;
    if (avoidWeekdays.has(weekday)) skip = true;

    if (!skip) {
      if (preferred.has(nak.name)) score += 5;
      if (AVOID_TITHIS.has(tithi.idx)) score -= 1;
      // Reward auspicious tithis: panchami(4), sashti(5), dasami(9), dvadasi(11)
      if ([4, 5, 9, 11].includes(tithi.idx)) score += 2;
      // Prefer Mon/Wed/Thu/Fri
      if ([1, 3, 4, 5].includes(weekday)) score += 1;

      slots.push({
        isoDate: toISO(cursor),
        weekday,
        weekdayTa: TA_WEEKDAYS[weekday],
        tithi: tithi.name,
        nakshatra: nak.name,
        score,
        nallaNeram: NALLA_NERAM[weekday],
        isHoliday: HOLIDAY_BY_ISO[toISO(cursor)]
      });
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  slots.sort((a, b) => b.score - a.score || a.isoDate.localeCompare(b.isoDate));
  return slots.slice(0, limit);
}

export type KarinaalCategory = 'ashtami' | 'navami' | 'chaturdasi';

export type KarinaalDay = {
  isoDate: string;
  weekday: number;
  weekdayTa: string;
  tithiIdx: number;
  tithiName: string;
  category: KarinaalCategory;
  isHoliday?: string;
};

const KARINAAL_CATEGORY_BY_TITHI: Record<number, KarinaalCategory> = {
  7: 'ashtami',
  8: 'navami',
  13: 'chaturdasi'
};

export const KARINAAL_LABELS: Record<KarinaalCategory, { ta: string; en: string; reasonTa: string; reasonEn: string }> = {
  ashtami: {
    ta: 'அஷ்டமி',
    en: 'Ashtami',
    reasonTa: 'சந்திர நிலையின் 8வது திதி — சுப செயல்களை தவிர்க்கவும்.',
    reasonEn: '8th lunar tithi — avoid auspicious undertakings.'
  },
  navami: {
    ta: 'நவமி',
    en: 'Navami',
    reasonTa: 'சந்திர நிலையின் 9வது திதி — பயணம், புதிய தொடக்கம் தவிர்க்கவும்.',
    reasonEn: '9th lunar tithi — avoid travel and new beginnings.'
  },
  chaturdasi: {
    ta: 'சதுர்தசி',
    en: 'Chaturdasi',
    reasonTa: 'சந்திர நிலையின் 14வது திதி — முக்கிய நிகழ்வுகளுக்கு உகந்தது அல்ல.',
    reasonEn: '14th lunar tithi — not suitable for important events.'
  }
};

export function findKarinaalDays(opts: { startDate: Date; endDate: Date }): KarinaalDay[] {
  const days: KarinaalDay[] = [];
  const cursor = new Date(opts.startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(opts.endDate);
  end.setHours(0, 0, 0, 0);
  while (cursor <= end) {
    const tithi = computeTithi(cursor);
    if (KARINAAL_TITHIS.has(tithi.idx)) {
      const iso = toISO(cursor);
      days.push({
        isoDate: iso,
        weekday: cursor.getDay(),
        weekdayTa: TA_WEEKDAYS[cursor.getDay()],
        tithiIdx: tithi.idx,
        tithiName: tithi.name,
        category: KARINAAL_CATEGORY_BY_TITHI[tithi.idx],
        isHoliday: HOLIDAY_BY_ISO[iso]
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function nextViratha(from: Date): { date: Date; name: string; daysAway: number } | null {
  // Look up to 60 days ahead for the next ஏகாதசி / சஷ்டி / பிரதோஷம் / பௌர்ணமி / அமாவாசை
  // using the (day-1) % 30 logic mirrored from /maatha-sirappu.
  for (let i = 0; i < 60; i++) {
    const d = new Date(from);
    d.setDate(d.getDate() + i);
    const tithi = (d.getDate() - 1) % 30;
    if (tithi === 14) return { date: d, name: 'பௌர்ணமி', daysAway: i };
    if (tithi === 29) return { date: d, name: 'அமாவாசை', daysAway: i };
    if (tithi === 10 || tithi === 25) return { date: d, name: 'ஏகாதசி', daysAway: i };
    if (tithi === 5 || tithi === 20) return { date: d, name: 'சஷ்டி', daysAway: i };
    if (tithi === 12 || tithi === 27) return { date: d, name: 'பிரதோஷம்', daysAway: i };
  }
  return null;
}

export function nextHoliday(from: Date): { isoDate: string; ta: string; en: string; daysAway: number } | null {
  const fromIso = toISO(from);
  const upcoming = HOLIDAYS_2026.find(h => h.isoDate >= fromIso);
  if (!upcoming) return null;
  const [y, m, d] = upcoming.isoDate.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const days = Math.round((target.getTime() - new Date(fromIso).getTime()) / 86_400_000);
  return { isoDate: upcoming.isoDate, ta: upcoming.ta, en: upcoming.en, daysAway: days };
}
