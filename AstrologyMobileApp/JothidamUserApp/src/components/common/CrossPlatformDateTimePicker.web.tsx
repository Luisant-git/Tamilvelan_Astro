import { useEffect, useRef } from 'react';
import type { ChangeEvent } from 'react';

interface Props {
  value: Date;
  mode?: 'date' | 'time' | 'datetime';
  display?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  onChange: (event: { type: 'set' | 'dismissed' }, selectedDate?: Date) => void;
}

const pad2 = (n: number) => String(n).padStart(2, '0');

function toInputValue(date: Date, isTime: boolean) {
  return isTime
    ? `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
    : `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

// @react-native-community/datetimepicker has no web implementation — its
// fallback for Platform.OS === 'web' renders null, which is why tapping the
// date field did nothing in browser/Expo-web. This shim swaps in a real
// HTML date/time input on web, picked up automatically by Metro's `.web`
// platform extension, so every screen using the native picker gets a
// working one on web without changing its own JSX.
export default function CrossPlatformDateTimePicker({ value, mode = 'date', minimumDate, maximumDate, onChange }: Props) {
  const isTime = mode === 'time';
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const el = inputRef.current;
    if (!el) return;
    const picker = el as HTMLInputElement & { showPicker?: () => void };
    if (typeof picker.showPicker === 'function') {
      try {
        picker.showPicker();
      } catch {
        el.focus();
      }
    } else {
      el.focus();
    }
  }, []);

  return (
    <input
      ref={inputRef}
      type={isTime ? 'time' : 'date'}
      defaultValue={toInputValue(value, isTime)}
      min={minimumDate ? toInputValue(minimumDate, isTime) : undefined}
      max={maximumDate ? toInputValue(maximumDate, isTime) : undefined}
      onChange={(event: ChangeEvent<HTMLInputElement>) => {
        const raw = event.target.value;
        if (!raw) return;
        let next: Date;
        if (isTime) {
          const [h, m] = raw.split(':').map(Number);
          next = new Date(value);
          next.setHours(h, m, 0, 0);
        } else {
          const [y, m, d] = raw.split('-').map(Number);
          next = new Date(y, m - 1, d);
        }
        onChange({ type: 'set' }, next);
      }}
      style={{
        background: '#0D0620',
        color: '#F5F0FF',
        border: '1px solid rgba(255,215,0,0.3)',
        borderRadius: 12,
        padding: '10px 12px',
        marginTop: 6,
        fontSize: 14,
        width: '100%',
        colorScheme: 'dark',
      }}
    />
  );
}
