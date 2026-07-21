'use client';

import { useRouter, usePathname } from 'next/navigation';

export default function BackButton() {
  const router = useRouter();
  const pathname = usePathname() || '/';

  if (pathname === '/' || pathname === '/admin/login') return null;

  const onClick = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/');
    }
  };

  return (
    <div style={{ padding: '6px 0 0 8px', lineHeight: 0 }}>
      <button
        onClick={onClick}
        className="no-print"
        aria-label="Back"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          background: '#1A0E3A',
          border: '1px solid #4B2A8F',
          color: '#FFD700',
          padding: '6px 14px 6px 10px',
          borderRadius: '999px',
          cursor: 'pointer',
          fontFamily: 'Noto Sans Tamil, sans-serif',
          fontSize: '12px',
          lineHeight: 1.15,
          transition: 'background 0.15s, border-color 0.15s'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = '#251450';
          e.currentTarget.style.borderColor = '#FFD700';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = '#1A0E3A';
          e.currentTarget.style.borderColor = '#4B2A8F';
        }}
      >
        <span style={{ fontSize: '14px', lineHeight: 1 }}>←</span>
        <span>
          <span style={{ display: 'block', color: '#FFD700' }}>பின்செல்</span>
          <span style={{ display: 'block', fontSize: '10px', color: '#A89BC8', fontFamily: 'system-ui, sans-serif' }}>Back</span>
        </span>
      </button>
    </div>
  );
}
