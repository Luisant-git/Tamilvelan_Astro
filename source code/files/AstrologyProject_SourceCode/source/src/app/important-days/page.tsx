'use client';

const COLOR = {
  card: '#251450',
  border: '#4B2A8F',
  divider: '#32205A',
  gold: '#FFD700',
  saffron: '#FF8C00',
  text: '#F5F0FF',
  muted: '#A89BC8',
  subtle: '#8B7BAA'
};

type Row = { day: string; ta: string; meta?: string };
type Section = { title: string; rows: Row[] };

const SUBA_MUHURTHAM: Row[] = [
  { day: 'மே 8',  ta: 'சித்திரை 25 - வெள்ளி' },
  { day: 'மே 13', ta: 'சித்திரை 30 - புதன்' },
  { day: 'மே 14', ta: 'சித்திரை 31 - வியாழன்' },
  { day: 'மே 18', ta: 'வைகாசி 4 - திங்கள்', meta: '*' },
  { day: 'மே 28', ta: 'வைகாசி 14 - வியாழன்', meta: '*' },
  { day: 'மே 29', ta: 'வைகாசி 15 - வெள்ளி', meta: '*' }
];

const OTHER_DAYS: Row[] = [
  { day: 'அஷ்டமி', ta: '9 சனி, 23 சனி' },
  { day: 'நவமி',  ta: '10 ஞாயிறு, 24 ஞாயிறு' },
  { day: 'தசமி',  ta: '11 திங்கள், 25 திங்கள்' },
  { day: 'கரி நாட்கள்', ta: '21 வியாழன், 30 சனி, 31 ஞாயிறு' }
];

const HINDU_FESTIVALS: Row[] = [
  { day: '1',  ta: 'சித்ரா பௌர்ணமி, புத்த பூர்ணிமா, ஸ்ரீ கள்ளழகர் வைகை எழுந்தருளல்' },
  { day: '4',  ta: 'அக்னி நட்சத்திரம் ஆரம்பம்' },
  { day: '11', ta: 'திருநாவுக்கரசு குருபூஜை' },
  { day: '28', ta: 'அக்னி நட்சத்திரம் நிவர்த்தி' },
  { day: '30', ta: 'வைகாசி விசாகம்' }
];

const MUSLIM_FESTIVALS: Row[] = [
  { day: '4',  ta: 'ஹாஜா பந்தே நவாஸ் உரூஸ்' },
  { day: '27', ta: 'அரபா மெக்காவுக்கு ஹஜ் யாத்திரை செய்த நாள்' },
  { day: '28', ta: 'பக்ரீத் பண்டிகை' }
];

const CHRISTIAN_FESTIVALS: Row[] = [
  { day: '3',  ta: 'ஹோலி கிராஸ் டே' },
  { day: '10', ta: 'ரொகேஷன் சன்டே' },
  { day: '14', ta: 'அஸன் தர்ஸ்டே' },
  { day: '24', ta: 'உவிட் சன்டே' },
  { day: '31', ta: 'திருத்துவ ஞாயிறு' }
];

const HOLIDAYS: Row[] = [
  { day: '1',  ta: 'தொழிலாளர் தினம்' },
  { day: '28', ta: 'பக்ரீத் பண்டிகை' }
];

const VIRATHA: Row[] = [
  { day: '●', ta: 'அமாவாசை',         meta: '16 சனி' },
  { day: '○', ta: 'பௌர்ணமி',         meta: '1 வெள்ளி, 31 ஞாயிறு' },
  { day: '⭐', ta: 'கிருத்திகை',       meta: '16 சனி' },
  { day: '🛕', ta: 'திருவோணம்',       meta: '9 சனி' },
  { day: '🪔', ta: 'ஏகாதசி',          meta: '13 புதன், 27 புதன்' },
  { day: '🌸', ta: 'சஷ்டி',           meta: '7 வியாழன், 22 வெள்ளி' },
  { day: '🙏', ta: 'சங்கடஹர சதுர்த்தி', meta: '5 செவ்வாய்' },
  { day: '🕉', ta: 'சிவராத்திரி',      meta: '15 வெள்ளி' },
  { day: '🐂', ta: 'பிரதோஷம்',        meta: '14 வியாழன், 28 வியாழன்' },
  { day: '🪷', ta: 'சதுர்த்தி',        meta: '20 புதன்' }
];

const SECTIONS: Section[] = [
  { title: 'சுபமுகூர்த்த தினங்கள்', rows: SUBA_MUHURTHAM },
  { title: 'மற்ற தினங்கள்',         rows: OTHER_DAYS },
  { title: 'இந்து பண்டிகைகள்',      rows: HINDU_FESTIVALS },
  { title: 'முஸ்லீம் பண்டிகைகள்',   rows: MUSLIM_FESTIVALS },
  { title: 'கிறிஸ்த்துவ பண்டிகைகள்', rows: CHRISTIAN_FESTIVALS },
  { title: 'அரசு விடுமுறை நாட்கள்', rows: HOLIDAYS },
  { title: 'விரத தினங்கள்',         rows: VIRATHA }
];

function HeaderBand({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: 'linear-gradient(180deg, #321C6B 0%, #251450 100%)',
      color: COLOR.gold,
      padding: '10px 14px',
      textAlign: 'center',
      fontFamily: 'Noto Sans Tamil, sans-serif',
      fontWeight: 600,
      fontSize: '16px',
      borderBottom: `1px solid ${COLOR.border}`
    }}>
      {children}
    </div>
  );
}

export default function ImportantDaysPage() {
  return (
    <div style={{ minHeight: 'calc(100vh - 64px)' }} className="kolam-bg">
      <div className="max-w-2xl mx-auto px-3 py-4" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ textAlign: 'center', fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.muted, fontSize: '14px', marginTop: '4px' }}>
          மே 2026 — முக்கிய தினங்கள்
        </div>
        {SECTIONS.map(section => (
          <div key={section.title} style={{ background: COLOR.card, border: `1px solid ${COLOR.border}`, borderRadius: '12px', overflow: 'hidden' }}>
            <HeaderBand>{section.title}</HeaderBand>
            {section.rows.map((row, i) => (
              <div key={i} className="row-icon-content-aside" style={{
                padding: '10px 14px',
                borderBottom: i < section.rows.length - 1 ? `1px dashed ${COLOR.divider}` : 'none',
                fontFamily: 'Noto Sans Tamil, sans-serif', color: COLOR.text, fontSize: '15px',
                ['--icon-w' as string]: '56px'
              }}>
                <span style={{ fontWeight: 700, color: COLOR.gold }}>{row.day}</span>
                <span>{row.ta}</span>
                {row.meta && <span style={{ color: COLOR.saffron, fontSize: '14px' }}>{row.meta}</span>}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
