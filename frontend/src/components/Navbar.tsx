'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Logo from '@/components/Logo';

// /ariggai (அறிக்கை) and /aalosanai (ஆலோசனை) are temporarily hidden from
// the nav per explicit request — routes still exist, just not linked here.
const NAV_LINKS = [
  { path: '/', label: 'முகப்பு' },
  { path: '/jathagam', label: 'ஜாதகம்' },
  { path: '/porutham', label: 'பொருத்தம்' },
  { path: '/panchang', label: 'பஞ்சாங்கம்' }
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout, isLoggedIn } = useAuth();
  const router = useRouter();
  const pathname = usePathname() || '/';

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav style={{ background: '#1A0E3A', borderBottom: '1px solid #4B2A8F' }}>
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <Logo size={44} />
          <div>
            <div style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '18px', fontWeight: 700, lineHeight: 1.1 }}>
              தமிழ்வேலன் / TamilVelan
            </div>
            <div style={{ color: '#A89BC8', fontSize: '11px' }}>TamilVelan Calendar</div>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {NAV_LINKS.map(l => (
            <Link
              key={l.path}
              href={l.path}
              style={{
                color: '#D4C5F0', fontSize: '14px', padding: '6px 12px',
                borderRadius: '8px', fontFamily: 'Noto Sans Tamil, sans-serif'
              }}
              className="hover:bg-purple-900 hover:text-yellow-400 transition-colors"
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Link href="/account" style={{ color: '#FFD700', fontSize: '13px', textDecoration: 'none' }}>
                {user?.name}
              </Link>
              <button onClick={handleLogout} className="btn-outline" style={{ padding: '6px 14px', fontSize: '12px', lineHeight: 1.15 }}>
                <span style={{ display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>வெளியேறு</span>
                <span style={{ display: 'block', fontSize: '10px', opacity: 0.85, fontFamily: 'system-ui, sans-serif' }}>Logout</span>
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn-outline" style={{ padding: '6px 14px', fontSize: '12px', lineHeight: 1.15 }}>
                <span style={{ display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>உள்நுழை</span>
                <span style={{ display: 'block', fontSize: '10px', opacity: 0.85, fontFamily: 'system-ui, sans-serif' }}>Login</span>
              </Link>
              <Link href="/register" className="btn-gold" style={{ padding: '6px 14px', fontSize: '12px', lineHeight: 1.15 }}>
                <span style={{ display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>பதிவு செய்</span>
                <span style={{ display: 'block', fontSize: '10px', opacity: 0.85, fontFamily: 'system-ui, sans-serif' }}>Register</span>
              </Link>
            </>
          )}
        </div>

        <button className="md:hidden text-yellow-400" onClick={() => setOpen(!open)} aria-label="menu">
          {open ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {open && (
        <div style={{ background: '#251450', borderTop: '1px solid #4B2A8F' }} className="md:hidden px-4 pb-4">
          {NAV_LINKS.map(l => (
            <Link
              key={l.path}
              href={l.path}
              onClick={() => setOpen(false)}
              style={{
                display: 'block', color: '#D4C5F0', padding: '10px 0',
                fontSize: '15px', borderBottom: '1px solid #32205A'
              }}
            >
              {l.label}
            </Link>
          ))}
          <div className="flex gap-2 mt-4 flex-wrap">
            {isLoggedIn ? (
              <>
                <Link href="/account" onClick={() => setOpen(false)} className="btn-outline" style={{ fontSize: '13px', lineHeight: 1.15 }}>
                  <span style={{ display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>என் கணக்கு</span>
                  <span style={{ display: 'block', fontSize: '10px', opacity: 0.85, fontFamily: 'system-ui, sans-serif' }}>My Account</span>
                </Link>
                <button onClick={handleLogout} className="btn-outline" style={{ fontSize: '13px', lineHeight: 1.15 }}>
                  <span style={{ display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>வெளியேறு</span>
                  <span style={{ display: 'block', fontSize: '10px', opacity: 0.85, fontFamily: 'system-ui, sans-serif' }}>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className="btn-outline" style={{ fontSize: '13px', lineHeight: 1.15 }}>
                  <span style={{ display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>உள்நுழை</span>
                  <span style={{ display: 'block', fontSize: '10px', opacity: 0.85, fontFamily: 'system-ui, sans-serif' }}>Login</span>
                </Link>
                <Link href="/register" onClick={() => setOpen(false)} className="btn-gold" style={{ fontSize: '13px', lineHeight: 1.15 }}>
                  <span style={{ display: 'block', fontFamily: 'Noto Sans Tamil, sans-serif' }}>பதிவு செய்</span>
                  <span style={{ display: 'block', fontSize: '10px', opacity: 0.85, fontFamily: 'system-ui, sans-serif' }}>Register</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
