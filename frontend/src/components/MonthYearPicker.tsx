'use client';

import { useEffect, useState } from 'react';

const COLOR = {
  card: '#251450',
  surface: '#1A0E3A',
  border: '#4B2A8F',
  gold: '#FFD700'
};

type MonthYearPickerProps = {
  open: boolean;
  year: number;
  month: number; // 0-based
  monthsTa: string[];
  onSelect: (year: number, month: number) => void;
  onClose: () => void;
};

// Opened by clicking the "மாத - ஆண்டு" title in the calendar nav card, so
// users can jump straight to any month/year instead of clicking the prev/next
// arrows one step at a time. Matches the existing modal-overlay style used
// elsewhere on the site (e.g. aalosanai/page.tsx) — fixed dark overlay,
// centered card, click-outside to dismiss.
export default function MonthYearPicker({ open, year, month, monthsTa, onSelect, onClose }: MonthYearPickerProps) {
  const [pickerYear, setPickerYear] = useState(year);

  useEffect(() => {
    if (open) setPickerYear(year);
  }, [open, year]);

  if (!open) return null;

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(0,0,0,0.65)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: COLOR.card, border: `1px solid ${COLOR.border}`,
          borderRadius: '16px', padding: '18px',
          maxWidth: '360px', width: '100%'
        }}
      >
        {/* Year selector */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <button
            onClick={() => setPickerYear(y => y - 1)}
            aria-label="previous year"
            style={{
              background: COLOR.surface, border: `1px solid rgba(255,215,0,0.2)`,
              borderRadius: '10px', width: '40px', height: '40px',
              color: COLOR.gold, fontSize: '18px', cursor: 'pointer'
            }}
          >
            ‹
          </button>
          <div style={{ fontSize: '20px', fontWeight: 700, fontFamily: 'Noto Serif Tamil, serif', color: COLOR.gold }}>
            {pickerYear}
          </div>
          <button
            onClick={() => setPickerYear(y => y + 1)}
            aria-label="next year"
            style={{
              background: COLOR.surface, border: `1px solid rgba(255,215,0,0.2)`,
              borderRadius: '10px', width: '40px', height: '40px',
              color: COLOR.gold, fontSize: '18px', cursor: 'pointer'
            }}
          >
            ›
          </button>
        </div>

        {/* Month grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
          {monthsTa.map((mTa, idx) => {
            const selected = pickerYear === year && idx === month;
            return (
              <button
                key={mTa}
                onClick={() => onSelect(pickerYear, idx)}
                style={{
                  padding: '12px 4px',
                  borderRadius: '10px',
                  border: selected ? `1px solid ${COLOR.gold}` : '1px solid rgba(255,215,0,0.1)',
                  background: selected ? 'rgba(255,215,0,0.1)' : COLOR.surface,
                  color: selected ? COLOR.gold : '#F5F0FF',
                  fontWeight: selected ? 700 : 400,
                  fontFamily: 'Noto Sans Tamil, sans-serif',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                {mTa}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
