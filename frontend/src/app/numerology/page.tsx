'use client';

import { useState } from 'react';

// Chaldean numerology values (most popular for Indian numerology)
const CHALDEAN: Record<string, number> = {
  A:1,B:2,C:3,D:4,E:5,F:8,G:3,H:5,I:1,J:1,K:2,L:3,M:4,N:5,
  O:7,P:8,Q:1,R:2,S:3,T:4,U:6,V:6,W:6,X:5,Y:1,Z:7
};

function reduce(n: number): number {
  while (n > 9 && n !== 11 && n !== 22 && n !== 33) {
    n = String(n).split('').reduce((s, c) => s + parseInt(c, 10), 0);
  }
  return n;
}
function nameNumber(name: string): number {
  const total = Array.from(name.toUpperCase())
    .filter(c => /[A-Z]/.test(c))
    .reduce((s, c) => s + (CHALDEAN[c] || 0), 0);
  return reduce(total);
}
function destinyFromDob(iso: string): number {
  const digits = iso.replace(/-/g, '').split('').map(d => parseInt(d, 10)).filter(n => !Number.isNaN(n));
  return reduce(digits.reduce((s, d) => s + d, 0));
}
function lifePathFromDob(iso: string): number {
  const [y, m, d] = iso.split('-').map(n => parseInt(n, 10));
  return reduce(reduce(y) + reduce(m) + reduce(d));
}

const NUMBER_MEANING: Record<number, { ta: string; en: string }> = {
  1:  { ta: 'தலைமை, தனிமை, புதிய தொடக்கம் — சூரியனின் ஆற்றல்.', en: 'Leadership, individuality, fresh starts — energy of the Sun.' },
  2:  { ta: 'பொருத்தம், அன்பு, உள்ளுணர்வு — சந்திரனின் ஆற்றல்.', en: 'Harmony, love, intuition — energy of the Moon.' },
  3:  { ta: 'வளர்ச்சி, கல்வி, ஞானம் — குருவின் ஆற்றல்.', en: 'Growth, learning, wisdom — energy of Jupiter.' },
  4:  { ta: 'நிலையான முயற்சி, ஒழுங்கு — ராகுவின் ஆற்றல்.', en: 'Discipline, structure, perseverance — energy of Rahu.' },
  5:  { ta: 'புதன், தகவல், விரைவான தொடர்பு — புதனின் ஆற்றல்.', en: 'Communication, adaptability — energy of Mercury.' },
  6:  { ta: 'அழகு, கலை, காதல், சொகுசு — சுக்கிரனின் ஆற்றல்.', en: 'Beauty, art, love, comfort — energy of Venus.' },
  7:  { ta: 'மறை ஞானம், ஆன்மிகம் — கேதுவின் ஆற்றல்.', en: 'Mysticism, spirituality — energy of Ketu.' },
  8:  { ta: 'நிலைத்தன்மை, கடினமான உழைப்பு — சனியின் ஆற்றல்.', en: 'Stability, hard work, karma — energy of Saturn.' },
  9:  { ta: 'வீரம், உயர் இலக்கு — செவ்வாயின் ஆற்றல்.', en: 'Courage, drive, action — energy of Mars.' },
  11: { ta: 'மாஸ்டர் எண் — உள்ளுணர்வு, தலைமை, தெய்வீக ஞானம்.', en: 'Master number — intuition, illumination, leadership.' },
  22: { ta: 'மாஸ்டர் கட்டுமான எண் — பெரிய சாதனை, மாற்றம்.', en: 'Master builder — large-scale achievement, transformation.' },
  33: { ta: 'மாஸ்டர் ஆசிரியர் எண் — அன்பு, சேவை, கருணை.', en: 'Master teacher — compassion, service, healing.' }
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700',
  fontSize: '17px', fontWeight: 600, marginBottom: '6px'
};

export default function NumerologyPage() {
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [result, setResult] = useState<{ name: number; destiny: number; lifePath: number } | null>(null);

  const onCalc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !dob) return;
    setResult({
      name: nameNumber(name),
      destiny: destinyFromDob(dob),
      lifePath: lifePathFromDob(dob)
    });
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '4px' }}>
        🔢 எண் கணிதம்
      </h1>
      <p style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '4px', fontFamily: 'system-ui, sans-serif' }}>
        Numerology
      </p>
      <p style={{ color: '#8B7BAA', fontSize: '13px', marginBottom: '24px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        சல்தீய எண் முறை — உங்கள் பெயர் மற்றும் பிறந்த தேதியின் அடிப்படையில் ஆற்றல் எண்கள்
      </p>

      <form onSubmit={onCalc} style={{
        background: '#251450', border: '1px solid #4B2A8F',
        borderRadius: '16px', padding: '20px', marginBottom: '20px'
      }}>
        <div style={{ marginBottom: '14px' }}>
          <label style={{ color: '#D4C5F0', fontSize: '13px', display: 'block', marginBottom: '6px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
            முழு பெயர் <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>/ Full Name (English)</span>
          </label>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Karthik"
            className="input-field"
          />
        </div>
        <div style={{ marginBottom: '18px' }}>
          <label style={{ color: '#D4C5F0', fontSize: '13px', display: 'block', marginBottom: '6px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
            பிறந்த தேதி <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>/ Date of Birth</span>
          </label>
          <input
            type="date" value={dob} onChange={e => setDob(e.target.value)}
            className="input-field" style={{ colorScheme: 'dark' }}
          />
        </div>
        <button type="submit" className="btn-gold" style={{ width: '100%' }}>
          கணக்கிடு / Calculate
        </button>
      </form>

      {result && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px', marginBottom: '16px' }}>
            {[
              { label: 'பெயர் எண்', en: 'Name Number', value: result.name },
              { label: 'விதி எண்',   en: 'Destiny',    value: result.destiny },
              { label: 'வாழ்க்கை பாதை எண்', en: 'Life Path', value: result.lifePath }
            ].map(b => (
              <div key={b.en} style={{
                background: '#1A0E3A', border: '1px solid #4B2A8F',
                borderRadius: '14px', padding: '18px', textAlign: 'center'
              }}>
                <div style={{ color: '#A89BC8', fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>{b.label}</div>
                <div style={{ color: '#8B7BAA', fontSize: '10px', fontFamily: 'system-ui, sans-serif', marginBottom: '6px' }}>{b.en}</div>
                <div style={{ color: '#FFD700', fontSize: '38px', fontWeight: 700, lineHeight: 1 }}>{b.value}</div>
              </div>
            ))}
          </div>

          <div style={{
            background: '#251450', border: '1px solid #4B2A8F',
            borderRadius: '14px', padding: '18px'
          }}>
            <div style={sectionTitle}>📖 எண்களின் பொருள்</div>
            <p style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif', marginBottom: '12px' }}>
              Meaning of your numbers
            </p>
            {[result.name, result.destiny, result.lifePath].map((n, i) => {
              const labels = ['பெயர் எண்', 'விதி எண்', 'வாழ்க்கை பாதை'];
              const m = NUMBER_MEANING[n];
              return (
                <div key={i} style={{
                  padding: '12px 14px', background: '#1A0E3A',
                  borderRadius: '10px', borderLeft: '3px solid #FFD700',
                  marginBottom: '10px'
                }}>
                  <div style={{ color: '#FFD700', fontSize: '13px', fontWeight: 600, fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {labels[i]} = <span style={{ fontSize: '18px' }}>{n}</span>
                  </div>
                  {m && (
                    <>
                      <div style={{ color: '#D4C5F0', fontSize: '13px', marginTop: '4px', fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.6 }}>
                        {m.ta}
                      </div>
                      <div style={{ color: '#8B7BAA', fontSize: '11px', marginTop: '2px', fontFamily: 'system-ui, sans-serif', lineHeight: 1.5 }}>
                        {m.en}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
