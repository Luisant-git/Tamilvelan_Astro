'use client';

import { useEffect, useState } from 'react';

const QUOTES: string[] = [
  'நம்பிக்கை உள்ள இடத்தில் அமைதியும், அமைதி உள்ள இடத்தில் கடவுளின் அருளும் எப்போதும் நிலைத்திருக்கும்.',
  'நல்லது செய்ய நாள் பார்க்க வேண்டாம் — நாளும் நல்ல நாள்.',
  'வேண்டியதை அல்ல, தகுந்ததை இறைவன் வழங்குவான்.',
  'பொறுமை என்பதே வெற்றியின் வேர்.',
  'உழைப்பு ஒன்றே உயர்வுக்கான திறவுகோல்.',
  'எண்ணம் தூய்மையாக இருந்தால் வாழ்க்கையும் தூய்மையாக இருக்கும்.',
  'நேற்று கடந்தது, நாளை வரவில்லை — இன்றே சிறந்த தினம்.',
  'நம் வாழ்வின் ஒளி நம் எண்ணங்களே.',
  'குரு வழி நின்றால் கூர்மை வளரும்.',
  'அன்பால் வென்றவனே உலகை வென்றவன்.',
  'அமைதியான மனமே அழகான மனிதர்களை உருவாக்குகிறது.',
  'நற்செயலுக்கு இறைவன் உடன் இருப்பான்.',
  'வாழ்க்கை ஒரு பயணம் — பயத்துடன் அல்ல, பக்தியுடன் நடப்போம்.',
  'விதியை மாற்ற முயற்சியே ஆயுதம்.',
  'வாக்கு தூய்மையாக இருந்தால் மனம் தூய்மையாகும்.',
  'நம்பிக்கை இல்லாமல் முயற்சி இல்லை, முயற்சி இல்லாமல் வெற்றி இல்லை.',
  'கடவுள் தீர்க்கும் காலம் சரியான நேரம்.',
  'ஞானம் என்பது ஒரு நாள் வளர்வதல்ல — தினமும் வளரும் ஒளி.',
  'அன்பு என்பது கடவுளின் மொழி.',
  'நல்லது செய், நல்லதே நினை, நல்லதே நடக்கும்.',
  'மனதை அடக்கினால் உலகையே வெல்லலாம்.',
  'புன்னகை ஒரு சிறிய தீபம் — ஆனால் வாழ்க்கையை ஒளிமயமாக்கும்.',
  'பிரார்த்தனை வெறும் சொற்கள் அல்ல — ஆழ்ந்த நம்பிக்கை.',
  'வெற்றியின் வாசல் தோல்விக்கு பின் திறக்கும்.',
  'அன்னை தாயின் ஆசி — பத்தாயிரம் ஆயுள்.',
  'பணம் கொடுக்கும் சுகம் தற்காலிகம், அன்பு கொடுக்கும் சுகம் நிரந்தரம்.',
  'நற்சிந்தனைகள் நற்செயல்களாக மலரும்.',
  'காலம் கைகளில் இருக்கும்போது பயன்படுத்துவது அறிவு.',
  'எளிமை என்பது அதிசயமான ஆபரணம்.',
  'மனம் தெளிவாக இருந்தால் வாழ்க்கை எளிதாகும்.'
];

function quoteOfDay(): string {
  const epochDay = Math.floor(Date.now() / (1000 * 60 * 60 * 24));
  return QUOTES[epochDay % QUOTES.length];
}
function todayKey(): string {
  const d = new Date();
  return `dailyQuoteShown:${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

export default function DailyQuote() {
  const [show, setShow] = useState(false);
  const [quote, setQuote] = useState('');

  useEffect(() => {
    const key = todayKey();
    if (typeof window !== 'undefined' && !localStorage.getItem(key)) {
      const timer = setTimeout(() => {
        setQuote(quoteOfDay());
        setShow(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    if (typeof window !== 'undefined') localStorage.setItem(todayKey(), '1');
    setShow(false);
  };

  if (!show) return null;

  return (
    <div
      onClick={close}
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(13, 6, 32, 0.85)',
        backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '16px', animation: 'fade-in-up 0.3s ease-out both'
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          maxWidth: '480px', width: '100%',
          background: '#1A0E3A',
          border: '1px solid #FFD700',
          borderRadius: '20px', padding: '28px 24px',
          textAlign: 'center', position: 'relative',
          boxShadow: '0 20px 50px rgba(0,0,0,0.6), 0 0 40px rgba(255,215,0,0.15)',
          animation: 'fade-in-up 0.4s ease-out both'
        }}
      >
        <button
          onClick={close}
          aria-label="Close"
          style={{
            position: 'absolute', top: '10px', right: '12px',
            background: 'transparent', border: 'none',
            color: '#8B7BAA', cursor: 'pointer',
            fontSize: '20px', lineHeight: 1
          }}
        >✕</button>

        <div style={{ fontSize: '38px', marginBottom: '10px' }}>🪔</div>

        <div style={{
          color: '#FF8C00', fontSize: '13px',
          fontFamily: 'Noto Sans Tamil, sans-serif',
          marginBottom: '4px', letterSpacing: '0.3px'
        }}>
          வாழ்க்கைக்கு ஊக்கமளிக்கும் ஒரு சிறந்த பொன்மொழி
        </div>
        <div style={{
          color: '#6B5A8A', fontSize: '11px',
          fontFamily: 'system-ui, sans-serif',
          marginBottom: '20px'
        }}>
          An inspiring quote for life
        </div>

        <div style={{
          background: '#251450', border: '1px solid #4B2A8F',
          borderRadius: '12px', padding: '18px 16px',
          marginBottom: '18px'
        }}>
          <div style={{
            fontSize: '26px', color: '#FFD700', lineHeight: 1,
            marginBottom: '6px', fontFamily: 'serif'
          }}>“</div>
          <p style={{
            color: '#F5F0FF', fontSize: '15px', lineHeight: 1.8,
            fontFamily: 'Noto Sans Tamil, sans-serif', fontStyle: 'italic'
          }}>
            {quote}
          </p>
          <div style={{
            fontSize: '26px', color: '#FFD700', lineHeight: 1,
            marginTop: '6px', fontFamily: 'serif', textAlign: 'right'
          }}>”</div>
        </div>

        <p style={{
          color: '#C4B5E0', fontSize: '13px', lineHeight: 1.7,
          fontFamily: 'Noto Sans Tamil, sans-serif', marginBottom: '20px'
        }}>
          இன்றைய தினத்தை நேர்மறை எண்ணங்களோடு தொடங்குவோம்!
        </p>

        <button
          onClick={close}
          className="btn-gold"
          style={{ padding: '10px 28px', fontSize: '14px', borderRadius: '999px' }}
        >
          தொடரவும் <span style={{ fontSize: '11px', opacity: 0.8 }}>/ Continue</span>
        </button>
      </div>
    </div>
  );
}
