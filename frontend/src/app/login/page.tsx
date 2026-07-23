'use client';

import { useState, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

const enSub: React.CSSProperties = {
  display: 'block', color: '#8B7BAA', fontSize: '11px', marginTop: '2px',
  fontFamily: 'system-ui, sans-serif', fontWeight: 400
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // If the user types digits only, cap at 10. Otherwise treat as free email text.
  const onIdentifierChange = (raw: string) => {
    const digitsOnly = /^\d*$/.test(raw);
    setIdentifier(digitsOnly ? raw.slice(0, 10) : raw.trim());
  };

  const sendOtp = () => {
    const id = identifier.trim();
    if (!EMAIL_RE.test(id) && !MOBILE_RE.test(id)) {
      toast.error('சரியான 10-இலக்க மொபைல் எண் அல்லது மின்னஞ்சல் தேவை / Enter a valid 10-digit mobile or email');
      return;
    }
    setOtpSent(true);
    toast.success('OTP அனுப்பப்பட்டது — 1234 பயன்படுத்தவும் / OTP sent — use 1234');
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!identifier || !otp) {
      toast.error('மொபைல்/மின்னஞ்சல் மற்றும் OTP தேவை / Identifier and OTP required');
      return;
    }
    setLoading(true);
    try {
      const user = await login(identifier.trim(), otp);
      toast.success(`வரவேற்கிறோம் / Welcome, ${user.name}!`);
      router.push(user.isAdmin ? '/admin' : '/');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string; errors?: { msg: string }[] } } }).response?.data?.error ||
        (err as { response?: { data?: { errors?: { msg: string }[] } } }).response?.data?.errors?.[0]?.msg ||
        'உள்நுழைவு தோல்வி / Login failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '2px' }}>
        உள்நுழைவு
      </h1>
      <div style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '12px', fontFamily: 'system-ui, sans-serif' }}>
        Login
      </div>
      <p style={{ color: '#8B7BAA', marginBottom: '4px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        OTP-மூலம் உள்நுழையவும்
      </p>
      <p style={{ color: '#6B5A8A', marginBottom: '24px', fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
        Sign in with OTP
      </p>

      <form
        onSubmit={onSubmit}
        style={{ background: '#251450', border: '1px solid #4B2A8F', borderRadius: '20px', padding: '24px' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <label style={{ color: '#D4C5F0', fontSize: '13px', display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
            மொபைல் எண் அல்லது மின்னஞ்சல்
            <span style={enSub}>Mobile Number or Email</span>
          </label>
          <input
            type="text"
            value={identifier}
            onChange={e => onIdentifierChange(e.target.value)}
            placeholder="98xxxxxxxx  அல்லது  you@example.com"
            className="input-field"
            autoComplete="username"
            style={{ marginTop: '6px' }}
            disabled={otpSent}
          />
        </div>

        {!otpSent ? (
          <button
            type="button"
            onClick={sendOtp}
            className="btn-gold"
            style={{ width: '100%' }}
          >
            OTP அனுப்பு / Send OTP
          </button>
        ) : (
          <>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ color: '#D4C5F0', fontSize: '13px', display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                OTP
                <span style={enSub}>One-time password</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="• • • •"
                className="input-field"
                autoComplete="one-time-code"
                maxLength={6}
                style={{ marginTop: '6px', letterSpacing: '6px', textAlign: 'center', fontSize: '20px' }}
              />
              <p style={{ color: '#6B5A8A', fontSize: '11px', marginTop: '8px', fontFamily: 'system-ui, sans-serif' }}>
                டெவெலப்மென்ட்டில் 1234 பயன்படுத்தவும் · Dev OTP: 1234
              </p>
            </div>
            <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%', opacity: loading ? 0.7 : 1, marginBottom: '8px' }}>
              {loading ? 'உள்நுழைகிறோம்... / Signing in…' : 'உள்நுழை / Login'}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setOtp(''); }}
              className="btn-outline"
              style={{ width: '100%', fontSize: '12px', padding: '8px 12px' }}
            >
              மாற்று / Change
            </button>
          </>
        )}

        <p style={{ color: '#8B7BAA', fontSize: '13px', marginTop: '16px', textAlign: 'center', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          புதியவரா? <Link href="/register" style={{ color: '#FFD700' }}>பதிவு செய்யுங்கள்</Link>
          <span style={{ display: 'block', color: '#6B5A8A', fontSize: '11px', marginTop: '2px', fontFamily: 'system-ui, sans-serif' }}>
            New here? <Link href="/register" style={{ color: '#FFD700' }}>Register</Link>
          </span>
        </p>
      </form>
    </div>
  );
}
