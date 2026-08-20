'use client';

// Planetary Hora — 24 horas/day, ~1 hour each (actually day-hora and night-hora
// have slightly different durations because day length varies). First hora of
// the day = ruler of the weekday. Cycle order is Chaldean.

const CHALDEAN_ORDER = ['Saturn', 'Jupiter', 'Mars', 'Sun', 'Venus', 'Mercury', 'Moon'];

const PLANET_TA: Record<string, string> = {
  Sun: 'சூரியன்', Moon: 'சந்திரன்', Mars: 'செவ்வாய்',
  Mercury: 'புதன்', Jupiter: 'குரு', Venus: 'சுக்கிரன்',
  Saturn: 'சனி'
};
const PLANET_ICON: Record<string, string> = {
  Sun: '☀', Moon: '🌙', Mars: '♂', Mercury: '☿',
  Jupiter: '♃', Venus: '♀', Saturn: '♄'
};
const PLANET_COLOR: Record<string, string> = {
  Sun: '#FF8C00', Moon: '#9FB4D9', Mars: '#FF6B6B',
  Mercury: '#4CAF50', Jupiter: '#FFD700', Venus: '#F48FB1',
  Saturn: '#7B6FAA'
};
// Quality of hora for general activities
const PLANET_QUALITY: Record<string, { ta: string; en: string; good: boolean }> = {
  Sun:     { ta: 'அதிகார காரியங்கள், அரசாங்கம், ஆரோக்கியம்', en: 'Authority, government, health',   good: true  },
  Moon:    { ta: 'புதிய முயற்சி, பயணம், அன்பு',              en: 'New ventures, travel, love',        good: true  },
  Mars:    { ta: 'சண்டை, அறுவை, விளையாட்டு — கவனம்',         en: 'Conflict, surgery, sports — caution', good: false },
  Mercury: { ta: 'வியாபாரம், கல்வி, தகவல் தொடர்பு',          en: 'Trade, study, communication',         good: true  },
  Jupiter: { ta: 'ஞானம், ஆன்மிகம், திருமணம் — மிகச்சிறந்த',   en: 'Wisdom, spiritual, marriage — best',  good: true  },
  Venus:   { ta: 'அழகு, கலை, காதல், சொகுசு',                 en: 'Beauty, art, love, luxury',           good: true  },
  Saturn:  { ta: 'நீண்டகால திட்டங்கள் — பொறுமை',             en: 'Long-term plans — patience',          good: false }
};

// Weekday → ruling planet
const WEEKDAY_RULER = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn'];
const WEEKDAY_TA = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];

const SUNRISE_H = 6, SUNRISE_M = 0;
const SUNSET_H = 18, SUNSET_M = 15;

function pad(n: number) { return String(n).padStart(2, '0'); }
function fmt(totalMin: number) {
  const t = ((totalMin % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = Math.round(t % 60);
  const am = h < 12;
  const hh = h % 12 || 12;
  return `${pad(hh)}:${pad(m)} ${am ? 'AM' : 'PM'}`;
}

export default function HoraPage() {
  const now = new Date();
  const dayIdx = now.getDay();
  const ruler = WEEKDAY_RULER[dayIdx];
  const startIdx = CHALDEAN_ORDER.indexOf(ruler);

  const sunriseMin = SUNRISE_H * 60 + SUNRISE_M;
  const sunsetMin = SUNSET_H * 60 + SUNSET_M;
  const dayDur = sunsetMin - sunriseMin;
  const nightDur = 24 * 60 - dayDur;
  const dayHora = dayDur / 12;
  const nightHora = nightDur / 12;

  // Generate 24 horas
  const horas: Array<{ planet: string; start: number; end: number; isDay: boolean }> = [];
  for (let i = 0; i < 12; i++) {
    horas.push({
      planet: CHALDEAN_ORDER[(startIdx + i) % 7],
      start: sunriseMin + i * dayHora,
      end: sunriseMin + (i + 1) * dayHora,
      isDay: true
    });
  }
  for (let i = 0; i < 12; i++) {
    horas.push({
      planet: CHALDEAN_ORDER[(startIdx + 12 + i) % 7],
      start: sunsetMin + i * nightHora,
      end: sunsetMin + (i + 1) * nightHora,
      isDay: false
    });
  }

  // Current hora highlight
  const nowMin = now.getHours() * 60 + now.getMinutes();
  const currentIdx = horas.findIndex(h => {
    if (h.start <= h.end) return nowMin >= h.start && nowMin < h.end;
    return nowMin >= h.start || nowMin < h.end;
  });

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '4px' }}>
        🌞 கிரக ஓரைகளின் காலம்
      </h1>
      <p style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '4px', fontFamily: 'system-ui, sans-serif' }}>
        Planetary Hora
      </p>
      <p style={{ color: '#8B7BAA', fontSize: '13px', marginBottom: '20px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        இன்று {WEEKDAY_TA[dayIdx]} — அதிபதி: {PLANET_ICON[ruler]} {PLANET_TA[ruler]}
      </p>

      <div style={{
        background: '#251450', border: '1px solid #4B2A8F',
        borderRadius: '14px', overflow: 'hidden', marginBottom: '20px'
      }}>
        <div style={{ background: '#1A0E3A', color: '#FFD700', padding: '12px 16px', fontFamily: 'Noto Serif Tamil, serif', fontWeight: 600 }}>
          24 ஓரைகள் <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif', fontWeight: 400 }}>· 12 day + 12 night</span>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          <thead>
            <tr style={{ background: '#32205A', color: '#FFD700' }}>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>#</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>நேரம்</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>கிரகம்</th>
              <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '12px' }}>வகை</th>
            </tr>
          </thead>
          <tbody>
            {horas.map((h, i) => {
              const isCurrent = i === currentIdx;
              const q = PLANET_QUALITY[h.planet];
              return (
                <tr key={i} style={{
                  background: isCurrent ? '#2A1A50' : (i % 2 === 0 ? '#1A0E3A' : '#251450'),
                  borderLeft: isCurrent ? '3px solid #FFD700' : '3px solid transparent'
                }}>
                  <td style={{ padding: '8px 12px', color: '#8B7BAA', fontSize: '12px' }}>{i + 1}</td>
                  <td style={{ padding: '8px 12px', color: '#A89BC8', fontSize: '12px' }}>
                    {fmt(h.start)} – {fmt(h.end)}
                  </td>
                  <td style={{ padding: '8px 12px', fontSize: '13px' }}>
                    <span style={{ color: PLANET_COLOR[h.planet], fontSize: '15px', marginRight: '4px' }}>{PLANET_ICON[h.planet]}</span>
                    <span style={{ color: '#FFD700', fontWeight: 500 }}>{PLANET_TA[h.planet]}</span>
                    {isCurrent && (
                      <span style={{ marginLeft: '8px', background: '#FFD700', color: '#251450', padding: '1px 6px', borderRadius: '999px', fontSize: '10px', fontWeight: 600 }}>
                        இப்போது
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '8px 12px', color: q.good ? '#4CAF50' : '#FF6B6B', fontSize: '11px' }}>
                    {h.isDay ? '☀ பகல்' : '🌙 இரவு'}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div style={{
        background: '#251450', border: '1px solid #4B2A8F',
        borderRadius: '14px', padding: '16px'
      }}>
        <div style={{ color: '#FFD700', fontFamily: 'Noto Serif Tamil, serif', fontSize: '15px', marginBottom: '10px' }}>
          📖 கிரக ஓரை பலன்கள் / Hora Significance
        </div>
        <div style={{ display: 'grid', gap: '8px' }}>
          {Object.entries(PLANET_QUALITY).map(([k, v]) => (
            <div key={k} style={{
              background: '#1A0E3A', borderRadius: '8px', padding: '10px 12px',
              borderLeft: `3px solid ${PLANET_COLOR[k]}`
            }}>
              <div style={{ color: PLANET_COLOR[k], fontSize: '13px', fontWeight: 600, fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {PLANET_ICON[k]} {PLANET_TA[k]} <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>({k})</span>
              </div>
              <div style={{ color: '#D4C5F0', fontSize: '12px', marginTop: '2px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {v.ta}
              </div>
              <div style={{ color: '#8B7BAA', fontSize: '10px', marginTop: '1px', fontFamily: 'system-ui, sans-serif' }}>
                {v.en}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
