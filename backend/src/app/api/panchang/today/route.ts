import { NextRequest, NextResponse } from 'next/server';

const TITHI = [
  'பிரதமை', 'துவிதியை', 'திருதியை', 'சதுர்த்தி', 'பஞ்சமி',
  'சஷ்டி', 'சப்தமி', 'அஷ்டமி', 'நவமி', 'தசமி',
  'ஏகாதசி', 'துவாதசி', 'திரயோதசி', 'சதுர்தசி', 'அமாவாசை / பூர்ணிமை'
];

const VARAM = [
  'ஞாயிற்றுக்கிழமை', 'திங்கட்கிழமை', 'செவ்வாய்க்கிழமை',
  'புதன்கிழமை', 'வியாழக்கிழமை', 'வெள்ளிக்கிழமை', 'சனிக்கிழமை'
];

const NAKSHATRA = [
  'அஸ்வினி', 'பரணி', 'கார்த்திகை', 'ரோகிணி', 'மிருகசீரிடம்',
  'திருவாதிரை', 'புனர்பூசம்', 'பூசம்', 'ஆயில்யம்', 'மகம்',
  'பூரம்', 'உத்திரம்', 'அஸ்தம்', 'சித்திரை', 'சுவாதி',
  'விசாகம்', 'அனுஷம்', 'கேட்டை', 'மூலம்', 'பூராடம்',
  'உத்திராடம்', 'திருவோணம்', 'அவிட்டம்', 'சதயம்',
  'பூரட்டாதி', 'உத்திரட்டாதி', 'ரேவதி'
];

const KARANA = ['பாலவம்', 'கௌலவம்', 'தைதிலம்', 'கரஜம்', 'வணிஜம்', 'விஷ்டி', 'சகுனி'];
const YOGA = ['சித்தி', 'விஷ்கம்பம்', 'பிரீதி', 'ஆயுஷ்மான்', 'சௌபாக்யம்', 'சோபனம்', 'அதிகண்டம்'];

const RAHU_KALAM: Record<number, string> = {
  0: '04:30 PM - 06:00 PM', 1: '07:30 AM - 09:00 AM', 2: '03:00 PM - 04:30 PM',
  3: '12:00 PM - 01:30 PM', 4: '01:30 PM - 03:00 PM', 5: '10:30 AM - 12:00 PM',
  6: '09:00 AM - 10:30 AM'
};

const YAMAGANDAM: Record<number, string> = {
  0: '12:00 PM - 01:30 PM', 1: '10:30 AM - 12:00 PM', 2: '09:00 AM - 10:30 AM',
  3: '07:30 AM - 09:00 AM', 4: '06:00 AM - 07:30 AM', 5: '03:00 PM - 04:30 PM',
  6: '01:30 PM - 03:00 PM'
};

// Gowri Nalla Neram by weekday (morning + evening windows — heuristic).
const GOWRI: Record<number, { morning: string; evening: string }> = {
  0: { morning: '10:30 - 11:30', evening: '06:30 - 07:30' },
  1: { morning: '09:00 - 10:00', evening: '05:00 - 06:00' },
  2: { morning: '07:30 - 08:30', evening: '03:30 - 04:30' },
  3: { morning: '10:30 - 11:30', evening: '06:30 - 07:30' },
  4: { morning: '09:00 - 10:00', evening: '05:00 - 06:00' },
  5: { morning: '07:30 - 08:30', evening: '03:30 - 04:30' },
  6: { morning: '06:00 - 07:00', evening: '02:00 - 03:00' }
};

const NALLA_NERAM: Record<number, { morning: string; evening: string }> = {
  0: { morning: '08:00 - 09:00', evening: '03:00 - 04:00' },
  1: { morning: '09:30 - 10:30', evening: '04:30 - 05:30' },
  2: { morning: '07:00 - 08:00', evening: '02:00 - 03:00' },
  3: { morning: '09:30 - 10:30', evening: '04:30 - 05:30' },
  4: { morning: '08:00 - 09:00', evening: '03:00 - 04:00' },
  5: { morning: '10:30 - 11:30', evening: '05:30 - 06:30' },
  6: { morning: '06:30 - 07:30', evening: '01:30 - 02:30' }
};

const SPECIAL_DAYS: Record<string, string> = {
  '01-01': 'புத்தாண்டு தினம்',
  '01-26': 'குடியரசு தினம்',
  '03-08': 'சர்வதேச மகளிர் தினம்',
  '05-01': 'தொழிலாளர் தினம்',
  '05-20': 'உலக அளவியல் தினம், உலக தேனீக்கள் தினம்',
  '06-05': 'உலக சுற்றுச்சூழல் தினம்',
  '06-21': 'சர்வதேச யோகா தினம்',
  '08-15': 'சுதந்திர தினம்',
  '10-02': 'காந்தி ஜெயந்தி'
};

function parseDate(s: string | null): Date {
  if (!s) return new Date();
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return new Date();
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get('date');
  const d = parseDate(dateParam);

  const dayOfWeek = d.getDay();
  const dayOfMonth = d.getDate();
  const monthOfYear = d.getMonth();
  const tithiIndex = (dayOfMonth - 1) % 15;
  const nakshatraIndex = (dayOfMonth * 3 + monthOfYear) % 27;
  const karanaIndex = (dayOfMonth + monthOfYear) % KARANA.length;
  const yogaIndex = (dayOfMonth * 2 + monthOfYear) % YOGA.length;

  const mmdd = `${String(monthOfYear + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`;

  return NextResponse.json({
    date: `${String(dayOfMonth).padStart(2, '0')}-${String(monthOfYear + 1).padStart(2, '0')}-${d.getFullYear()}`,
    isoDate: `${d.getFullYear()}-${String(monthOfYear + 1).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`,
    varam: VARAM[dayOfWeek],
    tithi: TITHI[tithiIndex],
    nakshatra: NAKSHATRA[nakshatraIndex],
    yoga: YOGA[yogaIndex],
    karana: KARANA[karanaIndex],
    rahuKalam: RAHU_KALAM[dayOfWeek],
    yamagandam: YAMAGANDAM[dayOfWeek],
    shubhaMuhurtham: '09:00 AM - 10:30 AM',
    sunrise: '05:53',
    sunset: '06:18',
    nallaNeram: NALLA_NERAM[dayOfWeek],
    gowriNeram: GOWRI[dayOfWeek],
    specialDay: SPECIAL_DAYS[mmdd] || ''
  });
}
