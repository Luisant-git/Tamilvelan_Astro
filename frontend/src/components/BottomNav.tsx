'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// Tools (/aalosanai) tab hidden per explicit request — not deleted, just
// left out of this array for now (mirrors the same change in the mobile
// app's MainTabNavigator.tsx).
const TABS = [
  { href: '/',          icon: '🏠', ta: 'முகப்பு',  en: 'Home',     match: (p: string) => p === '/' },
  { href: '/jathagam',  icon: '⭐', ta: 'ஜாதகம்',   en: 'Horoscope', match: (p: string) => p.startsWith('/jathagam') || p.startsWith('/porutham') || p.startsWith('/ariggai') },
  { href: '/panchang',  icon: '🕉',  ta: 'ஆன்மிகம்', en: 'Spiritual', match: (p: string) => p.startsWith('/panchang') }
];

export default function BottomNav() {
  const pathname = usePathname() || '/';

  if (pathname.startsWith('/admin')) return null;

  return (
    <nav style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 50,
      background: '#1A0E3A', borderTop: '1px solid #4B2A8F',
      paddingBottom: 'env(safe-area-inset-bottom, 0)',
      boxShadow: '0 -4px 12px rgba(0,0,0,0.35)'
    }}>
      <div style={{
        display: 'grid', gridTemplateColumns: `repeat(${TABS.length}, 1fr)`,
        maxWidth: '640px', margin: '0 auto'
      }}>
        {TABS.map(t => {
          const active = t.match(pathname);
          return (
            <Link
              key={t.href}
              href={t.href}
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '8px 4px 10px',
                color: active ? '#FFD700' : '#A89BC8',
                textDecoration: 'none',
                fontFamily: 'Noto Sans Tamil, sans-serif',
                lineHeight: 1.15,
                borderTop: active ? '2px solid #FFD700' : '2px solid transparent',
                background: active ? '#251450' : 'transparent',
                transition: 'background 0.15s, color 0.15s'
              }}
            >
              <span style={{ fontSize: '22px', marginBottom: '4px' }}>{t.icon}</span>
              <span style={{ fontSize: '12px', fontWeight: active ? 600 : 400 }}>{t.ta}</span>
              <span style={{ fontSize: '9px', color: active ? '#FF8C00' : '#6B5A8A', fontFamily: 'system-ui, sans-serif' }}>
                {t.en}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
