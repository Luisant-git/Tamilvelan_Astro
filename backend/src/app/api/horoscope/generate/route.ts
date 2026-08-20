import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';
import { computeFullChart } from '../../../../lib/astrology';

export async function POST(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  const body = await req.json().catch(() => ({}));
  const {
    fullName,
    gender,
    dob,
    birthTime,
    birthPlace,
    latitude,
    longitude,
    timezoneOffsetHours,
    chartStyle,
    language,
    profileId,
    saveProfile
  } = body as Record<string, string | number | boolean>;

  if (!fullName || !dob || !birthTime || !birthPlace) {
    return NextResponse.json(
      { error: 'பெயர், பிறந்த தேதி, நேரம், இடம் அனைத்தும் தேவை' },
      { status: 400 }
    );
  }

  try {
    const chart = computeFullChart({
      fullName: String(fullName),
      gender: String(gender || 'ஆண்'),
      dob: new Date(String(dob)),
      birthTime: String(birthTime),
      birthPlace: String(birthPlace),
      latitude: Number(latitude) || 0,
      longitude: Number(longitude) || 0,
      timezoneOffsetHours: timezoneOffsetHours !== undefined ? Number(timezoneOffsetHours) : 5.5
    });

    // Resolve target profile: prefer an explicit profileId (must belong to user);
    // otherwise create one only when saveProfile is truthy.
    let profile = null as null | { id: string };
    if (profileId) {
      const existing = await prisma.birthProfile.findUnique({ where: { id: String(profileId) } });
      if (!existing || existing.userId !== guard.auth.userId) {
        return NextResponse.json({ error: 'பிறப்பு விவரம் கிடைக்கவில்லை' }, { status: 404 });
      }
      profile = existing;
    } else if (saveProfile) {
      profile = await prisma.birthProfile.create({
        data: {
          userId: guard.auth.userId,
          fullName: String(fullName),
          dob: new Date(String(dob)),
          birthTime: String(birthTime),
          birthPlace: String(birthPlace),
          latitude: Number(latitude) || 0,
          longitude: Number(longitude) || 0,
          isDefault: false
        }
      });
    }

    // If no profile was selected/created, return chart only (no chart history record).
    if (!profile) {
      return NextResponse.json({
        success: true,
        chart,
        meta: { chartStyle: chartStyle || 'south', language: language || 'ta' }
      });
    }
    const profileObj = profile;

    const dbChart = await prisma.horoscopeChart.create({
      data: {
        profileId: profileObj.id,
        rasi: chart.rasi.nameTamil,
        lagna: chart.lagna.rasiTamil,
        nakshatra: chart.nakshatra.nameTamil,
        dashaLord: chart.currentMd?.lordTamil || chart.dasha.balanceLordTamil,
        dashaEnd: chart.currentMd ? new Date(chart.currentMd.endDate) : null,
        planetsJson: JSON.parse(JSON.stringify(chart.planets))
      }
    });

    return NextResponse.json({
      success: true,
      profileId: profileObj.id,
      chartId: dbChart.id,
      chart,
      meta: { chartStyle: chartStyle || 'south', language: language || 'ta' }
    });
  } catch (err) {
    console.error('generate error:', err);
    return NextResponse.json({ error: 'ஜாதகம் உருவாக்குவதில் பிழை.' }, { status: 500 });
  }
}
