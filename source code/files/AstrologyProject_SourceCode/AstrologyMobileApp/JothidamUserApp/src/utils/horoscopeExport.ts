// Used by JathagamResult.tsx to render "Y M D" style durations for dasha
// balance and bhukti spans.
export function formatYearsMonthsDays(years: number): string {
  const totalDays = years * 365.25;
  const y = Math.floor(totalDays / 365.25);
  const remAfterYears = totalDays - y * 365.25;
  const m = Math.floor(remAfterYears / 30.4375);
  const d = Math.round(remAfterYears - m * 30.4375);
  return `${y}Y ${m}M ${d}D`;
}
