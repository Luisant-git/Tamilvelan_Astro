'use client';

import { useState } from 'react';

const COLOR = {
  card: '#251450',
  surface: '#1A0E3A',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA',
  green: '#4CAF50',
  red: '#FF6B6B',
  amber: '#FFC107'
};

type Verdict = 'excellent' | 'good' | 'caution' | 'avoid';

type Direction = {
  key: string;
  ta: string;
  en: string;
  abbr: string;
  deity: string;
  elementTa: string;
  elementEn: string;
  idealUseTa: string;
  doorVerdict: Verdict;
};

const DIRECTIONS: Direction[] = [
  {
    key: 'NE', ta: 'வடகிழக்கு / ஈசான்யம்', en: 'North-East',  abbr: 'NE',
    deity: 'ஈசானன்', elementTa: 'நீர்', elementEn: 'Water',
    idealUseTa: 'பூஜை அறை, கிணறு, நீர் தொட்டி, நுழைவாயில்',
    doorVerdict: 'excellent'
  },
  {
    key: 'E', ta: 'கிழக்கு', en: 'East', abbr: 'E',
    deity: 'இந்திரன்', elementTa: 'காற்று', elementEn: 'Air',
    idealUseTa: 'நுழைவாயில், ஜன்னல், படிக்கும் அறை',
    doorVerdict: 'excellent'
  },
  {
    key: 'SE', ta: 'தென்கிழக்கு / ஆக்னேயம்', en: 'South-East', abbr: 'SE',
    deity: 'அக்னி', elementTa: 'அக்னி', elementEn: 'Fire',
    idealUseTa: 'சமையலறை, மின்சார பெட்டி, அடுப்பு',
    doorVerdict: 'caution'
  },
  {
    key: 'S', ta: 'தெற்கு', en: 'South', abbr: 'S',
    deity: 'யமன்', elementTa: 'நிலம்', elementEn: 'Earth',
    idealUseTa: 'படுக்கையறை, பெரிய பீரோ, புத்தக அலமாரி',
    doorVerdict: 'avoid'
  },
  {
    key: 'SW', ta: 'தென்மேற்கு / நிருதி', en: 'South-West', abbr: 'SW',
    deity: 'நிருதி', elementTa: 'நிலம்', elementEn: 'Earth',
    idealUseTa: 'முதன்மை படுக்கையறை, பேழை, கனமான அலமாரி',
    doorVerdict: 'avoid'
  },
  {
    key: 'W', ta: 'மேற்கு', en: 'West', abbr: 'W',
    deity: 'வருணன்', elementTa: 'நீர்', elementEn: 'Water',
    idealUseTa: 'சாப்பாட்டு அறை, குழந்தைகள் அறை, கழிப்பறை',
    doorVerdict: 'good'
  },
  {
    key: 'NW', ta: 'வடமேற்கு / வாயவ்யம்', en: 'North-West', abbr: 'NW',
    deity: 'வாயு', elementTa: 'காற்று', elementEn: 'Air',
    idealUseTa: 'விருந்தினர் அறை, கழிப்பறை, தானியக் கிடங்கு',
    doorVerdict: 'good'
  },
  {
    key: 'N', ta: 'வடக்கு', en: 'North', abbr: 'N',
    deity: 'குபேரன்', elementTa: 'நீர்', elementEn: 'Water',
    idealUseTa: 'பணப்பெட்டி, வியாபார அலுவலகம், நுழைவாயில்',
    doorVerdict: 'excellent'
  }
];

const VERDICT_META: Record<Verdict, { ta: string; en: string; color: string; icon: string; adviceTa: string }> = {
  excellent: { ta: 'மிகச் சிறந்தது', en: 'Excellent', color: COLOR.green,   icon: '⭐', adviceTa: 'எந்த மாற்றமும் தேவையில்லை.' },
  good:      { ta: 'நன்று',         en: 'Good',      color: COLOR.gold,    icon: '✅', adviceTa: 'பொதுவாக ஏற்றுக்கொள்ளக்கூடியது.' },
  caution:   { ta: 'எச்சரிக்கை',    en: 'Caution',   color: COLOR.amber,   icon: '⚠️', adviceTa: 'பரிகாரம் / மாற்று வடிவமைப்பு பரிசீலிக்கவும்.' },
  avoid:     { ta: 'தவிர்க்கவும்',  en: 'Avoid',     color: COLOR.red,     icon: '🚫', adviceTa: 'வாஸ்து தோஷம் — பரிகாரம் அவசியம்.' }
};

const ROOM_PLACEMENTS: Array<{ roomTa: string; roomEn: string; bestTa: string; avoidTa: string }> = [
  { roomTa: 'பூஜை அறை',      roomEn: 'Pooja Room',     bestTa: 'வடகிழக்கு (ஈசான்யம்)', avoidTa: 'தென்மேற்கு, தெற்கு' },
  { roomTa: 'சமையலறை',       roomEn: 'Kitchen',        bestTa: 'தென்கிழக்கு (ஆக்னேயம்)', avoidTa: 'வடகிழக்கு, வடக்கு' },
  { roomTa: 'முதன்மை படுக்கை', roomEn: 'Master Bedroom', bestTa: 'தென்மேற்கு (நிருதி)',     avoidTa: 'வடகிழக்கு' },
  { roomTa: 'குழந்தை அறை',    roomEn: 'Children Room',  bestTa: 'வடமேற்கு, மேற்கு',         avoidTa: 'தென்மேற்கு' },
  { roomTa: 'படிக்கும் அறை',  roomEn: 'Study Room',     bestTa: 'வடகிழக்கு, கிழக்கு',       avoidTa: 'தென்மேற்கு' },
  { roomTa: 'பணப்பெட்டி',     roomEn: 'Locker / Safe',  bestTa: 'வடக்கு (குபேரன் திசை)',     avoidTa: 'தெற்கு, தென்மேற்கு' },
  { roomTa: 'கழிப்பறை',        roomEn: 'Toilet',         bestTa: 'வடமேற்கு, மேற்கு',          avoidTa: 'வடகிழக்கு, தென்கிழக்கு, மையம்' },
  { roomTa: 'நீர் தொட்டி',     roomEn: 'Water Tank',     bestTa: 'வடகிழக்கு',                avoidTa: 'தென்மேற்கு, மையம்' }
];

const REMEDIES: Array<{ icon: string; ta: string }> = [
  { icon: '🪞', ta: 'வாஸ்து தோஷம் உள்ள திசையில் தெளிவான கண்ணாடி (mirror) தொங்கவிடவும் — தோஷத்தை திருப்பும்.' },
  { icon: '🌿', ta: 'வடகிழக்கு மூலையில் ஒரு துளசி செடி வைக்கவும் — நேர்மறை ஆற்றலை அதிகரிக்கிறது.' },
  { icon: '🧂', ta: 'திறந்த ஒரு கிண்ணத்தில் கல் உப்பு படுக்கையறை மூலையில் வைக்கவும் — எதிர்மறை ஆற்றலை உறிஞ்சும்.' },
  { icon: '🔔', ta: 'நுழைவு வாயிலில் காற்று மணி (wind chime) — சுப ஆற்றல் வரவேற்பு.' },
  { icon: '🟠', ta: 'தென்மேற்கு திசையில் கனமான பொருட்கள் / பெரிய மரப்பொருட்கள் — நிலையான ஆற்றலுக்கு.' },
  { icon: '💡', ta: 'வடகிழக்கு மற்றும் கிழக்கு திசைகளை இலகுவாக, பிரகாசமாக வைக்கவும் — பாரம் வேண்டாம்.' }
];

function HeaderBand({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #321C6B 0%, #251450 100%)',
      color: COLOR.gold, padding: '10px 14px', textAlign: 'center',
      fontFamily: 'Noto Sans Tamil, sans-serif', fontWeight: 600, fontSize: '16px',
      borderBottom: `1px solid ${COLOR.border}`
    }}>{children}</div>
  );
}

function DirectionCard({ d, onPick, picked }: { d: Direction; onPick: () => void; picked: boolean }) {
  const v = VERDICT_META[d.doorVerdict];
  return (
    <button
      onClick={onPick}
      style={{
        background: picked ? '#321C6B' : COLOR.card,
        border: `1px solid ${picked ? COLOR.gold : COLOR.border}`,
        borderRadius: '10px', padding: '12px', textAlign: 'left',
        cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '4px',
        transition: 'background 0.15s, border-color 0.15s'
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
        <div style={{ color: COLOR.gold, fontFamily: 'Noto Serif Tamil, serif', fontWeight: 700, fontSize: '14px' }}>
          {d.ta}
        </div>
        <div style={{ color: v.color, fontSize: '14px' }}>{v.icon}</div>
      </div>
      <div style={{ color: COLOR.subtle, fontSize: '10px', fontFamily: 'system-ui, sans-serif' }}>
        {d.en} · {d.abbr} · {d.deity}
      </div>
      <div style={{ color: COLOR.muted, fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
        {d.elementTa} ({d.elementEn})
      </div>
    </button>
  );
}

export default function VasthuPage() {
  const [doorDir, setDoorDir] = useState<string | null>(null);
  const picked = doorDir ? DIRECTIONS.find(d => d.key === doorDir)! : null;

  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>

        <div>
          <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: COLOR.gold, fontSize: 'clamp(18px, 4vw, 24px)', marginBottom: '2px' }}>
            வாஸ்து சாஸ்திரம்
          </h1>
          <div style={{ color: COLOR.muted, fontSize: '13px', fontFamily: 'system-ui, sans-serif' }}>
            Vasthu Sastra — 8 directions, room placement, and door direction check
          </div>
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>முதன்மை கதவின் திசை — Main door direction</HeaderBand>
          <div style={{ padding: '14px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '8px' }}>
            {DIRECTIONS.map(d => (
              <DirectionCard key={d.key} d={d} picked={doorDir === d.key} onPick={() => setDoorDir(d.key)} />
            ))}
          </div>

          {picked && (
            <div style={{ borderTop: `1px solid ${COLOR.border}`, padding: '14px', background: COLOR.surface }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                <div style={{ fontSize: '24px' }}>{VERDICT_META[picked.doorVerdict].icon}</div>
                <div>
                  <div style={{ color: VERDICT_META[picked.doorVerdict].color, fontFamily: 'Noto Serif Tamil, serif', fontWeight: 700, fontSize: '18px' }}>
                    {VERDICT_META[picked.doorVerdict].ta}
                  </div>
                  <div style={{ color: COLOR.subtle, fontSize: '11px', fontFamily: 'system-ui, sans-serif' }}>
                    {picked.ta} ({picked.en}) — {VERDICT_META[picked.doorVerdict].en} for main door
                  </div>
                </div>
              </div>
              <div style={{ color: COLOR.text, fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.6 }}>
                {VERDICT_META[picked.doorVerdict].adviceTa}
              </div>
              <div style={{ marginTop: '8px', padding: '10px', background: COLOR.card, borderRadius: '6px', color: COLOR.muted, fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                <strong style={{ color: COLOR.gold }}>இந்த திசையின் சிறந்த பயன்பாடு:</strong> {picked.idealUseTa}
              </div>
            </div>
          )}
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>அறை அமைப்பு வழிகாட்டி — Room placement guide</HeaderBand>
          <div>
            {ROOM_PLACEMENTS.map((r, i) => (
              <div key={r.roomEn} style={{
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : `1px solid ${COLOR.divider}`,
                display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px'
              }}>
                <div>
                  <div style={{ color: COLOR.gold, fontFamily: 'Noto Sans Tamil, sans-serif', fontWeight: 700, fontSize: '13px' }}>
                    {r.roomTa}
                  </div>
                  <div style={{ color: COLOR.subtle, fontSize: '10px', fontFamily: 'system-ui, sans-serif' }}>{r.roomEn}</div>
                </div>
                <div style={{ fontSize: '11px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                  <div style={{ color: COLOR.green, marginBottom: '2px' }}>✅ {r.bestTa}</div>
                  <div style={{ color: COLOR.red }}>🚫 {r.avoidTa}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
          <HeaderBand>எளிய வாஸ்து பரிகாரங்கள் — Simple remedies</HeaderBand>
          <div>
            {REMEDIES.map((r, i) => (
              <div key={i} style={{
                padding: '12px 14px',
                borderTop: i === 0 ? 'none' : `1px solid ${COLOR.divider}`,
                display: 'flex', gap: '12px', alignItems: 'flex-start'
              }}>
                <div style={{ fontSize: '20px', flexShrink: 0 }}>{r.icon}</div>
                <div style={{ color: COLOR.text, fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.5 }}>
                  {r.ta}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          marginTop: '4px', padding: '12px 14px',
          background: COLOR.surface, border: `1px dashed ${COLOR.border}`,
          borderRadius: '8px',
          color: COLOR.subtle, fontSize: '11px',
          fontFamily: 'Noto Sans Tamil, sans-serif', lineHeight: 1.5
        }}>
          குறிப்பு: வாஸ்து வழிகாட்டுதல் பாரம்பரிய எட்டு திசை கொள்கைகளின் சுருக்கம் ஆகும். ஒவ்வொரு வீடு / கடைக்கும் தனிப்பட்ட சூழ்நிலை உள்ளது — வாஸ்து புருஷ மண்டல கணக்கீடு, மண் தரம், மற்றும் சுற்றுப்புறம் அனைத்தும் முக்கியம். புதிய கட்டுமானம் / பெரிய மாற்றத்திற்கு முன் பாரம்பரிய வாஸ்து நிபுணரிடம் ஆலோசிக்கவும்.
          <br />
          <span style={{ fontFamily: 'system-ui, sans-serif' }}>
            Note: This is a summary of classical 8-direction Vasthu principles. Each home is unique — Vasthu Purusha Mandala, soil quality, and surroundings all matter. Consult a traditional Vasthu expert before construction or major renovation.
          </span>
        </div>
      </div>
    </div>
  );
}
