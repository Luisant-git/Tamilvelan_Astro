import Link from 'next/link';

export default function NotFound() {
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
      <div style={{ fontSize: '64px', marginBottom: '8px' }}>🌌</div>
      <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '32px', marginBottom: '8px' }}>
        404 — பக்கம் கிடைக்கவில்லை
      </h1>
      <p style={{ color: '#A89BC8', fontSize: '14px', marginBottom: '24px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        நீங்கள் தேடிய பக்கம் இங்கு இல்லை. முகப்பு பக்கத்திற்கு திரும்பவும்.
      </p>
      <Link href="/" className="btn-gold">
        முகப்புக்கு செல்
      </Link>
    </div>
  );
}
