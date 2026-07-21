'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

type Panchang = {
  date: string;
  isoDate: string;
  varam: string;
  tithi: string;
  nakshatra: string;
  yoga: string;
  karana: string;
  rahuKalam: string;
  yamagandam: string;
  sunrise: string;
  sunset: string;
  shubhaMuhurtham: string;
  nallaNeram: { morning: string; evening: string };
  gowriNeram: { morning: string; evening: string };
  specialDay: string;
};

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #2A1A50' }}>
      <span style={{ color: '#A89BC8', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>{label}</span>
      <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 500, fontFamily: 'Noto Sans Tamil, sans-serif' }}>{value || '—'}</span>
    </div>
  );
}

export default function TomorrowPage() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateLong = tomorrow.toLocaleDateString('ta-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
  const tomorrowISO = toISO(tomorrow);

  const [data, setData] = useState<Panchang | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/panchang/today?date=${tomorrowISO}`)
      .then(r => setData(r.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [tomorrowISO]);

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '4px' }}>
        🌄 நாளைய சிறப்புகள்
      </h1>
      <p style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '4px', fontFamily: 'system-ui, sans-serif' }}>
        Tomorrow&apos;s Highlights
      </p>
      <p style={{ color: '#8B7BAA', marginBottom: '20px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>{dateLong}</p>

      {loading ? (
        <div style={{ color: '#8B7BAA', fontFamily: 'Noto Sans Tamil, sans-serif' }}>ஏற்றுகிறோம்... / Loading…</div>
      ) : !data ? (
        <div style={{ color: '#FF6B6B', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          பஞ்சாங்க தகவலை பெற முடியவில்லை. / Could not load panchang.
        </div>
      ) : (
        <>
          <div style={{ background: '#251450', border: '1px solid #4B2A8F', borderRadius: '16px', padding: '20px', marginBottom: '16px' }}>
            <Row label="வாரம்" value={data.varam} />
            <Row label="திதி" value={data.tithi} />
            <Row label="நட்சத்திரம்" value={data.nakshatra} />
            <Row label="யோகம்" value={data.yoga} />
            <Row label="கரணம்" value={data.karana} />
            <Row label="சூரிய உதயம்" value={data.sunrise} />
            <Row label="சூரிய அஸ்தமனம்" value={data.sunset} />
          </div>

          <div style={{ background: '#251450', border: '1px solid #FF6B6B33', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ color: '#FF6B6B', fontSize: '13px', marginBottom: '6px', fontWeight: 600, fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              ⚠️ தவிர்க்க வேண்டிய நேரங்கள் / Avoid these hours
            </div>
            <Row label="ராகு காலம்" value={data.rahuKalam} />
            <Row label="யமகண்டம்" value={data.yamagandam} />
          </div>

          <div style={{ background: '#1A2A1A', border: '1px solid #4CAF5033', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
            <div style={{ color: '#4CAF50', fontSize: '13px', marginBottom: '6px', fontWeight: 600, fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              ✨ சுப முகூர்த்த நேரம் / Auspicious time
            </div>
            <div style={{ color: '#FFD700', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              {data.shubhaMuhurtham}
            </div>
            <div style={{ marginTop: '8px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' }}>
              <div>
                <div style={{ color: '#8B7BAA', fontFamily: 'Noto Sans Tamil, sans-serif' }}>நல்ல நேரம் காலை</div>
                <div style={{ color: '#FFD700' }}>{data.nallaNeram.morning}</div>
              </div>
              <div>
                <div style={{ color: '#8B7BAA', fontFamily: 'Noto Sans Tamil, sans-serif' }}>நல்ல நேரம் மாலை</div>
                <div style={{ color: '#FFD700' }}>{data.nallaNeram.evening}</div>
              </div>
            </div>
          </div>

          {data.specialDay && (
            <div style={{ background: '#251450', border: '1px solid #FFD70044', borderRadius: '12px', padding: '14px', marginBottom: '20px' }}>
              <div style={{ color: '#FFD700', fontSize: '13px', fontWeight: 600, fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                🎉 சிறப்பு நாள் / Special day
              </div>
              <div style={{ color: '#F5F0FF', fontSize: '13px', marginTop: '4px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {data.specialDay}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/panchang" className="btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
              இன்றைய பஞ்சாங்கம் / Today
            </Link>
            <Link href={`/panchang?date=${tomorrowISO}`} className="btn-outline" style={{ padding: '8px 18px', fontSize: '13px' }}>
              முழு பஞ்சாங்கம் / Full panchang
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
