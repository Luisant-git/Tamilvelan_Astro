'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Calendar } from 'lucide-react';
import {
  findKarinaalDays,
  KARINAAL_LABELS,
  type KarinaalCategory,
  type KarinaalDay
} from '@/lib/muhurtham';
import { toTamilDate, tamilMonthRangeForGregorian } from '@/lib/tamilCalendar';
import MonthYearPicker from '@/components/MonthYearPicker';

const MONTHS_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];
const MONTHS_EN = ['January','February','March','April','May','June','July','August','September','October','November','December'];

const COLOR = {
  card: '#251450',
  surface: '#1A0E3A',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  red: '#FF6B6B',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA',
  festival: '#4CAF50'
};

const CATEGORY_TINT: Record<KarinaalCategory, string> = {
  ashtami:    '#FF8C00',
  navami:     '#FF6B6B',
  chaturdasi: '#C77DFF'
};

const FILTERS: Array<{ key: KarinaalCategory | 'all'; ta: string; en: string }> = [
  { key: 'all',        ta: 'அனைத்தும்', en: 'All' },
  { key: 'ashtami',    ta: 'அஷ்டமி',     en: 'Ashtami' },
  { key: 'navami',     ta: 'நவமி',       en: 'Navami' },
  { key: 'chaturdasi', ta: 'சதுர்தசி',   en: 'Chaturdasi' }
];

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

function KarinaalCard({ day }: { day: KarinaalDay }) {
  const [y, m, d] = day.isoDate.split('-').map(Number);
  const tint = CATEGORY_TINT[day.category];
  const labels = KARINAAL_LABELS[day.category];
  const tamil = toTamilDate(new Date(y, m - 1, d));

  return (
    <Link
      href={`/panchang?date=${day.isoDate}`}
      style={{
        display: 'block', textDecoration: 'none',
        background: COLOR.card, border: `1px solid ${COLOR.border}`,
        borderLeft: `4px solid ${tint}`,
        borderRadius: '12px', padding: '14px',
        transition: 'border-color 0.15s, background 0.15s'
      }}
      onMouseEnter={e => { e.currentTarget.style.background = '#321C6B'; }}
      onMouseLeave={e => { e.currentTarget.style.background = COLOR.card; }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '12px' }}>
        <div>
          <div style={{ color: COLOR.gold, fontSize: '20px', fontWeight: 700, fontFamily: 'Noto Serif Tamil, serif' }}>
            {String(d).padStart(2, '0')}-{String(m).padStart(2, '0')}-{y}
          </div>
          <div style={{ color: COLOR.muted, fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif', marginTop: '2px' }}>
            {MONTHS_TA[m - 1]} · {day.weekdayTa}
          </div>
        </div>
        <div style={{
          background: COLOR.surface, color: tint,
          border: `1px solid ${tint}`, borderRadius: '999px',
          padding: '4px 12px', fontSize: '12px', fontWeight: 700,
          fontFamily: 'Noto Sans Tamil, sans-serif', whiteSpace: 'nowrap'
        }}>
          {labels.ta}
        </div>
      </div>

      <div style={{
        marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px',
        fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '13px'
      }}>
        <div>
          <div style={{ color: COLOR.subtle, fontSize: '11px' }}>தமிழ் தேதி</div>
          <div style={{ color: COLOR.text }}>{tamil.monthName} {tamil.day}</div>
        </div>
        <div>
          <div style={{ color: COLOR.subtle, fontSize: '11px' }}>திதி</div>
          <div style={{ color: COLOR.text }}>{day.tithiName}</div>
        </div>
      </div>

      <div style={{
        marginTop: '10px', padding: '8px 10px',
        background: COLOR.surface, borderRadius: '6px',
        color: COLOR.muted, fontSize: '12px',
        fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.5
      }}>
        ⚠️ {labels.reasonTa}
      </div>

      {day.isHoliday && (
        <div style={{
          marginTop: '8px', padding: '6px 10px',
          background: COLOR.surface, borderRadius: '6px',
          color: COLOR.festival, fontSize: '12px',
          fontFamily: 'Noto Sans Tamil, sans-serif'
        }}>
          🎉 {day.isHoliday}
        </div>
      )}

      <div style={{ marginTop: '10px', color: COLOR.subtle, fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif', textAlign: 'right' }}>
        இந்த நாள் பஞ்சாங்கம் பார்க்க →
      </div>
    </Link>
  );
}

export default function KarinaalPage() {
  const now = useMemo(() => new Date(), []);
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [filter, setFilter] = useState<KarinaalCategory | 'all'>('all');
  const [pickerOpen, setPickerOpen] = useState(false);

  const days = useMemo(() => {
    const start = new Date(year, month, 1);
    const end = new Date(year, month + 1, 0);
    return findKarinaalDays({ startDate: start, endDate: end });
  }, [year, month]);

  const filtered = filter === 'all' ? days : days.filter(d => d.category === filter);

  const counts = useMemo(() => {
    const c: Record<KarinaalCategory, number> = { ashtami: 0, navami: 0, chaturdasi: 0 };
    days.forEach(d => { c[d.category]++; });
    return c;
  }, [days]);

  const tamilRange = tamilMonthRangeForGregorian(year, month);

  const prev = () => {
    if (month === 0) { setYear(year - 1); setMonth(11); }
    else setMonth(month - 1);
  };
  const next = () => {
    if (month === 11) { setYear(year + 1); setMonth(0); }
    else setMonth(month + 1);
  };
  const handleSelectMonthYear = (selectedYear: number, selectedMonth: number) => {
    setYear(selectedYear);
    setMonth(selectedMonth);
    setPickerOpen(false);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div>
          <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: COLOR.gold, fontSize: 'clamp(18px, 4vw, 24px)', marginBottom: '2px' }}>
            கரி நாட்கள்
          </h1>
          <div style={{ color: COLOR.muted, fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
            Inauspicious days — Ashtami, Navami, Chaturdasi tithis to avoid
          </div>
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', gap: '8px', padding: '10px 12px' }}>
            <button
              onClick={prev}
              aria-label="Previous month"
              style={{
                background: COLOR.surface, color: COLOR.gold,
                border: `1px solid ${COLOR.border}`, borderRadius: '8px',
                padding: '8px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 700
              }}
            >‹</button>
            <button
              onClick={() => setPickerOpen(true)}
              aria-label="select month and year"
              style={{ textAlign: 'center', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              <div style={{
                color: COLOR.gold, fontFamily: 'Noto Serif Tamil, serif', fontSize: '18px', fontWeight: 700,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                <Calendar size={16} />
                {MONTHS_TA[month]} {year}
                <span style={{ fontSize: '12px' }}>▾</span>
              </div>
              <div style={{ color: COLOR.subtle, fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {tamilRange} · {MONTHS_EN[month]}
              </div>
            </button>
            <button
              onClick={next}
              aria-label="Next month"
              style={{
                background: COLOR.surface, color: COLOR.gold,
                border: `1px solid ${COLOR.border}`, borderRadius: '8px',
                padding: '8px 14px', cursor: 'pointer', fontSize: '16px', fontWeight: 700
              }}
            >›</button>
          </div>
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>இந்த மாதம் — This month</HeaderBand>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', background: COLOR.divider }}>
            {(['ashtami','navami','chaturdasi'] as KarinaalCategory[]).map(cat => (
              <div key={cat} style={{ background: COLOR.card, padding: '12px 8px', textAlign: 'center' }}>
                <div style={{ color: CATEGORY_TINT[cat], fontSize: '24px', fontWeight: 800, fontFamily: 'system-ui, sans-serif' }}>
                  {counts[cat]}
                </div>
                <div style={{ color: COLOR.muted, fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif', marginTop: '2px' }}>
                  {KARINAAL_LABELS[cat].ta}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {FILTERS.map(f => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                style={{
                  background: active ? '#321C6B' : COLOR.card,
                  color: active ? COLOR.gold : COLOR.text,
                  border: `1px solid ${active ? COLOR.gold : COLOR.border}`,
                  borderRadius: '999px',
                  padding: '6px 14px',
                  cursor: 'pointer',
                  fontFamily: 'Noto Sans Tamil, sans-serif',
                  fontSize: '13px',
                  fontWeight: active ? 700 : 500,
                  transition: 'background 0.15s, color 0.15s'
                }}
              >
                {f.ta}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {filtered.length === 0 ? (
            <div style={{
              background: COLOR.card, border: `1px dashed ${COLOR.border}`,
              borderRadius: '12px', padding: '24px',
              textAlign: 'center', color: COLOR.muted,
              fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '14px'
            }}>
              இந்த மாதம் இந்த வகை கரி நாட்கள் இல்லை.
              <div style={{ fontSize: '12px', color: COLOR.subtle, marginTop: '4px', fontFamily: 'system-ui, sans-serif' }}>
                No karinaal days of this type this month.
              </div>
            </div>
          ) : (
            filtered.map(day => <KarinaalCard key={day.isoDate} day={day} />)
          )}
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <Link
            href="/muhurtham"
            style={{
              flex: '1 1 0', textDecoration: 'none', textAlign: 'center',
              background: COLOR.card, color: COLOR.gold,
              border: `1px solid ${COLOR.border}`, borderRadius: '10px',
              padding: '10px 14px',
              fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '13px', fontWeight: 600
            }}
          >
            ✨ சுப முகூர்த்த நாட்கள் →
          </Link>
          <Link
            href="/panchang"
            style={{
              flex: '1 1 0', textDecoration: 'none', textAlign: 'center',
              background: COLOR.card, color: COLOR.gold,
              border: `1px solid ${COLOR.border}`, borderRadius: '10px',
              padding: '10px 14px',
              fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '13px', fontWeight: 600
            }}
          >
            📅 இன்றைய பஞ்சாங்கம் →
          </Link>
        </div>

        <div style={{
          marginTop: '8px', padding: '12px 14px',
          background: COLOR.surface, border: `1px dashed ${COLOR.border}`,
          borderRadius: '8px',
          color: COLOR.subtle, fontSize: '11px',
          fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.5
        }}>
          குறிப்பு: கரிநாள் கணிப்பு பொதுவான பஞ்சாங்க விதிகளின் (அஷ்டமி, நவமி, சதுர்தசி திதிகள்) அடிப்படையில் தோராயமாக கணக்கிடப்படுகிறது. பாரம்பரிய தமிழ் கரிநாள் பட்டியல் தமிழ் மாதங்களின் சூரிய நிலையை அடிப்படையாகக் கொண்டது — இது வேறுபடலாம். முக்கிய நிகழ்வுகளுக்கு குலகுரு / பாரம்பரிய ஜோதிடரிடம் ஆலோசிக்கவும்.
          <br />
          <span style={{ fontFamily: 'system-ui, sans-serif' }}>
            Note: Karinaal estimation here is a heuristic based on lunar tithis (Ashtami, Navami, Chaturdasi). The traditional Tamil karinaal list is solar-month based and may differ. Consult a traditional astrologer for important events.
          </span>
        </div>
      </div>

      <MonthYearPicker
        open={pickerOpen}
        year={year}
        month={month}
        monthsTa={MONTHS_TA}
        onSelect={handleSelectMonthYear}
        onClose={() => setPickerOpen(false)}
      />
    </div>
  );
}
