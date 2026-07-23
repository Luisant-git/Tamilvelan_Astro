// Approximate Tamil (Solar) calendar helpers — month boundaries are fixed
// to typical Gregorian start dates. Not a true panchang ephemeris.

export const TAMIL_MONTHS = [
  'சித்திரை', 'வைகாசி', 'ஆனி', 'ஆடி', 'ஆவணி', 'புரட்டாசி',
  'ஐப்பசி', 'கார்த்திகை', 'மார்கழி', 'தை', 'மாசி', 'பங்குனி'
];

export const TAMIL_WEEKDAYS_SHORT = ['ஞா', 'தி', 'செ', 'பு', 'வி', 'வெ', 'ச'];
export const TAMIL_WEEKDAYS = [
  'ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'
];

// Approximate Gregorian start (month-1-indexed, day) for each Tamil month start.
const TAMIL_MONTH_STARTS: Array<[number, number]> = [
  [3, 14],   // சித்திரை — Apr 14
  [4, 15],   // வைகாசி — May 15
  [5, 15],   // ஆனி — Jun 15
  [6, 16],   // ஆடி — Jul 16
  [7, 17],   // ஆவணி — Aug 17
  [8, 17],   // புரட்டாசி — Sep 17
  [9, 18],   // ஐப்பசி — Oct 18
  [10, 17],  // கார்த்திகை — Nov 17
  [11, 16],  // மார்கழி — Dec 16
  [0, 14],   // தை — Jan 14
  [1, 13],   // மாசி — Feb 13
  [2, 14]    // பங்குனி — Mar 14
];

function startDateOf(tamilMonthIdx: number, gYear: number): Date {
  const [m, d] = TAMIL_MONTH_STARTS[tamilMonthIdx];
  // தை–பங்குனி (indexes 9-11) fall in early Gregorian months of the *next* year
  // for the Tamil year that started in சித்திரை.
  return new Date(gYear, m, d);
}

export function toTamilDate(date: Date): { monthIdx: number; monthName: string; day: number } {
  const y = date.getFullYear();
  for (let i = 0; i < 12; i++) {
    // For each Tamil month i in Tamil-year-starting-y and y-1, pick the one bracket containing `date`.
    const startThisYear = startDateOf(i, y);
    const startNextYear = startDateOf(i, y + 1);
    const startLastYear = startDateOf(i, y - 1);
    for (const start of [startLastYear, startThisYear, startNextYear]) {
      const next = nextMonthStart(i, start);
      if (date >= start && date < next) {
        const day = Math.floor((date.getTime() - start.getTime()) / 86_400_000) + 1;
        return { monthIdx: i, monthName: TAMIL_MONTHS[i], day };
      }
    }
  }
  return { monthIdx: 0, monthName: TAMIL_MONTHS[0], day: 1 };
}

function nextMonthStart(tamilMonthIdx: number, currentStart: Date): Date {
  const nextIdx = (tamilMonthIdx + 1) % 12;
  const [m, d] = TAMIL_MONTH_STARTS[nextIdx];
  // The next start either falls in the same Gregorian year as currentStart, or +1 if wrap.
  let year = currentStart.getFullYear();
  if (nextIdx < tamilMonthIdx) {
    // wrapped: e.g. பங்குனி (Mar) → சித்திரை (Apr) still same year; but மார்கழி (Dec) → தை (Jan) is +1 year
    if (tamilMonthIdx === 8) year += 1; // மார்கழி → தை crosses Jan
  }
  const cand = new Date(year, m, d);
  if (cand <= currentStart) return new Date(year + 1, m, d);
  return cand;
}

export function tamilMonthRangeForGregorian(year: number, gMonth: number): string {
  // Returns "சித்திரை - வைகாசி" style — Tamil months whose days appear during this Gregorian month.
  const first = new Date(year, gMonth, 1);
  const last = new Date(year, gMonth + 1, 0);
  const a = toTamilDate(first).monthName;
  const b = toTamilDate(last).monthName;
  return a === b ? a : `${a} - ${b}`;
}
