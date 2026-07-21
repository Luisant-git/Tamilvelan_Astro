'use client';

import Link from 'next/link';

type Props = {
  icon: string;
  titleTa: string;
  titleEn: string;
  taglineTa: string;
  taglineEn: string;
  features: Array<{ icon?: string; ta: string; en: string }>;
  etaTa?: string;
  etaEn?: string;
};

export default function ComingSoon({
  icon, titleTa, titleEn, taglineTa, taglineEn, features,
  etaTa = 'விரைவில் வருகிறது', etaEn = 'Coming soon'
}: Props) {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #1A0E3A 0%, #251450 100%)',
        border: '1px solid #4B2A8F',
        borderRadius: '20px', padding: '32px 24px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
        marginBottom: '20px'
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(circle at 30% 30%, rgba(255,215,0,0.08), transparent 60%), radial-gradient(circle at 70% 70%, rgba(255,140,0,0.08), transparent 60%)',
          pointerEvents: 'none'
        }}/>
        <div style={{ position: 'relative' }}>
          <div style={{ fontSize: '60px', marginBottom: '10px' }}>{icon}</div>
          <h1 style={{
            fontFamily: 'Noto Serif Tamil, serif',
            color: '#FFD700', fontSize: '30px', fontWeight: 700, lineHeight: 1.2,
            marginBottom: '4px'
          }}>
            {titleTa}
          </h1>
          <div style={{ color: '#FF8C00', fontSize: '14px', fontFamily: 'system-ui, sans-serif', marginBottom: '14px' }}>
            {titleEn}
          </div>

          <span style={{
            display: 'inline-block',
            background: '#FF8C00', color: 'white',
            padding: '4px 14px', borderRadius: '999px',
            fontSize: '11px', fontWeight: 600, letterSpacing: '0.5px',
            marginBottom: '14px'
          }}>
            ⏳ {etaTa} · {etaEn}
          </span>

          <p style={{ color: '#D4C5F0', fontSize: '14px', lineHeight: 1.7, fontFamily: 'Noto Sans Tamil, sans-serif', maxWidth: '520px', margin: '0 auto' }}>
            {taglineTa}
          </p>
          <p style={{ color: '#8B7BAA', fontSize: '12px', marginTop: '6px', fontFamily: 'system-ui, sans-serif' }}>
            {taglineEn}
          </p>
        </div>
      </div>

      {/* Feature preview */}
      <div style={{
        background: '#251450', border: '1px solid #4B2A8F',
        borderRadius: '16px', padding: '20px', marginBottom: '20px'
      }}>
        <h2 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '17px', marginBottom: '14px' }}>
          🔮 இந்த சேவையில் என்ன கிடைக்கும்?
          <span style={{ display: 'block', color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif', fontWeight: 400, marginTop: '2px' }}>
            What this service will offer
          </span>
        </h2>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {features.map((f, i) => (
            <li key={i} style={{
              display: 'flex', alignItems: 'flex-start', gap: '10px',
              padding: '10px 0',
              borderBottom: i < features.length - 1 ? '1px solid #32205A' : 'none'
            }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: '28px', height: '28px', borderRadius: '8px',
                background: '#1A0E3A', border: '1px solid #4B2A8F',
                fontSize: '14px', flexShrink: 0
              }}>{f.icon || '✦'}</span>
              <div style={{ flex: 1 }}>
                <div style={{ color: '#FFD700', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif', fontWeight: 500 }}>
                  {f.ta}
                </div>
                <div style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif', marginTop: '1px' }}>
                  {f.en}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* CTA */}
      <div style={{ textAlign: 'center' }}>
        <Link href="/" className="btn-gold" style={{ padding: '10px 24px', display: 'inline-block' }}>
          முகப்பு / Home
        </Link>
      </div>
    </div>
  );
}
