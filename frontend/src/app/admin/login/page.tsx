'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const enSub: React.CSSProperties = {
  display: 'block', color: '#8B7BAA', fontSize: '11px', marginTop: '2px',
  fontFamily: 'system-ui, sans-serif', fontWeight: 400
};

export default function AdminLoginPage() {
  const { login, logout } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('மின்னஞ்சல் மற்றும் கடவுச்சொல் தேவை / Email and password required');
      return;
    }
    setLoading(true);
    try {
      const user = await login(email, password);
      if (!user.isAdmin) {
        logout();
        toast.error('நிர்வாக அனுமதி இல்லை / Not an admin account');
        return;
      }
      toast.success(`வரவேற்கிறோம் / Welcome, ${user.name}!`);
      router.push('/admin');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } }).response?.data?.error ||
        'உள்நுழைவு தோல்வி / Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div style={{
        background: '#1A0E3A', border: '1px solid #8B6914', borderRadius: '20px',
        padding: '28px', boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{ fontSize: '40px', marginBottom: '6px' }}>🛡️</div>
          <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(18px, 4vw, 24px)', marginBottom: '2px' }}>
            நிர்வாக உள்நுழைவு
          </h1>
          <div style={{ color: '#FF8C00', fontSize: '14px', fontFamily: 'system-ui, sans-serif', marginBottom: '8px' }}>
            Admin Login
          </div>
          <p style={{ color: '#A89BC8', fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
            நிர்வாகி கணக்கு மட்டுமே அனுமதிக்கப்படும்
          </p>
          <p style={{ color: '#6B5A8A', fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>
            Admin accounts only
          </p>
        </div>

        <form onSubmit={onSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ color: '#D4C5F0', fontSize: '13px', display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              மின்னஞ்சல்
              <span style={enSub}>Email</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              className="input-field"
              autoComplete="email"
              style={{ marginTop: '6px' }}
            />
          </div>
          <div style={{ marginBottom: '24px' }}>
            <label style={{ color: '#D4C5F0', fontSize: '13px', display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
              கடவுச்சொல்
              <span style={enSub}>Password</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••"
              className="input-field"
              autoComplete="current-password"
              style={{ marginTop: '6px' }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '12px',
              background: 'linear-gradient(90deg, #FFD700 0%, #FF8C00 100%)',
              color: '#251450', border: 'none', borderRadius: '12px',
              fontWeight: 700, fontSize: '14px', cursor: 'pointer',
              opacity: loading ? 0.7 : 1, lineHeight: 1.2,
              fontFamily: 'Noto Sans Tamil, sans-serif'
            }}
          >
            {loading
              ? <>உள்நுழைகிறோம்... <span style={{ fontSize: '11px', opacity: 0.8 }}>/ Signing in…</span></>
              : <>நிர்வாகியாக உள்நுழை <span style={{ fontSize: '11px', opacity: 0.8 }}>/ Login as Admin</span></>
            }
          </button>
        </form>

        <div style={{
          marginTop: '20px', padding: '12px', background: '#251450',
          border: '1px solid #4B2A8F', borderRadius: '10px',
          textAlign: 'center'
        }}>
          <div style={{ color: '#A89BC8', fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
            பயனர் தளம்: <a href="/login" style={{ color: '#FFD700' }}>உள்நுழைய</a>
          </div>
          <div style={{ color: '#6B5A8A', fontSize: '10px', fontFamily: 'system-ui, sans-serif', marginTop: '2px' }}>
            User site: <a href="/login" style={{ color: '#FFD700' }}>Login here</a>
          </div>
        </div>
      </div>
    </div>
  );
}
