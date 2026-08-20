'use client';

import { useMemo, useState, useEffect } from 'react';
import {
  BIRDS,
  ACTIVITIES,
  type Bird,
  type Activity,
  type SlotResult,
  birdForNakshatraIdx,
  nakshatrasForBird,
  daySchedule,
  pakshaFor,
  relationship,
  rulerBirdFor,
  friendsOf,
  enemiesOf,
  birdInfo
} from '@/lib/panchaPakshi';
import { NAKSHATRA } from '@/lib/muhurtham';

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
  green: '#4CAF50',
  red: '#FF6B6B',
  cyan: '#7DD3FC'
};

const ACTIVITY_COLOR: Record<Activity, string> = {
  rule:  COLOR.gold,
  eat:   COLOR.green,
  walk:  COLOR.cyan,
  sleep: COLOR.muted,
  die:   COLOR.red
};

const STORAGE_KEY = 'jothidam_my_nakshatra';

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

function BirdBadge({ bird, size = 'md' }: { bird: Bird; size?: 'sm' | 'md' | 'lg' }) {
  const info = birdInfo(bird);
  const dims = size === 'lg' ? { icon: 56, ta: 22, en: 13, pad: 18 }
             : size === 'sm' ? { icon: 28, ta: 13, en: 10, pad: 8 }
             : { icon: 36, ta: 16, en: 11, pad: 12 };
  return (
    <div style={{ textAlign: 'center', padding: `${dims.pad}px` }}>
      <div style={{ fontSize: `${dims.icon}px`, lineHeight: 1 }}>{info.icon}</div>
      <div style={{ color: COLOR.gold, fontFamily: 'Noto Serif Tamil, serif', fontWeight: 700, fontSize: `${dims.ta}px`, marginTop: '6px' }}>
        {info.ta}
      </div>
      <div style={{ color: COLOR.subtle, fontSize: `${dims.en}px`, fontFamily: 'system-ui, sans-serif' }}>
        {info.en} · {info.elementTa}
      </div>
    </div>
  );
}

function SlotRow({ slot, isCurrent }: { slot: SlotResult; isCurrent: boolean }) {
  const a = ACTIVITIES[slot.activity];
  const tint = ACTIVITY_COLOR[slot.activity];
  return (
    <div className="row-icon-content-aside" style={{
      padding: '12px 14px',
      background: isCurrent ? '#321C6B' : 'transparent',
      borderLeft: isCurrent ? `4px solid ${tint}` : `4px solid transparent`,
      ['--icon-w' as string]: '90px'
    }}>
      <div style={{ color: COLOR.text, fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
        {slot.clockStart}<br/>
        <span style={{ color: COLOR.subtle, fontSize: '11px' }}>{slot.clockEnd}</span>
      </div>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '18px' }}>{a.icon}</span>
          <span style={{ color: tint, fontFamily: 'Noto Sans Tamil, sans-serif', fontWeight: 700, fontSize: '15px' }}>
            {a.ta}
          </span>
          <span style={{ color: COLOR.subtle, fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>
            ({a.en})
          </span>
        </div>
        <div style={{ color: COLOR.muted, fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif', marginTop: '2px' }}>
          {a.toneTa}
        </div>
      </div>
      <div style={{
        background: COLOR.surface, color: tint,
        border: `1px solid ${tint}`, borderRadius: '999px',
        padding: '3px 10px', fontSize: '11px', fontWeight: 800,
        fontFamily: 'system-ui, sans-serif', whiteSpace: 'nowrap'
      }}>
        {a.score > 0 ? `+${a.score}` : a.score}
      </div>
    </div>
  );
}

export default function PanchaPakshiPage() {
  const now = useMemo(() => new Date(), []);
  const [nakIdx, setNakIdx] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved !== null && !Number.isNaN(Number(saved))) {
      setNakIdx(Number(saved));
    }
  }, []);

  const persistNak = (idx: number) => {
    setNakIdx(idx);
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, String(idx));
  };
  const clearNak = () => {
    setNakIdx(null);
    if (typeof window !== 'undefined') window.localStorage.removeItem(STORAGE_KEY);
  };

  const userBird = nakIdx !== null ? birdForNakshatraIdx(nakIdx) : null;
  const ruler = rulerBirdFor(now);
  const paksha = pakshaFor(now);
  const schedule: SlotResult[] | null = userBird ? daySchedule(userBird, now) : null;

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const currentSlotIdx = schedule
    ? schedule.findIndex(s => nowMinutes >= s.startMinutes && nowMinutes < s.endMinutes)
    : -1;

  const isoToday = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div>
          <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: COLOR.gold, fontSize: 'clamp(18px, 4vw, 24px)', marginBottom: '2px' }}>
            பஞ்ச பட்சி சாஸ்திரம்
          </h1>
          <div style={{ color: COLOR.muted, fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
            Pancha Pakshi Sastram — five birds mapped to your nakshatra
          </div>
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>உங்கள் பிறந்த நட்சத்திரம் — Your birth nakshatra</HeaderBand>
          <div style={{ padding: '14px' }}>
            <select
              value={nakIdx === null ? '' : String(nakIdx)}
              onChange={e => persistNak(Number(e.target.value))}
              style={{
                width: '100%', padding: '10px 12px',
                background: COLOR.surface, color: COLOR.text,
                border: `1px solid ${COLOR.border}`, borderRadius: '8px',
                fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '15px'
              }}
            >
              <option value="" disabled>— தேர்ந்தெடுக்கவும் / Select —</option>
              {NAKSHATRA.map((nak, i) => (
                <option key={i} value={i}>
                  {i + 1}. {nak}
                </option>
              ))}
            </select>
            {nakIdx !== null && (
              <button
                onClick={clearNak}
                style={{
                  marginTop: '8px', background: 'transparent', color: COLOR.subtle,
                  border: `1px solid ${COLOR.border}`, borderRadius: '6px',
                  padding: '6px 12px', cursor: 'pointer', fontSize: '12px',
                  fontFamily: 'Noto Sans Tamil, sans-serif'
                }}
              >
                அகற்று / Clear
              </button>
            )}
          </div>
        </div>

        {userBird && (
          <>
            <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <HeaderBand>உங்கள் பறவை — Your bird</HeaderBand>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: COLOR.divider }}>
                <div style={{ background: COLOR.card }}>
                  <BirdBadge bird={userBird} size="lg" />
                </div>
                <div style={{ background: COLOR.card, padding: '14px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
                  <div style={{ color: COLOR.muted, fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>நட்சத்திரங்கள்</div>
                  <div style={{ color: COLOR.text, fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '13px', lineHeight: 1.6 }}>
                    {nakshatrasForBird(userBird).join(', ')}
                  </div>
                </div>
              </div>
            </div>

            <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <HeaderBand>இன்று ({isoToday}) — Today</HeaderBand>
              <div style={{ padding: '12px 14px', display: 'flex', gap: '12px', justifyContent: 'space-between', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                  <div style={{ color: COLOR.subtle }}>பக்ஷம் / Paksha</div>
                  <div style={{ color: COLOR.gold, fontWeight: 700 }}>
                    {paksha === 'shukla' ? 'சுக்ல (வளர்பிறை)' : 'கிருஷ்ண (தேய்பிறை)'}
                  </div>
                </div>
                <div style={{ fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif', textAlign: 'right' }}>
                  <div style={{ color: COLOR.subtle }}>இன்றைய ஆதிக்கப் பறவை / Ruling bird</div>
                  <div style={{ color: COLOR.gold, fontWeight: 700 }}>
                    {birdInfo(ruler).icon} {birdInfo(ruler).ta}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: `1px solid ${COLOR.border}` }}>
                {schedule!.map((s, i) => (
                  <div key={s.index} style={{ borderTop: i === 0 ? 'none' : `1px solid ${COLOR.divider}` }}>
                    <SlotRow slot={s} isCurrent={i === currentSlotIdx} />
                  </div>
                ))}
              </div>
              <div style={{ padding: '10px 14px', borderTop: `1px solid ${COLOR.border}`, color: COLOR.subtle, fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                * பகல் நேரம் (06:00 - 18:00) ஐந்து சம பகுதிகளாகப் பிரிக்கப்பட்டுள்ளது. சரியான சூரியோதய நேரம் பயன்படுத்த உண்மையான ஜோதிடரிடம் ஆலோசிக்கவும்.
              </div>
            </div>

            <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
              <HeaderBand>நட்பு / எதிரி பறவைகள் — Friends &amp; enemies</HeaderBand>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1px', background: COLOR.divider }}>
                <div style={{ background: COLOR.card, padding: '12px', textAlign: 'center' }}>
                  <div style={{ color: COLOR.green, fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                    🤝 நட்பு / Friends
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {friendsOf(userBird).map(b => (
                      <div key={b} style={{ background: COLOR.surface, borderRadius: '8px', minWidth: '70px' }}>
                        <BirdBadge bird={b} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: COLOR.card, padding: '12px', textAlign: 'center' }}>
                  <div style={{ color: COLOR.red, fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '12px', fontWeight: 700, marginBottom: '8px' }}>
                    ⚔️ எதிரி / Enemies
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', flexWrap: 'wrap' }}>
                    {enemiesOf(userBird).map(b => (
                      <div key={b} style={{ background: COLOR.surface, borderRadius: '8px', minWidth: '70px' }}>
                        <BirdBadge bird={b} size="sm" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>ஐந்து பறவைகள் — All five birds</HeaderBand>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))', gap: '1px', background: COLOR.divider }}>
            {BIRDS.map(b => {
              const rel = userBird ? relationship(userBird, b.key) : null;
              const tint = rel === 'self' ? COLOR.gold
                         : rel === 'friend' ? COLOR.green
                         : rel === 'enemy' ? COLOR.red
                         : COLOR.subtle;
              return (
                <div
                  key={b.key}
                  onClick={() => persistNak(NAKSHATRA.findIndex((_, i) => birdForNakshatraIdx(i) === b.key))}
                  style={{
                    background: COLOR.card,
                    cursor: 'pointer',
                    borderTop: rel === 'self' ? `2px solid ${COLOR.gold}` : '2px solid transparent',
                    padding: '10px 6px', textAlign: 'center', position: 'relative'
                  }}
                >
                  <div style={{ fontSize: '28px', lineHeight: 1 }}>{b.icon}</div>
                  <div style={{ color: tint, fontFamily: 'Noto Sans Tamil, sans-serif', fontWeight: 700, fontSize: '13px', marginTop: '4px' }}>
                    {b.ta}
                  </div>
                  <div style={{ color: COLOR.subtle, fontSize: '10px', fontFamily: 'system-ui, sans-serif' }}>
                    {b.elementEn}
                  </div>
                  {rel && rel !== 'self' && (
                    <div style={{
                      position: 'absolute', top: '4px', right: '4px',
                      fontSize: '10px', color: tint, fontFamily: 'Noto Sans Tamil, sans-serif'
                    }}>
                      {rel === 'friend' ? '🤝' : rel === 'enemy' ? '⚔️' : ''}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div style={{
          marginTop: '4px', padding: '12px 14px',
          background: COLOR.surface, border: `1px dashed ${COLOR.border}`,
          borderRadius: '8px',
          color: COLOR.subtle, fontSize: '11px',
          fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.5
        }}>
          குறிப்பு: பஞ்ச பட்சி நேர அட்டவணை ஒரு பொதுவான மாதிரியாக கணக்கிடப்பட்டுள்ளது (சூரியோதயம் 06:00 எனத் தோராயமாக). உண்மையான பஞ்ச பட்சி கணக்கீடு உள்ளூர் சூரியோதய நேரம், உண்மையான பக்ஷம், மற்றும் தனிப்பட்ட சம்பிரதாயங்களின் அடிப்படையில் வேறுபடலாம். முக்கியமான நிகழ்வுகளுக்கு பாரம்பரிய ஜோதிடரிடம் ஆலோசிக்கவும்.
          <br />
          <span style={{ fontFamily: 'system-ui, sans-serif' }}>
            Note: This Pancha Pakshi schedule is a generic heuristic (sunrise approximated as 06:00). Authentic Pancha Pakshi calculations use local sunrise, true paksha, and tradition-specific activity sequences. Consult a traditional astrologer for important events.
          </span>
        </div>
      </div>
    </div>
  );
}
