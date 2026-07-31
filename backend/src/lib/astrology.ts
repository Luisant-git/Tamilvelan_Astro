/* eslint-disable @typescript-eslint/no-unused-vars */

// =====================================================================
// வேத ஜோதிட கணிப்புகள் — Vedic chart math (approximate but principled)
// Uses simplified Meeus-style mean longitudes + Lahiri ayanamsa.
// Accuracy: ~1° on planets, sufficient for rasi/nakshatra/dasha.
//
// TODO(swisseph): Replace this module with a real ephemeris (Swiss Ephemeris
// via the `swisseph` native binding or a hosted Astro-Seek / vedicapi.com API)
// before any monetised feature (paid kundli, marriage report, muhurtham).
// Scope of swap when the time comes:
//   • Planet longitudes (Sun..Ketu) — drop computeMeanLongitudes()
//   • Ayanamsa — use swisseph's Lahiri instead of the local interpolation
//   • Sidereal time / lagna — use swe_houses() or swe_sidtime()
//   • Validate against jhora.com / drik panchang for at least 10 dates
// The same helpers also back src/lib/muhurtham.ts (tithi/nakshatra heuristics
// for the muhurtham finder), so swap both together.
// =====================================================================

export const RASI_NAMES_TAMIL = [
  'மேஷம்', 'ரிஷபம்', 'மிதுனம்', 'கடகம்',
  'சிம்மம்', 'கன்னி', 'துலாம்', 'விருச்சிகம்',
  'தனுசு', 'மகரம்', 'கும்பம்', 'மீனம்'
] as const;

export const RASI_NAMES_EN = [
  'Mesham', 'Rishabam', 'Midhunam', 'Kadakam',
  'Simmam', 'Kanni', 'Thulam', 'Viruchigam',
  'Dhanusu', 'Magaram', 'Kumbam', 'Meenam'
] as const;

export const NAKSHATRA_TAMIL = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்',
  'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்',
  'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி',
  'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்',
  'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
] as const;

export const PLANET_TAMIL: Record<string, string> = {
  Sun: 'சூரியன்', Moon: 'சந்திரன்', Mars: 'செவ்வாய்',
  Mercury: 'புதன்', Jupiter: 'குரு', Venus: 'சுக்கிரன்',
  Saturn: 'சனி', Rahu: 'ராகு', Ketu: 'கேது'
};

export const PLANET_SHORT_TAMIL: Record<string, string> = {
  Sun: 'சூரி', Moon: 'சந்', Mars: 'செவ்', Mercury: 'புதன்',
  Jupiter: 'குரு', Venus: 'சுக்', Saturn: 'சனி', Rahu: 'ராகு', Ketu: 'கேது'
};

export const RASI_LORD: Record<number, string> = {
  1: 'Mars (செவ்வாய்)', 2: 'Venus (சுக்கிரன்)', 3: 'Mercury (புதன்)',
  4: 'Moon (சந்திரன்)', 5: 'Sun (சூரியன்)', 6: 'Mercury (புதன்)',
  7: 'Venus (சுக்கிரன்)', 8: 'Mars (செவ்வாய்)', 9: 'Jupiter (குரு)',
  10: 'Saturn (சனி)', 11: 'Saturn (சனி)', 12: 'Jupiter (குரு)'
};

export const TITHI_TAMIL = [
  'பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி',
  'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி',
  'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்தசி', 'பூர்ணிமை',
  'பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி',
  'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி',
  'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்தசி', 'அமாவாசை'
] as const;

// Vimshottari mahadasha order + years
const DASHA_LORDS = ['Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu', 'Jupiter', 'Saturn', 'Mercury'] as const;
const DASHA_YEARS: Record<string, number> = {
  Ketu: 7, Venus: 20, Sun: 6, Moon: 10, Mars: 7, Rahu: 18, Jupiter: 16, Saturn: 19, Mercury: 17
};
// Nakshatra → dasha lord at start (each ruled by one of the 9)
const NAKSHATRA_LORD = [
  'Ketu', 'Venus', 'Sun',         // Aswini, Bharani, Kritika
  'Moon', 'Mars', 'Rahu',         // Rohini, Mrigashira, Ardra
  'Jupiter', 'Saturn', 'Mercury', // Punarvasu, Pushya, Ashlesha
  'Ketu', 'Venus', 'Sun',         // Magha, Purva Phalguni, Uttara Phalguni
  'Moon', 'Mars', 'Rahu',         // Hasta, Chitra, Swati
  'Jupiter', 'Saturn', 'Mercury', // Vishakha, Anuradha, Jyeshtha
  'Ketu', 'Venus', 'Sun',         // Mula, Purva Ashadha, Uttara Ashadha
  'Moon', 'Mars', 'Rahu',         // Shravana, Dhanishta, Shatabhisha
  'Jupiter', 'Saturn', 'Mercury'  // Purva Bhadrapada, Uttara Bhadrapada, Revati
];

const DEG = Math.PI / 180;

function norm360(x: number): number {
  return ((x % 360) + 360) % 360;
}

// Julian Day from UT date (Gregorian)
function julianDay(year: number, month: number, day: number, hourUT: number): number {
  let y = year;
  let m = month;
  if (m <= 2) { y -= 1; m += 12; }
  const A = Math.floor(y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const jd = Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1))
    + day + hourUT / 24 + B - 1524.5;
  return jd;
}

// Lahiri ayanamsa (deg). Reference epoch 1900-01-01: ~22°27'37" = 22.4603°. Annual ~50.27" = 0.0139583°.
function lahiriAyanamsa(jd: number): number {
  const jdRef = 2415020.5; // 1900-01-01 UT
  const yearsFrom1900 = (jd - jdRef) / 365.25;
  return 22.4603 + 0.0139583 * yearsFrom1900;
}

// Sun's tropical longitude (Meeus, low precision). Returns deg [0,360).
function sunLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const L0 = 280.46646 + 36000.76983 * T + 0.0003032 * T * T;
  const M = 357.52911 + 35999.05029 * T - 0.0001537 * T * T;
  const Mr = M * DEG;
  const C = (1.914602 - 0.004817 * T - 0.000014 * T * T) * Math.sin(Mr)
    + (0.019993 - 0.000101 * T) * Math.sin(2 * Mr)
    + 0.000289 * Math.sin(3 * Mr);
  return norm360(L0 + C);
}

// Moon's tropical longitude (Meeus, simplified main terms).
function moonLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Lp = 218.3164477 + 481267.88123421 * T - 0.0015786 * T * T;
  const D = 297.8501921 + 445267.1114034 * T;
  const M = 357.5291092 + 35999.0502909 * T;
  const Mp = 134.9633964 + 477198.8675055 * T;
  const F = 93.2720950 + 483202.0175233 * T;

  const Dr = D * DEG, Mr = M * DEG, Mpr = Mp * DEG, Fr = F * DEG;

  // Main periodic terms in longitude (degrees, summed Σl / 1e6)
  let sigma = 0;
  sigma += 6288774 * Math.sin(Mpr);
  sigma += 1274027 * Math.sin(2 * Dr - Mpr);
  sigma += 658314  * Math.sin(2 * Dr);
  sigma += 213618  * Math.sin(2 * Mpr);
  sigma -= 185116  * Math.sin(Mr);
  sigma -= 114332  * Math.sin(2 * Fr);
  sigma += 58793   * Math.sin(2 * Dr - 2 * Mpr);
  sigma += 57066   * Math.sin(2 * Dr - Mr - Mpr);
  sigma += 53322   * Math.sin(2 * Dr + Mpr);
  sigma += 45758   * Math.sin(2 * Dr - Mr);
  sigma -= 40923   * Math.sin(Mr - Mpr);
  sigma -= 34720   * Math.sin(Dr);
  sigma -= 30383   * Math.sin(Mr + Mpr);

  return norm360(Lp + sigma / 1000000);
}

// Mean Rahu (Moon's ascending node). Ketu = Rahu + 180°.
function rahuLongitude(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const Omega = 125.04452 - 1934.136261 * T + 0.0020708 * T * T;
  return norm360(Omega);
}

// =====================================================================
// Proper heliocentric → geocentric planet positions (Schlyter's algorithm)
// Orbital elements at epoch 1999-12-31 0h UT (JD 2451543.5).
// Accuracy ~1 arcmin for inner planets, ~0.05° for outer — sufficient
// for rasi (30°) and nakshatra (13.33°) placement.
// =====================================================================

type OrbElems = {
  N: [number, number]; // longitude of ascending node [deg, deg/day]
  i: [number, number]; // inclination
  w: [number, number]; // argument of perihelion
  a: number;           // semi-major axis (AU)
  e: [number, number]; // eccentricity
  M: [number, number]; // mean anomaly
};

const ORB: Record<string, OrbElems> = {
  Mercury: {
    N: [48.3313, 3.24587e-5], i: [7.0047, 5.00e-8],
    w: [29.1241, 1.01444e-5], a: 0.387098,
    e: [0.205635, 5.59e-10], M: [168.6562, 4.0923344368]
  },
  Venus: {
    N: [76.6799, 2.46590e-5], i: [3.3946, 2.75e-8],
    w: [54.8910, 1.38374e-5], a: 0.723330,
    e: [0.006773, -1.302e-9], M: [48.0052, 1.6021302244]
  },
  Mars: {
    N: [49.5574, 2.11081e-5], i: [1.8497, -1.78e-8],
    w: [286.5016, 2.92961e-5], a: 1.523688,
    e: [0.093405, 2.516e-9], M: [18.6021, 0.5240207766]
  },
  Jupiter: {
    N: [100.4542, 2.76854e-5], i: [1.3030, -1.557e-7],
    w: [273.8777, 1.64505e-5], a: 5.20256,
    e: [0.048498, 4.469e-9], M: [19.8950, 0.0830853001]
  },
  Saturn: {
    N: [113.6634, 2.38980e-5], i: [2.4886, -1.081e-7],
    w: [339.3939, 2.97661e-5], a: 9.55475,
    e: [0.055546, -9.499e-9], M: [316.9670, 0.0334442282]
  }
};

function elemAt(d: number, e: [number, number]): number {
  return e[0] + e[1] * d;
}

function solveKepler(Mdeg: number, e: number): number {
  const M = norm360(Mdeg) * DEG;
  let E = M + e * Math.sin(M) * (1 + e * Math.cos(M));
  for (let it = 0; it < 8; it++) {
    const dE = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    E -= dE;
    if (Math.abs(dE) < 1e-9) break;
  }
  return E;
}

// Returns heliocentric ecliptic rectangular coords (AU).
function heliocentricXYZ(jd: number, orb: OrbElems): { x: number; y: number; z: number } {
  const d = jd - 2451543.5; // Schlyter epoch
  const N = elemAt(d, orb.N);
  const i = elemAt(d, orb.i);
  const w = elemAt(d, orb.w);
  const a = orb.a;
  const e = elemAt(d, orb.e);
  const M = elemAt(d, orb.M);

  const E = solveKepler(M, e); // radians
  const xv = a * (Math.cos(E) - e);
  const yv = a * Math.sqrt(1 - e * e) * Math.sin(E);
  const v = Math.atan2(yv, xv);
  const r = Math.sqrt(xv * xv + yv * yv);

  const NR = N * DEG, iR = i * DEG, vwR = v + w * DEG;
  const x = r * (Math.cos(NR) * Math.cos(vwR) - Math.sin(NR) * Math.sin(vwR) * Math.cos(iR));
  const y = r * (Math.sin(NR) * Math.cos(vwR) + Math.cos(NR) * Math.sin(vwR) * Math.cos(iR));
  const z = r * Math.sin(vwR) * Math.sin(iR);
  return { x, y, z };
}

// Sun's geocentric rectangular ecliptic coords (AU, distance ~1).
function sunGeocentricXYZ(jd: number): { x: number; y: number; z: number } {
  const T = (jd - 2451545.0) / 36525;
  const lon = sunLongitude(jd) * DEG;
  const M = (357.52911 + 35999.05029 * T) * DEG;
  const r = 1.00014 - 0.01671 * Math.cos(M) - 0.00014 * Math.cos(2 * M);
  return { x: r * Math.cos(lon), y: r * Math.sin(lon), z: 0 };
}

// Geocentric ecliptic longitude (tropical, degrees).
function planetGeocentricLongitude(jd: number, planet: 'Mercury' | 'Venus' | 'Mars' | 'Jupiter' | 'Saturn'): number {
  const helio = heliocentricXYZ(jd, ORB[planet]);
  const sun = sunGeocentricXYZ(jd);
  const xg = helio.x + sun.x;
  const yg = helio.y + sun.y;
  return norm360(Math.atan2(yg, xg) / DEG);
}

// Greenwich Mean Sidereal Time at jd (in degrees, [0,360))
function gmstDeg(jd: number): number {
  const T = (jd - 2451545.0) / 36525;
  const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0)
    + 0.000387933 * T * T - T * T * T / 38710000;
  return norm360(gmst);
}

// Compute Ascendant (Lagna) tropical longitude.
// Input: jd in UT, observer latitude (deg), longitude (deg, east positive).
function ascendantTrop(jd: number, lat: number, lon: number): number {
  const lst = gmstDeg(jd) + lon; // local sidereal time (deg)
  const RAMC = norm360(lst);
  const obl = 23.4392911; // mean obliquity (approx)
  const ramcR = RAMC * DEG;
  const latR = lat * DEG;
  const oblR = obl * DEG;

  // Standard ascendant formula (Meeus 13.6 with proper quadrant)
  const y = Math.cos(ramcR);
  const x = -Math.sin(ramcR) * Math.cos(oblR) - Math.tan(latR) * Math.sin(oblR);
  let asc = Math.atan2(y, x) / DEG;
  asc = norm360(asc);
  return asc;
}

export type PlanetState = {
  name: string;
  nameTamil: string;
  longitude: number; // sidereal degrees [0,360)
  rasi: number;       // 1..12
  rasiNameTamil: string;
  degInRasi: number;  // 0..30
  degInRasiStr: string;
  nakshatra: number;  // 0..26
  nakshatraTamil: string;
  pada: number;       // 1..4
  retrograde?: boolean;
};

function buildPlanet(name: string, trop: number, ayan: number): PlanetState {
  const sidereal = norm360(trop - ayan);
  const rasi = Math.floor(sidereal / 30) + 1;
  const degInRasi = sidereal - (rasi - 1) * 30;
  const nakshatra = Math.floor(sidereal / (360 / 27));
  const padaSize = (360 / 27) / 4;
  const pada = Math.floor((sidereal - nakshatra * (360 / 27)) / padaSize) + 1;
  return {
    name,
    nameTamil: PLANET_TAMIL[name] || name,
    longitude: sidereal,
    rasi,
    rasiNameTamil: RASI_NAMES_TAMIL[rasi - 1],
    degInRasi,
    degInRasiStr: `${Math.floor(degInRasi)}°${Math.floor((degInRasi % 1) * 60)}'`,
    nakshatra,
    nakshatraTamil: NAKSHATRA_TAMIL[nakshatra],
    pada
  };
}

export type Tithi = { index: number; nameTamil: string; paksha: 'சுக்ல பக்ஷம்' | 'கிருஷ்ண பக்ஷம்' };

function computeTithi(sunSid: number, moonSid: number): Tithi {
  const diff = norm360(moonSid - sunSid);
  const index = Math.floor(diff / 12); // 0..29
  const paksha = index < 15 ? 'சுக்ல பக்ஷம்' : 'கிருஷ்ண பக்ஷம்';
  return { index, nameTamil: TITHI_TAMIL[index], paksha };
}

export type DashaPeriod = {
  lord: string;
  lordTamil: string;
  startDate: string;  // ISO date
  endDate: string;
  years: number;            // actual duration of this displayed period (e.g. partial for balance)
  canonicalYears: number;   // full canonical Vimshottari duration of this lord
  isCurrent?: boolean;
  bhukti?: DashaPeriod[];
};

// Compute the full 120-year Vimshottari dasha breakdown starting from birth.
// Standard Vedic method:
//   1. First mahadasha is the lord of Moon's nakshatra — show its CANONICAL years
//      (e.g. குரு 16y) but the period covers only the BALANCE (remaining time).
//   2. Bhuktis inside the first mahadasha: figure out which bhukti the person was
//      born into; show the remaining time of that bhukti first, then subsequent
//      bhuktis run their full canonical durations until the mahadasha ends.
//   3. Subsequent 8 mahadashas: full canonical durations with full bhukti sequence.
function computeVimshottariDasha(birthDate: Date, moonLongitudeSid: number): {
  balanceYears: number;
  balanceLord: string;
  balanceLordTamil: string;
  mahadashas: DashaPeriod[];
} {
  const nakshatraSize = 360 / 27;
  const nakIndex = Math.floor(moonLongitudeSid / nakshatraSize);
  const posInNak = moonLongitudeSid - nakIndex * nakshatraSize;
  const elapsedFraction = posInNak / nakshatraSize;
  const fractionRemaining = 1 - elapsedFraction;

  const startLord = NAKSHATRA_LORD[nakIndex];
  const startLordIdx = DASHA_LORDS.indexOf(startLord as typeof DASHA_LORDS[number]);
  const balanceYears = DASHA_YEARS[startLord] * fractionRemaining;

  const now = Date.now();
  const mahadashas: DashaPeriod[] = [];
  let cursor = new Date(birthDate.getTime());

  for (let i = 0; i < 9; i++) {
    const lord = DASHA_LORDS[(startLordIdx + i) % 9];
    const canonical = DASHA_YEARS[lord];
    const startDate = new Date(cursor.getTime());

    const bhukti: DashaPeriod[] = [];
    let bhCursor = new Date(startDate.getTime());
    let mdYears: number;

    if (i === 0) {
      // Find which bhukti the person was born into.
      let cumulative = 0;
      let firstBhuktiIdx = 0;
      let elapsedInFirstBhukti = 0;
      for (let j = 0; j < 9; j++) {
        const bLord = DASHA_LORDS[(startLordIdx + j) % 9];
        const bFracOfMd = DASHA_YEARS[bLord] / 120; // each bhukti's share of its mahadasha
        if (cumulative + bFracOfMd > elapsedFraction) {
          firstBhuktiIdx = j;
          elapsedInFirstBhukti = (elapsedFraction - cumulative) / bFracOfMd;
          break;
        }
        cumulative += bFracOfMd;
      }

      for (let j = firstBhuktiIdx; j < 9; j++) {
        const bLord = DASHA_LORDS[(startLordIdx + j) % 9];
        const bCanonicalYears = (canonical * DASHA_YEARS[bLord]) / 120;
        const effYears = j === firstBhuktiIdx
          ? bCanonicalYears * (1 - elapsedInFirstBhukti)
          : bCanonicalYears;
        const bStart = new Date(bhCursor.getTime());
        const bEnd = addYears(bhCursor, effYears);
        bhukti.push({
          lord: bLord,
          lordTamil: PLANET_TAMIL[bLord] || bLord,
          startDate: bStart.toISOString().split('T')[0],
          endDate: bEnd.toISOString().split('T')[0],
          years: effYears,
          canonicalYears: bCanonicalYears,
          isCurrent: now >= bStart.getTime() && now < bEnd.getTime()
        });
        bhCursor = bEnd;
      }
      mdYears = balanceYears;
    } else {
      for (let j = 0; j < 9; j++) {
        const bLord = DASHA_LORDS[(DASHA_LORDS.indexOf(lord) + j) % 9];
        const bYears = (canonical * DASHA_YEARS[bLord]) / 120;
        const bStart = new Date(bhCursor.getTime());
        const bEnd = addYears(bhCursor, bYears);
        bhukti.push({
          lord: bLord,
          lordTamil: PLANET_TAMIL[bLord] || bLord,
          startDate: bStart.toISOString().split('T')[0],
          endDate: bEnd.toISOString().split('T')[0],
          years: bYears,
          canonicalYears: bYears,
          isCurrent: now >= bStart.getTime() && now < bEnd.getTime()
        });
        bhCursor = bEnd;
      }
      mdYears = canonical;
    }

    const endDate = addYears(startDate, mdYears);
    mahadashas.push({
      lord,
      lordTamil: PLANET_TAMIL[lord] || lord,
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      years: mdYears,
      canonicalYears: canonical,
      isCurrent: now >= startDate.getTime() && now < endDate.getTime(),
      bhukti
    });
    cursor = endDate;
  }

  return {
    balanceYears,
    balanceLord: startLord,
    balanceLordTamil: PLANET_TAMIL[startLord] || startLord,
    mahadashas
  };
}

function addYears(date: Date, years: number): Date {
  const ms = years * 365.25 * 24 * 3600 * 1000;
  return new Date(date.getTime() + ms);
}

export type DoshamResult = {
  saniDosha: { present: boolean; templeUrl: string };
  chevvaiDosha: { present: boolean; templeUrl: string };
  sarpaDosha: { present: boolean; templeUrl: string };
  papaPercent: { lagna: number; moon: number; venus: number };
};

function computeDosham(planets: Record<string, PlanetState>, lagnaRasi: number): DoshamResult {
  const moonRasi = planets.Moon.rasi;
  const venusRasi = planets.Venus.rasi;

  // Chevvai (Mangal) dosha, classical three-fold check: Mars in 1, 2, 4, 7,
  // 8, or 12 from Lagna, from Moon, or from Venus — dosha is considered
  // present if the affliction shows from any of the three reference points
  // (checking Lagna alone, as before, misses charts where the dosha only
  // shows from Chandra/Kuja or Sukra/Kuja).
  const houseOf = (baseRasi: number, targetRasi: number) => ((targetRasi - baseRasi + 12) % 12) + 1;
  const marsAfflicts = (baseRasi: number) => [1, 2, 4, 7, 8, 12].includes(houseOf(baseRasi, planets.Mars.rasi));
  const chevvaiPresent = marsAfflicts(lagnaRasi) || marsAfflicts(moonRasi) || marsAfflicts(venusRasi);

  // Sani dosha (simplified): Saturn in 2, 7, 8 from Moon
  const saturnFromMoon = ((planets.Saturn.rasi - moonRasi + 12) % 12) + 1;
  const saniPresent = [2, 7, 8].includes(saturnFromMoon);

  // Sarpa (Kala Sarpa) dosha: all 7 planets between Rahu and Ketu
  const rahuLong = planets.Rahu.longitude;
  const ketuLong = planets.Ketu.longitude;
  const check = (p: PlanetState) => {
    const arc1 = norm360(p.longitude - rahuLong);
    const arc2 = norm360(ketuLong - rahuLong);
    return arc1 < arc2; // within Rahu→Ketu arc
  };
  const others = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
  const allInside = others.every(n => check(planets[n]));
  const allOutside = others.every(n => !check(planets[n]));
  const sarpaPresent = allInside || allOutside;

  // Papa shadbala (very simplified percentage based on hostile-house count)
  const malefics = ['Sun', 'Mars', 'Saturn', 'Rahu', 'Ketu'];
  const houseFrom = (base: number, target: number) => ((target - base + 12) % 12) + 1;
  const badHouses = [6, 8, 12];
  const calcFor = (baseRasi: number) => {
    const hits = malefics.filter(m => badHouses.includes(houseFrom(baseRasi, planets[m].rasi))).length;
    return Math.round((hits / malefics.length) * 100);
  };

  return {
    saniDosha: {
      present: saniPresent,
      templeUrl: 'https://www.google.com/search?q=saneeswaran+temple+near+me'
    },
    chevvaiDosha: {
      present: chevvaiPresent,
      templeUrl: 'https://www.google.com/search?q=mars+chevvai+temple+near+me'
    },
    sarpaDosha: {
      present: sarpaPresent,
      templeUrl: 'https://www.google.com/search?q=rahu+ketu+temple+near+me'
    },
    papaPercent: {
      lagna: calcFor(lagnaRasi),
      moon: calcFor(moonRasi),
      venus: calcFor(venusRasi)
    }
  };
}

export type FullChart = {
  birthInfo: {
    fullName: string;
    gender: string;
    dobFormatted: string;
    dobIso: string;
    birthTime: string;
    birthPlace: string;
    latitude: number;
    longitude: number;
  };
  ayanamsa: number;
  ayanamsaName: string;
  lagna: { rasi: number; rasiTamil: string; lord: string; degInRasi: number };
  rasi: { num: number; nameTamil: string };
  nakshatra: { index: number; nameTamil: string; pada: number };
  tithi: Tithi;
  planets: Record<string, PlanetState>;
  navamsa: Record<string, { rasi: number; rasiTamil: string }>; // D9 chart
  navamsaLagna: number;
  dasha: ReturnType<typeof computeVimshottariDasha>;
  currentMd: DashaPeriod | undefined;
  currentBhukti: DashaPeriod | undefined;
  dosham: DoshamResult;
};

// Navamsa = D9 chart. Each rasi divided into 9 parts of 3°20'.
// Movable signs (1,4,7,10) start navamsa from same sign;
// Fixed (2,5,8,11) start 9th from same; Dual (3,6,9,12) start 5th from same.
function navamsaRasi(sidLongitude: number): number {
  const rasi = Math.floor(sidLongitude / 30) + 1;
  const degInRasi = sidLongitude - (rasi - 1) * 30;
  const navIndex = Math.floor(degInRasi / (30 / 9)); // 0..8
  let startRasi: number;
  const type = ((rasi - 1) % 3); // 0 movable, 1 fixed, 2 dual
  if (type === 0) startRasi = rasi;
  else if (type === 1) startRasi = ((rasi - 1 + 8) % 12) + 1; // 9th from
  else startRasi = ((rasi - 1 + 4) % 12) + 1; // 5th from
  return ((startRasi - 1 + navIndex) % 12) + 1;
}

export function computeFullChart(input: {
  fullName: string;
  gender: string;
  dob: Date;          // date-only
  birthTime: string;  // 'HH:MM' 24h
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezoneOffsetHours?: number; // default +5.5 (IST)
}): FullChart {
  const tz = input.timezoneOffsetHours ?? 5.5;
  const [hh, mm] = input.birthTime.split(':').map(n => parseInt(n, 10));
  const localDecimal = hh + mm / 60;
  const utDecimal = localDecimal - tz;

  // Use Gregorian Y/M/D from local birthdate
  const year = input.dob.getUTCFullYear();
  const month = input.dob.getUTCMonth() + 1;
  const day = input.dob.getUTCDate();
  const jd = julianDay(year, month, day, utDecimal);

  const ayan = lahiriAyanamsa(jd);

  const sunT = sunLongitude(jd);
  const moonT = moonLongitude(jd);
  const rahuT = rahuLongitude(jd);

  const planets: Record<string, PlanetState> = {
    Sun:     buildPlanet('Sun', sunT, ayan),
    Moon:    buildPlanet('Moon', moonT, ayan),
    Mars:    buildPlanet('Mars', planetGeocentricLongitude(jd, 'Mars'), ayan),
    Mercury: buildPlanet('Mercury', planetGeocentricLongitude(jd, 'Mercury'), ayan),
    Jupiter: buildPlanet('Jupiter', planetGeocentricLongitude(jd, 'Jupiter'), ayan),
    Venus:   buildPlanet('Venus', planetGeocentricLongitude(jd, 'Venus'), ayan),
    Saturn:  buildPlanet('Saturn', planetGeocentricLongitude(jd, 'Saturn'), ayan),
    Rahu:    buildPlanet('Rahu', rahuT, ayan),
    Ketu:    buildPlanet('Ketu', norm360(rahuT + 180), ayan)
  };

  const ascTrop = ascendantTrop(jd, input.latitude, input.longitude);
  const ascSid = norm360(ascTrop - ayan);
  const lagnaRasi = Math.floor(ascSid / 30) + 1;
  const lagnaDeg = ascSid - (lagnaRasi - 1) * 30;

  const tithi = computeTithi(planets.Sun.longitude, planets.Moon.longitude);

  // Moon's sidereal nakshatra/pada
  const nakSize = 360 / 27;
  const moonNakIndex = Math.floor(planets.Moon.longitude / nakSize);
  const moonPada = Math.floor((planets.Moon.longitude - moonNakIndex * nakSize) / (nakSize / 4)) + 1;

  const dasha = computeVimshottariDasha(input.dob, planets.Moon.longitude);
  const currentMd = dasha.mahadashas.find(m => m.isCurrent);
  const currentBhukti = currentMd?.bhukti?.find(b => b.isCurrent);

  const dosham = computeDosham(planets, lagnaRasi);

  // Navamsa positions for each planet + lagna
  const navamsa: Record<string, { rasi: number; rasiTamil: string }> = {};
  Object.entries(planets).forEach(([name, p]) => {
    const nr = navamsaRasi(p.longitude);
    navamsa[name] = { rasi: nr, rasiTamil: RASI_NAMES_TAMIL[nr - 1] };
  });
  const navamsaLagna = navamsaRasi(ascSid);

  return {
    birthInfo: {
      fullName: input.fullName,
      gender: input.gender,
      dobFormatted: input.dob.toUTCString().replace(/\s00:00:00 GMT$/, '').replace(/^(\w+),\s/, '$1, '),
      dobIso: input.dob.toISOString(),
      birthTime: input.birthTime,
      birthPlace: input.birthPlace,
      latitude: input.latitude,
      longitude: input.longitude
    },
    ayanamsa: ayan,
    ayanamsaName: 'லாகிரி அயனாம்சம்',
    lagna: {
      rasi: lagnaRasi,
      rasiTamil: RASI_NAMES_TAMIL[lagnaRasi - 1],
      lord: RASI_LORD[lagnaRasi],
      degInRasi: lagnaDeg
    },
    rasi: { num: planets.Moon.rasi, nameTamil: planets.Moon.rasiNameTamil },
    nakshatra: { index: moonNakIndex, nameTamil: NAKSHATRA_TAMIL[moonNakIndex], pada: moonPada },
    tithi,
    planets,
    navamsa,
    navamsaLagna,
    dasha,
    currentMd,
    currentBhukti,
    dosham
  };
}

// =====================================================================
// தசவித பொருத்தம் (Dasavidha Porutham) — 10-fold marriage matching
// + extra checks (Vrucha/Nadi). Based on Tamil Vedic tradition.
// =====================================================================

// Gana grouping: 0=Deva, 1=Manushya, 2=Rakshasa (by nakshatra index 0..26)
const NAKSHATRA_GANA: number[] = [
  0, 1, 2, 1, 0, 1, 0, 0, 2, 2,  // Aswini..Magha
  1, 1, 0, 2, 0, 2, 0, 2, 2, 1,  // PPhalguni..PAshadha
  1, 0, 2, 2, 1, 1, 0             // UAshadha..Revati
];

// Yoni animals (1..14). Friendly/hostile relations defined separately.
const NAKSHATRA_YONI: number[] = [
  1, 4, 5, 5, 6, 6, 7, 7, 8, 8,    // Aswini..Magha (Horse, Elephant, Sheep×2, Serpent×2, Dog×2, Cat×2)
  9, 9, 10, 10, 11, 11, 3, 3, 2, 13,  // PP..PAsh
  13, 12, 12, 14, 14, 1, 2          // UAsh..Revati
];
const YONI_HOSTILE: Record<number, number[]> = {
  1: [2], 2: [1],         // Horse - Buffalo
  3: [4], 4: [3],         // Goat - Tiger
  5: [12], 12: [5],       // Sheep - Monkey... etc (simplified)
  6: [9], 9: [6],         // Serpent - Mongoose
  7: [14], 14: [7],       // Dog - Deer
  8: [11], 11: [8],       // Cat - Mouse
  10: [13], 13: [10]      // Cow - Lion
};

// Rajju groups (5 rajjus, 4 directions). 0=Pada (feet), 1=Kati (thigh),
// 2=Nabhi (navel), 3=Kantha (neck), 4=Shira (head).
const NAKSHATRA_RAJJU: number[] = [
  4, 3, 2, 1, 0, 0, 1, 2, 3, 4,    // Aswini..Magha
  4, 3, 2, 1, 0, 0, 1, 2, 3, 4,    // PPhalguni..PAshadha
  4, 3, 2, 1, 0, 0, 1                // UAshadha..Revati
];

// Vedha pairs (obstruction). Bride and groom should not be in these pairs.
const VEDHA_PAIRS: Array<[number, number]> = [
  [0, 17], [1, 16], [2, 15], [3, 14], [4, 12], [5, 11], [6, 10], [7, 9],
  [18, 26], [19, 25], [20, 24], [21, 23]
];

// Rasi lord (planet name)
const RASI_LORD_PLANET: Record<number, string> = {
  1: 'Mars', 2: 'Venus', 3: 'Mercury', 4: 'Moon', 5: 'Sun', 6: 'Mercury',
  7: 'Venus', 8: 'Mars', 9: 'Jupiter', 10: 'Saturn', 11: 'Saturn', 12: 'Jupiter'
};
// Friendship (simplified — Parashara natural friends/enemies)
const PLANET_FRIENDS: Record<string, string[]> = {
  Sun:     ['Moon', 'Mars', 'Jupiter'],
  Moon:    ['Sun', 'Mercury'],
  Mars:    ['Sun', 'Moon', 'Jupiter'],
  Mercury: ['Sun', 'Venus'],
  Jupiter: ['Sun', 'Moon', 'Mars'],
  Venus:   ['Mercury', 'Saturn'],
  Saturn:  ['Mercury', 'Venus']
};
const PLANET_ENEMIES: Record<string, string[]> = {
  Sun:     ['Venus', 'Saturn'],
  Moon:    [],
  Mars:    ['Mercury'],
  Mercury: ['Moon'],
  Jupiter: ['Mercury', 'Venus'],
  Venus:   ['Sun', 'Moon'],
  Saturn:  ['Sun', 'Moon', 'Mars']
};

// Vasya groups: each rasi controls certain rasis.
const VASYA_TABLE: Record<number, number[]> = {
  1: [5, 8],          // Mesha → Simha, Vrischika
  2: [4, 7],          // Vrishabha → Kataka, Tula
  3: [6],             // Mithuna → Kanya
  4: [8, 9],          // Kataka → Vrischika, Dhanus
  5: [10],            // Simha → Makara
  6: [3, 12],         // Kanya → Mithuna, Meena
  7: [2, 10],         // Tula → Vrishabha, Makara
  8: [4, 7],          // Vrischika → Kataka, Tula
  9: [12],            // Dhanus → Meena
  10: [11],           // Makara → Kumbha
  11: [5],            // Kumbha → Simha
  12: [9]             // Meena → Dhanus
};

export type PoruthamItem = {
  num: number;
  name: string;
  description: string;
  weight: number;     // max score (varahmihira weights)
  score: number;      // achieved (0..weight)
  verdict: string;    // பொருந்தும் / பொருந்தும் (சுமார்) / பொருந்தாது
  level: 'good' | 'mid' | 'bad';
  note?: string;
};

function poruthamVerdict(score: number, weight: number): { verdict: string; level: 'good' | 'mid' | 'bad' } {
  const ratio = score / weight;
  if (ratio >= 0.9) return { verdict: 'பொருந்தும்', level: 'good' };
  if (ratio >= 0.5) return { verdict: 'பொருந்தும் (சுமார்)', level: 'mid' };
  return { verdict: 'பொருந்தாது', level: 'bad' };
}

export function computeDasavithaPorutham(
  brideNak: number, brideRasi: number,
  groomNak: number, groomRasi: number
): { items: PoruthamItem[]; totalScore: number; maxScore: number; percentage: number } {

  const items: PoruthamItem[] = [];

  // 1. தினப் பொருத்தம் (Dina): count (groomNak - brideNak) mod 9. 2,4,6,8,9 good.
  {
    const diff = ((groomNak - brideNak + 27) % 27) + 1;
    const goodSet = [2, 4, 6, 8, 9];
    const ok = goodSet.includes(diff % 9 || 9);
    const score = ok ? 3 : 0;
    items.push({
      num: 1, name: 'தினப் பொருத்தம்', description: 'ஆரோக்கியம், ஆயுள் பொருத்தம்',
      weight: 3, score, ...poruthamVerdict(score, 3)
    });
  }

  // 2. கணப் பொருத்தம் (Gana)
  {
    const bg = NAKSHATRA_GANA[brideNak];
    const gg = NAKSHATRA_GANA[groomNak];
    let score = 0;
    if (bg === gg) score = 6;
    else if ((bg === 0 && gg === 1) || (bg === 1 && gg === 0)) score = 5;
    else if (bg === 2 || gg === 2) score = bg === 2 && gg === 2 ? 6 : 0;
    items.push({
      num: 2, name: 'கணப் பொருத்தம்', description: 'குணம், மனப்பாங்கு பொருத்தம்',
      weight: 6, score, ...poruthamVerdict(score, 6)
    });
  }

  // 3. மகேந்திரம் (Mahendra) — count of bride→groom (1-based) ∈ {4,7,10,13,16,19,22,25}
  {
    const c = ((groomNak - brideNak + 27) % 27) + 1;
    const good = [4, 7, 10, 13, 16, 19, 22, 25].includes(c);
    const score = good ? 2 : 0;
    items.push({
      num: 3, name: 'மகேந்திரப் பொருத்தம்', description: 'பிள்ளை வரம், செழிப்பு',
      weight: 2, score, ...poruthamVerdict(score, 2)
    });
  }

  // 4. ஸ்திரீ தீர்க்கம் (Stree Deergha) — count from groom→bride should be > 9
  {
    const c = ((brideNak - groomNak + 27) % 27) + 1;
    const ok = c > 9;
    const score = ok ? 2 : 0;
    items.push({
      num: 4, name: 'ஸ்திரீ தீர்க்க பொருத்தம்', description: 'பெண்ணுக்கு நீண்ட ஆயுள், சுபம்',
      weight: 2, score, ...poruthamVerdict(score, 2)
    });
  }

  // 5. யோனிப் பொருத்தம் (Yoni)
  {
    const by = NAKSHATRA_YONI[brideNak];
    const gy = NAKSHATRA_YONI[groomNak];
    const hostile = YONI_HOSTILE[by]?.includes(gy);
    let score = 0;
    if (by === gy) score = 4;       // same yoni
    else if (hostile) score = 0;     // hostile
    else score = 2;                  // neutral
    items.push({
      num: 5, name: 'யோனிப் பொருத்தம்', description: 'உடல், தாம்பத்ய பொருத்தம்',
      weight: 4, score, ...poruthamVerdict(score, 4)
    });
  }

  // 6. ராசிப் பொருத்தம் (Rasi)
  {
    const d1 = ((groomRasi - brideRasi + 12) % 12) + 1;
    const d2 = ((brideRasi - groomRasi + 12) % 12) + 1;
    let score = 7;
    if (d1 === 6 || d1 === 8 || d2 === 6 || d2 === 8) score = 0;   // 6/8 axis bad
    else if (d1 === 2 || d1 === 12) score = 4;                       // 2-12 mild
    items.push({
      num: 6, name: 'இராசிப் பொருத்தம்', description: 'மன பொருத்தம், ஒற்றுமை',
      weight: 7, score, ...poruthamVerdict(score, 7)
    });
  }

  // 7. ராசியாதிபதி (Rasi Lord)
  {
    const bLord = RASI_LORD_PLANET[brideRasi];
    const gLord = RASI_LORD_PLANET[groomRasi];
    let score = 0;
    if (bLord === gLord) score = 5;
    else if (PLANET_FRIENDS[bLord]?.includes(gLord) || PLANET_FRIENDS[gLord]?.includes(bLord)) score = 4;
    else if (PLANET_ENEMIES[bLord]?.includes(gLord) || PLANET_ENEMIES[gLord]?.includes(bLord)) score = 0;
    else score = 2;
    items.push({
      num: 7, name: 'இராசி அதிபதி பொருத்தம்', description: 'குடும்ப செழிப்பு, செல்வம்',
      weight: 5, score, ...poruthamVerdict(score, 5)
    });
  }

  // 8. வசியம் (Vasya)
  {
    let score = 2;
    if (VASYA_TABLE[brideRasi]?.includes(groomRasi) || VASYA_TABLE[groomRasi]?.includes(brideRasi)) score = 2;
    else if (brideRasi === groomRasi) score = 2;
    else score = 1;
    items.push({
      num: 8, name: 'வசியப் பொருத்தம்', description: 'ஒருவரை ஒருவர் கவர்தல்',
      weight: 2, score, ...poruthamVerdict(score, 2)
    });
  }

  // 9. ரஜ்ஜு (Rajju) — same rajju is dosha
  {
    const sameRajju = NAKSHATRA_RAJJU[brideNak] === NAKSHATRA_RAJJU[groomNak];
    const score = sameRajju ? 0 : 5;
    items.push({
      num: 9, name: 'ரஜ்ஜுப் பொருத்தம்', description: 'திருமண ஸ்திரத்தன்மை, கணவன் ஆயுள்',
      weight: 5, score, ...poruthamVerdict(score, 5),
      note: sameRajju ? 'ஒரே ரஜ்ஜு — தோஷம்' : undefined
    });
  }

  // 10. வேதை (Vedha)
  {
    const bad = VEDHA_PAIRS.some(([a, b]) =>
      (brideNak === a && groomNak === b) || (brideNak === b && groomNak === a)
    );
    const score = bad ? 0 : 4;
    items.push({
      num: 10, name: 'வேதைப் பொருத்தம்', description: 'ஒற்றுமை, தடையின்மை',
      weight: 4, score, ...poruthamVerdict(score, 4)
    });
  }

  // 11. நாடிப் பொருத்தம் (Nadi) — three nadis (Adya, Madhya, Antya). Same nadi = dosha.
  {
    const nadi = (n: number) => {
      const r = n % 9;
      if ([0, 5, 6].includes(r)) return 0;
      if ([1, 4, 7].includes(r)) return 1;
      return 2;
    };
    const same = nadi(brideNak) === nadi(groomNak);
    const score = same ? 0 : 8;
    items.push({
      num: 11, name: 'நாடிப் பொருத்தம்', description: 'ஆரோக்கியம், பிள்ளை பாக்கியம்',
      weight: 8, score, ...poruthamVerdict(score, 8),
      note: same ? 'ஒரே நாடி — தோஷம்' : undefined
    });
  }

  // 12. விருட்சப் பொருத்தம் (Vruksha — tree compatibility, popular in Tamil tradition)
  {
    // Each nakshatra has an associated tree. Same tree-class compatible.
    const vrukshaClass = (n: number) => Math.floor(n / 9);
    const ok = vrukshaClass(brideNak) === vrukshaClass(groomNak)
      || Math.abs(vrukshaClass(brideNak) - vrukshaClass(groomNak)) === 1;
    const score = ok ? 2 : 0;
    items.push({
      num: 12, name: 'விருட்சப் பொருத்தம்', description: 'மரத்தின் இணைப்பு — செழிப்பு',
      weight: 2, score, ...poruthamVerdict(score, 2)
    });
  }

  const totalScore = items.reduce((s, x) => s + x.score, 0);
  const maxScore = items.reduce((s, x) => s + x.weight, 0);
  const percentage = Math.round((totalScore / maxScore) * 100);

  return { items, totalScore, maxScore, percentage };
}

// ============ தோட விவரம் — match-level dosha checks ============

export type MatchDosham = {
  name: string;
  matching: boolean;       // true = no dosha problem
  note: string;
};

export function computeMatchDoshams(brideChart: FullChart, groomChart: FullChart): MatchDosham[] {
  const out: MatchDosham[] = [];

  // 1. செவ்வாய் தோஷம் (Mangal/Chevvai) — reuse the same three-fold
  // (Lagna/Moon/Venus) result already computed on each chart via
  // computeDosham(), so the individual-chart Dosha screen and the marriage
  // match screen can never disagree about the same person's Chevvai dosha.
  const brideMangal = brideChart.dosham.chevvaiDosha.present;
  const groomMangal = groomChart.dosham.chevvaiDosha.present;
  if (brideMangal === groomMangal) {
    out.push({
      name: 'செவ்வாய் தோஷம்',
      matching: true,
      note: brideMangal ? 'Matching (இருவருக்கும் தோஷம் — ஒத்துப் போகும்)' : 'Matching (No Dosham)'
    });
  } else {
    out.push({
      name: 'செவ்வாய் தோஷம்',
      matching: false,
      note: brideMangal ? 'Not Matching (Chevvai dosha from girl)' : 'Not Matching (Chevvai dosha from boy)'
    });
  }

  // 2. சர்ப்ப தோஷம் (Sarpa/Rahu-Ketu)
  const isKalaSarpa = (chart: FullChart): boolean => {
    const rahu = chart.planets.Rahu.longitude;
    const ketu = chart.planets.Ketu.longitude;
    const others = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
    const arc = norm360(ketu - rahu);
    const inside = others.every(n => norm360(chart.planets[n].longitude - rahu) < arc);
    const outside = others.every(n => norm360(chart.planets[n].longitude - rahu) >= arc);
    return inside || outside;
  };
  const brideSarpa = isKalaSarpa(brideChart);
  const groomSarpa = isKalaSarpa(groomChart);
  if (brideSarpa === groomSarpa) {
    out.push({
      name: 'சர்ப்ப தோஷம்', matching: true,
      note: brideSarpa ? 'Matching (இருவருக்கும் தோஷம்)' : 'Matching (No Sarpa Dosham)'
    });
  } else {
    out.push({
      name: 'சர்ப்ப தோஷம்', matching: false,
      note: brideSarpa ? 'Not Matching (sarpa dosa from girl)' : 'Not Matching (sarpa dosa from boy)'
    });
  }

  // 3. தசா சந்தி / ஏக தசா (Dasha sandhi / same mahadasha at marriage time = problematic)
  const sameDashaLord = brideChart.currentMd?.lord === groomChart.currentMd?.lord;
  out.push({
    name: 'தசா சந்தி / ஏக தசா',
    matching: !sameDashaLord,
    note: sameDashaLord ? 'Not Matching (இருவரும் ஒரே தசையில்)' : 'Matching'
  });

  // 4. பாப சாம்யம் (Papa Saamya) — papa points should be roughly equal between partners
  const papaDiff = Math.abs(brideChart.dosham.papaPercent.lagna - groomChart.dosham.papaPercent.lagna);
  out.push({
    name: 'பாப சாம்யம்',
    matching: papaDiff <= 20,
    note: papaDiff <= 20
      ? `Matching (வேறுபாடு ${papaDiff}%)`
      : `Not Matching (வேறுபாடு ${papaDiff}%)`
  });

  // 5. புத்திர / களத்திர தோஷம் (5th/7th house affliction)
  const fifthAfflicted = (c: FullChart) => {
    const fifth = ((c.lagna.rasi - 1 + 4) % 12) + 1;
    return ['Mars', 'Saturn', 'Rahu', 'Ketu'].some(p => c.planets[p].rasi === fifth);
  };
  const both5Bad = fifthAfflicted(brideChart) && fifthAfflicted(groomChart);
  out.push({
    name: 'புத்திர / களத்திர தோஷம்',
    matching: !both5Bad,
    note: both5Bad ? 'Not Matching (5/7 பாவத்தில் பாபக்கிரகம்)' : 'Matching'
  });

  // 6. சட்டாஷ்டக தோஷம் (6/8 axis between moon rasis)
  const r1 = brideChart.planets.Moon.rasi;
  const r2 = groomChart.planets.Moon.rasi;
  const d = ((r2 - r1 + 12) % 12) + 1;
  const sashtashtaka = [6, 8].includes(d);
  out.push({
    name: 'சட்டாஷ்டக தோஷம்',
    matching: !sashtashtaka,
    note: sashtashtaka ? 'Not Matching (6/8 ஆகிய சந்தர்ப்பம்)' : 'Matching'
  });

  return out;
}

// Old API kept for any legacy callers (returns the same simplified shape)
export type Planet = { rasi: number; degree: string };
export type Planets = Record<string, Planet>;

export function calculatePlanetsLocal(
  dob: Date,
  _birthTime: string
): { planets: Planets; lagnaRasi: number; nakshatraIndex: number } {
  const seed = dob.getDate() + dob.getMonth() * 31;
  const planets: Planets = {};
  ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'].forEach((p, i) => {
    planets[p] = { rasi: ((seed + i * 3) % 12) + 1, degree: ((seed * i) % 30).toFixed(2) };
  });
  const lagnaRasi = ((seed * 2) % 12) + 1;
  const nakshatraIndex = (seed * 3) % 27;
  return { planets, lagnaRasi, nakshatraIndex };
}

export type GridCell = {
  pos: number;
  isCenter: boolean;
  planets: Array<{ name: string; nameTamil: string; degree: string }>;
  rasi?: number;
  rasiNameTamil?: string;
  isLagna?: boolean;
};

// South Indian fixed-grid mapping: rasi N → grid pos (0..15 in 4×4)
const RASI_TO_GRID_POS = [0, 1, 2, 3, 7, 11, 15, 14, 13, 12, 8, 4];

export function buildSouthIndianChartData(planets: Planets, lagnaRasi: number): GridCell[] {
  const grid: GridCell[] = Array(16).fill(null).map((_, i) => ({
    pos: i, planets: [], isCenter: i >= 5 && i <= 10 && i !== 7 && i !== 8
  }));
  const activeCells = [0, 1, 2, 3, 4, 7, 8, 11, 12, 13, 14, 15];
  Object.entries(planets).forEach(([name, data]) => {
    const gridPos = RASI_TO_GRID_POS[data.rasi - 1];
    if (grid[gridPos]) {
      grid[gridPos].planets.push({
        name, nameTamil: PLANET_TAMIL[name] || name, degree: data.degree
      });
    }
  });
  activeCells.forEach(pos => {
    const rasiNum = RASI_TO_GRID_POS.indexOf(pos) % 12;
    grid[pos].rasi = rasiNum + 1;
    grid[pos].rasiNameTamil = RASI_NAMES_TAMIL[rasiNum];
    grid[pos].isLagna = rasiNum + 1 === lagnaRasi;
  });
  return grid;
}
