'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

const RASIS: Array<{ num: number; ta: string; symbol: string; en: string }> = [
  { num: 1,  ta: 'மேஷம்',     symbol: '♈', en: 'Aries' },
  { num: 2,  ta: 'ரிஷபம்',    symbol: '♉', en: 'Taurus' },
  { num: 3,  ta: 'மிதுனம்',   symbol: '♊', en: 'Gemini' },
  { num: 4,  ta: 'கடகம்',     symbol: '♋', en: 'Cancer' },
  { num: 5,  ta: 'சிம்மம்',   symbol: '♌', en: 'Leo' },
  { num: 6,  ta: 'கன்னி',     symbol: '♍', en: 'Virgo' },
  { num: 7,  ta: 'துலாம்',    symbol: '♎', en: 'Libra' },
  { num: 8,  ta: 'விருச்சிகம்', symbol: '♏', en: 'Scorpio' },
  { num: 9,  ta: 'தனுசு',     symbol: '♐', en: 'Sagittarius' },
  { num: 10, ta: 'மகரம்',     symbol: '♑', en: 'Capricorn' },
  { num: 11, ta: 'கும்பம்',   symbol: '♒', en: 'Aquarius' },
  { num: 12, ta: 'மீனம்',     symbol: '♓', en: 'Pisces' }
];

export default function RasiPalanPage() {
  const [predictions, setPredictions] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all(
      RASIS.map(r =>
        api.get(`/horoscope/daily/${r.num}`)
          .then(res => [r.num, res.data.prediction as string] as const)
          .catch(() => [r.num, 'இன்று உங்களுக்கு நல்ல நாள். தைரியமாக முன்னேறுங்கள்.'] as const)
      )
    ).then(rows => {
      const map: Record<number, string> = {};
      rows.forEach(([n, p]) => { map[n] = p; });
      setPredictions(map);
      setLoading(false);
    });
  }, []);

  const today = new Date().toLocaleDateString('ta-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '4px' }}>
        ⭐ ராசி பலன்கள்
      </h1>
      <p style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '4px', fontFamily: 'system-ui, sans-serif' }}>
        Rasi Predictions (All 12)
      </p>
      <p style={{ color: '#8B7BAA', fontSize: '13px', marginBottom: '20px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        இன்று — {today}
      </p>

      {loading ? (
        <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்... / Loading…</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {RASIS.map(r => (
            <div key={r.num} style={{
              background: '#251450', border: '1px solid #4B2A8F',
              borderRadius: '14px', padding: '16px',
              display: 'flex', flexDirection: 'column', gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid #32205A', paddingBottom: '8px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: '#1A0E3A', border: '1px solid #FFD700',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '20px', color: '#FFD700'
                }}>
                  {r.symbol}
                </div>
                <div>
                  <div style={{ color: '#FFD700', fontSize: '15px', fontWeight: 600, fontFamily: 'Noto Serif Tamil, serif' }}>
                    {r.ta}
                  </div>
                  <div style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>
                    {r.en} · Rasi {r.num}
                  </div>
                </div>
              </div>
              <p style={{ color: '#D4C5F0', fontSize: '13px', lineHeight: 1.7, fontFamily: 'Noto Sans Tamil, sans-serif', margin: 0 }}>
                {predictions[r.num]}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
