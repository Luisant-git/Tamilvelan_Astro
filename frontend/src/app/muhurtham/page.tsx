'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { PURPOSES, findMuhurthams, type Purpose, type Slot } from '@/lib/muhurtham';
import { weekdayTaForIso } from '@/lib/holidays';

const MONTHS_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];

const COLOR = {
  card: '#251450',
  surface: '#1A0E3A',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA',
  festival: '#4CAF50'
};

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}
function fromISO(s: string): Date {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function HeaderBand({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #321C6B 0%, #251450 100%)',
      color: COLOR.gold, padding: '10px 14px', textAlign: 'center',
      fontFamily: 'Noto Sans Tamil, sans-serif', fontWeight: 600, fontSize: '16px',
      borderBottom: `1px solid ${COLOR.border}`
    }}>{children}</div>
  );
}

function SlotCard({ slot }: { slot: Slot }) {
  const [y, m, d] = slot.isoDate.split('-').map(Number);
  return (
    <Link
      href={`/panchang?date=${slot.isoDate}`}
      style={{
        display: 'block', textDecoration: 'none',
        background: COLOR.card, border: `1px solid ${COLOR.border}`,
        borderRadius: '12px', padding: '14px',
        transition: 'border-color 0.15s, background 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = COLOR.gold; e.currentTarget.style.background = '#321C6B'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = COLOR.border; e.currentTarget.style.background = COLOR.card; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
        <div>
          <div style={{ color: COLOR.gold, fontSize: '20px', fontWeight: 700, fontFamily: 'Noto Serif Tamil, serif' }}>
            {String(d).padStart(2, '0')}-{String(m).padStart(2, '0')}-{y}
          </div>
          <div style={{ color: COLOR.muted, fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif', marginTop: '2px' }}>
            {MONTHS_TA[m - 1]} · {weekdayTaForIso(slot.isoDate)}
          </div>
        </div>
        <div style={{
          background: COLOR.surface, color: COLOR.saffron,
          border: `1px solid ${COLOR.border}`, borderRadius: '999px',
          padding: '4px 10px', fontSize: '11px', fontWeight: 700,
          fontFamily: 'system-ui, sans-serif'
        }}>
          Score {slot.score}
        </div>
      </div>

      <div style={{
        marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
        fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '13px'
      }}>
        <div>
          <div style={{ color: COLOR.subtle, fontSize: '11px' }}>நட்சத்திரம்</div>
          <div style={{ color: COLOR.text }}>{slot.nakshatra}</div>
        </div>
        <div>
          <div style={{ color: COLOR.subtle, fontSize: '11px' }}>திதி</div>
          <div style={{ color: COLOR.text }}>{slot.tithi}</div>
        </div>
        <div>
          <div style={{ color: COLOR.subtle, fontSize: '11px' }}>நல்ல நேரம் காலை</div>
          <div style={{ color: COLOR.gold, fontFamily: 'system-ui, sans-serif' }}>{slot.nallaNeram.morning}</div>
        </div>
        <div>
          <div style={{ color: COLOR.subtle, fontSize: '11px' }}>நல்ல நேரம் மாலை</div>
          <div style={{ color: COLOR.gold, fontFamily: 'system-ui, sans-serif' }}>{slot.nallaNeram.evening}</div>
        </div>
      </div>

      {slot.isHoliday && (
        <div style={{
          marginTop: '10px', padding: '6px 10px',
          background: COLOR.surface, borderRadius: '6px',
          color: COLOR.festival, fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif'
        }}>
          🎉 {slot.isHoliday}
        </div>
      )}

      <div style={{ marginTop: '10px', color: COLOR.subtle, fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif', textAlign: 'right' }}>
        இந்த நாள் பஞ்சாங்கம் பார்க்க →
      </div>
    </Link>
  );
}

export default function MuhurthamPage() {
  const today = useMemo(() => new Date(), []);
  const ninetyDaysOut = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 90);
    return d;
  }, [today]);

  const [purpose, setPurpose] = useState<Purpose>('wedding');
  const [startISO, setStartISO] = useState(toISO(today));
  const [endISO, setEndISO] = useState(toISO(ninetyDaysOut));
  const [slots, setSlots] = useState<Slot[] | null>(null);

  const run = () => {
    const start = fromISO(startISO);
    const end = fromISO(endISO);
    if (end < start) {
      setSlots([]);
      return;
    }
    const result = findMuhurthams({ purpose, startDate: start, endDate: end, limit: 12 });
    setSlots(result);
  };

  const selected = PURPOSES.find(p => p.key === purpose)!;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div>
          <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: COLOR.gold, fontSize: 'clamp(18px, 4vw, 24px)', marginBottom: '2px' }}>
            சுபமுகூர்த்த தேர்வு
          </h1>
          <div style={{ color: COLOR.muted, fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
            Muhurtham Finder — pick a purpose + date range
          </div>
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>நோக்கம் தேர்வு — Choose purpose</HeaderBand>
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1px', background: COLOR.divider
          }}>
            {PURPOSES.map(p => (
              <button
                key={p.key}
                onClick={() => setPurpose(p.key)}
                style={{
                  background: purpose === p.key ? '#321C6B' : COLOR.card,
                  border: 'none', cursor: 'pointer',
                  padding: '14px 10px',
                  textAlign: 'center', color: COLOR.text,
                  fontFamily: 'Noto Sans Tamil, sans-serif',
                  borderTop: purpose === p.key ? `2px solid ${COLOR.gold}` : '2px solid transparent',
                  transition: 'background 0.15s'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '4px' }}>{p.icon}</div>
                <div style={{ fontSize: '13px', color: purpose === p.key ? COLOR.gold : COLOR.text, fontWeight: 600 }}>{p.ta}</div>
                <div style={{ fontSize: '10px', color: COLOR.subtle, fontFamily: 'system-ui, sans-serif', marginTop: '2px' }}>{p.en}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>தேதி வரம்பு — Date range</HeaderBand>
          <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            <div>
              <label style={{ color: COLOR.muted, fontSize: '12px', display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif', marginBottom: '4px' }}>
                தொடக்கம் / From
              </label>
              <input
                type="date"
                value={startISO}
                onChange={e => setStartISO(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  background: COLOR.surface, color: COLOR.text,
                  border: `1px solid ${COLOR.border}`, fontFamily: 'system-ui, sans-serif'
                }}
              />
            </div>
            <div>
              <label style={{ color: COLOR.muted, fontSize: '12px', display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif', marginBottom: '4px' }}>
                முடிவு / To
              </label>
              <input
                type="date"
                value={endISO}
                onChange={e => setEndISO(e.target.value)}
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: '8px',
                  background: COLOR.surface, color: COLOR.text,
                  border: `1px solid ${COLOR.border}`, fontFamily: 'system-ui, sans-serif'
                }}
              />
            </div>
          </div>
          <div style={{ padding: '0 14px 14px' }}>
            <button
              onClick={run}
              className="btn-gold"
              style={{ width: '100%' }}
            >
              சுபமுகூர்த்தம் கண்டறி / Find Muhurthams
            </button>
          </div>
        </div>

        {slots !== null && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div style={{ color: COLOR.muted, fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif', textAlign: 'center' }}>
              {slots.length > 0
                ? `${selected.ta} — சிறந்த ${slots.length} நாட்கள் / Top ${slots.length} for ${selected.en}`
                : 'பொருத்தமான நாட்கள் இல்லை. வேறு வரம்பை முயற்சிக்கவும். / No matches — try a different range.'}
            </div>
            {slots.map(s => <SlotCard key={s.isoDate} slot={s} />)}
          </div>
        )}

        <div style={{ marginTop: '12px', padding: '12px 14px', background: COLOR.surface, border: `1px dashed ${COLOR.border}`, borderRadius: '8px', color: COLOR.subtle, fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.5 }}>
          குறிப்பு: இந்த கணிப்பு பொதுவான பஞ்சாங்க விதிகளின் அடிப்படையில் தோராயமாக கணக்கிடப்படுகிறது. முக்கியமான நிகழ்வுகளுக்கு குலகுரு / பாரம்பரிய ஜோதிடரிடம் ஆலோசிக்கவும்.
          <br />
          <span style={{ fontFamily: 'system-ui, sans-serif' }}>
            Note: This is a heuristic estimate based on common panchang rules. For important events, consult a traditional astrologer.
          </span>
        </div>
      </div>
    </div>
  );
}
