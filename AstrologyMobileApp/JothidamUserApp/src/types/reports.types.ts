// Verified against source/src/app/api/reports/list/route.ts — returns a
// PLAIN ARRAY (no {reports} wrapper), 4 real items, only these 4 fields.
export interface Report {
  id: string;
  name: string;
  price: number;
  description: string;
}
