'use client';

import { useMemo, useState } from 'react';
import { Calendar } from 'lucide-react';
import { holidaysForMonth, type Holiday, type HolidayKind } from '@/lib/holidays';
import { findKarinaalDays, findGeneralMuhurthams, type KarinaalCategory, type KarinaalDay } from '@/lib/muhurtham';
import MonthYearPicker from '@/components/MonthYearPicker';

const MONTHS_TA = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];

const HOLIDAY_TAG_COLOR: Record<HolidayKind, string> = {
  national: '#FF6B6B',
  tamilnadu: '#4CAF50',
  international: '#4FC3F7',
  optional: '#FF8C00'
};

const HOLIDAY_TAG_LABEL: Record<HolidayKind, string> = {
  national: 'NATL',
  tamilnadu: 'TN',
  international: 'INTL',
  optional: 'OPT'
};

const COLOR = {
  card: '#251450',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA'
};

type Row = { day: string; ta: string; meta?: string };
type Section = { title: string; rows: Row[] };

// Suba Muhurtham & Other Days (Ashtami/Navami/Chaturdasi) are computed per
// month below (see computeSubaMuhurthamRows/computeOtherDaysRows) — they
// used to be a frozen May-2026 snapshot, which never matched the selected
// month. Same heuristic tithi math as the Muhurtham Finder / Karinaal screens.

const HINDU_FESTIVALS: Row[] = [
  { day: '1',  ta: 'சித்ரா பௌர்ணமி, புத்த பூர்ணிமா, ஸ்ரீ கள்ளழகர் வைகை எழுந்தருளல்' },
  { day: '4',  ta: 'அக்னி நட்சத்திரம் ஆரம்பம்' },
  { day: '11', ta: 'திருநாவுக்கரசு குருபூஜை' },
  { day: '28', ta: 'அக்னி நட்சத்திரம் நிவர்த்தி' },
  { day: '30', ta: 'வைகாசி விசாகம்' }
];

const MUSLIM_FESTIVALS: Row[] = [
  { day: '4',  ta: 'ஹாஜா பந்தே நவாஸ் உரூஸ்' },
  { day: '27', ta: 'அரபா மெக்காவுக்கு ஹஜ் யாத்திரை செய்த நாள்' },
  { day: '28', ta: 'பக்ரீத் பண்டிகை' }
];

const CHRISTIAN_FESTIVALS: Row[] = [
  { day: '3',  ta: 'ஹோலி கிராஸ் டே' },
  { day: '10', ta: 'ரொகேஷன் சன்டே' },
  { day: '14', ta: 'அஸன் தர்ஸ்டே' },
  { day: '24', ta: 'உவிட் சன்டே' },
  { day: '31', ta: 'திருத்துவ ஞாயிறு' }
];

const VIRATHA: Row[] = [
  { day: '●', ta: 'அமாவாசை',         meta: '16 சனி' },
  { day: '○', ta: 'பௌர்ணமி',         meta: '1 வெள்ளி, 31 ஞாயிறு' },
  { day: '⭐', ta: 'கிருத்திகை',       meta: '16 சனி' },
  { day: '🛕', ta: 'திருவோணம்',       meta: '9 சனி' },
  { day: '🪔', ta: 'ஏகாதசி',          meta: '13 புதன், 27 புதன்' },
  { day: '🌸', ta: 'சஷ்டி',           meta: '7 வியாழன், 22 வெள்ளி' },
  { day: '🙏', ta: 'சங்கடஹர சதுர்த்தி', meta: '5 செவ்வாய்' },
  { day: '🕉', ta: 'சிவராத்திரி',      meta: '15 வெள்ளி' },
  { day: '🐂', ta: 'பிரதோஷம்',        meta: '14 வியாழன், 28 வியாழன்' },
  { day: '🪷', ta: 'சதுர்த்தி',        meta: '20 புதன்' }
];

// Government Holidays (real, month/year-aware — see holidaysForMonth) is
// rendered separately, in the same position this list used to hold it, so
// the static reference sections keep their exact original order/spacing.
const STATIC_SECTIONS_BEFORE_HOLIDAYS: Section[] = [
  { title: 'இந்து பண்டிகைகள்',      rows: HINDU_FESTIVALS },
  { title: 'முஸ்லீம் பண்டிகைகள்',   rows: MUSLIM_FESTIVALS },
  { title: 'கிறிஸ்த்துவ பண்டிகைகள்', rows: CHRISTIAN_FESTIVALS }
];

const SECTIONS_AFTER_HOLIDAYS: Section[] = [
  { title: 'விரத தினங்கள்',         rows: VIRATHA }
];

function computeSubaMuhurthamRows(year: number, month: number): Row[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days = findGeneralMuhurthams({ startDate: start, endDate: end, limit: 6 });
  return days.map(d => {
    const dd = Number(d.isoDate.split('-')[2]);
    return {
      day: `${MONTHS_TA[month]} ${dd}`,
      ta: `${d.tithiName} - ${d.weekdayTa}`,
      meta: d.meta
    };
  });
}

const KARINAAL_ROW_LABEL: Record<KarinaalCategory, string> = {
  ashtami: 'அஷ்டமி',
  navami: 'நவமி',
  chaturdasi: 'சதுர்தசி'
};

function computeOtherDaysRows(year: number, month: number): Row[] {
  const start = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);
  const days = findKarinaalDays({ startDate: start, endDate: end });
  const byCategory: Record<KarinaalCategory, KarinaalDay[]> = { ashtami: [], navami: [], chaturdasi: [] };
  days.forEach(d => byCategory[d.category].push(d));
  return (['ashtami', 'navami', 'chaturdasi'] as KarinaalCategory[]).map(cat => {
    const list = byCategory[cat];
    return {
      day: KARINAAL_ROW_LABEL[cat],
      ta: list.length
        ? list.map(d => `${Number(d.isoDate.split('-')[2])} ${d.weekdayTa}`).join(', ')
        : 'இல்லை'
    };
  });
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

function HolidayList({ items }: { items: Holiday[] }) {
  if (items.length === 0) {
    return <div style={{ padding: '14px', color: COLOR.subtle, textAlign: 'center', fontFamily: 'Noto Sans Tamil, sans-serif' }}>இல்லை</div>;
  }
  return (
    <div>
      {items.map((h, i) => {
        const [, m, d] = h.isoDate.split('-').map(Number);
        const tagColor = HOLIDAY_TAG_COLOR[h.kind];
        return (
          <div key={h.isoDate} className="row-icon-content-aside" style={{
            padding: '10px 14px',
            borderBottom: i < items.length - 1 ? `1px dashed ${COLOR.divider}` : 'none',
            fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.text, fontSize: '14px'
          }}>
            <div style={{ color: COLOR.gold, fontWeight: 700, fontSize: '13px' }}>
              {MONTHS_TA[m - 1]} {String(d).padStart(2, '0')}
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
              {HOLIDAY_TAG_LABEL[h.kind]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default function ImportantDaysPage() {
  const [cursor, setCursor] = useState<Date>(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [pickerOpen, setPickerOpen] = useState(false);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const monthHolidays = useMemo(() => holidaysForMonth(year, month), [year, month]);
  const subaMuhurthamRows = useMemo(() => computeSubaMuhurthamRows(year, month), [year, month]);
  const otherDaysRows = useMemo(() => computeOtherDaysRows(year, month), [year, month]);

  const handleSelectMonthYear = (selectedYear: number, selectedMonth: number) => {
    setCursor(new Date(selectedYear, selectedMonth, 1));
    setPickerOpen(false);
  };

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <button
          onClick={() => setPickerOpen(true)}
          aria-label="select month and year"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            background: 'transparent', border: 'none', cursor: 'pointer',
            fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.muted, fontSize: '14px', marginTop: '4px'
          }}
        >
          <Calendar size={15} />
          {MONTHS_TA[month]} {year} — முக்கிய தினங்கள்
          <span style={{ fontSize: '11px' }}>▾</span>
        </button>

        {[
          { title: 'சுபமுகூர்த்த தினங்கள்', rows: subaMuhurthamRows },
          { title: 'மற்ற தினங்கள்', rows: otherDaysRows },
          ...STATIC_SECTIONS_BEFORE_HOLIDAYS
        ].map(section => (
          <div key={section.title} style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
            <HeaderBand>{section.title}</HeaderBand>
            {section.rows.map((row, i) => (
              <div key={i} className="row-icon-content-aside" style={{
                padding: '10px 14px',
                borderBottom: i < section.rows.length - 1 ? `1px dashed ${COLOR.divider}` : 'none',
                fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.text, fontSize: '15px',
                ['--icon-w' as string]: '56px'
              }}>
                <span style={{ fontWeight: 700, color: COLOR.gold }}>{row.day}</span>
                <span>{row.ta}</span>
                {row.meta && <span style={{ color: COLOR.saffron, fontSize: '14px' }}>{row.meta}</span>}
              </div>
            ))}
          </div>
        ))}

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>{`அரசு விடுமுறை நாட்கள் — ${MONTHS_TA[month]} ${year}`}</HeaderBand>
          <HolidayList items={monthHolidays} />
        </div>

        {SECTIONS_AFTER_HOLIDAYS.map(section => (
          <div key={section.title} style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
            <HeaderBand>{section.title}</HeaderBand>
            {section.rows.map((row, i) => (
              <div key={i} className="row-icon-content-aside" style={{
                padding: '10px 14px',
                borderBottom: i < section.rows.length - 1 ? `1px dashed ${COLOR.divider}` : 'none',
                fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.text, fontSize: '15px',
                ['--icon-w' as string]: '56px'
              }}>
                <span style={{ fontWeight: 700, color: COLOR.gold }}>{row.day}</span>
                <span>{row.ta}</span>
                {row.meta && <span style={{ color: COLOR.saffron, fontSize: '14px' }}>{row.meta}</span>}
              </div>
            ))}
          </div>
        ))}
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
