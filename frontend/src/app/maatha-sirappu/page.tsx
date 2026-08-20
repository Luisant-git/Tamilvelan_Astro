'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';
import api from '@/lib/api';
import { toTamilDate, tamilMonthRangeForGregorian, TAMIL_WEEKDAYS_SHORT } from '@/lib/tamilCalendar';
import { weekdayTaForIso, holidaysForMonth, type Holiday } from '@/lib/holidays';
import MonthYearPicker from '@/components/MonthYearPicker';

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
  warning: '#FF6B6B',
  festival: '#4CAF50',
  sundayRed: '#FF6B6B',
  todayBg: '#7C1A1A'
};

type DayMarker = { icon?: string };

function getMarker(date: Date): DayMarker {
  const day = date.getDate();
  const month = date.getMonth();
  const tithi = (day - 1) % 30;
  if (tithi === 14) return { icon: '○' };
  if (tithi === 29) return { icon: '●' };
  if (tithi === 5 || tithi === 20) return { icon: '🛕' };
  if (tithi === 10 || tithi === 25) return { icon: '🪔' };
  if (tithi === 12 || tithi === 27) return { icon: '🐂' };
  if (day % 7 === 0 && month === 4) return { icon: '🐄' };
  return {};
}

const VIRATHA_LIST: Array<[string, string, string]> = [
  ['●', 'அமாவாசை',         '16 சனி'],
  ['○', 'பௌர்ணமி',         '1 வெள்ளி, 31 ஞாயிறு'],
  ['⭐', 'கிருத்திகை',       '16 சனி'],
  ['🛕', 'திருவோணம்',       '9 சனி'],
  ['🪔', 'ஏகாதசி',          '13 புதன், 27 புதன்'],
  ['🌸', 'சஷ்டி',           '7 வியாழன், 22 வெள்ளி'],
  ['🙏', 'சங்கடஹர சதுர்த்தி', '5 செவ்வாய்'],
  ['🕉', 'சிவராத்திரி',      '15 வெள்ளி'],
  ['🐂', 'பிரதோஷம்',        '14 வியாழன், 28 வியாழன்'],
  ['🪷', 'சதுர்த்தி',        '20 புதன்']
];

type Panchang = {
  tithi: string;
  nakshatra: string;
  karana: string;
  rahuKalam: string;
  yamagandam: string;
  sunrise: string;
  nallaNeram: { morning: string; evening: string };
  gowriNeram: { morning: string; evening: string };
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

function Card({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
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

function HolidayList({ items }: { items: Holiday[] }) {
  if (items.length === 0) {
    return <div style={{ padding: '14px', color: COLOR.subtle, textAlign: 'center', fontFamily: 'Noto Sans Tamil, sans-serif' }}>இல்லை</div>;
  }
  return (
    <div>
      {items.map((h, i) => {
        const [, m, d] = h.isoDate.split('-').map(Number);
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

export default function MonthCalendarPage() {
  const [cursor, setCursor] = useState<Date>(new Date());
  const [today] = useState<Date>(new Date());
  const [todayPanchang, setTodayPanchang] = useState<Panchang | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  useEffect(() => {
    api.get('/panchang/today', { params: { date: toISO(today) } })
      .then(r => setTodayPanchang(r.data))
      .catch(() => setTodayPanchang(null));
  }, [today]);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  const firstOfMonth = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = firstOfMonth.getDay();

  const cells: Array<{ date: Date; inMonth: boolean }> = [];
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({ date: d, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ date: new Date(year, month, d), inMonth: true });
  }
  while (cells.length % 7 !== 0 || cells.length < 42) {
    const last = cells[cells.length - 1].date;
    const next = new Date(last);
    next.setDate(next.getDate() + 1);
    cells.push({ date: next, inMonth: false });
    if (cells.length >= 42) break;
  }

  const shiftMonth = (delta: number) => {
    const d = new Date(cursor);
    d.setDate(1);
    d.setMonth(d.getMonth() + delta);
    setCursor(d);
  };

  const handleSelectMonthYear = (selectedYear: number, selectedMonth: number) => {
    setCursor(new Date(selectedYear, selectedMonth, 1));
    setPickerOpen(false);
  };

  const tamilRange = tamilMonthRangeForGregorian(year, month);
  const monthHolidays = holidaysForMonth(year, month);

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>

        {/* Month header */}
        <div style={{
          background: 'linear-gradient(180deg, #321C6B 0%, #1A0E3A 100%)',
          border: `1px solid ${COLOR.border}`,
          borderRadius: '12px',
          padding: '10px 12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <button onClick={() => shiftMonth(-1)} aria-label="previous" style={{ background: 'transparent', border: 'none', color: COLOR.gold, cursor: 'pointer' }}>
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={() => setPickerOpen(true)}
            aria-label="select month and year"
            style={{ textAlign: 'center', flex: 1, background: 'transparent', border: 'none', cursor: 'pointer', padding: 0 }}
          >
            <div style={{
              fontSize: '20px', fontWeight: 600, fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.gold,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px'
            }}>
              {MONTHS_TA[month]} - {year}
              <ChevronDown size={16} />
            </div>
            <div style={{ fontSize: '15px', fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.muted, marginTop: '2px' }}>
              {tamilRange}
            </div>
          </button>
          <button onClick={() => shiftMonth(1)} aria-label="next" style={{ background: 'transparent', border: 'none', color: COLOR.gold, cursor: 'pointer' }}>
            <ChevronRight size={32} />
          </button>
        </div>

        {/* Calendar grid — each cell links to /panchang?date=YYYY-MM-DD */}
        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)', borderBottom: `1px solid ${COLOR.divider}` }}>
            {TAMIL_WEEKDAYS_SHORT.map((wd, i) => (
              <div key={wd} style={{
                textAlign: 'center', padding: '10px 0',
                color: i === 0 ? COLOR.sundayRed : COLOR.gold, fontWeight: 700,
                fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '16px',
                background: COLOR.surface
              }}>{wd}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7,1fr)' }}>
            {cells.map((c, idx) => {
              const tam = toTamilDate(c.date);
              const marker = c.inMonth ? getMarker(c.date) : {};
              const isToday = c.inMonth && isSameDay(c.date, today);
              const isSun = c.date.getDay() === 0;
              const cellBg = isToday ? COLOR.todayBg : COLOR.card;
              const cellFg = isToday ? COLOR.gold : (!c.inMonth ? '#5B4A7A' : (isSun ? COLOR.sundayRed : COLOR.text));
              const overlayFg = !c.inMonth ? '#3B2A5A' : (isToday ? COLOR.saffron : COLOR.muted);
              return (
                <Link
                  key={idx}
                  href={`/panchang?date=${toISO(c.date)}`}
                  aria-label={`${MONTHS_TA[c.date.getMonth()]} ${c.date.getDate()} ${c.date.getFullYear()}`}
                  style={{
                    position: 'relative', minHeight: '64px',
                    borderRight: (idx + 1) % 7 ? `1px solid ${COLOR.divider}` : 'none',
                    borderBottom: idx < 35 ? `1px solid ${COLOR.divider}` : 'none',
                    background: cellBg,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none', cursor: 'pointer',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => { if (!isToday) e.currentTarget.style.background = '#321C6B'; }}
                  onMouseLeave={e => { if (!isToday) e.currentTarget.style.background = cellBg; }}
                >
                  <div style={{
                    position: 'absolute', top: '4px', left: '6px',
                    fontSize: '11px', color: overlayFg, fontFamily: 'system-ui, sans-serif'
                  }}>{tam.day}</div>
                  <div style={{
                    fontSize: '20px', fontWeight: 700, color: cellFg,
                    fontFamily: 'system-ui, sans-serif'
                  }}>
                    {c.date.getDate()}
                  </div>
                  {marker.icon && (
                    <div style={{
                      position: 'absolute', bottom: '4px', right: '6px',
                      fontSize: '12px', color: isToday ? COLOR.gold : COLOR.muted
                    }}>{marker.icon}</div>
                  )}
                </Link>
              );
            })}
          </div>
          <div style={{
            padding: '8px 14px', borderTop: `1px solid ${COLOR.divider}`,
            background: COLOR.surface, color: COLOR.subtle,
            fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '11px', textAlign: 'center'
          }}>
            ஒரு தேதியைத் தேர்ந்தெடுக்க தட்டவும் — Tap a date for that day's panchang
          </div>
        </div>

        {/* Today's panchang sections */}
        <Card>
          <HeaderBand>{todayPanchang?.tithi || '—'}</HeaderBand>
          <div style={{ padding: '10px 14px', color: COLOR.subtle, fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '13px', textAlign: 'center', borderBottom: `1px dashed ${COLOR.divider}` }}>
            இன்றைய விவரங்கள் — {MONTHS_TA[today.getMonth()]} {today.getDate()}, {today.getFullYear()}
          </div>
        </Card>

        <Card>
          <HeaderBand>நல்ல நேரம்</HeaderBand>
          {todayPanchang && (
            <TimeTable rows={[
              ['காலை', todayPanchang.nallaNeram.morning],
              ['மாலை', todayPanchang.nallaNeram.evening]
            ]} />
          )}
        </Card>

        <Card>
          <HeaderBand>கௌரி நல்ல நேரம்</HeaderBand>
          {todayPanchang && (
            <TimeTable rows={[
              ['காலை', todayPanchang.gowriNeram.morning],
              ['மாலை', todayPanchang.gowriNeram.evening]
            ]} />
          )}
        </Card>

        <Card>
          <HeaderBand>பஞ்சாங்கம்</HeaderBand>
          {todayPanchang && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
              <PanchangCell title="சூரிய உதயம்" value={todayPanchang.sunrise} />
              <PanchangCell title="கரணன்" value={todayPanchang.karana} borderLeft />
              <PanchangCell title="திதி" value={`இன்று மாலை 04.38 வரை ${todayPanchang.tithi} பின்பு`} borderTop multiline />
              <PanchangCell title="நட்சத்திரம்" value={`இன்று காலை 11.13 வரை ${todayPanchang.nakshatra}`} borderTop borderLeft multiline />
            </div>
          )}
        </Card>

        <Card>
          <HeaderBand>தவிர்க்க வேண்டிய நேரங்கள்</HeaderBand>
          {todayPanchang && (
            <TimeTable rows={[
              ['ராகு காலம்', todayPanchang.rahuKalam],
              ['யமகண்டம்', todayPanchang.yamagandam]
            ]} />
          )}
        </Card>

        {/* விரத தினங்கள் */}
        <Card>
          <HeaderBand>விரத தினங்கள்</HeaderBand>
          {VIRATHA_LIST.map(([icon, name, when], i) => (
            <div key={name} className="row-icon-content-aside" style={{
              padding: '10px 14px',
              borderBottom: i < VIRATHA_LIST.length - 1 ? `1px dashed ${COLOR.divider}` : 'none',
              fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.text, fontSize: '15px',
              ['--icon-w' as string]: '44px'
            }}>
              <span style={{ fontSize: '20px' }}>{icon}</span>
              <span>{name}</span>
              <span style={{ textAlign: 'right', color: COLOR.gold }}>{when}</span>
            </div>
          ))}
        </Card>

        {/* Government holidays — this month */}
        <Card>
          <HeaderBand>அரசு விடுமுறை நாட்கள் — {MONTHS_TA[month]} {year}</HeaderBand>
          <HolidayList items={monthHolidays} />
        </Card>
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
