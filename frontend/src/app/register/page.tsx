'use client';

import { useState, ChangeEvent, FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';

type Form = { name: string; email: string; mobile: string; otp: string };

const enSub: React.CSSProperties = {
  display: 'block', color: '#8B7BAA', fontSize: '11px', marginTop: '2px',
  fontFamily: 'system-ui, sans-serif', fontWeight: 400
};

function BiLabel({ ta, en }: { ta: string; en: string }) {
  return (
    <label style={{ color: '#D4C5F0', fontSize: '13px', display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
      {ta}
      <span style={enSub}>{en}</span>
    </label>
  );
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<Form>({ name: '', email: '', mobile: '', otp: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const next = name === 'otp' ? value.replace(/\D/g, '').slice(0, 6)
               : name === 'mobile' ? value.replace(/\D/g, '').slice(0, 10)
               : value;
    setForm({ ...form, [name]: next });
  };

  const sendOtp = () => {
    const errs: string[] = [];
    if (!form.name) errs.push('பெயர் / Name');
    if (!MOBILE_RE.test(form.mobile)) errs.push('சரியான மொபைல் / valid mobile');
    if (!EMAIL_RE.test(form.email)) errs.push('சரியான மின்னஞ்சல் / valid email');
    if (errs.length) {
      toast.error(`தேவை: ${errs.join(', ')}`);
      return;
    }
    setOtpSent(true);
    toast.success('OTP அனுப்பப்பட்டது — 1234 பயன்படுத்தவும் / OTP sent — use 1234');
  };

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`வரவேற்கிறோம் / Welcome, ${user.name}!`);
      router.push('/');
    } catch (err: unknown) {
      const data = (err as { response?: { data?: { error?: string; errors?: { msg: string }[] } } }).response?.data;
      const msg = data?.error || data?.errors?.[0]?.msg || 'பதிவு தோல்வி / Registration failed';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '2px' }}>
        புதிய பதிவு
      </h1>
      <div style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '12px', fontFamily: 'system-ui, sans-serif' }}>
        Register
      </div>
      <p style={{ color: '#8B7BAA', marginBottom: '4px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        OTP-மூலம் இலவசமாக கணக்கு உருவாக்குங்கள்
      </p>
      <p style={{ color: '#6B5A8A', marginBottom: '24px', fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
        Create a free account with OTP
      </p>

      <form
        onSubmit={onSubmit}
        style={{ background: '#251450', border: '1px solid #4B2A8F', borderRadius: '20px', padding: '24px' }}
      >
        <div style={{ marginBottom: '14px' }}>
          <BiLabel ta="முழு பெயர்" en="Full Name" />
          <input name="name" value={form.name} onChange={onChange} placeholder="உங்கள் பெயர் / Your name" className="input-field" style={{ marginTop: '6px' }} disabled={otpSent} />
        </div>
        <div style={{ marginBottom: '14px' }}>
          <BiLabel ta="மொபைல் எண்" en="Mobile Number" />
          <input
            name="mobile"
            value={form.mobile}
            onChange={onChange}
            placeholder="98xxxxxxxx"
            className="input-field"
            autoComplete="tel"
            maxLength={10}
            style={{ marginTop: '6px' }}
            disabled={otpSent}
          />
        </div>
        <div style={{ marginBottom: otpSent ? '14px' : '20px' }}>
          <BiLabel ta="மின்னஞ்சல்" en="Email" />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={onChange}
            placeholder="you@example.com"
            className="input-field"
            autoComplete="email"
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
            <div style={{ marginBottom: '20px' }}>
              <BiLabel ta="OTP" en="One-time password" />
              <input
                type="text"
                inputMode="numeric"
                name="otp"
                value={form.otp}
                onChange={onChange}
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
              {loading ? 'பதிவாகிறது... / Registering…' : 'பதிவு செய் / Register'}
            </button>
            <button
              type="button"
              onClick={() => { setOtpSent(false); setForm({ ...form, otp: '' }); }}
              className="btn-outline"
              style={{ width: '100%', fontSize: '12px', padding: '8px 12px' }}
            >
              திருத்து / Edit details
            </button>
          </>
        )}

        <p style={{ color: '#8B7BAA', fontSize: '13px', marginTop: '16px', textAlign: 'center', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          ஏற்கனவே கணக்கு உள்ளதா? <Link href="/login" style={{ color: '#FFD700' }}>உள்நுழையுங்கள்</Link>
          <span style={{ display: 'block', color: '#6B5A8A', fontSize: '11px', marginTop: '2px', fontFamily: 'system-ui, sans-serif' }}>
            Already have an account? <Link href="/login" style={{ color: '#FFD700' }}>Login</Link>
          </span>
        </p>
      </form>
    </div>
  );
}
