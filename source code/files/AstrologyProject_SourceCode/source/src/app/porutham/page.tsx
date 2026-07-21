'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import ProtectedRoute from '@/components/ProtectedRoute';

type Suggestion = { label: string; latitude: number; longitude: number };

type Side = {
  name: string;
  month: string; day: string; year: string;
  hour: string; minute: string; ampm: 'AM' | 'PM';
  birthPlace: string;
  selected: Suggestion | null;
};

type PoruthamItem = {
  num: number; name: string; description: string;
  weight: number; score: number;
  verdict: string; level: 'good' | 'mid' | 'bad';
  note?: string;
};
type SideChart = {
  name: string; dobIso: string; birthTime: string; birthPlace: string;
  latitude: number; longitude: number;
  lagna: string; lagnaRasi: number;
  rasi: string; rasiNum: number;
  nakshatra: string; pada: number;
  planets: Record<string, { rasi: number }>;
};
type MatchDosham = { name: string; matching: boolean; note: string };

type Result = {
  bride: SideChart; groom: SideChart;
  porutthams: PoruthamItem[];
  totalScore: number; maxScore: number; percentage: number;
  doshams: MatchDosham[];
  recommendation: string;
};

const MONTHS_TAMIL = ['ஜனவரி','பிப்ரவரி','மார்ச்','ஏப்ரல்','மே','ஜூன்','ஜூலை','ஆகஸ்ட்','செப்டம்பர்','அக்டோபர்','நவம்பர்','டிசம்பர்'];
const DAYS = Array.from({ length: 31 }, (_, i) => String(i + 1));
const CURRENT_YEAR = new Date().getFullYear();
const YEARS = Array.from({ length: CURRENT_YEAR - 1939 }, (_, i) => String(CURRENT_YEAR - i));
const HOURS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));

const PLANET_SHORT_TAMIL: Record<string, string> = {
  Sun:'சூரி', Moon:'சந்', Mars:'செவ்', Mercury:'புதன்', Jupiter:'குரு', Venus:'சுக்', Saturn:'சனி', Rahu:'ராகு', Ketu:'கேது'
};

const emptySide = (): Side => ({
  name: '', month: '1', day: '1', year: String(CURRENT_YEAR),
  hour: '01', minute: '59', ampm: 'AM', birthPlace: '', selected: null
});

const darkInput: React.CSSProperties = {
  width:'100%', padding:'10px 14px',
  border:'1px solid #4B2A8F', borderRadius:'10px',
  background:'#1A0E3A', color:'white',
  fontSize:'13px', fontFamily:'Noto Sans Tamil, sans-serif', outline:'none'
};
const labelStyle: React.CSSProperties = {
  display:'flex', alignItems:'center', gap:'8px',
  color:'#D4C5F0', fontSize:'13px',
  fontFamily:'Noto Sans Tamil, sans-serif', marginBottom:'6px'
};
function IconBadge({ icon, color }: { icon:string; color:string }) {
  return <span style={{
    display:'inline-flex', alignItems:'center', justifyContent:'center',
    width:'26px', height:'26px', borderRadius:'8px',
    background:color, color:'white', fontSize:'14px', flexShrink:0
  }}>{icon}</span>;
}

function PlaceAutocomplete({ value, onChange, selected, onSelect }: {
  value:string; onChange:(v:string)=>void;
  selected:Suggestion|null; onSelect:(s:Suggestion|null)=>void;
}) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>|null>(null);

  useEffect(() => {
    if (!value || value.length < 2 || selected?.label === value) { setSuggestions([]); return; }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      setLoading(true);
      api.get(`/horoscope/geocode?place=${encodeURIComponent(value)}`)
        .then(r => { setSuggestions(r.data.suggestions || []); setShow(true); })
        .catch(() => setSuggestions([]))
        .finally(() => setLoading(false));
    }, 400);
  }, [value, selected]);

  return (
    <div style={{ position:'relative' }}>
      <input
        value={value}
        onChange={e => { onChange(e.target.value); onSelect(null); }}
        onFocus={() => suggestions.length > 0 && setShow(true)}
        onBlur={() => setTimeout(() => setShow(false), 200)}
        placeholder="பிறந்த இடம்"
        style={darkInput}
        autoComplete="off"
      />
      {loading && (
        <span style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)',
          color:'#8B7BAA', fontSize:'11px', fontFamily:'Noto Sans Tamil, sans-serif' }}>தேடுகிறது...</span>
      )}
      {show && suggestions.length > 0 && (
        <div style={{
          position:'absolute', top:'100%', left:0, right:0, zIndex:20,
          background:'#1A0E3A', border:'1px solid #4B2A8F', borderRadius:'10px',
          marginTop:'4px', maxHeight:'220px', overflowY:'auto',
          boxShadow:'0 6px 18px rgba(0,0,0,0.4)'
        }}>
          {suggestions.map((s, i) => (
            <div key={i}
              onMouseDown={() => { onSelect(s); onChange(s.label); setShow(false); }}
              style={{
                padding:'8px 14px', borderBottom:'1px solid #2A1A50',
                cursor:'pointer', fontSize:'12px',
                background:i===0?'#2A1A50':'transparent',
                color:i===0?'#FFD700':'#D4C5F0',
                fontFamily:'Noto Sans Tamil, sans-serif'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#32205A'; }}
              onMouseLeave={e => { e.currentTarget.style.background = i===0?'#2A1A50':'transparent'; }}
            >{s.label}</div>
          ))}
        </div>
      )}
    </div>
  );
}

function PartyCard({ title, subtitle, headerColor, iconColor, side, setSide }: {
  title:string; subtitle:string; headerColor:string; iconColor:string;
  side:Side; setSide:React.Dispatch<React.SetStateAction<Side>>;
}) {
  const set = <K extends keyof Side>(field:K, value:Side[K]) =>
    setSide(prev => ({ ...prev, [field]: value }));
  return (
    <div style={{ background:'#251450', border:'1px solid #4B2A8F', borderRadius:'20px', overflow:'hidden' }}>
      <div style={{ background:headerColor, padding:'16px 20px', textAlign:'center' }}>
        <div style={{ fontFamily:'Noto Serif Tamil, serif', color:'white', fontSize:'18px', fontWeight:700, marginBottom:'4px' }}>{title}</div>
        <div style={{ color:'rgba(255,255,255,0.85)', fontSize:'12px', fontFamily:'Noto Sans Tamil, sans-serif' }}>{subtitle}</div>
      </div>
      <div style={{ padding:'20px' }}>
        <div className="field-row field-row-narrow">
          <div style={labelStyle}><IconBadge icon="👤" color={iconColor}/><span>பெயர்</span></div>
          <input value={side.name} onChange={e => set('name', e.target.value)} placeholder="பெயர்" style={darkInput}/>
        </div>
        <div className="field-row field-row-narrow">
          <div style={labelStyle}><IconBadge icon="📅" color={iconColor}/><span>பிறந்த தேதி</span></div>
          <div style={{ display:'grid', gridTemplateColumns:'1.6fr 1fr 1fr', gap:'6px' }}>
            <select value={side.month} onChange={e => set('month', e.target.value)} style={darkInput}>
              {MONTHS_TAMIL.map((m, i) => <option key={i} value={String(i + 1)}>{m}</option>)}
            </select>
            <select value={side.day} onChange={e => set('day', e.target.value)} style={darkInput}>
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={side.year} onChange={e => set('year', e.target.value)} style={darkInput}>
              {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
        <div className="field-row field-row-narrow">
          <div style={labelStyle}><IconBadge icon="🕒" color={iconColor}/><span>பிறந்த நேரம்</span></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'6px' }}>
            <select value={side.hour} onChange={e => set('hour', e.target.value)} style={darkInput}>
              {HOURS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
            <select value={side.minute} onChange={e => set('minute', e.target.value)} style={darkInput}>
              {MINUTES.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={side.ampm} onChange={e => set('ampm', e.target.value as 'AM'|'PM')} style={darkInput}>
              <option value="AM">AM</option>
              <option value="PM">PM</option>
            </select>
          </div>
        </div>
        <div className="field-row field-row-narrow">
          <div style={labelStyle}><IconBadge icon="📍" color={iconColor}/><span>பிறந்த இடம்</span></div>
          <PlaceAutocomplete value={side.birthPlace} onChange={v => set('birthPlace', v)} selected={side.selected} onSelect={s => set('selected', s)}/>
        </div>
      </div>
    </div>
  );
}

// ============ RESULT COMPONENTS ============

function formatDateLong(iso:string, time:string): string {
  try {
    const d = new Date(iso);
    const base = d.toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' });
    return `${base} ${time}`;
  } catch { return iso; }
}

function SideBirthCard({ chart, accent, title }: { chart:SideChart; accent:string; title:string }) {
  const rows: Array<[string,string]> = [
    ['பிறந்த தேதி', formatDateLong(chart.dobIso, chart.birthTime)],
    ['லக்னம்', chart.lagna],
    ['ராசி', chart.rasi],
    ['நட்சத்திரம்', `${chart.nakshatra} - ${chart.pada} பாதம்`],
    ['பிறந்த ஊர்', chart.birthPlace]
  ];
  return (
    <div style={{ background:'#251450', border:'1px solid #4B2A8F', borderRadius:'14px', overflow:'hidden' }}>
      <div style={{ background:accent, color:'white', padding:'10px 16px', fontFamily:'Noto Sans Tamil, sans-serif', fontWeight:600, fontSize:'14px' }}>
        📍 {title}
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'Noto Sans Tamil, sans-serif' }}>
        <tbody>
          {rows.map(([k,v], i) => (
            <tr key={k} style={{ background: i%2===0 ? '#1A0E3A' : '#251450' }}>
              <td style={{ padding:'8px 14px', color:'#D4C5F0', fontSize:'12px', width:'40%' }}>{k}</td>
              <td style={{ padding:'8px 14px', color:'#FFD700', fontSize:'12px' }}>{v}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Mini rasi chakra (south Indian, 4×4)
const GRID_TO_RASI: Array<number|null> = [12,1,2,3, 11,null,null,4, 10,null,null,5, 9,8,7,6];

function MiniRasiChart({ title, accent, lagnaRasi, planets, centerLabel }: {
  title:string; accent:string; lagnaRasi:number;
  planets:Record<string,{rasi:number}>; centerLabel:string;
}) {
  const byRasi: Record<number,string[]> = {};
  Object.entries(planets).forEach(([n,d]) => {
    if (!byRasi[d.rasi]) byRasi[d.rasi] = [];
    byRasi[d.rasi].push(PLANET_SHORT_TAMIL[n] || n.slice(0,3));
  });
  const CELL=70, COLS=4, W=CELL*COLS, H=CELL*COLS;
  return (
    <div style={{ background:'#1A0E3A', border:'1px solid #4B2A8F', borderRadius:'14px', overflow:'hidden' }}>
      <div style={{ background:accent, color:'white', padding:'10px 16px', textAlign:'center', fontFamily:'Noto Sans Tamil, sans-serif', fontWeight:600, fontSize:'14px' }}>
        {title}
      </div>
      <div style={{ padding:'10px' }}>
        <svg width="100%" viewBox={`0 0 ${W} ${H}`} style={{ display:'block', maxWidth:'320px', margin:'0 auto' }}>
          <rect width={W} height={H} fill="#0D0620" rx={6}/>
          {Array.from({ length:16 }, (_,pos) => {
            const rasi = GRID_TO_RASI[pos];
            const isCenter = [5,6,9,10].includes(pos);
            const isLagna = rasi === lagnaRasi;
            const here = rasi ? byRasi[rasi]||[] : [];
            const col = pos%COLS, row = Math.floor(pos/COLS);
            const x = col*CELL, y = row*CELL;
            if (isCenter) {
              if (pos===5) return (
                <g key={pos}>
                  <rect x={CELL} y={CELL} width={CELL*2} height={CELL*2} fill="#251450" stroke="#8B6914" strokeWidth={1}/>
                  <text x={CELL*2} y={CELL*2.1} textAnchor="middle" fill="#FFD700" fontSize={14} fontWeight={700} fontFamily="Noto Serif Tamil, serif">{centerLabel}</text>
                </g>
              );
              return null;
            }
            return (
              <g key={pos}>
                <rect x={x} y={y} width={CELL} height={CELL}
                  fill={isLagna?'#2A1A50':'#1A0E3A'} stroke={isLagna?'#FFD700':'#4B2A8F'} strokeWidth={isLagna?1.2:0.6}/>
                {isLagna && <text x={x+5} y={y+12} fill="#FFD700" fontSize={9} fontWeight={700}>ல</text>}
                {here.slice(0,4).map((code,i) => (
                  <text key={code+i} x={x+CELL/2} y={y+22+i*12} textAnchor="middle"
                    fill="#FF8C00" fontSize={10} fontFamily="Noto Sans Tamil, sans-serif">{code}</text>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

function PlanetLegend() {
  return (
    <div style={{
      background:'#1A0E3A', border:'1px solid #4B2A8F', color:'#D4C5F0',
      borderRadius:'999px', padding:'8px 14px', fontSize:'11px',
      fontFamily:'Noto Sans Tamil, sans-serif',
      display:'flex', flexWrap:'wrap', justifyContent:'center', gap:'8px', rowGap:'4px'
    }}>
      {[
        ['சூ','சூரியன்'],['சந்','சந்திரன்'],['செவ்','செவ்வாய்'],['புதன்','புதன்'],
        ['சனி','சனி'],['குரு','குரு'],['சுக்','சுக்கிரன்'],['ராகு','ராகு'],['கேது','கேது']
      ].map(([s,n], i, arr) => (
        <span key={s}>
          <span style={{ color:'#FFD700' }}>{s}</span> - {n}
          {i < arr.length-1 && <span style={{ color:'#4B2A8F', margin:'0 4px' }}>|</span>}
        </span>
      ))}
    </div>
  );
}

function PoruthamTable({ items }: { items:PoruthamItem[] }) {
  return (
    <div style={{ background:'#251450', border:'1px solid #4B2A8F', borderRadius:'14px', overflow:'hidden' }}>
      <div style={{ background:'#1A0E3A', color:'#FFD700', padding:'12px 18px', fontFamily:'Noto Serif Tamil, serif', fontSize:'17px', fontWeight:600 }}>
        📋 தசவித பொருத்தம்
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'Noto Sans Tamil, sans-serif' }}>
        <thead>
          <tr style={{ background:'#32205A', color:'#FFD700' }}>
            <th style={{ padding:'10px 14px', textAlign:'left', fontSize:'13px', width:'40px' }}>#</th>
            <th style={{ padding:'10px 14px', textAlign:'left', fontSize:'13px' }}>பொருத்தம்</th>
            <th style={{ padding:'10px 14px', textAlign:'left', fontSize:'13px' }}>முடிவு</th>
          </tr>
        </thead>
        <tbody>
          {items.map((p, i) => {
            const verdictColor = p.level === 'good' ? '#4CAF50' : p.level === 'mid' ? '#FFB74D' : '#FF6B6B';
            return (
              <tr key={p.num} style={{ background: i%2===0 ? '#1A0E3A' : '#251450' }}>
                <td style={{ padding:'10px 14px', color:'#8B7BAA', fontSize:'13px' }}>{p.num}</td>
                <td style={{ padding:'10px 14px', color:'#D4C5F0', fontSize:'13px' }}>{p.name}</td>
                <td style={{ padding:'10px 14px', color:verdictColor, fontSize:'13px', fontWeight:500 }}>{p.verdict}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function DoshamTable({ doshams }: { doshams:MatchDosham[] }) {
  return (
    <div style={{ background:'#251450', border:'1px solid #4B2A8F', borderRadius:'14px', overflow:'hidden', marginTop:'20px' }}>
      <div style={{ background:'#1A0E3A', color:'#FFD700', padding:'12px 18px', fontFamily:'Noto Serif Tamil, serif', fontSize:'17px', fontWeight:600 }}>
        ⚠️ தோட விவரம்
      </div>
      <table style={{ width:'100%', borderCollapse:'collapse', fontFamily:'Noto Sans Tamil, sans-serif' }}>
        <thead>
          <tr style={{ background:'#32205A', color:'#FFD700' }}>
            <th style={{ padding:'10px 14px', textAlign:'left', fontSize:'13px' }}>தோட வகை</th>
            <th style={{ padding:'10px 14px', textAlign:'left', fontSize:'13px' }}>முடிவு</th>
          </tr>
        </thead>
        <tbody>
          {doshams.map((d, i) => (
            <tr key={d.name} style={{ background: i%2===0 ? '#1A0E3A' : '#251450' }}>
              <td style={{ padding:'10px 14px', color:'#D4C5F0', fontSize:'13px' }}>{d.name}</td>
              <td style={{ padding:'10px 14px', color:d.matching?'#4CAF50':'#FF6B6B', fontSize:'13px', fontWeight:500 }}>{d.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function InfoCards() {
  const cards = [
    { icon:'📋', title:'10 பொருத்தங்கள்', desc:'தினம், கணம், மகேந்திரம், யோனிப், ராசி முதலிய 10 பொருத்த கூறுகளின் விரிவான பகுப்பாய்வு.' },
    { icon:'🕉', title:'வேத ஜோதிட நுணி', desc:'பண்டைய வேத ஜோதிட கொள்கைகளின் அடிப்படையில் திருமண பொருத்தம் கணிப்பு.' },
    { icon:'📄', title:'விரிவான அறிக்கை', desc:'தோட விவரம், பொருத்த மதிப்பெண் முழுமையான திருமண பகுப்பாய்வு அடங்கிய அறிக்கை.' }
  ];
  return (
    <div style={{ marginTop:'24px' }}>
      <h2 style={{ color:'#FFD700', fontFamily:'Noto Serif Tamil, serif', fontSize:'18px', marginBottom:'12px' }}>
        ⭐ ஜாதக பொருத்தம் என்றால் என்ன?
      </h2>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(200px, 1fr))', gap:'12px' }}>
        {cards.map(c => (
          <div key={c.title} style={{
            background:'#251450', border:'1px solid #4B2A8F', borderRadius:'14px',
            padding:'18px', textAlign:'center'
          }}>
            <div style={{ fontSize:'30px', marginBottom:'8px' }}>{c.icon}</div>
            <div style={{ color:'#FFD700', fontFamily:'Noto Serif Tamil, serif', fontSize:'14px', fontWeight:600, marginBottom:'6px' }}>{c.title}</div>
            <div style={{ color:'#A89BC8', fontSize:'12px', lineHeight:1.6, fontFamily:'Noto Sans Tamil, sans-serif' }}>{c.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function toIsoDate(s:Side): string {
  return `${s.year}-${s.month.padStart(2,'0')}-${s.day.padStart(2,'0')}`;
}
function toTime24(s:Side): string {
  let h = parseInt(s.hour, 10);
  if (s.ampm === 'PM' && h < 12) h += 12;
  if (s.ampm === 'AM' && h === 12) h = 0;
  return `${String(h).padStart(2,'0')}:${s.minute}`;
}

function PoruthamInner() {
  const [bride, setBride] = useState<Side>(emptySide());
  const [groom, setGroom] = useState<Side>(emptySide());
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e:FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!bride.name || !groom.name) { toast.error('இரு பெயர்களும் தேவை'); return; }
    setLoading(true);
    try {
      const res = await api.post('/marriage/match', {
        brideName: bride.name, brideDob: toIsoDate(bride), brideBirthTime: toTime24(bride),
        brideBirthPlace: bride.birthPlace,
        brideLatitude: bride.selected?.latitude, brideLongitude: bride.selected?.longitude,
        groomName: groom.name, groomDob: toIsoDate(groom), groomBirthTime: toTime24(groom),
        groomBirthPlace: groom.birthPlace,
        groomLatitude: groom.selected?.latitude, groomLongitude: groom.selected?.longitude
      });
      setResult(res.data);
      setTimeout(() => document.getElementById('porutham-result')?.scrollIntoView({ behavior:'smooth' }), 100);
    } catch (err:unknown) {
      const msg = (err as { response?: { data?: { error?:string } } }).response?.data?.error || 'பொருத்தம் கணிக்கவில்லை';
      toast.error(msg);
    } finally { setLoading(false); }
  };

  const onPrint = () => window.print();
  const onDetail = () => toast.success('விரிவான அறிக்கை விரைவில்...');

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 style={{ fontFamily:'Noto Serif Tamil, serif', color:'#FFD700', fontSize:'clamp(20px, 4.8vw, 28px)', marginBottom:'8px' }}>
        திருமண பொருத்தம்
      </h1>
      <p style={{ color:'#8B7BAA', marginBottom:'28px', fontFamily:'Noto Sans Tamil, sans-serif' }}>
        மணமகள் மற்றும் மணமகனின் பிறந்த விவரங்களை நிரப்பவும்
      </p>

      <form onSubmit={handleSubmit}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(340px, 1fr))', gap:'20px', marginBottom:'24px' }}>
          <PartyCard title="🚺 பெண் விவரங்கள்" subtitle="பெண்ணின் பிறந்த விவரங்களை நிரப்பவும்" headerColor="#4B2A8F" iconColor="#FF8C00" side={bride} setSide={setBride}/>
          <PartyCard title="🚹 ஆண் விவரங்கள்" subtitle="மணமகனின் பிறந்த விவரங்களை நிரப்பவும்" headerColor="#1A0E3A" iconColor="#7B1FA2" side={groom} setSide={setGroom}/>
        </div>
        <div className="no-print" style={{ textAlign:'center' }}>
          <button type="submit" disabled={loading} className="btn-gold"
            style={{ padding:'14px 36px', fontSize:'15px', borderRadius:'999px',
              opacity:loading?0.7:1, display:'inline-flex', alignItems:'center', gap:'8px' }}>
            ❤ {loading ? 'கணிக்கிறோம்...' : 'பொருத்தம் பார்க்க'}
          </button>
        </div>
      </form>

      {result && (
        <div id="porutham-result" style={{ marginTop:'32px' }}>
          {/* HEADER */}
          <div style={{
            background:'#1A0E3A', border:'1px solid #4B2A8F', borderRadius:'16px',
            padding:'24px', textAlign:'center', marginBottom:'20px'
          }}>
            <div style={{ fontSize:'30px', marginBottom:'4px' }}>💖</div>
            <h2 style={{ color:'#FFD700', fontFamily:'Noto Serif Tamil, serif', fontSize:'clamp(18px, 4vw, 24px)', marginBottom:'6px' }}>
              ஜாதக பொருத்தம் முடிவு
            </h2>
            <p style={{ color:'#A89BC8', fontSize:'13px', fontFamily:'Noto Sans Tamil, sans-serif' }}>
              தசவித பொருத்தம் அடிப்படையில் கணிக்கப்பட்ட திருமண பொருத்தம் விவரம்
            </p>
            <div style={{ marginTop:'14px' }}>
              <div style={{ fontSize:'42px', fontWeight:700, color:result.percentage >= 60 ? '#4CAF50' : '#FF6B6B' }}>
                {result.percentage}%
              </div>
              <div style={{ color:'#FFD700', fontSize:'13px', fontFamily:'Noto Sans Tamil, sans-serif' }}>
                {result.totalScore} / {result.maxScore} புள்ளி
              </div>
              <div style={{ color:'#C4B5E0', fontSize:'12px', marginTop:'6px', fontFamily:'Noto Sans Tamil, sans-serif' }}>
                {result.recommendation}
              </div>
            </div>
          </div>

          {/* BIRTH DETAILS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'16px', marginBottom:'20px' }}>
            <SideBirthCard chart={result.bride} accent="#4B2A8F" title="பெண் பிறப்பு விவரங்கள்"/>
            <SideBirthCard chart={result.groom} accent="#7B1FA2" title="ஆண் பிறப்பு விவரங்கள்"/>
          </div>

          {/* RASI CHARTS */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(300px, 1fr))', gap:'16px', marginBottom:'16px' }}>
            <MiniRasiChart title="🌙 பெண் ராசி சக்கரம்" accent="#FF8C00" lagnaRasi={result.bride.lagnaRasi} planets={result.bride.planets} centerLabel="பெண் ராசி"/>
            <MiniRasiChart title="☀ ஆண் ராசி சக்கரம்" accent="#E65100" lagnaRasi={result.groom.lagnaRasi} planets={result.groom.planets} centerLabel="ஆண் ராசி"/>
          </div>
          <div style={{ marginBottom:'20px' }}>
            <PlanetLegend/>
          </div>

          {/* DASAVIDHA PORUTHAM */}
          <PoruthamTable items={result.porutthams}/>

          {/* ACTION BUTTONS */}
          <div className="no-print" style={{ display:'flex', justifyContent:'center', gap:'12px', flexWrap:'wrap', margin:'20px 0' }}>
            <button onClick={onDetail} style={{
              background:'#FFD700', color:'#251450', border:'none',
              padding:'10px 22px', borderRadius:'999px', cursor:'pointer',
              fontFamily:'Noto Sans Tamil, sans-serif', fontSize:'13px', fontWeight:700,
              display:'inline-flex', alignItems:'center', gap:'8px'
            }}>🔍 விரிவான பொருத்தம் அறிய</button>
            <button onClick={onPrint} style={{
              background:'#4B2A8F', color:'white', border:'1px solid #4B2A8F',
              padding:'10px 22px', borderRadius:'999px', cursor:'pointer',
              fontFamily:'Noto Sans Tamil, sans-serif', fontSize:'13px', fontWeight:600,
              display:'inline-flex', alignItems:'center', gap:'8px'
            }}>🖨️ அச்சிடு</button>
          </div>

          {/* DOSHA TABLE */}
          <DoshamTable doshams={result.doshams}/>

          {/* INFO CARDS */}
          <InfoCards/>
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, footer { display: none !important; }
        }
      `}</style>
    </div>
  );
}

export default function PoruthamPage() {
  return (
    <ProtectedRoute>
      <PoruthamInner/>
    </ProtectedRoute>
  );
}
