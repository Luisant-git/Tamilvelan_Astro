// Heuristic tithi-based auspicious/inauspicious day finder.
// Mirrors frontend/src/lib/muhurtham.ts — kept in sync manually since the
// mobile app and website are separate codebases. Not ephemeris-accurate.

const TITHI = [
  'பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி',
  'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி',
  'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்தசி', 'அமாவாசை / பூர்ணிமை'
];

const NAKSHATRA = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்',
  'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்',
  'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி',
  'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்',
  'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
];

const KARINAAL_TITHIS = new Set([7, 8, 13]); // ashtami, navami, chaturdasi

const TA_WEEKDAYS = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

export function computeTithi(d: Date): { idx: number; name: string } {
  const idx = (d.getDate() - 1) % 15;
  return { idx, name: TITHI[idx] };
}

export function computeNakshatra(d: Date): { idx: number; name: string } {
  const idx = (d.getDate() * 3 + d.getMonth()) % 27;
  return { idx, name: NAKSHATRA[idx] };
}

function toISO(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export type KarinaalCategory = 'ashtami' | 'navami' | 'chaturdasi';

export type KarinaalDay = {
  isoDate: string;
  weekday: number;
  weekdayTa: string;
  tithiIdx: number;
  tithiName: string;
  category: KarinaalCategory;
};

const KARINAAL_CATEGORY_BY_TITHI: Record<number, KarinaalCategory> = {
  7: 'ashtami',
  8: 'navami',
  13: 'chaturdasi'
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
      days.push({
        isoDate: toISO(cursor),
        weekday: cursor.getDay(),
        weekdayTa: TA_WEEKDAYS[cursor.getDay()],
        tithiIdx: tithi.idx,
        tithiName: tithi.name,
        category: KARINAAL_CATEGORY_BY_TITHI[tithi.idx]
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export type GeneralMuhurthamDay = {
  isoDate: string;
  weekdayTa: string;
  tithiName: string;
  nakshatraName: string;
  meta?: string;
};

// Purpose-agnostic "generally auspicious days" — same tithi/weekday scoring
// the Muhurtham Finder screen uses, minus the purpose-specific nakshatra/
// weekday bias (there's no single "purpose" for a generic Important Days
// list). Used by ImportantDaysScreen's "சுபமுகூர்த்த தினங்கள்" section so
// it's genuinely computed per month instead of a frozen reference list.
export function findGeneralMuhurthams(opts: { startDate: Date; endDate: Date; limit?: number }): GeneralMuhurthamDay[] {
  const limit = opts.limit ?? 6;
  const cursor = new Date(opts.startDate);
  cursor.setHours(0, 0, 0, 0);
  const end = new Date(opts.endDate);
  end.setHours(0, 0, 0, 0);

  const scored: Array<GeneralMuhurthamDay & { score: number }> = [];
  while (cursor <= end) {
    const weekday = cursor.getDay();
    const tithi = computeTithi(cursor);
    if (!KARINAAL_TITHIS.has(tithi.idx)) {
      const nak = computeNakshatra(cursor);
      let score = 0;
      if ([4, 5, 9, 11].includes(tithi.idx)) score += 2;
      if ([1, 3, 4, 5].includes(weekday)) score += 1;
      scored.push({
        isoDate: toISO(cursor),
        weekdayTa: TA_WEEKDAYS[weekday],
        tithiName: tithi.name,
        nakshatraName: nak.name,
        score,
        meta: score >= 3 ? '✦' : undefined
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return scored
    .sort((a, b) => b.score - a.score || a.isoDate.localeCompare(b.isoDate))
    .slice(0, limit)
    .sort((a, b) => a.isoDate.localeCompare(b.isoDate))
    .map(({ score: _score, ...rest }) => rest);
}
