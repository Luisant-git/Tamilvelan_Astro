'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

// ============ Types ============
type Stats = { totalUsers: number; totalReports: number; totalRevenue: number };

type AdminUser = {
  id: string; name: string; email: string; mobile: string;
  isAdmin: boolean; createdAt: string;
  _count: { birthProfiles: number; reports: number; consultations: number; matches: number };
};

type Astrologer = {
  id: string; name: string; specialization: string;
  experienceYrs: number; ratePerHour: number;
  bio?: string | null; photoUrl?: string | null; available: boolean;
};

type Match = {
  id: string; brideName: string; groomName: string; totalScore: number; createdAt: string;
  user: { id: string; name: string; email: string };
};

type Chart = {
  id: string; rasi: string; lagna: string; nakshatra: string; dashaLord: string; generatedAt: string;
  profile: { fullName: string; birthPlace: string; dob: string; user: { id: string; name: string; email: string } };
};

// ============ Shared styles ============
const card: React.CSSProperties = {
  background: '#251450', border: '1px solid #4B2A8F', borderRadius: '14px', overflow: 'hidden'
};
const tableHead: React.CSSProperties = { background: '#32205A', color: '#FFD700' };
const th: React.CSSProperties = { padding: '10px 14px', textAlign: 'left', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif' };
const td: React.CSSProperties = { padding: '10px 14px', fontSize: '13px', color: '#D4C5F0', fontFamily: 'Noto Sans Tamil, sans-serif' };

function BiHeading({ ta, en, icon }: { ta: string; en: string; icon: string }) {
  return (
    <div style={{
      background: '#1A0E3A', color: '#FFD700',
      padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '10px'
    }}>
      <span style={{ fontSize: '20px' }}>{icon}</span>
      <div>
        <div style={{ fontFamily: 'Noto Serif Tamil, serif', fontSize: '17px', fontWeight: 600 }}>{ta}</div>
        <div style={{ fontFamily: 'system-ui, sans-serif', fontSize: '11px', color: '#A89BC8' }}>{en}</div>
      </div>
    </div>
  );
}

// ============ Tabs ============
type TabKey = 'overview' | 'users' | 'astrologers' | 'matches' | 'charts';
const TABS: Array<{ key: TabKey; ta: string; en: string; icon: string }> = [
  { key: 'overview',    ta: 'பொது விவரம்',     en: 'Overview',    icon: '📊' },
  { key: 'users',       ta: 'பயனர்கள்',         en: 'Users',       icon: '👥' },
  { key: 'astrologers', ta: 'ஜோதிடர்கள்',       en: 'Astrologers', icon: '🔮' },
  { key: 'matches',     ta: 'பொருத்தங்கள்',     en: 'Matches',     icon: '💍' },
  { key: 'charts',      ta: 'ஜாதகங்கள்',        en: 'Horoscopes',  icon: '⭐' }
];

// ============ Overview ============
function StatCard({ ta, en, value, accent }: { ta: string; en: string; value: string | number; accent: string }) {
  return (
    <div style={{ background: '#251450', border: `1px solid ${accent}`, borderRadius: '14px', padding: '20px' }}>
      <div style={{ color: '#A89BC8', fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>{ta}</div>
      <div style={{ color: '#6B5A8A', fontSize: '10px', fontFamily: 'system-ui, sans-serif', marginBottom: '10px' }}>{en}</div>
      <div style={{ color: accent, fontSize: '30px', fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/admin/stats').then(r => setStats(r.data)).catch(() => toast.error('புள்ளிவிவரம் ஏற்றுவதில் பிழை')).finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்... / Loading…</div>;
  if (!stats) return <div style={{ color: '#8B7BAA' }}>தரவு கிடைக்கவில்லை / No data</div>;
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
      <StatCard ta="மொத்த பயனர்கள்" en="Total Users" value={stats.totalUsers} accent="#FFD700" />
      <StatCard ta="மொத்த அறிக்கைகள்" en="Total Reports" value={stats.totalReports} accent="#FF8C00" />
      <StatCard ta="மொத்த வருவாய்" en="Total Revenue" value={`₹${stats.totalRevenue.toLocaleString('en-IN')}`} accent="#4CAF50" />
    </div>
  );
}

// ============ Users ============
function Users() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const { user: current } = useAuth();

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/users').then(r => setUsers(r.data.users)).catch(() => toast.error('பயனர் ஏற்ற பிழை')).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const toggleAdmin = async (u: AdminUser) => {
    try {
      await api.patch(`/admin/users/${u.id}`, { isAdmin: !u.isAdmin });
      toast.success(u.isAdmin ? 'நிர்வாக அனுமதி நீக்கப்பட்டது' : 'நிர்வாக அனுமதி வழங்கப்பட்டது');
      load();
    } catch {
      toast.error('புதுப்பிக்க முடியவில்லை');
    }
  };

  const deleteUser = async (u: AdminUser) => {
    if (!confirm(`"${u.name}" / ${u.email} — பயனரை நீக்க வேண்டுமா? Delete this user?`)) return;
    try {
      await api.delete(`/admin/users/${u.id}`);
      toast.success('நீக்கப்பட்டது / Deleted');
      load();
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'நீக்க முடியவில்லை';
      toast.error(msg);
    }
  };

  if (loading) return <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்... / Loading…</div>;
  return (
    <div style={card}>
      <BiHeading ta="பயனர்கள்" en="Users" icon="👥" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={tableHead}>
            <th style={th}>பெயர் / Name</th>
            <th style={th}>மின்னஞ்சல் / Email</th>
            <th style={th}>மொபைல்</th>
            <th style={th}>பயன்பாடு</th>
            <th style={th}>நிலை</th>
            <th style={th}>செயல்கள்</th>
          </tr></thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
                <td style={td}>{u.name}</td>
                <td style={td}>{u.email}</td>
                <td style={td}>{u.mobile}</td>
                <td style={{ ...td, fontSize: '11px', color: '#A89BC8' }}>
                  ⭐ {u._count.birthProfiles} · 💍 {u._count.matches} · 📄 {u._count.reports}
                </td>
                <td style={td}>
                  {u.isAdmin ? (
                    <span style={{ background: '#FFD700', color: '#251450', padding: '2px 10px', borderRadius: '999px', fontSize: '11px', fontWeight: 600 }}>நிர்வாகி / Admin</span>
                  ) : (
                    <span style={{ background: '#4B2A8F', color: 'white', padding: '2px 10px', borderRadius: '999px', fontSize: '11px' }}>பயனர் / User</span>
                  )}
                </td>
                <td style={td}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                    <button
                      onClick={() => toggleAdmin(u)}
                      disabled={u.id === current?.id}
                      style={{
                        background: 'transparent', color: '#FFD700', border: '1px solid #FFD700',
                        borderRadius: '6px', padding: '3px 10px', fontSize: '11px',
                        cursor: u.id === current?.id ? 'not-allowed' : 'pointer',
                        opacity: u.id === current?.id ? 0.5 : 1,
                        fontFamily: 'Noto Sans Tamil, sans-serif'
                      }}
                    >
                      {u.isAdmin ? 'நிர்வாகி நீக்கு' : 'நிர்வாகி ஆக்கு'}
                    </button>
                    <button
                      onClick={() => deleteUser(u)}
                      disabled={u.id === current?.id}
                      style={{
                        background: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B',
                        borderRadius: '6px', padding: '3px 10px', fontSize: '11px',
                        cursor: u.id === current?.id ? 'not-allowed' : 'pointer',
                        opacity: u.id === current?.id ? 0.5 : 1,
                        fontFamily: 'Noto Sans Tamil, sans-serif'
                      }}
                    >
                      நீக்கு
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ Astrologers ============
const emptyAstrologer: Omit<Astrologer, 'id'> = {
  name: '', specialization: '', experienceYrs: 0, ratePerHour: 0, bio: '', photoUrl: '', available: true
};

function Astrologers() {
  const [list, setList] = useState<Astrologer[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Astrologer | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Astrologer, 'id'>>(emptyAstrologer);

  const load = useCallback(() => {
    setLoading(true);
    api.get('/admin/astrologers').then(r => setList(r.data.astrologers)).catch(() => toast.error('ஏற்ற முடியவில்லை')).finally(() => setLoading(false));
  }, []);
  useEffect(load, [load]);

  const startCreate = () => { setCreating(true); setEditing(null); setForm(emptyAstrologer); };
  const startEdit = (a: Astrologer) => {
    setEditing(a); setCreating(false);
    setForm({ ...a, bio: a.bio || '', photoUrl: a.photoUrl || '' });
  };
  const cancel = () => { setCreating(false); setEditing(null); };

  const save = async () => {
    try {
      if (creating) {
        await api.post('/admin/astrologers', form);
        toast.success('சேர்க்கப்பட்டது / Added');
      } else if (editing) {
        await api.patch(`/admin/astrologers/${editing.id}`, form);
        toast.success('புதுப்பிக்கப்பட்டது / Updated');
      }
      cancel(); load();
    } catch {
      toast.error('சேமிக்க முடியவில்லை');
    }
  };

  const remove = async (a: Astrologer) => {
    if (!confirm(`"${a.name}" — நீக்க வேண்டுமா? Delete?`)) return;
    try {
      await api.delete(`/admin/astrologers/${a.id}`);
      toast.success('நீக்கப்பட்டது');
      load();
    } catch {
      toast.error('நீக்க முடியவில்லை');
    }
  };

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '8px 12px', background: '#1A0E3A',
    border: '1px solid #4B2A8F', borderRadius: '8px', color: 'white',
    fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '13px', outline: 'none'
  };
  const labelStyle: React.CSSProperties = { color: '#A89BC8', fontSize: '12px', marginBottom: '4px', display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' };

  return (
    <div style={card}>
      <BiHeading ta="ஜோதிடர்கள்" en="Astrologers" icon="🔮" />
      <div style={{ padding: '14px 18px', borderBottom: '1px solid #4B2A8F' }}>
        <button onClick={startCreate} className="btn-gold" style={{ padding: '6px 14px', fontSize: '13px' }}>
          + புதிய ஜோதிடர் / Add Astrologer
        </button>
      </div>

      {(creating || editing) && (
        <div style={{ padding: '18px', borderBottom: '1px solid #4B2A8F', background: '#1A0E3A' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '10px', marginBottom: '12px' }}>
            <div><label style={labelStyle}>பெயர் / Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>சிறப்பு / Specialization</label><input value={form.specialization} onChange={e => setForm({ ...form, specialization: e.target.value })} style={inputStyle} /></div>
            <div><label style={labelStyle}>அனுபவம் (ஆண்டுகள்) / Exp (yrs)</label><input type="number" value={form.experienceYrs} onChange={e => setForm({ ...form, experienceYrs: parseInt(e.target.value, 10) || 0 })} style={inputStyle} /></div>
            <div><label style={labelStyle}>கட்டணம் / Rate per hour (₹)</label><input type="number" value={form.ratePerHour} onChange={e => setForm({ ...form, ratePerHour: parseInt(e.target.value, 10) || 0 })} style={inputStyle} /></div>
            <div style={{ gridColumn: '1/-1' }}><label style={labelStyle}>பயோ / Bio</label><textarea value={form.bio || ''} onChange={e => setForm({ ...form, bio: e.target.value })} style={{ ...inputStyle, minHeight: '60px', resize: 'vertical' }} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" id="avail" checked={form.available} onChange={e => setForm({ ...form, available: e.target.checked })} style={{ accentColor: '#FFD700' }} />
              <label htmlFor="avail" style={{ color: '#D4C5F0', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>இருப்பு / Available</label>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={save} className="btn-gold" style={{ padding: '6px 16px', fontSize: '13px' }}>
              சேமி / Save
            </button>
            <button onClick={cancel} style={{
              background: 'transparent', color: '#A89BC8', border: '1px solid #4B2A8F',
              borderRadius: '8px', padding: '6px 16px', fontSize: '13px', cursor: 'pointer',
              fontFamily: 'Noto Sans Tamil, sans-serif'
            }}>ரத்து / Cancel</button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ color: '#8B7BAA', padding: '20px' }}>ஏற்றுகிறோம்... / Loading…</div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr style={tableHead}>
              <th style={th}>பெயர் / Name</th>
              <th style={th}>சிறப்பு / Specialization</th>
              <th style={th}>அனுபவம்</th>
              <th style={th}>கட்டணம் / Rate</th>
              <th style={th}>இருப்பு</th>
              <th style={th}>செயல்கள்</th>
            </tr></thead>
            <tbody>
              {list.map((a, i) => (
                <tr key={a.id} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
                  <td style={{ ...td, color: '#FFD700' }}>{a.name}</td>
                  <td style={td}>{a.specialization}</td>
                  <td style={td}>{a.experienceYrs}y</td>
                  <td style={td}>₹{a.ratePerHour}</td>
                  <td style={td}>
                    {a.available
                      ? <span style={{ color: '#4CAF50' }}>● ஆம்</span>
                      : <span style={{ color: '#FF6B6B' }}>● இல்லை</span>}
                  </td>
                  <td style={td}>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => startEdit(a)} style={{
                        background: 'transparent', color: '#FFD700', border: '1px solid #FFD700',
                        borderRadius: '6px', padding: '3px 10px', fontSize: '11px', cursor: 'pointer',
                        fontFamily: 'Noto Sans Tamil, sans-serif'
                      }}>திருத்து / Edit</button>
                      <button onClick={() => remove(a)} style={{
                        background: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B',
                        borderRadius: '6px', padding: '3px 10px', fontSize: '11px', cursor: 'pointer',
                        fontFamily: 'Noto Sans Tamil, sans-serif'
                      }}>நீக்கு / Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============ Matches ============
function Matches() {
  const [list, setList] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/admin/matches').then(r => setList(r.data.matches)).catch(() => toast.error('ஏற்ற பிழை')).finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்... / Loading…</div>;
  return (
    <div style={card}>
      <BiHeading ta="பொருத்தங்கள்" en="Marriage Matches" icon="💍" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={tableHead}>
            <th style={th}>பயனர்</th>
            <th style={th}>பெண் / Bride</th>
            <th style={th}>ஆண் / Groom</th>
            <th style={th}>புள்ளி / Score</th>
            <th style={th}>தேதி / Date</th>
          </tr></thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={5} style={{ ...td, textAlign: 'center', padding: '20px' }}>பதிவுகள் இல்லை / No records</td></tr>
            ) : list.map((m, i) => (
              <tr key={m.id} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
                <td style={td}>{m.user.name}<br/><span style={{ fontSize: '11px', color: '#8B7BAA' }}>{m.user.email}</span></td>
                <td style={td}>{m.brideName}</td>
                <td style={td}>{m.groomName}</td>
                <td style={{ ...td, color: '#FF8C00', fontWeight: 600 }}>{m.totalScore}</td>
                <td style={{ ...td, fontSize: '12px' }}>{new Date(m.createdAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ Charts ============
function Charts() {
  const [list, setList] = useState<Chart[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    api.get('/admin/charts').then(r => setList(r.data.charts)).catch(() => toast.error('ஏற்ற பிழை')).finally(() => setLoading(false));
  }, []);
  if (loading) return <div style={{ color: '#8B7BAA' }}>ஏற்றுகிறோம்... / Loading…</div>;
  return (
    <div style={card}>
      <BiHeading ta="ஜாதகங்கள்" en="Horoscopes" icon="⭐" />
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead><tr style={tableHead}>
            <th style={th}>பயனர்</th>
            <th style={th}>பெயர் / Name</th>
            <th style={th}>ராசி</th>
            <th style={th}>லக்னம்</th>
            <th style={th}>நட்சத்திரம்</th>
            <th style={th}>தசை</th>
            <th style={th}>தேதி</th>
          </tr></thead>
          <tbody>
            {list.length === 0 ? (
              <tr><td colSpan={7} style={{ ...td, textAlign: 'center', padding: '20px' }}>பதிவுகள் இல்லை / No records</td></tr>
            ) : list.map((c, i) => (
              <tr key={c.id} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
                <td style={td}>{c.profile.user.name}<br/><span style={{ fontSize: '11px', color: '#8B7BAA' }}>{c.profile.user.email}</span></td>
                <td style={td}>{c.profile.fullName}<br/><span style={{ fontSize: '11px', color: '#8B7BAA' }}>{c.profile.birthPlace}</span></td>
                <td style={{ ...td, color: '#FFD700' }}>{c.rasi}</td>
                <td style={{ ...td, color: '#FF8C00' }}>{c.lagna}</td>
                <td style={td}>{c.nakshatra}</td>
                <td style={td}>{c.dashaLord}</td>
                <td style={{ ...td, fontSize: '12px' }}>{new Date(c.generatedAt).toLocaleDateString('en-IN')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ============ Shell ============
function AdminInner() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<TabKey>('overview');

  const onLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '20px', flexWrap: 'wrap', gap: '12px'
      }}>
        <div>
          <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '4px' }}>
            நிர்வாக மேலாண்மை
          </h1>
          <div style={{ color: '#A89BC8', fontSize: '14px', fontFamily: 'system-ui, sans-serif' }}>
            Admin Dashboard — {user?.name}
          </div>
        </div>
        <button onClick={onLogout} style={{
          background: 'transparent', color: '#FF6B6B', border: '1px solid #FF6B6B',
          borderRadius: '999px', padding: '6px 16px', cursor: 'pointer',
          fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '12px', lineHeight: 1.15
        }}>
          <span style={{ display: 'block' }}>வெளியேறு</span>
          <span style={{ display: 'block', fontSize: '10px', opacity: 0.85, fontFamily: 'system-ui, sans-serif' }}>Logout</span>
        </button>
      </div>

      <div style={{
        display: 'flex', gap: '4px', marginBottom: '20px',
        borderBottom: '1px solid #4B2A8F', overflowX: 'auto'
      }}>
        {TABS.map(t => {
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                background: active ? '#251450' : 'transparent',
                color: active ? '#FFD700' : '#A89BC8',
                border: 'none',
                borderBottom: active ? '2px solid #FFD700' : '2px solid transparent',
                padding: '10px 16px', cursor: 'pointer',
                fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '13px',
                whiteSpace: 'nowrap', lineHeight: 1.2
              }}
            >
              <span style={{ marginRight: '6px' }}>{t.icon}</span>
              <span>{t.ta}</span>
              <span style={{ marginLeft: '6px', fontSize: '10px', color: active ? '#FF8C00' : '#6B5A8A', fontFamily: 'system-ui, sans-serif' }}>
                {t.en}
              </span>
            </button>
          );
        })}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'users' && <Users />}
      {tab === 'astrologers' && <Astrologers />}
      {tab === 'matches' && <Matches />}
      {tab === 'charts' && <Charts />}
    </div>
  );
}

export default function AdminPage() {
  return (
    <ProtectedRoute adminOnly>
      <AdminInner />
    </ProtectedRoute>
  );
}
