'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import Logo from '@/components/Logo';
import DailyQuote from '@/components/DailyQuote';
import { nextHoliday, nextViratha } from '@/lib/muhurtham';

type Rasi = { num: number; name: string; symbol: string; en: string };

const RASI_LIST: Rasi[] = [
  { num: 1,  name: 'மேஷம்',     symbol: '♈', en: 'Mesham' },
  { num: 2,  name: 'ரிஷபம்',    symbol: '♉', en: 'Rishabam' },
  { num: 3,  name: 'மிதுனம்',   symbol: '♊', en: 'Midhunam' },
  { num: 4,  name: 'கடகம்',     symbol: '♋', en: 'Kadagam' },
  { num: 5,  name: 'சிம்மம்',   symbol: '♌', en: 'Simmam' },
  { num: 6,  name: 'கன்னி',     symbol: '♍', en: 'Kanni' },
  { num: 7,  name: 'துலாம்',    symbol: '♎', en: 'Thulam' },
  { num: 8,  name: 'விருச்சிகம்', symbol: '♏', en: 'Viruchigam' },
  { num: 9,  name: 'தனுசு',     symbol: '♐', en: 'Dhanusu' },
  { num: 10, name: 'மகரம்',     symbol: '♑', en: 'Magaram' },
  { num: 11, name: 'கும்பம்',   symbol: '♒', en: 'Kumbam' },
  { num: 12, name: 'மீனம்',     symbol: '♓', en: 'Meenam' }
];

type Tile = { icon: string; ta: string; en: string; href?: string; comingSoon?: boolean; bg: string };

// Matrimony tile hidden per explicit request — not deleted, just left out
// of this array for now (mirrors the same change in the mobile app's
// HomeScreen.tsx).
const QUICK_ACCESS: Tile[] = [
  { icon: '📅', ta: 'நாள் காட்டி',      en: 'Day Calendar',      href: '/panchang',       bg: '#FF6B6B' },
  { icon: '🗓',  ta: 'மாத காட்டி',       en: 'Month Calendar',    href: '/maatha-sirappu', bg: '#4CAF50' },
  { icon: '⭐', ta: 'ராசி பலன்கள்',     en: 'Rasi Predictions',  href: '/rasi-palan',     bg: '#2196F3' },
  { icon: '🌟', ta: 'முக்கிய தினங்கள்',  en: 'Important Days',    href: '/important-days', bg: '#03A9F4' },
  { icon: '🕉',  ta: 'ஆன்மிகம்',        en: 'Spiritual',         href: '/gowri',          bg: '#FF8C00' },
  { icon: '🔮', ta: 'ஜாதகம் கணிக்க',   en: 'Get Horoscope',     href: '/jathagam',       bg: '#FFD700' }
];

const CATEGORIES: Array<{ ta: string; en: string; icon: string; tiles: Tile[] }> = [
  {
    ta: 'ஜாதக சேவைகள்', en: 'Horoscope Services', icon: '⭐',
    tiles: [
      { icon: '⭐',  ta: 'உங்கள் ஜாதகம்',     en: 'Your Horoscope',  href: '/jathagam',  bg: '#FFD700' },
      { icon: '💍', ta: 'திருமண பொருத்தம்',   en: 'Marriage Match',  href: '/porutham',  bg: '#D4537E' }
      // ஜோதிட அறிக்கை/Astrology Report (/ariggai) and ஜோதிடர் ஆலோசனை/
      // Consultation (/aalosanai) tiles hidden per explicit request.
    ]
  },
  {
    ta: 'சிறப்பு தகவல்கள்', en: 'Special Info', icon: '✨',
    tiles: [
      { icon: '🌅', ta: 'இன்றைய சிறப்புகள்',  en: "Today's Highlights",    href: '/panchang',        bg: '#4CAF50' },
      { icon: '🌄', ta: 'நாளைய சிறப்புகள்',   en: "Tomorrow's Highlights", href: '/naalai-sirappu',  bg: '#03A9F4' },
      { icon: '📅', ta: 'மாத சிறப்புகள்',     en: "Monthly Highlights",    href: '/maatha-sirappu',  bg: '#FF8C00' },
      { icon: '💎', ta: 'சுபமுகூர்த்த தேர்வு', en: 'Muhurtham Finder',     href: '/muhurtham',       bg: '#E91E63' }
    ]
  },
  {
    ta: 'ஆன்மிக தகவல்கள்', en: 'Spiritual Info', icon: '🕉',
    tiles: [
      { icon: '📜', ta: 'இன்றைய பஞ்சாங்கம்',          en: 'Today Panchang',           href: '/panchang',     bg: '#FFD700' },
      { icon: '⛔', ta: 'இராகு, குளிகை, எமகண்டம்',    en: 'Rahu/Yamagandam',          href: '/panchang',     bg: '#FF6B6B' },
      { icon: '🪔', ta: 'கௌரி பஞ்சாங்கம்',             en: 'Gowri Panchangam',         href: '/gowri',        bg: '#4CAF50' },
      { icon: '🌞', ta: 'கிரக ஓரைகளின் காலம்',        en: 'Planetary Hora',           href: '/hora',         bg: '#FF8C00' },
      { icon: '🚫', ta: 'கரி நாட்கள், அஷ்டமி, நவமி',  en: 'Karinaal / Ashtami / Navami', href: '/karinaal',  bg: '#8B6914' },
      { icon: '🏠', ta: 'வாஸ்து தகவல்கள்',             en: 'Vasthu Information',       href: '/vasthu',       bg: '#FF5722' },
      { icon: '🦚', ta: 'பஞ்ச பட்சி சாஸ்திரம்',        en: 'Pancha Pakshi Sastram',    href: '/pancha-pakshi', bg: '#2196F3' },
      { icon: '🔍', ta: 'ஜோதிட தேடல்',                 en: 'Jothida Search',           href: '/jathagam',     bg: '#FFD700' },
      { icon: '🔢', ta: 'எண் கணிதம்',                  en: 'Numerology',               href: '/numerology',   bg: '#E91E63' },
      { icon: '📖', ta: 'கதைகள் / கட்டுரைகள்',         en: 'Stories / Articles',       href: '/kathaikal',    bg: '#9C27B0' },
      { icon: '❓', ta: 'ஜோதிடர் பதில்',                en: 'Ask Astrologer',           href: '/aalosanai',    bg: '#673AB7' },
      { icon: '❤️', ta: 'காதல் பொருத்தம்',              en: 'Love Match',               href: '/kadhal',       bg: '#FF4081' }
    ]
  }
];

function todayLong() {
  const d = new Date();
  return d.toLocaleDateString('en-IN', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' });
}
function todayTamilLong() {
  const d = new Date();
  const weekdays = ['ஞாயிறு', 'திங்கள்', 'செவ்வாய்', 'புதன்', 'வியாழன்', 'வெள்ளி', 'சனி'];
  return `${weekdays[d.getDay()]}, ${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
}

function ServiceTile({ t }: { t: Tile }) {
  const onClick = (e: React.MouseEvent) => {
    if (t.comingSoon) {
      e.preventDefault();
      toast(`${t.ta} — விரைவில் / Coming soon`, { icon: '⏳' });
    }
  };

  const inner = (
    <div style={{
      background: '#251450',
      padding: '14px 10px',
      display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
      gap: '8px', height: '100%', minHeight: '128px',
      transition: 'background 0.15s, transform 0.15s',
      cursor: 'pointer', position: 'relative'
    }}
    onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#32205A'; }}
    onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = '#251450'; }}
    >
      <div style={{
        width: '44px', height: '44px', borderRadius: '10px',
        background: t.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '22px', color: 'white',
        boxShadow: `0 2px 8px ${t.bg}50`
      }}>
        {t.icon}
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', width: '100%' }}>
        <div style={{ fontFamily: 'Noto Sans Tamil, sans-serif', color: '#FFD700', fontSize: '12px', fontWeight: 600, lineHeight: 1.25 }}>
          {t.ta}
        </div>
        <div style={{ fontFamily: 'system-ui, sans-serif', color: '#8B7BAA', fontSize: '10px', marginTop: '2px' }}>
          {t.en}
        </div>
      </div>
      {t.comingSoon && (
        <span style={{
          position: 'absolute', top: '6px', right: '6px',
          background: '#FF8C00', color: 'white',
          padding: '1px 6px', borderRadius: '999px',
          fontSize: '8px', fontWeight: 600, letterSpacing: '0.3px'
        }}>SOON</span>
      )}
    </div>
  );

  return t.href ? (
    <Link href={t.href} onClick={onClick} style={{ textDecoration: 'none', display: 'block' }}>
      {inner}
    </Link>
  ) : (
    <div onClick={onClick}>{inner}</div>
  );
}

function CategorySection({ ta, en, icon, tiles }: { ta: string; en: string; icon: string; tiles: Tile[] }) {
  return (
    <section style={{ marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px', paddingLeft: '4px' }}>
        <span style={{ fontSize: '22px' }}>{icon}</span>
        <div>
          <div style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '18px', fontWeight: 600, lineHeight: 1.1 }}>
            {ta}
          </div>
          <div style={{ fontFamily: 'system-ui, sans-serif', color: '#8B7BAA', fontSize: '11px' }}>
            {en}
          </div>
        </div>
      </div>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '1px',
        background: '#4B2A8F', border: '1px solid #4B2A8F',
        borderRadius: '14px', overflow: 'hidden'
      }}>
        {tiles.map((t, i) => <ServiceTile key={i} t={t} />)}
      </div>
    </section>
  );
}

// ============ Next-festival banner ============

function NextFestivalBanner() {
  const [info, setInfo] = useState<{ isoDate: string; ta: string; en: string; daysAway: number } | null>(null);
  useEffect(() => { setInfo(nextHoliday(new Date())); }, []);
  if (!info) return null;
  return (
    <div style={{
      background: 'linear-gradient(90deg, #321C6B 0%, #1A0E3A 100%)',
      borderBottom: '1px solid #4B2A8F',
      padding: '8px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      gap: '10px', flexWrap: 'wrap',
      fontFamily: 'Noto Sans Tamil, sans-serif'
    }}>
      <span style={{ fontSize: '18px' }}>🎉</span>
      <span style={{ color: '#FFD700', fontSize: '13px', fontWeight: 600 }}>
        அடுத்த பண்டிகை: {info.ta}
      </span>
      <span style={{ color: '#A89BC8', fontSize: '12px' }}>
        — {info.daysAway === 0 ? 'இன்று / today' : `${info.daysAway} நாட்கள் / days`}
      </span>
      <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>
        ({info.en})
      </span>
    </div>
  );
}

// ============ Today widget ============

type Panchang = {
  rahuKalam: string;
  yamagandam: string;
  nallaNeram: { morning: string; evening: string };
  specialDay: string;
};

function TodayWidget() {
  const [data, setData] = useState<Panchang | null>(null);
  const [viratha, setViratha] = useState<{ name: string; daysAway: number } | null>(null);

  useEffect(() => {
    api.get('/panchang/today').then(r => setData(r.data)).catch(() => {});
    const v = nextViratha(new Date());
    if (v) setViratha({ name: v.name, daysAway: v.daysAway });
  }, []);

  return (
    <section className="max-w-5xl mx-auto px-4 pt-4">
      <div style={{
        background: '#251450', border: '1px solid #4B2A8F',
        borderRadius: '14px', overflow: 'hidden'
      }}>
        <div style={{
          background: 'linear-gradient(180deg, #321C6B 0%, #251450 100%)',
          padding: '8px 14px', borderBottom: '1px solid #4B2A8F',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
          fontFamily: 'Noto Sans Tamil, sans-serif'
        }}>
          <span style={{ color: '#FFD700', fontSize: '14px', fontWeight: 600 }}>இன்றைய பார்வை — Today at a glance</span>
          <Link href="/panchang" style={{ color: '#FF8C00', fontSize: '11px', textDecoration: 'none' }}>
            முழு பஞ்சாங்கம் →
          </Link>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: '1px', background: '#32205A'
        }}>
          <Cell label="நல்ல நேரம் காலை" value={data?.nallaNeram.morning || '—'} accent="#4CAF50" />
          <Cell label="நல்ல நேரம் மாலை" value={data?.nallaNeram.evening || '—'} accent="#4CAF50" />
          <Cell label="ராகு காலம்"     value={data?.rahuKalam || '—'} accent="#FF6B6B" />
          <Cell label="யமகண்டம்"       value={data?.yamagandam || '—'} accent="#FF6B6B" />
          <Cell
            label="அடுத்த விரதம்"
            value={viratha ? `${viratha.name} · ${viratha.daysAway === 0 ? 'இன்று' : `${viratha.daysAway} நாட்கள்`}` : '—'}
            accent="#FFD700"
            wide
          />
        </div>
        {data?.specialDay && (
          <div style={{
            padding: '8px 14px', background: '#1A0E3A',
            color: '#FF8C00', fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif',
            textAlign: 'center', borderTop: '1px solid #32205A'
          }}>
            🌟 {data.specialDay}
          </div>
        )}
      </div>
    </section>
  );
}

function Cell({ label, value, accent, wide }: { label: string; value: string; accent: string; wide?: boolean }) {
  return (
    <div style={{
      background: '#251450', padding: '10px 14px',
      gridColumn: wide ? '1 / -1' : undefined
    }}>
      <div style={{ color: '#A89BC8', fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>{label}</div>
      <div style={{ color: accent, fontSize: '14px', fontWeight: 600, fontFamily: 'system-ui, sans-serif', marginTop: '2px' }}>
        {value}
      </div>
    </div>
  );
}

// ============ Rasi Accordion (with save-my-rasi) ============

const MY_RASI_KEY = 'jothidam_my_rasi';

function RasiAccordion() {
  const [open, setOpen] = useState(false);
  const [selectedRasi, setSelectedRasi] = useState<Rasi | null>(null);
  const [myRasiNum, setMyRasiNum] = useState<number | null>(null);
  const [prediction, setPrediction] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchPrediction = useMemo(() => async (r: Rasi) => {
    setSelectedRasi(r);
    setLoading(true);
    try {
      const res = await api.get(`/horoscope/daily/${r.num}`);
      setPrediction(res.data.prediction);
    } catch {
      setPrediction('இன்று உங்களுக்கு நல்ல நாள். தைரியமாக முன்னேறுங்கள்.');
    }
    setLoading(false);
  }, []);

  // On mount, auto-expand and auto-load if user saved a rasi previously.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(MY_RASI_KEY);
      if (!saved) return;
      const num = Number(saved);
      const r = RASI_LIST.find(x => x.num === num);
      if (r) {
        setMyRasiNum(num);
        setOpen(true);
        fetchPrediction(r);
      }
    } catch { /* localStorage may be unavailable in SSR or blocked */ }
  }, [fetchPrediction]);

  const saveMyRasi = (r: Rasi) => {
    try { localStorage.setItem(MY_RASI_KEY, String(r.num)); } catch {}
    setMyRasiNum(r.num);
    toast.success(`${r.symbol} ${r.name} — உங்கள் ராசியாக சேமிக்கப்பட்டது`);
  };
  const clearMyRasi = () => {
    try { localStorage.removeItem(MY_RASI_KEY); } catch {}
    setMyRasiNum(null);
    toast('என் ராசி நீக்கப்பட்டது', { icon: '🗑' });
  };

  return (
    <div style={{
      background: '#251450', border: '1px solid #4B2A8F',
      borderRadius: '14px', overflow: 'hidden', marginBottom: '24px'
    }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: '100%', background: 'transparent', border: 'none',
          padding: '14px 18px', cursor: 'pointer',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
          color: '#FFD700', textAlign: 'left'
        }}
        aria-expanded={open}
      >
        <div>
          <div style={{ fontFamily: 'Noto Serif Tamil, serif', fontSize: '17px', fontWeight: 600 }}>
            ⭐ இன்றைய ராசி பலன்
          </div>
          <div style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>
            {myRasiNum
              ? `Today's prediction for your saved rasi — tap to ${open ? 'collapse' : 'expand'}`
              : `Today's Rasi Prediction — tap to ${open ? 'collapse' : 'expand'}`}
          </div>
        </div>
        <span style={{
          color: '#FF8C00', fontSize: '14px',
          transition: 'transform 0.2s',
          transform: open ? 'rotate(180deg)' : 'rotate(0deg)'
        }}>▼</span>
      </button>

      {open && (
        <div style={{ borderTop: '1px solid #4B2A8F', padding: '14px', animation: 'fade-in-up 0.25s ease-out both' }}>
          <div style={{
            display: 'flex', flexWrap: 'nowrap',
            gap: '8px', overflowX: 'auto', paddingBottom: '6px',
            scrollbarWidth: 'thin'
          }}>
            {RASI_LIST.map(r => {
              const isSelected = selectedRasi?.num === r.num;
              const isMine = myRasiNum === r.num;
              return (
                <button
                  key={r.num}
                  onClick={() => fetchPrediction(r)}
                  style={{
                    flex: '0 0 auto', minWidth: '80px', position: 'relative',
                    background: isSelected ? '#2A1A50' : '#1A0E3A',
                    border: `1px solid ${isSelected ? '#FFD700' : '#4B2A8F'}`,
                    borderRadius: '10px', padding: '8px 6px', cursor: 'pointer',
                    color: isSelected ? '#FFD700' : '#C4B5E0',
                    transition: 'all 0.15s', textAlign: 'center'
                  }}
                >
                  {isMine && (
                    <span style={{
                      position: 'absolute', top: '-6px', right: '-6px',
                      background: '#FF8C00', color: 'white',
                      width: '18px', height: '18px', borderRadius: '999px',
                      fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.4)'
                    }} title="என் ராசி">★</span>
                  )}
                  <div style={{ fontSize: '18px' }}>{r.symbol}</div>
                  <div style={{ fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '11px', fontWeight: 500, marginTop: '2px' }}>
                    {r.name}
                  </div>
                </button>
              );
            })}
          </div>

          {selectedRasi && (
            <div style={{
              marginTop: '12px',
              background: '#1A0E3A', border: '1px solid #FFD700',
              borderRadius: '12px', padding: '14px', textAlign: 'center',
              animation: 'fade-in-up 0.25s ease-out both'
            }}>
              <div style={{ color: '#FFD700', fontSize: '15px', fontWeight: 600 }}>
                {selectedRasi.symbol} {selectedRasi.name}
                <span style={{ color: '#8B7BAA', fontSize: '11px', fontFamily: 'system-ui, sans-serif', marginLeft: '6px' }}>
                  ({selectedRasi.en})
                </span>
              </div>
              <div style={{ marginTop: '8px' }}>
                {loading ? (
                  <div style={{ color: '#8B7BAA' }}>கணிக்கிறோம்...</div>
                ) : (
                  <p style={{ color: '#D4C5F0', fontSize: '13px', lineHeight: 1.7, fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {prediction}
                  </p>
                )}
              </div>
              <div style={{ marginTop: '12px' }}>
                {myRasiNum === selectedRasi.num ? (
                  <button
                    onClick={clearMyRasi}
                    style={{
                      background: 'transparent', border: '1px solid #4B2A8F',
                      color: '#8B7BAA', padding: '6px 14px', borderRadius: '999px',
                      cursor: 'pointer', fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif'
                    }}
                  >★ என் ராசி — Remove</button>
                ) : (
                  <button
                    onClick={() => saveMyRasi(selectedRasi)}
                    style={{
                      background: '#FFD700', border: 'none',
                      color: '#251450', padding: '6px 14px', borderRadius: '999px',
                      cursor: 'pointer', fontSize: '11px', fontWeight: 700, fontFamily: 'Noto Sans Tamil, sans-serif'
                    }}
                  >★ என் ராசியாக சேமி / Save as my rasi</button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============ Page ============

export default function HomePage() {
  return (
    <div>
      <NextFestivalBanner />
      <DailyQuote />

      <section style={{ background: 'linear-gradient(180deg, #251450 0%, #0D0620 100%)', padding: '32px 16px 28px' }}>
        <div className="max-w-5xl mx-auto" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          gap: '16px', flexWrap: 'wrap'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', minWidth: 0 }}>
            <Logo size={70} />
            <div>
              <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', fontSize: 'clamp(20px, 3.5vw, 32px)', color: '#FFD700', lineHeight: 1.2, margin: 0 }}>
                தமிழ்வேலன் / TamilVelan
              </h1>
              <p style={{ color: '#C4B5E0', fontSize: '12px', margin: '2px 0 0', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                தமிழ்நாட்டின் நம்பகமான தமிழ் நாட்காட்டி வலைதளம்
              </p>
              <p style={{ color: '#8B7BAA', fontSize: '11px', margin: '1px 0 0', fontFamily: 'system-ui, sans-serif' }}>
                TamilVelan Calendar
              </p>
            </div>
          </div>

          <Link
            href="/panchang"
            aria-label="நாள் காட்டி — Day Calendar"
            style={{
              background: '#1A0E3A', border: '1px solid #4B2A8F',
              borderRadius: '14px', padding: '10px 18px',
              textAlign: 'right', minWidth: '180px',
              textDecoration: 'none', display: 'block',
              transition: 'background 0.15s, border-color 0.15s, transform 0.15s'
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = '#251450';
              e.currentTarget.style.borderColor = '#FFD700';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = '#1A0E3A';
              e.currentTarget.style.borderColor = '#4B2A8F';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <div style={{ color: '#A89BC8', fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif', marginBottom: '2px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px' }}>
              <span>📅 இன்றைய தேதி</span>
              <span style={{ color: '#FF8C00', fontSize: '12px' }}>→</span>
            </div>
            <div style={{ color: '#FFD700', fontSize: '16px', fontWeight: 700, fontFamily: 'Noto Serif Tamil, serif', lineHeight: 1.25 }}>
              {todayTamilLong()}
            </div>
            <div style={{ color: '#8B7BAA', fontSize: '10px', marginTop: '2px', fontFamily: 'system-ui, sans-serif' }}>
              {todayLong()}
            </div>
          </Link>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-4 pt-6">
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '1px', background: '#4B2A8F', border: '1px solid #4B2A8F',
          borderRadius: '14px', overflow: 'hidden', marginBottom: '24px'
        }}>
          {QUICK_ACCESS.map((t, i) => <ServiceTile key={i} t={t} />)}
        </div>
      </section>

      <TodayWidget />

      <section className="max-w-5xl mx-auto px-4 pt-6">
        <RasiAccordion />
      </section>

      <section style={{ background: '#0D0620', padding: '8px 16px 24px' }}>
        <div className="max-w-5xl mx-auto">
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <h2 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '22px', marginBottom: '4px' }}>
              எங்கள் சேவைகள்
            </h2>
            <p style={{ color: '#8B7BAA', fontSize: '12px', fontFamily: 'system-ui, sans-serif' }}>
              Our Services — categorized
            </p>
          </div>
          {CATEGORIES.map(c => (
            <CategorySection key={c.ta} {...c} />
          ))}
        </div>
      </section>
    </div>
  );
}
