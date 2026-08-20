'use client';

import { useState, useEffect, useRef, FormEvent } from 'react';
import toast from 'react-hot-toast';
import api from '@/lib/api';
import HoroscopeCharts from '@/components/HoroscopeChart';
import ProtectedRoute from '@/components/ProtectedRoute';

type Suggestion = { label: string; latitude: number; longitude: number; country?: string; state?: string };

type DashaBhukti = { lord: string; lordTamil: string; startDate: string; endDate: string; years: number; canonicalYears: number; isCurrent?: boolean };
type DashaPeriod = DashaBhukti & { bhukti?: DashaBhukti[] };

type ChartResponse = {
  chart: {
    birthInfo: {
      fullName: string; gender: string; dobFormatted: string; dobIso: string;
      birthTime: string; birthPlace: string; latitude: number; longitude: number;
    };
    ayanamsa: number;
    ayanamsaName: string;
    lagna: { rasi: number; rasiTamil: string; lord: string; degInRasi: number };
    rasi: { num: number; nameTamil: string };
    nakshatra: { index: number; nameTamil: string; pada: number };
    tithi: { index: number; nameTamil: string; paksha: string };
    planets: Record<string, {
      name: string; nameTamil: string; longitude: number; rasi: number;
      rasiNameTamil: string; degInRasi: number; degInRasiStr: string;
      nakshatra: number; nakshatraTamil: string; pada: number;
    }>;
    navamsa: Record<string, { rasi: number; rasiTamil: string }>;
    navamsaLagna: number;
    dasha: {
      balanceYears: number; balanceLord: string; balanceLordTamil: string;
      mahadashas: DashaPeriod[];
    };
    currentMd?: DashaPeriod;
    currentBhukti?: DashaBhukti;
    dosham: {
      saniDosha: { present: boolean; templeUrl: string };
      chevvaiDosha: { present: boolean; templeUrl: string };
      sarpaDosha: { present: boolean; templeUrl: string };
      papaPercent: { lagna: number; moon: number; venus: number };
    };
  };
};

const HOUR_OPTIONS = Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
const MIN_OPTIONS = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'));
// ===== Shared styles (dark spiritual theme) =====
const labelCol: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  color: '#D4C5F0', fontWeight: 500, fontSize: '14px',
  fontFamily: 'Noto Sans Tamil, sans-serif'
};
const darkInput: React.CSSProperties = {
  width: '100%', padding: '10px 14px',
  border: '1px solid #4B2A8F', borderRadius: '10px',
  background: '#1A0E3A', color: 'white',
  fontSize: '14px', fontFamily: 'Noto Sans Tamil, sans-serif', outline: 'none'
};
const sectionHeader: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '10px',
  background: '#1A0E3A', color: '#FFD700',
  padding: '14px 18px', borderRadius: '14px 14px 0 0',
  fontFamily: 'Noto Serif Tamil, serif', fontSize: '18px', fontWeight: 600,
  border: '1px solid #4B2A8F', borderBottom: 'none'
};
const sectionBody: React.CSSProperties = {
  background: '#251450', border: '1px solid #4B2A8F',
  borderTop: 'none', borderRadius: '0 0 14px 14px',
  padding: '20px', marginBottom: '24px'
};

function FieldRow({ icon, label, color, children }: { icon: string; label: string; color: string; children: React.ReactNode }) {
  return (
    <div className="field-row">
      <div style={labelCol}>
        <span style={{
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '28px', height: '28px', borderRadius: '8px',
          background: color, color: 'white', fontSize: '14px'
        }}>{icon}</span>
        <span>{label}</span>
      </div>
      <div style={{ minWidth: 0 }}>{children}</div>
    </div>
  );
}

type SavedProfile = {
  id: string;
  fullName: string;
  dob: string;
  birthTime: string;
  birthPlace: string;
  latitude: number;
  longitude: number;
  isDefault: boolean;
};

function JathagamForm({ onResult, onSavedProfileChange }: {
  onResult: (data: ChartResponse, language: string, chartStyle: string) => void;
  onSavedProfileChange?: () => void;
}) {
  const [fullName, setFullName] = useState('');
  const [dob, setDob] = useState('');
  const [hour, setHour] = useState('06');
  const [minute, setMinute] = useState('40');
  const [ampm, setAmpm] = useState<'AM' | 'PM'>('PM');
  const [gender, setGender] = useState('ஆண்');
  const [birthPlace, setBirthPlace] = useState('');
  const chartStyle = 'south';
  const language = 'ta';
  const [loading, setLoading] = useState(false);

  // Saved profiles
  const [savedProfiles, setSavedProfiles] = useState<SavedProfile[]>([]);
  const [activeProfileId, setActiveProfileId] = useState<string>('');
  const [saveToProfile, setSaveToProfile] = useState(false);

  useEffect(() => {
    api.get('/profile/list').then(r => {
      const profiles: SavedProfile[] = r.data.profiles || [];
      setSavedProfiles(profiles);
      // If a default exists, prefill the form with it.
      const def = profiles.find(p => p.isDefault) || profiles[0];
      if (def) loadProfile(def);
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadProfile = (p: SavedProfile) => {
    setActiveProfileId(p.id);
    setFullName(p.fullName);
    setDob(p.dob.slice(0, 10));
    setBirthPlace(p.birthPlace);
    setSelected({ label: p.birthPlace, latitude: p.latitude, longitude: p.longitude });
    // Parse "HH:MM" 24-hour → 12-hour + AM/PM
    const [hh, mm] = p.birthTime.split(':').map(Number);
    const ap: 'AM' | 'PM' = hh >= 12 ? 'PM' : 'AM';
    const h12 = ((hh + 11) % 12) + 1;
    setHour(String(h12).padStart(2, '0'));
    setMinute(String(mm).padStart(2, '0'));
    setAmpm(ap);
  };

  const onChooseProfile = (id: string) => {
    if (!id) {
      // "+ New profile" reset
      setActiveProfileId('');
      setFullName(''); setDob(''); setBirthPlace(''); setSelected(null);
      setHour('06'); setMinute('40'); setAmpm('PM');
      return;
    }
    const p = savedProfiles.find(x => x.id === id);
    if (p) loadProfile(p);
  };

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSugg, setShowSugg] = useState(false);
  const [selected, setSelected] = useState<Suggestion | null>(null);
  const [geoLoading, setGeoLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!birthPlace || birthPlace.length < 2 || selected?.label === birthPlace) {
      setSuggestions([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setGeoLoading(true);
      api.get(`/horoscope/geocode?place=${encodeURIComponent(birthPlace)}`)
        .then(r => {
          setSuggestions(r.data.suggestions || []);
          setShowSugg(true);
        })
        .catch(() => setSuggestions([]))
        .finally(() => setGeoLoading(false));
    }, 400);
  }, [birthPlace, selected]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!fullName || !dob || !birthPlace) {
      toast.error('அனைத்து விவரங்களும் தேவை');
      return;
    }
    let h = parseInt(hour, 10);
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    const birthTime24 = `${String(h).padStart(2, '0')}:${minute}`;

    let lat = selected?.latitude;
    let lng = selected?.longitude;
    if (lat == null || lng == null) {
      try {
        const r = await api.get(`/horoscope/geocode?place=${encodeURIComponent(birthPlace)}`);
        const first = r.data.suggestions?.[0];
        if (first) { lat = first.latitude; lng = first.longitude; }
      } catch { /* fall through */ }
    }
    if (lat == null || lng == null) {
      toast.error('இடம் கண்டுபிடிக்கவில்லை — பட்டியலில் இருந்து தேர்வு செய்யவும்');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/horoscope/generate', {
        fullName, gender, dob, birthTime: birthTime24, birthPlace,
        latitude: lat, longitude: lng, chartStyle, language,
        // Reuse existing profile if loaded; otherwise create only when user opted in.
        profileId: activeProfileId || undefined,
        saveProfile: !activeProfileId && saveToProfile
      });
      onResult(res.data as ChartResponse, language, chartStyle);
      // If a new profile was created, refresh local list + bubble up.
      if (!activeProfileId && saveToProfile && res.data.profileId) {
        const refreshed = await api.get('/profile/list').catch(() => null);
        if (refreshed) setSavedProfiles(refreshed.data.profiles || []);
        setActiveProfileId(res.data.profileId);
        onSavedProfileChange?.();
        toast.success('ஜாதகம் தயார் — சுயவிவரத்தில் சேமிக்கப்பட்டது');
      } else {
        toast.success('ஜாதகம் தயார்!');
      }
      setTimeout(() => document.getElementById('jathagam-result')?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } }).response?.data?.error || 'ஜாதகம் கணிக்கவில்லை';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{
      background: '#251450', border: '1px solid #4B2A8F', borderRadius: '20px',
      padding: '24px', marginBottom: '24px'
    }}>
      {savedProfiles.length > 0 && (
        <div className="field-row field-row-tight" style={{
          marginBottom: '20px', padding: '12px 14px',
          background: '#1A0E3A', border: '1px solid #4B2A8F', borderRadius: '12px'
        }}>
          <div style={labelCol}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              width: '28px', height: '28px', borderRadius: '8px',
              background: '#4B2A8F', color: 'white', fontSize: '14px'
            }}>📁</span>
            <span>சேமித்த சுயவிவரம்</span>
          </div>
          <select
            value={activeProfileId}
            onChange={e => onChooseProfile(e.target.value)}
            style={darkInput}
          >
            <option value="">+ புதிய சுயவிவரம் / New profile</option>
            {savedProfiles.map(p => (
              <option key={p.id} value={p.id}>
                {p.fullName} {p.isDefault ? '★' : ''} · {new Date(p.dob).toLocaleDateString('ta-IN')}
              </option>
            ))}
          </select>
        </div>
      )}

      <FieldRow icon="👤" label="முழு பெயர்" color="#FF8C00">
        <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="உங்கள் பெயர்" style={darkInput} />
      </FieldRow>

      <FieldRow icon="📅" label="பிறந்த தேதி" color="#7B1FA2">
        <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={{ ...darkInput, colorScheme: 'dark' }} />
      </FieldRow>

      <FieldRow icon="🕒" label="பிறந்த நேரம்" color="#7B1FA2">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
          <select value={hour} onChange={e => setHour(e.target.value)} style={darkInput}>
            {HOUR_OPTIONS.map(h => <option key={h} value={h}>{h}</option>)}
          </select>
          <select value={minute} onChange={e => setMinute(e.target.value)} style={darkInput}>
            {MIN_OPTIONS.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          <select value={ampm} onChange={e => setAmpm(e.target.value as 'AM' | 'PM')} style={darkInput}>
            <option value="AM">AM</option>
            <option value="PM">PM</option>
          </select>
        </div>
      </FieldRow>

      <FieldRow icon="⚥" label="பாலினம்" color="#FF8C00">
        <select value={gender} onChange={e => setGender(e.target.value)} style={darkInput}>
          <option value="ஆண்">ஆண்</option>
          <option value="பெண்">பெண்</option>
          <option value="மற்றவை">மற்றவை</option>
        </select>
      </FieldRow>

      <FieldRow icon="📍" label="பிறந்த இடம்" color="#FF8C00">
        <div style={{ position: 'relative' }}>
          <input
            value={birthPlace}
            onChange={e => { setBirthPlace(e.target.value); setSelected(null); }}
            onFocus={() => suggestions.length > 0 && setShowSugg(true)}
            onBlur={() => setTimeout(() => setShowSugg(false), 200)}
            placeholder="நகரம் — எ.கா. Coimbatore"
            style={darkInput}
            autoComplete="off"
          />
          {geoLoading && (
            <span style={{
              position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)',
              color: '#8B7BAA', fontSize: '12px', fontFamily: 'Noto Sans Tamil, sans-serif'
            }}>
              தேடுகிறது...
            </span>
          )}
          {showSugg && suggestions.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 20,
              background: '#1A0E3A', border: '1px solid #4B2A8F', borderRadius: '10px',
              marginTop: '4px', maxHeight: '260px', overflowY: 'auto',
              boxShadow: '0 6px 18px rgba(0,0,0,0.4)'
            }}>
              {suggestions.map((s, i) => (
                <div
                  key={i}
                  onMouseDown={() => {
                    setSelected(s);
                    setBirthPlace(s.label);
                    setShowSugg(false);
                  }}
                  style={{
                    padding: '10px 14px', borderBottom: '1px solid #2A1A50',
                    cursor: 'pointer', fontSize: '13px',
                    background: i === 0 ? '#2A1A50' : 'transparent',
                    color: i === 0 ? '#FFD700' : '#D4C5F0',
                    fontFamily: 'Noto Sans Tamil, sans-serif'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#32205A'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = i === 0 ? '#2A1A50' : 'transparent'; }}
                >
                  {s.label}
                </div>
              ))}
            </div>
          )}
        </div>
      </FieldRow>

      {!activeProfileId && (
        <label style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          marginTop: '14px', padding: '8px 12px',
          background: '#1A0E3A', border: '1px dashed #4B2A8F', borderRadius: '8px',
          color: '#D4C5F0', fontSize: '13px', fontFamily: 'Noto Sans Tamil, sans-serif',
          cursor: 'pointer'
        }}>
          <input
            type="checkbox"
            checked={saveToProfile}
            onChange={e => setSaveToProfile(e.target.checked)}
            style={{ accentColor: '#FFD700' }}
          />
          <span>பின்னர் பயன்படுத்த சுயவிவரத்தில் சேமி / Save as a profile for later</span>
        </label>
      )}

      <button type="submit" disabled={loading} className="btn-gold" style={{ width: '100%', opacity: loading ? 0.7 : 1, marginTop: '12px' }}>
        {loading ? 'கணிக்கிறோம்...' : (activeProfileId ? 'ஜாதகம் மீண்டும் கணிக்கவும்' : 'ஜாதகம் கணிக்கவும்')}
      </button>
    </form>
  );
}

// ============ RESULT SECTIONS (dark theme) ============

function formatYearsMonthsDays(years: number): string {
  const totalDays = years * 365.25;
  const y = Math.floor(totalDays / 365.25);
  const remAfterYears = totalDays - y * 365.25;
  const m = Math.floor(remAfterYears / 30.4375);
  const d = Math.round(remAfterYears - m * 30.4375);
  return `${y}Y ${m}M ${d}D`;
}

function darkTable<T>(rows: T[], render: (r: T, i: number) => React.ReactNode) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
            {render(r, i)}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function Section1KeyDetails({ chart }: { chart: ChartResponse['chart'] }) {
  const rows: Array<[string, string]> = [
    ['பெயர்', chart.birthInfo.fullName],
    ['பிறந்த தேதி', new Date(chart.birthInfo.dobIso).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })],
    ['பிறந்த நேரம்', chart.birthInfo.birthTime],
    ['பிறந்த இடம்', chart.birthInfo.birthPlace],
    ['அட்சரேகை', chart.birthInfo.latitude.toFixed(7)],
    ['தீர்க்க ரேகை', chart.birthInfo.longitude.toFixed(7)],
    ['லக்னம்', chart.lagna.rasiTamil],
    ['லக்னம் அதிபதி', chart.lagna.lord],
    ['ராசி', chart.rasi.nameTamil],
    ['நட்சத்திரம்', `${chart.nakshatra.nameTamil} - ${chart.nakshatra.pada} பாதம்`],
    ['திதி', chart.tithi.nameTamil],
    ['வளர்பிறை/தேய்பிறை சந்திரன்', chart.tithi.paksha],
    ['அயனாம்சம் பெயர்', chart.ayanamsaName],
    ['அயனாம்சம்', chart.ayanamsa.toFixed(10)],
    ['இருப்பு தசா', `${chart.dasha.balanceLordTamil} ${formatYearsMonthsDays(chart.dasha.balanceYears)}`]
  ];
  return (
    <div>
      <div style={sectionHeader}>👤 முக்கிய விவரங்கள்</div>
      <div style={{ ...sectionBody, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          <thead>
            <tr style={{ background: '#32205A' }}>
              <th style={{ padding: '12px 18px', color: '#FFD700', textAlign: 'left', fontWeight: 600, fontSize: '14px', width: '45%' }}>பெயர்</th>
              <th style={{ padding: '12px 18px', color: '#FFD700', textAlign: 'left', fontWeight: 600, fontSize: '14px' }}>விளக்கம்</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([k, v], i) => (
              <tr key={k} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
                <td style={{ padding: '10px 18px', color: '#D4C5F0', fontWeight: 500, fontSize: '14px' }}>{k}</td>
                <td style={{ padding: '10px 18px', color: '#FFD700', fontSize: '14px' }}>{v}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section2Charts({ chart }: { chart: ChartResponse['chart'] }) {
  return (
    <div>
      <div style={sectionHeader}>📊 ராசி கட்டம் / நவாம்சம் கட்டம்</div>
      <div style={sectionBody}>
        <HoroscopeCharts
          lagnaRasi={chart.lagna.rasi}
          planets={chart.planets}
          navamsaLagna={chart.navamsaLagna}
          navamsa={chart.navamsa}
        />
      </div>
    </div>
  );
}

function Section3Dosham({ chart }: { chart: ChartResponse['chart'] }) {
  const d = chart.dosham;
  const rows = [
    { label: 'Sani Dosha :', present: d.saniDosha.present, url: d.saniDosha.templeUrl, templeLabel: 'Saneeswaran Temples' },
    { label: 'செவ்வாய் தோஷம்', present: d.chevvaiDosha.present, url: d.chevvaiDosha.templeUrl, templeLabel: 'Mars Temples' },
    { label: 'சர்ப்ப தோஷம் :', present: d.sarpaDosha.present, url: d.sarpaDosha.templeUrl, templeLabel: 'Rahu / Ketu Temples' }
  ];
  return (
    <div>
      <div style={sectionHeader}>⚠️ தோஷம்</div>
      <div style={{ ...sectionBody, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          <thead>
            <tr style={{ background: '#32205A', color: '#FFD700' }}>
              <th style={{ padding: '12px 18px', textAlign: 'left', fontSize: '14px' }}>Dosham</th>
              <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '14px' }}>Dosham Result</th>
              <th style={{ padding: '12px 18px', textAlign: 'center', fontSize: '14px' }}>Dosham Pariharam Temple</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={r.label} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
                <td style={{ padding: '12px 18px', color: '#D4C5F0', fontWeight: 500, fontSize: '14px' }}>{r.label}</td>
                <td style={{ padding: '12px 18px', textAlign: 'center', color: r.present ? '#FF6B6B' : '#4CAF50', fontWeight: 500, fontSize: '13px' }}>
                  {r.present ? 'Dosha Present' : 'Dosha not Present'}
                </td>
                <td style={{ padding: '12px 18px', textAlign: 'center' }}>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" style={{ color: '#FFD700', textDecoration: 'underline', fontSize: '13px' }}>
                    {r.templeLabel}
                  </a>
                </td>
              </tr>
            ))}
            <tr style={{ background: '#1A0E3A' }}>
              <td style={{ padding: '12px 18px', color: '#D4C5F0', fontWeight: 500, fontSize: '14px' }}>பாப குறியீடு [லக்னம்] :</td>
              <td colSpan={2} style={{ padding: '12px 18px', textAlign: 'center', color: '#FFD700', fontSize: '14px' }}>{d.papaPercent.lagna} %</td>
            </tr>
            <tr style={{ background: '#251450' }}>
              <td style={{ padding: '12px 18px', color: '#D4C5F0', fontWeight: 500, fontSize: '14px' }}>பாப குறியீடு [சந்திரன்] :</td>
              <td colSpan={2} style={{ padding: '12px 18px', textAlign: 'center', color: '#FFD700', fontSize: '14px' }}>{d.papaPercent.moon} %</td>
            </tr>
            <tr style={{ background: '#1A0E3A' }}>
              <td style={{ padding: '12px 18px', color: '#D4C5F0', fontWeight: 500, fontSize: '14px' }}>பாப குறியீடு [சுக்கிரன்] :</td>
              <td colSpan={2} style={{ padding: '12px 18px', textAlign: 'center', color: '#FFD700', fontSize: '14px' }}>{d.papaPercent.venus} %</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section4CurrentDasha({ chart }: { chart: ChartResponse['chart'] }) {
  return (
    <div>
      <div style={sectionHeader}>🕉️ நடப்பு தசா புக்தி</div>
      <div style={sectionBody}>
        {chart.currentMd && chart.currentBhukti ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div style={{ background: '#1A0E3A', border: '1px solid #4B2A8F', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#A89BC8', fontSize: '12px', marginBottom: '6px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>நடப்பு மகா தசை</div>
              <div style={{ color: '#FFD700', fontSize: '20px', fontWeight: 700, fontFamily: 'Noto Serif Tamil, serif' }}>{chart.currentMd.lordTamil}</div>
              <div style={{ color: '#8B7BAA', fontSize: '12px', marginTop: '6px' }}>{chart.currentMd.startDate} → {chart.currentMd.endDate}</div>
            </div>
            <div style={{ background: '#1A0E3A', border: '1px solid #8B6914', borderRadius: '12px', padding: '16px' }}>
              <div style={{ color: '#A89BC8', fontSize: '12px', marginBottom: '6px', fontFamily: 'Noto Sans Tamil, sans-serif' }}>நடப்பு புக்தி</div>
              <div style={{ color: '#FF8C00', fontSize: '20px', fontWeight: 700, fontFamily: 'Noto Serif Tamil, serif' }}>{chart.currentBhukti.lordTamil}</div>
              <div style={{ color: '#8B7BAA', fontSize: '12px', marginTop: '6px' }}>{chart.currentBhukti.startDate} → {chart.currentBhukti.endDate}</div>
            </div>
          </div>
        ) : (
          <div style={{ color: '#8B7BAA' }}>நடப்பு தசை தகவல் இல்லை</div>
        )}
      </div>
    </div>
  );
}

function Section5Planets({ chart }: { chart: ChartResponse['chart'] }) {
  const order = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  return (
    <div>
      <div style={sectionHeader}>🪐 கிரக நிலைகள்</div>
      <div style={{ ...sectionBody, padding: 0, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
          <thead>
            <tr style={{ background: '#32205A', color: '#FFD700' }}>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px' }}>கிரகம்</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px' }}>ராசி</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px' }}>பாகை</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px' }}>நட்சத்திரம்</th>
              <th style={{ padding: '10px 14px', textAlign: 'left', fontSize: '13px' }}>பாதம்</th>
            </tr>
          </thead>
          <tbody>
            {order.map((p, i) => {
              const pl = chart.planets[p];
              return (
                <tr key={p} style={{ background: i % 2 === 0 ? '#1A0E3A' : '#251450' }}>
                  <td style={{ padding: '10px 14px', color: '#D4C5F0', fontWeight: 500, fontSize: '13px' }}>{pl.nameTamil} ({p})</td>
                  <td style={{ padding: '10px 14px', color: '#FFD700', fontSize: '13px' }}>{pl.rasiNameTamil}</td>
                  <td style={{ padding: '10px 14px', color: '#FF8C00', fontSize: '13px' }}>{pl.degInRasiStr}</td>
                  <td style={{ padding: '10px 14px', color: '#D4C5F0', fontSize: '13px' }}>{pl.nakshatraTamil}</td>
                  <td style={{ padding: '10px 14px', color: '#A89BC8', fontSize: '13px' }}>{pl.pada}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Section6Dasha({ chart }: { chart: ChartResponse['chart'] }) {
  const [expanded, setExpanded] = useState<string | null>(chart.currentMd?.lord || null);
  return (
    <div>
      <div style={sectionHeader}>📅 தசா புக்தி விவரங்கள் - 120 வருட பகுப்பாய்வு</div>
      <div style={sectionBody}>
        {chart.dasha.mahadashas.map(md => {
          const isOpen = expanded === md.lord;
          return (
            <div key={md.lord} style={{
              border: `1px solid ${md.isCurrent ? '#FFD700' : '#4B2A8F'}`,
              borderRadius: '10px', marginBottom: '10px',
              background: md.isCurrent ? '#2A1A50' : '#1A0E3A', overflow: 'hidden'
            }}>
              <div
                onClick={() => setExpanded(isOpen ? null : md.lord)}
                style={{
                  padding: '10px 14px', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  flexWrap: 'wrap', gap: '8px',
                  fontFamily: 'Noto Sans Tamil, sans-serif'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#FF8C00', fontSize: '12px' }}>{isOpen ? '▼' : '▶'}</span>
                  <span style={{
                    background: '#251450', color: '#FFD700', padding: '4px 14px',
                    borderRadius: '999px', fontWeight: 600, fontSize: '14px',
                    border: '1px solid #4B2A8F'
                  }}>{md.lordTamil}</span>
                  <span style={{
                    background: '#32205A', color: '#FF8C00', padding: '2px 10px',
                    borderRadius: '999px', fontSize: '11px'
                  }}>
                    {md.canonicalYears}y
                  </span>
                  {md.isCurrent && (
                    <span style={{
                      background: '#FFD700', color: '#251450', padding: '2px 10px',
                      borderRadius: '999px', fontSize: '11px', fontWeight: 600
                    }}>
                      நடப்பு
                    </span>
                  )}
                </div>
                <div style={{ color: '#A89BC8', fontSize: '12px' }}>
                  {md.startDate} to {md.endDate}
                </div>
              </div>
              {isOpen && md.bhukti && (
                <table style={{ width: '100%', borderCollapse: 'collapse', borderTop: '1px solid #4B2A8F' }}>
                  <thead>
                    <tr style={{ background: '#251450' }}>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '12px', color: '#FFD700', fontFamily: 'Noto Sans Tamil, sans-serif' }}>புக்தி</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '12px', color: '#FFD700', fontFamily: 'Noto Sans Tamil, sans-serif' }}>தொடக்கம்</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '12px', color: '#FFD700', fontFamily: 'Noto Sans Tamil, sans-serif' }}>முடிவு</th>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: '12px', color: '#FFD700', fontFamily: 'Noto Sans Tamil, sans-serif' }}>காலம்</th>
                    </tr>
                  </thead>
                  <tbody>
                    {md.bhukti.map((bh, i) => (
                      <tr key={bh.lord} style={{ background: bh.isCurrent ? '#2A1A50' : (i % 2 === 0 ? '#1A0E3A' : '#251450') }}>
                        <td style={{ padding: '8px 14px', fontSize: '13px', color: '#D4C5F0', fontFamily: 'Noto Sans Tamil, sans-serif' }}>
                          {md.lordTamil}-{bh.lordTamil}
                          {bh.isCurrent && (
                            <span style={{ marginLeft: '8px', background: '#FFD700', color: '#251450', padding: '1px 8px', borderRadius: '999px', fontSize: '10px', fontWeight: 600 }}>
                              நடப்பு
                            </span>
                          )}
                        </td>
                        <td style={{ padding: '8px 14px', fontSize: '13px', color: '#FF8C00' }}>{bh.startDate}</td>
                        <td style={{ padding: '8px 14px', fontSize: '13px', color: '#FF8C00' }}>{bh.endDate}</td>
                        <td style={{ padding: '8px 14px', fontSize: '13px', color: '#A89BC8' }}>{formatYearsMonthsDays(bh.years)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BottomActions({ chart }: { chart: ChartResponse['chart'] }) {
  const onEmail = () => {
    const subject = encodeURIComponent(`ஜாதகம் — ${chart.birthInfo.fullName}`);
    const body = encodeURIComponent(
      `பெயர்: ${chart.birthInfo.fullName}\n` +
      `பிறந்த தேதி: ${chart.birthInfo.dobIso}\n` +
      `பிறந்த இடம்: ${chart.birthInfo.birthPlace}\n` +
      `லக்னம்: ${chart.lagna.rasiTamil}\n` +
      `ராசி: ${chart.rasi.nameTamil}\n` +
      `நட்சத்திரம்: ${chart.nakshatra.nameTamil}\n` +
      `நடப்பு தசை: ${chart.currentMd?.lordTamil || '—'}`
    );
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const onPrint = () => window.print();

  const onDownload = () => {
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<!doctype html><html><head><meta charset="utf-8"><title>ஜாதகம் — ${chart.birthInfo.fullName}</title></head><body>`);
    w.document.write(document.getElementById('jathagam-result')?.innerHTML || '');
    w.document.write('</body></html>');
    w.document.close();
    setTimeout(() => w.print(), 500);
  };

  return (
    <div className="no-print" style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap', marginTop: '24px' }}>
      <button onClick={onEmail} style={{
        background: '#4B2A8F', color: 'white', border: '1px solid #4B2A8F',
        padding: '12px 24px', borderRadius: '999px', cursor: 'pointer',
        fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '14px', fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: '8px'
      }}>
        <span>✉️</span> மின் அஞ்சல்
      </button>
      <button onClick={onPrint} style={{
        background: 'transparent', color: '#FFD700', border: '1px solid #FFD700',
        padding: '12px 24px', borderRadius: '999px', cursor: 'pointer',
        fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '14px', fontWeight: 600,
        display: 'inline-flex', alignItems: 'center', gap: '8px'
      }}>
        <span>🖨️</span> அச்சு ஜாதகம்
      </button>
      <button onClick={onDownload} style={{
        background: '#FFD700', color: '#251450', border: 'none',
        padding: '12px 24px', borderRadius: '999px', cursor: 'pointer',
        fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '14px', fontWeight: 700,
        display: 'inline-flex', alignItems: 'center', gap: '8px'
      }}>
        <span>⭐</span> உங்கள் ஜாதகம் பெறுங்கள்
      </button>
    </div>
  );
}

function JathagamInner() {
  const [result, setResult] = useState<ChartResponse | null>(null);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
        <h1 style={{ fontFamily: 'Noto Serif Tamil, serif', color: '#FFD700', fontSize: '20px', margin: 0 }}>
          ஜாதக கணிப்பு
        </h1>
        <p style={{ color: '#8B7BAA', fontFamily: 'Noto Sans Tamil, sans-serif', fontSize: '12px', margin: 0 }}>
          — உங்கள் பிறப்பு விவரங்களை கொடுத்து முழு ஜாதகம் பெறுங்கள்
        </p>
      </div>

      <JathagamForm onResult={r => setResult(r)} />

      {result && (
        <div id="jathagam-result">
          <Section1KeyDetails chart={result.chart} />
          <Section2Charts chart={result.chart} />
          <Section3Dosham chart={result.chart} />
          <Section4CurrentDasha chart={result.chart} />
          <Section5Planets chart={result.chart} />
          <Section6Dasha chart={result.chart} />
          <BottomActions chart={result.chart} />
        </div>
      )}

      <style>{`
        @media print {
          .no-print { display: none !important; }
          nav, footer { display: none !important; }
          @page { margin: 8mm; }
          #jathagam-result {
            transform: scale(0.62);
            transform-origin: top left;
            width: 161%;
          }
          #jathagam-result > div {
            page-break-inside: avoid;
            break-inside: avoid;
          }
          #jathagam-result * {
            margin-top: 4px !important;
            margin-bottom: 4px !important;
            line-height: 1.3 !important;
          }
        }
      `}</style>
    </div>
  );
}

export default function JathagamPage() {
  return (
    <ProtectedRoute>
      <JathagamInner />
    </ProtectedRoute>
  );
}
