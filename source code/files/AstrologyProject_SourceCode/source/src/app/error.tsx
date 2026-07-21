'use client';

import { useEffect } from 'react';

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        textAlign: 'center'
      }}
    >
      <div style={{ fontSize: '64px', marginBottom: '8px' }}>⚠️</div>
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FF6B6B', fontSize: 'clamp(20px, 4.8vw, 28px)', marginBottom: '8px' }}>
        ஏதோ பிழை ஏற்பட்டது
      </h1>
      <p style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '24px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        சிறிது நேரம் கழித்து மீண்டும் முயற்சிக்கவும்.
      </p>
      <button onClick={reset} className="btn-gold">
        மீண்டும் முயற்சி
      </button>
    </div>
  );
}
