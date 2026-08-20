'use client';

import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { toTamilDate, TAMIL_WEEKDAYS } from '@/lib/tamilCalendar';
import { holidaysForMonth, weekdayTaForIso, type Holiday } from '@/lib/holidays';

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
  nallaNeram: { morning: string; evening: string };
  gowriNeram: { morning: string; evening: string };
  specialDay: string;
};

const PAKSHAM_BY_TITHI: Record<string, string> = {};
['பிரதமை','துவிதியை','திருதியை','சதுர்த்தி','பஞ்சமி','சஷ்டி','சப்தமி','அஷ்டமி','நவமி','தசமி','ஏகாதசி','துவாதசி','திரயோதசி','சதுர்தசி','பூர்ணிமை']
  .forEach(t => PAKSHAM_BY_TITHI[t] = 'வளர்பிறை');

const MONTHS_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];

const COLOR = {
  bg: '#0D0620',
  card: '#251450',
  surface: '#1A0E3A',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA',
  warning: '#FF6B6B',
  festival: '#4CAF50'
};

function toISO(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function HeaderBand({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #321C6B 0%, #251450 100%)',
      color: COLOR.gold,
      padding: '10px 14px',
      textAlign: 'center',
      fontFamily: 'Noto Sans Tamil, sans-serif',
      fontWeight: 600,
      fontSize: '16px',
      borderBottom: `1px solid ${COLOR.border}`
    }}>
      {children}
    </div>
  );
}

function Card({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div style={{
      background: COLOR.card,
      border: `1px solid ${COLOR.border}`,
      borderRadius: '12px',
      overflow: 'hidden',
      ...style
    }}>
      {children}
    </div>
  );
}

function TimeTable({ rows }: { rows: Array<[string, string]> }) {
  return (
    <div>
      {rows.map(([label, value], i) => (
        <div key={label} style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '12px 18px',
          borderBottom: i < rows.length - 1 ? `1px dashed ${COLOR.divider}` : 'none',
          color: COLOR.text, fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '15px'
        }}>
          <span>{label}</span>
          <span style={{ fontFamily: 'system-ui, sans-serif', color: COLOR.gold }}>{value}</span>
        </div>
      ))}
    </div>
  );
}

function HolidayList({ items }: { items: Holiday[] }) {
  if (items.length === 0) {
    return <div style={{ padding: '14px', color: COLOR.subtle, textAlign: 'center', fontFamily: 'Noto Sans Tamil, sans-serif' }}>இல்லை</div>;
  }
  return (
    <div>
      {items.map((h, i) => {
        const [y, m, d] = h.isoDate.split('-').map(Number);
        const dd = String(d).padStart(2, '0');
        const mm = MONTHS_TA[m - 1];
        const wd = weekdayTaForIso(h.isoDate);
        const tagColor = h.kind === 'national' ? COLOR.warning
          : h.kind === 'tamilnadu' ? COLOR.festival
          : h.kind === 'international' ? '#4FC3F7'
          : COLOR.saffron;
        return (
          <div key={h.isoDate} className="row-icon-content-aside" style={{
            padding: '10px 14px',
            borderBottom: i < items.length - 1 ? `1px dashed ${COLOR.divider}` : 'none',
            fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.text, fontSize: '14px'
          }}>
            <div style={{ color: COLOR.gold, fontWeight: 700, fontSize: '13px' }}>
              <div>{mm} {dd}</div>
              <div style={{ color: COLOR.subtle, fontSize: '11px', fontWeight: 400 }}>{wd}</div>
            </div>
            <div>
              <div>{h.ta}</div>
              <div style={{ color: COLOR.subtle, fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>{h.en}</div>
            </div>
            <span style={{
              color: tagColor, fontSize: '10px', fontWeight: 600,
              border: `1px solid ${tagColor}`, padding: '2px 8px', borderRadius: '999px',
              fontFamily: 'system-ui, sans-serif', whiteSpace: 'nowrap'
            }}>
              {h.kind === 'national' ? 'NATL' : h.kind === 'tamilnadu' ? 'TN' : h.kind === 'international' ? 'INTL' : 'OPT'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function parseISODate(s: string | null): Date | null {
  if (!s) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export default function PanchangPage() {
  const searchParams = useSearchParams();
  const initialDate = parseISODate(searchParams?.get('date') ?? null) ?? new Date();
  const [date, setDate] = useState<Date>(initialDate);
  const [data, setData] = useState<Panchang | null>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api.get('/panchang/today', { params: { date: toISO(date) } })
      .then(r => setData(r.data))
      .catch(() => setData(null));
  }, [date]);

  const tamil = toTamilDate(date);
  const dow = date.getDay();
  const monthHolidays = holidaysForMonth(date.getFullYear(), date.getMonth());

  const shift = (days: number) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    setDate(d);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Date header */}
        <Card style={{ background: 'linear-gradient(180deg, #321C6B 0%, #1A0E3A 100%)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px' }}>
            <button onClick={() => shift(-1)} aria-label="previous" style={{ background: 'transparent', border: 'none', color: COLOR.gold, cursor: 'pointer', padding: '4px' }}>
              <ChevronLeft size={28} />
            </button>
            <button
              onClick={() => {
                // showPicker() can throw (e.g. no user-activation in some
                // automation/edge-case contexts) — `??` only covers a nullish
                // return, not a thrown error, so a real try/catch is needed
                // to still fall back to focus() in that case.
                try {
                  dateInputRef.current?.showPicker?.();
                } catch {
                  dateInputRef.current?.focus();
                }
              }}
              aria-label="select date"
              style={{ textAlign: 'center', flex: 1, color: COLOR.text, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, position: 'relative' }}
            >
              <div style={{ fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.muted }}>
                {MONTHS_TA[date.getMonth()]} - {TAMIL_WEEKDAYS[dow].replace('கிழமை', '')}
              </div>
              <div style={{
                fontSize: '28px', fontWeight: 700, letterSpacing: '0.5px', fontFamily: 'system-ui, sans-serif', marginTop: '2px', color: COLOR.gold,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
              }}>
                {String(date.getDate()).padStart(2, '0')}-{String(date.getMonth() + 1).padStart(2, '0')}-{date.getFullYear()}
                <ChevronDown size={16} />
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.muted, marginTop: '6px' }}>
                {tamil.monthName} மாதம் - வசந்த ருது - உத்தராயணம்
              </div>
              <div style={{ fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.muted }}>
                பராபவ - {tamil.monthName} - {tamil.day}
              </div>
              <input
                ref={dateInputRef}
                type="date"
                value={toISO(date)}
                onChange={e => {
                  const d = parseISODate(e.target.value);
                  if (d) setDate(d);
                }}
                style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
                tabIndex={-1}
                aria-hidden="true"
              />
            </button>
            <button onClick={() => shift(1)} aria-label="next" style={{ background: 'transparent', border: 'none', color: COLOR.gold, cursor: 'pointer', padding: '4px' }}>
              <ChevronRight size={28} />
            </button>
          </div>
        </Card>

        {/* Tithi card */}
        <Card>
          <HeaderBand>{data?.tithi || '—'}</HeaderBand>
          <div style={{ display: 'flex', justifyContent: 'space-around', alignItems: 'center', padding: '14px 16px', fontSize: '28px' }}>
            <span>🪔</span>
            <span>🌙</span>
            <span style={{ color: COLOR.saffron }}>⬆</span>
          </div>
          {data?.specialDay && (
            <div style={{ borderTop: `1px dashed ${COLOR.divider}`, padding: '12px 16px', textAlign: 'center', color: COLOR.text, fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '15px' }}>
              {data.specialDay}
            </div>
          )}
        </Card>

        {/* How is today */}
        <Card>
          <HeaderBand>இன்றைய நாள் எப்படி உள்ளது?</HeaderBand>
        </Card>

        {/* Nalla Neram */}
        <Card>
          <HeaderBand>நல்ல நேரம்</HeaderBand>
          {data && (
            <TimeTable rows={[
              ['காலை', data.nallaNeram.morning],
              ['மாலை', data.nallaNeram.evening]
            ]} />
          )}
        </Card>

        {/* Gowri Nalla Neram */}
        <Card>
          <HeaderBand>கௌரி நல்ல நேரம்</HeaderBand>
          {data && (
            <TimeTable rows={[
              ['காலை', data.gowriNeram.morning],
              ['மாலை', data.gowriNeram.evening]
            ]} />
          )}
        </Card>

        {/* Panchangam 2x2 grid */}
        <Card>
          <HeaderBand>பஞ்சாங்கம்</HeaderBand>
          {data && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <PanchangCell title="சூரிய உதயம்" value={data.sunrise} />
              <PanchangCell title="கரணன்" value={data.karana} borderLeft />
              <PanchangCell title="திதி" value={`இன்று மாலை 04.38 வரை ${data.tithi} பின்பு`} borderTop multiline />
              <PanchangCell title="நட்சத்திரம்" value={`இன்று காலை 11.13 வரை ${data.nakshatra}`} borderTop borderLeft multiline />
            </div>
          )}
        </Card>

        {/* Avoid times */}
        <Card>
          <HeaderBand>தவிர்க்க வேண்டிய நேரங்கள்</HeaderBand>
          {data && (
            <TimeTable rows={[
              ['ராகு காலம்', data.rahuKalam],
              ['யமகண்டம்', data.yamagandam]
            ]} />
          )}
        </Card>

        {/* Government holiday days — current month only */}
        <Card>
          <HeaderBand>அரசு விடுமுறை நாட்கள் — {MONTHS_TA[date.getMonth()]} {date.getFullYear()}</HeaderBand>
          <HolidayList items={monthHolidays} />
        </Card>

        {!data && <div style={{ color: COLOR.subtle, textAlign: 'center', padding: '20px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>ஏற்றுகிறோம்...</div>}
      </div>
    </div>
  );
}

function PanchangCell({ title, value, borderTop, borderLeft, multiline }:
  { title: string; value: string; borderTop?: boolean; borderLeft?: boolean; multiline?: boolean }) {
  return (
    <div style={{
      padding: '12px 14px',
      borderTop: borderTop ? `1px solid ${COLOR.divider}` : undefined,
      borderLeft: borderLeft ? `1px solid ${COLOR.divider}` : undefined,
      textAlign: 'center'
    }}>
      <div style={{ color: COLOR.saffron, fontWeight: 600, fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '15px', marginBottom: '6px' }}>
        {title}
      </div>
      <div style={{ color: COLOR.text, fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: multiline ? '13px' : '15px', lineHeight: 1.4 }}>
        {value}
      </div>
    </div>
  );
}
