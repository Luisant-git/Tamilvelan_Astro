'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

type Astrologer = {
  id: string;
  name: string;
  specialization: string;
  experienceYrs: number;
  ratePerHour: number;
  bio?: string | null;
  photoUrl?: string | null;
  available: boolean;
};

const TIME_SLOTS = [
  '09:00 - 10:00',
  '10:00 - 11:00',
  '11:00 - 12:00',
  '14:00 - 15:00',
  '15:00 - 16:00',
  '16:00 - 17:00',
  '17:00 - 18:00',
  '18:00 - 19:00'
];

function toISODate(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function BookingModal({ astrologer, onClose, onBooked }: {
  astrologer: Astrologer;
  onClose: () => void;
  onBooked: () => void;
}) {
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d;
  }, []);
  const maxDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d;
  }, []);

  const [date, setDate] = useState<string>(toISODate(tomorrow));
  const [slot, setSlot] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const onConfirm = async () => {
    if (!date || !slot) {
      toast.error('தேதி மற்றும் நேரம் தேர்ந்தெடுக்கவும்');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.post('/consultation/book', {
        astrologerId: astrologer.id,
        date,
        timeSlot: slot
      });
      toast.success(res.data.message || 'ஆலோசனை பதிவு வெற்றி');
      onBooked();
      onClose();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'பதிவு தோல்வி';
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

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
          background: '#251450', border: '1px solid #4B2A8F',
          borderRadius: '16px', padding: '24px',
          maxWidth: '480px', width: '100%',
          maxHeight: '90vh', overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '18px', fontWeight: 600 }}>
              {astrologer.name}
            </div>
            <div style={{ color: '#A89BC8', fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif', marginTop: '2px' }}>
              {astrologer.specialization} · ₹{astrologer.ratePerHour}/மணி
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: 'none', color: '#A89BC8',
              fontSize: '20px', cursor: 'pointer', lineHeight: 1
            }}
            aria-label="Close"
          >✕</button>
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ color: '#D4C5F0', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif', display: 'block', marginBottom: '6px' }}>
            தேதி தேர்வு
          </label>
          <input
            type="date"
            value={date}
            min={toISODate(tomorrow)}
            max={toISODate(maxDate)}
            onChange={e => setDate(e.target.value)}
            style={{
              width: '100%', padding: '10px 14px',
              border: '1px solid #4B2A8F', borderRadius: '10px',
              background: '#1A0E3A', color: 'white',
              fontSize: '14px', colorScheme: 'dark', outline: 'none'
            }}
          />
        </div>

        <div style={{ marginTop: '14px' }}>
          <label style={{ color: '#D4C5F0', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif', display: 'block', marginBottom: '6px' }}>
            நேர இடைவெளி
          </label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
            {TIME_SLOTS.map(s => {
              const active = slot === s;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSlot(s)}
                  style={{
                    padding: '8px 10px',
                    background: active ? '#2A1A50' : '#1A0E3A',
                    border: `1px solid ${active ? '#FFD700' : '#4B2A8F'}`,
                    color: active ? '#FFD700' : '#D4C5F0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontFamily: 'system-ui, sans-serif',
                    fontSize: '13px'
                  }}
                >
                  {s}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ marginTop: '20px', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button
            onClick={onClose}
            className="btn-outline"
            style={{ padding: '8px 16px', fontSize: '13px' }}
          >
            ரத்து
          </button>
          <button
            onClick={onConfirm}
            disabled={submitting || !slot}
            className="btn-gold"
            style={{ padding: '8px 16px', fontSize: '13px', opacity: submitting || !slot ? 0.6 : 1 }}
          >
            {submitting ? 'பதிகிறோம்...' : 'உறுதிப்படுத்து'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AstrologersList() {
  const { isLoggedIn } = useAuth();
  const router = useRouter();
  const [list, setList] = useState<Astrologer[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<Astrologer | null>(null);

  useEffect(() => {
    api
      .get('/consultation/astrologers')
      .then(r => setList(r.data))
      .catch(() => toast.error('ஜோதிடர் பட்டியல் ஏற்றவில்லை'))
      .finally(() => setLoading(false));
  }, []);

  const onClickBook = (a: Astrologer) => {
    if (!isLoggedIn) {
      toast('ஆலோசனை பதிவு செய்ய உள்நுழைய வேண்டும் / Please login to book', { icon: '🔒' });
      router.push('/login');
      return;
    }
    setActiveBooking(a);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '8px' }}>
        🔮 ஆலோசனை பதிவு
      </h1>
      <p style={{ color: '#8B7BAA', marginBottom: '24px' }}>
        அனுபவமிக்க ஜோதிடர்களிடம் நேரடி ஆலோசனை பெறுங்கள்
      </p>

      {loading ? (
        <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்...</div>
      ) : !list || list.length === 0 ? (
        <div style={{ background: '#251450', border: '1px solid #4B2A8F', borderRadius: '16px', padding: '20px', color: '#A89BC8' }}>
          தற்போது எந்த ஜோதிடரும் இணைப்பில் இல்லை. விரைவில் முயற்சி செய்யவும்.
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {list.map(a => (
            <div
              key={a.id}
              style={{
                background: '#251450', border: '1px solid #4B2A8F',
                borderRadius: '16px', padding: '20px',
                display: 'flex', flexDirection: 'column'
              }}
            >
              <div style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '16px', fontWeight: 600 }}>
                {a.name}
              </div>
              <div style={{ color: '#A89BC8', fontSize: '13px', marginTop: '4px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                {a.specialization} · {a.experienceYrs}+ ஆண்டுகள்
              </div>
              {a.bio && (
                <div style={{ color: '#C4B5E0', fontSize: '12px', marginTop: '10px', lineHeight: 1.5, flex: 1, fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                  {a.bio}
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
                <span style={{ color: '#FF8C00', fontSize: '16px', fontWeight: 700 }}>₹{a.ratePerHour}/மணி</span>
                <button
                  onClick={() => onClickBook(a)}
                  disabled={!a.available}
                  className="btn-gold"
                  style={{ padding: '6px 14px', fontSize: '13px' }}
                >
                  பதிவு செய்
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeBooking && (
        <BookingModal
          astrologer={activeBooking}
          onClose={() => setActiveBooking(null)}
          onBooked={() => { /* nothing — toast handled in modal */ }}
        />
      )}
    </div>
  );
}

export default function AalosanaiPage() {
  return <AstrologersList />;
}
