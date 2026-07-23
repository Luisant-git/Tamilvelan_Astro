// Pancha Pakshi Sastram — heuristic implementation.
// Tamil tradition: 5 birds, each ruling a portion of 27 nakshatras. Birds
// cycle through 5 activities through each day, with the sequence shifted
// by weekday + paksha (waxing / waning moon). Not a canonical ephemeris-
// driven engine — the activity sequence here is a deterministic heuristic
// consistent with one common Pancha Pakshi convention.

import { NAKSHATRA } from './muhurtham';

export type Bird = 'vulture' | 'owl' | 'crow' | 'cock' | 'peacock';
export type Activity = 'rule' | 'eat' | 'walk' | 'sleep' | 'die';
export type Paksha = 'shukla' | 'krishna';

export const BIRDS: Array<{ key: Bird; ta: string; en: string; icon: string; elementTa: string; elementEn: string }> = [
  { key: 'vulture', ta: 'வாகை',  en: 'Vulture', icon: '🦅', elementTa: 'நிலம்',   elementEn: 'Earth' },
  { key: 'owl',     ta: 'ஆந்தை', en: 'Owl',     icon: '🦉', elementTa: 'நீர்',    elementEn: 'Water' },
  { key: 'crow',    ta: 'காகம்',  en: 'Crow',    icon: '🐦‍⬛', elementTa: 'அக்னி', elementEn: 'Fire' },
  { key: 'cock',    ta: 'கோழி',   en: 'Cock',    icon: '🐓', elementTa: 'காற்று', elementEn: 'Air' },
  { key: 'peacock', ta: 'மயில்',  en: 'Peacock', icon: '🦚', elementTa: 'ஆகாயம்', elementEn: 'Ether' }
];

// Each bird rules a contiguous block of nakshatra indices 0..26.
const NAKSHATRA_TO_BIRD: Bird[] = [
  'vulture','vulture','vulture','vulture','vulture',           // 0-4   Ashvini..Mrigashira
  'owl','owl','owl','owl','owl',                                // 5-9   Ardra..Magha
  'crow','crow','crow','crow','crow',                           // 10-14 Purva P..Swati
  'cock','cock','cock','cock','cock',                           // 15-19 Vishakha..Purvashada
  'peacock','peacock','peacock','peacock','peacock','peacock','peacock'  // 20-26 Uttarashada..Revati
];

export function birdForNakshatraIdx(idx: number): Bird {
  return NAKSHATRA_TO_BIRD[idx];
}

export function nakshatrasForBird(bird: Bird): string[] {
  return NAKSHATRA.filter((_, i) => NAKSHATRA_TO_BIRD[i] === bird);
}

export const ACTIVITIES: Record<Activity, { ta: string; en: string; score: number; icon: string; toneTa: string }> = {
  rule:  { ta: 'ஆட்சி',     en: 'Ruling',  score:  5, icon: '👑', toneTa: 'மிகச் சிறந்தது — முக்கிய காரியம் தொடங்க' },
  eat:   { ta: 'உணவு',      en: 'Eating',  score:  2, icon: '🍚', toneTa: 'நல்லது — வாங்குதல், கூட்டம், சந்திப்பு' },
  walk:  { ta: 'நடப்பு',    en: 'Walking', score:  0, icon: '🚶', toneTa: 'சாதாரண — பயணம், செய்தி பரிமாற்றம்' },
  sleep: { ta: 'உறக்கம்',   en: 'Sleeping',score: -2, icon: '😴', toneTa: 'பலவீனம் — முக்கிய முடிவு தவிர்க்கவும்' },
  die:   { ta: 'மரணம்',     en: 'Death',   score: -5, icon: '💀', toneTa: 'மோசமான — சுப காரியம் தவிர்க்க' }
};

const ACTIVITY_ORDER: Activity[] = ['rule', 'eat', 'walk', 'sleep', 'die'];
const BIRD_ORDER: Bird[] = ['vulture', 'owl', 'crow', 'cock', 'peacock'];
const BIRD_IDX: Record<Bird, number> = { vulture: 0, owl: 1, crow: 2, cock: 3, peacock: 4 };

// Each weekday is "ruled" by one bird. Common Pancha Pakshi convention.
const WEEKDAY_RULER: Bird[] = [
  'vulture', // Sunday
  'owl',     // Monday
  'crow',    // Tuesday
  'cock',    // Wednesday
  'peacock', // Thursday
  'vulture', // Friday
  'owl'      // Saturday
];

// Friend / enemy relationships — symmetric, each bird has 2 friends + 2 enemies.
const FRIENDS: Record<Bird, Bird[]> = {
  vulture: ['owl', 'peacock'],
  owl:     ['vulture', 'cock'],
  crow:    ['cock', 'peacock'],
  cock:    ['owl', 'crow'],
  peacock: ['vulture', 'crow']
};
const ENEMIES: Record<Bird, Bird[]> = {
  vulture: ['crow', 'cock'],
  owl:     ['crow', 'peacock'],
  crow:    ['vulture', 'owl'],
  cock:    ['vulture', 'peacock'],
  peacock: ['owl', 'cock']
};

export function relationship(a: Bird, b: Bird): 'self' | 'friend' | 'enemy' | 'neutral' {
  if (a === b) return 'self';
  if (FRIENDS[a].includes(b)) return 'friend';
  if (ENEMIES[a].includes(b)) return 'enemy';
  return 'neutral';
}

export function friendsOf(bird: Bird): Bird[] {
  return FRIENDS[bird];
}
export function enemiesOf(bird: Bird): Bird[] {
  return ENEMIES[bird];
}

// Paksha from date — Shukla (waxing) for tithi 0-14, Krishna (waning) for 15-29.
// Uses the same (day-1) % 30 heuristic the rest of the app shares.
export function pakshaFor(date: Date): Paksha {
  const tithi = (date.getDate() - 1) % 30;
  return tithi < 15 ? 'shukla' : 'krishna';
}

export type SlotResult = {
  index: number;            // 0..4
  startMinutes: number;     // minutes after sunrise (heuristic 6am)
  endMinutes: number;
  clockStart: string;       // HH:MM
  clockEnd: string;
  activity: Activity;
};

const SUNRISE_MINUTES = 6 * 60;
const SLOT_MINUTES = (12 * 60) / 5; // 144 min — 5 daytime segments

function fmtClock(mins: number): string {
  const h = Math.floor(mins / 60) % 24;
  const m = Math.round(mins % 60);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

// Day activity sequence for a given bird on a given date.
// Heuristic: starting activity depends on (bird, weekday-ruler, paksha).
// Shukla cycles activities forward; Krishna cycles them backward.
export function daySchedule(bird: Bird, date: Date): SlotResult[] {
  const weekday = date.getDay();
  const ruler = WEEKDAY_RULER[weekday];
  const paksha = pakshaFor(date);

  const birdOffset = (BIRD_IDX[bird] - BIRD_IDX[ruler] + 5) % 5;
  const direction = paksha === 'shukla' ? 1 : -1;

  const slots: SlotResult[] = [];
  for (let i = 0; i < 5; i++) {
    const aIdx = ((birdOffset + direction * i) % 5 + 5) % 5;
    const startMin = SUNRISE_MINUTES + i * SLOT_MINUTES;
    const endMin = startMin + SLOT_MINUTES;
    slots.push({
      index: i,
      startMinutes: startMin,
      endMinutes: endMin,
      clockStart: fmtClock(startMin),
      clockEnd: fmtClock(endMin),
      activity: ACTIVITY_ORDER[aIdx]
    });
  }
  return slots;
}

export function rulerBirdFor(date: Date): Bird {
  return WEEKDAY_RULER[date.getDay()];
}

export function birdInfo(bird: Bird) {
  return BIRDS.find(b => b.key === bird)!;
}

export { BIRD_ORDER };
