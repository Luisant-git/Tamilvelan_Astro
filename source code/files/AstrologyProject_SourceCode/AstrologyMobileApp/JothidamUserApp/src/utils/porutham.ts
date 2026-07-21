// Shared Tamil name constants and result-shape types for the Porutham
// (marriage matching) feature. The actual scoring/dosham computation lives
// in the backend (POST /marriage/match) — PoruthamScreen only consumes its
// response, typed via PoruthamItem/MatchDosham below.

export const RASI_TAMIL = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்', 'சிம்மம்', 'கன்னி',
  'துலாம்', 'விருச்சிகம்', 'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்',
];
export const NAKSHATRA_TAMIL = [
  'அசுவினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிஷம்', 'திருவாதிரை', 'புனர்பூசம்',
  'பூசம்', 'ஆயில்யம்', 'மகம்', 'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி',
  'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்', 'உத்திராடம்', 'திருவோணம்',
  'அவிட்டம்', 'சதயம்', 'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி',
];

export interface PoruthamItem {
  num: number;
  name: string;
  description: string;
  weight: number;
  score: number;
  verdict: string;
  level: 'good' | 'mid' | 'bad';
  note?: string;
}

export interface MatchDosham {
  name: string;
  matching: boolean;
  note: string;
}
