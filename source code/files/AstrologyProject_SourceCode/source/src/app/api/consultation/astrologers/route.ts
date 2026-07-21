import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// Default seed astrologers used when the DB is empty. Auto-seeded on first call
// so the booking flow is demoable without manual setup.
const SEED = [
  {
    name: 'பண்டிட் ராமசாமி சாஸ்திரிகள்',
    specialization: 'ஜாதகம் / திருமண பொருத்தம்',
    experienceYrs: 32,
    ratePerHour: 1500,
    bio: 'காஞ்சிபுரம் வாசி. வேதக் கணிதம் மற்றும் தென்னிந்திய ஜோதிட முறை வல்லுநர். 30+ ஆண்டுகள் ஜாதக ஆலோசனை அனுபவம்.',
    photoUrl: null
  },
  {
    name: 'ஸ்ரீமதி கௌரி அம்மாள்',
    specialization: 'விரத ஆலோசனை / பரிகாரம்',
    experienceYrs: 24,
    ratePerHour: 1200,
    bio: 'மதுரை. நாள், திதி, விரத பரிகாரம், கோயில் வழிபாட்டு ஆலோசனை. பெண்களுக்கான குடும்ப ஜோதிட வழிகாட்டுதல்.',
    photoUrl: null
  },
  {
    name: 'ஜோதிட சிரோமணி கணேசன்',
    specialization: 'வாஸ்து / எண் கணிதம்',
    experienceYrs: 18,
    ratePerHour: 1000,
    bio: 'கோயம்புத்தூர். வீடு / வியாபார வாஸ்து சீரமைப்பு, பெயர் எண் கணிதம், மற்றும் பஞ்ச பட்சி சாஸ்திர ஆய்வாளர்.',
    photoUrl: null
  },
  {
    name: 'திரு. வேலாயுதம் பிள்ளை',
    specialization: 'தசா புக்தி / நாடி ஜோதிடம்',
    experienceYrs: 40,
    ratePerHour: 2000,
    bio: 'வைத்தீஸ்வரன் கோயில். பரம்பரை நாடி ஜோதிட வம்சாவளி, 40 ஆண்டுகள் தசை-புக்தி பகுப்பாய்வு அனுபவம்.',
    photoUrl: null
  }
];

async function ensureSeeded() {
  const count = await prisma.astrologer.count();
  if (count > 0) return;
  await prisma.astrologer.createMany({
    data: SEED.map(s => ({ ...s, available: true }))
  });
}

export async function GET() {
  try {
    await ensureSeeded();
    const astrologers = await prisma.astrologer.findMany({
      where: { available: true },
      orderBy: { experienceYrs: 'desc' }
    });
    return NextResponse.json(astrologers);
  } catch {
    return NextResponse.json([]);
  }
}
