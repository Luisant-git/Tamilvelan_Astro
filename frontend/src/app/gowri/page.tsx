'use client';

// Gowri Panchangam — 8 periods × day/night based on weekday.
// Period names and their quality (Amrutham = nectar/best, Marana = death/avoid).

type Quality = 'good' | 'bad' | 'mid';

const PERIOD_INFO: Record<string, { ta: string; en: string; quality: Quality }> = {
  Udayam:   { ta: 'உதயம்',   en: 'Udayam',   quality: 'mid'  },
  Amrutham: { ta: 'அமிர்தம்', en: 'Amrutham', quality: 'good' },
  Siddham:  { ta: 'சித்தம்',  en: 'Siddham',  quality: 'good' },
  Sukam:    { ta: 'சுகம்',   en: 'Sukam',    quality: 'good' },
  Roga:     { ta: 'ரோகம்',   en: 'Roga',     quality: 'bad'  },
  Kala:     { ta: 'காலம்',   en: 'Kala',     quality: 'bad'  },
  Marana:   { ta: 'மரணம்',   en: 'Marana',   quality: 'bad'  },
  Labha:    { ta: 'லாபம்',   en: 'Labha',    quality: 'good' }
};

// Weekday → day period sequence (8 periods from sunrise → sunset)
// Sun=0, Mon=1, ..., Sat=6
const DAY_SEQUENCES: Record<number, string[]> = {
  0: ['Udayam', 'Amrutham', 'Siddham', 'Marana', 'Roga', 'Labha', 'Kala', 'Sukam'],     // Sunday
  1: ['Sukam',  'Udayam',   'Amrutham','Siddham','Marana', 'Roga', 'Labha', 'Kala'],    // Monday
  2: ['Kala',   'Sukam',    'Udayam',  'Amrutham','Siddham','Marana','Roga',  'Labha'], // Tuesday
  3: ['Labha',  'Kala',     'Sukam',   'Udayam', 'Amrutham','Siddham','Marana','Roga'], // Wednesday
  4: ['Roga',   'Labha',    'Kala',    'Sukam',  'Udayam', 'Amrutham','Siddham','Marana'], // Thursday
  5: ['Marana', 'Roga',     'Labha',   'Kala',   'Sukam',  'Udayam', 'Amrutham','Siddham'], // Friday
  6: ['Siddham','Marana',   'Roga',    'Labha',  'Kala',   'Sukam',  'Udayam', 'Amrutham']  // Saturday
};

// Night sequence — shift by 5 positions from day sequence (standard Gowri Panchangam rule)
function nightSequenceFor(day: number): string[] {
  const seq = DAY_SEQUENCES[day];
  return [...seq.slice(5), ...seq.slice(0, 5)];
}

const WEEKDAY_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
const WEEKDAY_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Approx Tamil Nadu sunrise/sunset for now — for production use real values
const SUNRISE_H = 6, SUNRISE_M = 0;
const SUNSET_H = 18, SUNSET_M = 15;

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(h: number, m: number) {
  const am = h < 12;
  const hh = h % 12 || 12;
  return `${pad(hh)}:${pad(m)} ${am ? 'AM' : 'PM'}`;
}

function buildPeriods(startH: number, startM: number, durationMin: number, names: string[]) {
  const per = durationMin / 8;
  let cursor = startH * 60 + startM;
  return names.map(n => {
    const s = cursor;
    const e = cursor + per;
    cursor = e;
    return {
      name: n,
      info: PERIOD_INFO[n],
      start: fmt(Math.floor(s / 60) % 24, Math.round(s % 60)),
      end:   fmt(Math.floor(e / 60) % 24, Math.round(e % 60))
    };
  });
}

const qualityColor: Record<Quality, string> = {
  good: '#4CAF50',
  mid:  '#FFD700',
  bad:  '#FF6B6B'
};
const qualityLabel: Record<Quality, { ta: string; en: string }> = {
  good: { ta: 'நல்ல நேரம்', en: 'Good' },
  mid:  { ta: 'மிதம்',     en: 'Neutral' },
  bad:  { ta: 'தவிர்க்க',   en: 'Avoid' }
};

export default function GowriPage() {
  const now = new Date();
  const dayIdx = now.getDay();

  const daySeq = DAY_SEQUENCES[dayIdx];
  const nightSeq = nightSequenceFor(dayIdx);

  const sunsetMin = SUNSET_H * 60 + SUNSET_M;
  const sunriseMin = SUNRISE_H * 60 + SUNRISE_M;
  const dayDur = sunsetMin - sunriseMin;
  const nightDur = 24 * 60 - dayDur;

  const dayPeriods = buildPeriods(SUNRISE_H, SUNRISE_M, dayDur, daySeq);
  const nightPeriods = buildPeriods(SUNSET_H, SUNSET_M, nightDur, nightSeq);

  const renderRow = (p: typeof dayPeriods[number], i: number) => {
    const c = qualityColor[p.info.quality];
    return (
      <tr key={i} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
        <td style={{ padding: '10px 14px', color: '#A89BC8', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          {p.start} – {p.end}
        </td>
        <td style={{ padding: '10px 14px', color: '#FFD700', fontSize: '14px', fontFamily: 'Noto Sans Tamil, sans-serif', fontWeight: 500 }}>
          {p.info.ta} <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>({p.info.en})</span>
        </td>
        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
          <span style={{
            background: c, color: '#251450', padding: '3px 10px',
            borderRadius: '999px', fontSize: '11px', fontWeight: 600,
            fontFamily: 'Noto Sans Tamil, sans-serif'
          }}>
            {qualityLabel[p.info.quality].ta}
          </span>
        </td>
      </tr>
    );
  };

  const sectionStyle: React.CSSProperties = {
    background: '#251450', border: '1px solid #4B2A8F',
    borderRadius: '14px', overflow: 'hidden', marginBottom: '18px'
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '4px' }}>
        🪔 கௌரி பஞ்சாங்கம்
      </h1>
      <p style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '4px', fontFamily: 'system-ui, sans-serif' }}>
        Gowri Panchangam
      </p>
      <p style={{ color: '#8B7BAA', fontSize: '13px', marginBottom: '20px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        இன்று {WEEKDAY_TA[dayIdx]} · {WEEKDAY_EN[dayIdx]} — 8 பகல் + 8 இரவு பெரியதுகள்
      </p>

      <div style={sectionStyle}>
        <div style={{ background: '#1A0E3A', color: '#FFD700', padding: '12px 16px', fontFamily: 'Noto Serif Tamil, serif', fontWeight: 600 }}>
          ☀️ பகல் பெரியது <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>· Day Period (Sunrise → Sunset)</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>{dayPeriods.map(renderRow)}</tbody>
        </table>
      </div>

      <div style={sectionStyle}>
        <div style={{ background: '#1A0E3A', color: '#FFD700', padding: '12px 16px', fontFamily: 'Noto Serif Tamil, serif', fontWeight: 600 }}>
          🌙 இரவு பெரியது <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>· Night Period (Sunset → Sunrise)</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>{nightPeriods.map(renderRow)}</tbody>
        </table>
      </div>

      <div style={{ ...sectionStyle, padding: '16px' }}>
        <div style={{ color: '#FFD700', fontFamily: 'Noto Serif Tamil, serif', fontSize: '15px', marginBottom: '10px' }}>
          📖 விளக்கம் / Legend
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px' }}>
          {Object.entries(PERIOD_INFO).map(([k, v]) => (
            <div key={k} style={{
              background: '#1A0E3A', borderRadius: '8px', padding: '8px 12px',
              borderLeft: `3px solid ${qualityColor[v.quality]}`
            }}>
              <div style={{ color: '#FFD700', fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {v.ta} <span style={{ color: '#8B7BAA', fontSize: '10px', fontFamily: 'system-ui, sans-serif' }}>({v.en})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
