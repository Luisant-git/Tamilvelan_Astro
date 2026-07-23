'use client';

import { useState, FormEvent } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';

type Traits = { trust: number; communication: number; passion: number; stability: number };
type Result = { name1: string; name2: string; percentage: number; verdict: string; traits: Traits };

const TRAIT_LABEL: Record<keyof Traits, string> = {
  trust: 'நம்பிக்கை',
  communication: 'தொடர்பு',
  passion: 'காதல்',
  stability: 'நிலைத்தன்மை'
};

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ marginBottom: '10px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ color: '#A89BC8', fontSize: '13px' }}>{label}</span>
        <span style={{ color: '#FFD700', fontSize: '13px' }}>{value}%</span>
      </div>
      <div style={{ background: '#1A0E3A', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
        <div style={{ background: '#FF6B9D', height: '100%', width: `${value}%`, transition: 'width 0.4s' }} />
      </div>
    </div>
  );
}

export default function KadhalPage() {
  const [name1, setName1] = useState('');
  const [name2, setName2] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!name1 || !name2) {
      toast.error('இரு பெயர்களும் தேவை');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/kadhal/match', { name1, name2 });
      setResult(res.data);
    } catch {
      toast.error('கணிக்கவில்லை');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '8px' }}>
        ❤️ காதல் கணிப்பு
      </h1>
      <p style={{ color: '#8B7BAA', marginBottom: '28px' }}>
        இரு பெயர்களையும் கொடுத்து காதல் பொருத்தம் சதவீதம் கண்டறியுங்கள்
      </p>

      <form
        onSubmit={onSubmit}
        style={{ background: '#251450', border: '1px solid #4B2A8F', borderRadius: '20px', padding: '24px' }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <div>
            <label style={{ color: '#F4C0D1', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              பெயர் 1
            </label>
            <input
              value={name1}
              onChange={e => setName1(e.target.value)}
              placeholder="உங்கள் பெயர்"
              className="input-field"
            />
          </div>
          <div>
            <label style={{ color: '#B5D4F4', fontSize: '13px', display: 'block', marginBottom: '6px' }}>
              பெயர் 2
            </label>
            <input
              value={name2}
              onChange={e => setName2(e.target.value)}
              placeholder="அவர்/அவள் பெயர்"
              className="input-field"
            />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%', opacity: loading ? 0.7 : 1 }}>
          {loading ? 'கணிக்கிறோம்...' : 'காதல் சதவீதம் கண்டறி'}
        </button>
      </form>

      {result && (
        <div
          style={{
            marginTop: '24px',
            background: '#251450',
            border: '1px solid #D4537E',
            borderRadius: '20px',
            padding: '24px'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ fontSize: '14px', color: '#A89BC8' }}>
              {result.name1} <span style={{ color: '#FF6B9D' }}>❤</span> {result.name2}
            </div>
            <div style={{ fontSize: '52px', fontWeight: 700, color: '#FF6B9D', marginTop: '8px' }}>
              {result.percentage}%
            </div>
            <div style={{ color: '#C4B5E0', fontSize: '14px', marginTop: '8px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              {result.verdict}
            </div>
          </div>
          <div>
            {(Object.keys(result.traits) as Array<keyof Traits>).map(k => (
              <Bar key={k} label={TRAIT_LABEL[k]} value={result.traits[k]} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
