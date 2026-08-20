'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

type Profile = {
  id: string;
  fullName: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  isDefault: boolean;
  createdAt: string;
};

type Chart = {
  id: string;
  rasi: string;
  lagna: string;
  nakshatra: string;
  dashaLord: string;
  generatedAt: string;
  profile: { id: string; fullName: string; birthPlace: string; dob: string };
};

type Match = {
  id: string;
  brideName: string;
  groomName: string;
  totalScore: number;
  createdAt: string;
};

type Booking = {
  id: string;
  astrologerName: string;
  date: string;
  timeSlot: string;
  status: string;
  createdAt: string;
};

const cardStyle: React.CSSProperties = {
  background: '#251450',
  border: '1px solid #4B2A8F',
  borderRadius: '16px',
  padding: '20px',
  marginBottom: '20px'
};

const sectionTitle: React.CSSProperties = {
  fontFamily: 'Noto Serif Tamil, serif',
  color: '#FFD700',
  fontSize: '18px',
  marginBottom: '14px'
};

function formatDate(d?: string) {
  if (!d) return '—';
  try {
    return new Date(d).toLocaleDateString('ta-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return d;
  }
}

function AccountInner() {
  const { user, logout } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [charts, setCharts] = useState<Chart[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([
      api.get('/profile/list'),
      api.get('/horoscope/history'),
      api.get('/marriage/history'),
      api.get('/consultation/list').catch(() => ({ data: { bookings: [] } }))
    ])
      .then(([p, c, m, b]) => {
        setProfiles(p.data.profiles || []);
        setCharts(c.data.charts || []);
        setMatches(m.data.matches || []);
        setBookings(b.data.bookings || []);
      })
      .catch(() => toast.error('தரவு ஏற்றுவதில் பிழை'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const onDeleteProfile = async (id: string) => {
    if (!confirm('இந்த பிறப்பு விவரத்தை நீக்க வேண்டுமா?')) return;
    try {
      await api.delete(`/profile/${id}`);
      toast.success('நீக்கப்பட்டது');
      load();
    } catch {
      toast.error('நீக்க முடியவில்லை');
    }
  };

  const onSetDefault = async (id: string) => {
    try {
      await api.put(`/profile/${id}`, { isDefault: true });
      toast.success('முதன்மை சுயவிவரம் அமைக்கப்பட்டது');
      load();
    } catch {
      toast.error('முடியவில்லை');
    }
  };

  const statusColor = (s: string) =>
    s === 'CONFIRMED' ? '#4CAF50' : s === 'CANCELLED' ? '#FF6B6B' : '#FF8C00';
  const statusTa = (s: string) =>
    s === 'CONFIRMED' ? 'உறுதிசெய்யப்பட்டது' : s === 'CANCELLED' ? 'ரத்து செய்யப்பட்டது' : 'நிலுவையில்';

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '8px' }}>
        என் கணக்கு
      </h1>
      <p style={{ color: '#8B7BAA', marginBottom: '24px' }}>உங்கள் சுயவிவரம் மற்றும் வரலாறு</p>

      <div style={cardStyle}>
        <div style={sectionTitle}>சுயவிவரம்</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
          <div>
            <div style={{ color: '#8B7BAA', fontSize: '12px' }}>பெயர்</div>
            <div style={{ color: '#FFD700', fontSize: '14px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              {user?.name}
            </div>
          </div>
          <div>
            <div style={{ color: '#8B7BAA', fontSize: '12px' }}>மின்னஞ்சல்</div>
            <div style={{ color: '#FFD700', fontSize: '14px' }}>{user?.email}</div>
          </div>
          {user?.isAdmin && (
            <div>
              <div style={{ color: '#8B7BAA', fontSize: '12px' }}>பங்கு</div>
              <div style={{ color: '#FF8C00', fontSize: '14px' }}>நிர்வாகி</div>
            </div>
          )}
        </div>
        <div style={{ marginTop: '14px', display: 'flex', gap: '8px' }}>
          {user?.isAdmin && (
            <Link href="/admin" className="btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }}>
              நிர்வாக மேலாண்மை
            </Link>
          )}
          <button onClick={logout} className="btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }}>
            வெளியேறு
          </button>
        </div>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={sectionTitle}>📌 பிறப்பு விவரங்கள்</div>
          <Link href="/jathagam" className="btn-gold" style={{ padding: '6px 14px', fontSize: '13px' }}>
            + புதியது
          </Link>
        </div>
        {loading ? (
          <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்...</div>
        ) : profiles.length === 0 ? (
          <div style={{ color: '#8B7BAA', fontSize: '13px' }}>
            இதுவரை எந்த பிறப்பு விவரமும் சேர்க்கப்படவில்லை.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {profiles.map(p => (
              <div
                key={p.id}
                style={{
                  background: '#1A0E3A',
                  borderLeft: p.isDefault ? '3px solid #FFD700' : '3px solid #4B2A8F',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ color: '#FFD700', fontSize: '14px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {p.fullName} {p.isDefault && <span style={{ color: '#FF8C00', fontSize: '11px' }}>★ முதன்மை</span>}
                  </div>
                  <div style={{ color: '#A89BC8', fontSize: '12px' }}>
                    {formatDate(p.dob)} · {p.birthTime} · {p.birthPlace}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {!p.isDefault && (
                    <button
                      onClick={() => onSetDefault(p.id)}
                      style={{
                        background: 'transparent',
                        border: '1px solid #FFD700',
                        color: '#FFD700',
                        borderRadius: '6px',
                        padding: '4px 10px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontFamily: 'Noto Sans Tamil, sans-serif'
                      }}
                    >
                      ★ முதன்மை
                    </button>
                  )}
                  <Link
                    href={`/jathagam`}
                    style={{
                      background: 'transparent',
                      border: '1px solid #4B2A8F',
                      color: '#D4C5F0',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      textDecoration: 'none',
                      fontFamily: 'Noto Sans Tamil, sans-serif'
                    }}
                  >
                    ஜாதகம் பார்
                  </Link>
                  <button
                    onClick={() => onDeleteProfile(p.id)}
                    style={{
                      background: 'transparent',
                      border: '1px solid #FF6B6B',
                      color: '#FF6B6B',
                      borderRadius: '6px',
                      padding: '4px 10px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    நீக்கு
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={sectionTitle}>⭐ ஜாதக வரலாறு</div>
        {loading ? (
          <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்...</div>
        ) : charts.length === 0 ? (
          <div style={{ color: '#8B7BAA', fontSize: '13px' }}>இதுவரை எந்த ஜாதகமும் உருவாக்கப்படவில்லை.</div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {charts.map(c => (
              <div
                key={c.id}
                style={{
                  background: '#1A0E3A',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ color: '#FFD700', fontSize: '14px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {c.profile?.fullName}
                  </div>
                  <div style={{ color: '#A89BC8', fontSize: '12px' }}>
                    {c.rasi} · {c.nakshatra} · {formatDate(c.generatedAt)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={sectionTitle}>💍 பொருத்த வரலாறு</div>
        {loading ? (
          <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்...</div>
        ) : matches.length === 0 ? (
          <div style={{ color: '#8B7BAA', fontSize: '13px' }}>இதுவரை எந்த பொருத்தமும் கணிக்கப்படவில்லை.</div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {matches.map(m => (
              <div
                key={m.id}
                style={{
                  background: '#1A0E3A',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <div style={{ color: '#FFD700', fontSize: '14px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {m.brideName} ❤ {m.groomName}
                  </div>
                  <div style={{ color: '#A89BC8', fontSize: '12px' }}>{formatDate(m.createdAt)}</div>
                </div>
                <div style={{ color: '#FF8C00', fontSize: '14px', fontWeight: 600 }}>
                  {m.totalScore} புள்ளி
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={sectionTitle}>🔮 ஆலோசனை பதிவுகள்</div>
          <Link href="/aalosanai" className="btn-outline" style={{ padding: '6px 14px', fontSize: '13px' }}>
            + புதிய பதிவு
          </Link>
        </div>
        {loading ? (
          <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்...</div>
        ) : bookings.length === 0 ? (
          <div style={{ color: '#8B7BAA', fontSize: '13px' }}>இதுவரை எந்த ஆலோசனையும் பதிவு செய்யவில்லை.</div>
        ) : (
          <div style={{ display: 'grid', gap: '8px' }}>
            {bookings.map(b => (
              <div
                key={b.id}
                style={{
                  background: '#1A0E3A',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}
              >
                <div>
                  <div style={{ color: '#FFD700', fontSize: '14px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                    {b.astrologerName}
                  </div>
                  <div style={{ color: '#A89BC8', fontSize: '12px' }}>
                    {formatDate(b.date)} · {b.timeSlot}
                  </div>
                </div>
                <span style={{
                  color: statusColor(b.status),
                  border: `1px solid ${statusColor(b.status)}`,
                  borderRadius: '999px',
                  padding: '2px 10px',
                  fontSize: '11px',
                  fontFamily: 'Noto Sans Tamil, sans-serif',
                  fontWeight: 600
                }}>
                  {statusTa(b.status)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <AccountInner />
    </ProtectedRoute>
  );
}
