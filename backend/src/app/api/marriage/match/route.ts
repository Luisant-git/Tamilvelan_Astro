import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';
import {
  computeFullChart,
  computeDasavithaPorutham,
  computeMatchDoshams
} from '../../../../lib/astrology';

export async function POST(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, string | number>;
  const {
    brideName, brideDob, brideBirthTime, brideBirthPlace, brideLatitude, brideLongitude,
    groomName, groomDob, groomBirthTime, groomBirthPlace, groomLatitude, groomLongitude
  } = body;

  if (!brideName || !brideDob || !groomName || !groomDob) {
    return NextResponse.json({ error: 'மணமகள் மற்றும் மணமகன் விவரங்கள் தேவை' }, { status: 400 });
  }

  try {
    const brideChart = computeFullChart({
      fullName: String(brideName), gender: 'பெண்',
      dob: new Date(String(brideDob)),
      birthTime: String(brideBirthTime || '12:00'),
      birthPlace: String(brideBirthPlace || ''),
      latitude: Number(brideLatitude) || 13.0827,    // Chennai fallback
      longitude: Number(brideLongitude) || 80.2707
    });

    const groomChart = computeFullChart({
      fullName: String(groomName), gender: 'ஆண்',
      dob: new Date(String(groomDob)),
      birthTime: String(groomBirthTime || '12:00'),
      birthPlace: String(groomBirthPlace || ''),
      latitude: Number(groomLatitude) || 13.0827,
      longitude: Number(groomLongitude) || 80.2707
    });

    const porutham = computeDasavithaPorutham(
      brideChart.nakshatra.index, brideChart.planets.Moon.rasi,
      groomChart.nakshatra.index, groomChart.planets.Moon.rasi
    );

    const doshams = computeMatchDoshams(brideChart, groomChart);

    const recommendation =
      porutham.percentage >= 75 ? 'மிகச்சிறந்த பொருத்தம் — திருமணம் சிபாரிசு செய்யப்படுகிறது.' :
      porutham.percentage >= 60 ? 'நல்ல பொருத்தம் — திருமணம் பொருத்தமானது.' :
      porutham.percentage >= 45 ? 'மிதமான பொருத்தம் — ஜோதிடரிடம் ஆலோசிக்கவும்.' :
                                  'பொருத்தம் குறைவு — மேலும் ஆராய வேண்டும்.';

    const match = await prisma.marriageMatch.create({
      data: {
        userId: guard.auth.userId,
        brideName: String(brideName),
        brideDob: new Date(String(brideDob)),
        brideBirthTime: String(brideBirthTime || ''),
        brideBirthPlace: String(brideBirthPlace || ''),
        groomName: String(groomName),
        groomDob: new Date(String(groomDob)),
        groomBirthTime: String(groomBirthTime || ''),
        groomBirthPlace: String(groomBirthPlace || ''),
        porutthamJson: JSON.parse(JSON.stringify(porutham.items)),
        totalScore: porutham.totalScore
      }
    });

    const sideSummary = (chart: ReturnType<typeof computeFullChart>) => ({
      name: chart.birthInfo.fullName,
      dobIso: chart.birthInfo.dobIso,
      birthTime: chart.birthInfo.birthTime,
      birthPlace: chart.birthInfo.birthPlace,
      latitude: chart.birthInfo.latitude,
      longitude: chart.birthInfo.longitude,
      lagna: chart.lagna.rasiTamil,
      lagnaRasi: chart.lagna.rasi,
      rasi: chart.rasi.nameTamil,
      rasiNum: chart.planets.Moon.rasi,
      nakshatra: chart.nakshatra.nameTamil,
      pada: chart.nakshatra.pada,
      planets: Object.fromEntries(
        Object.entries(chart.planets).map(([k, v]) => [k, { rasi: v.rasi }])
      )
    });

    return NextResponse.json({
      matchId: match.id,
      bride: sideSummary(brideChart),
      groom: sideSummary(groomChart),
      porutthams: porutham.items,
      totalScore: porutham.totalScore,
      maxScore: porutham.maxScore,
      percentage: porutham.percentage,
      doshams,
      recommendation
    });
  } catch (err) {
    console.error('marriage/match error:', err);
    return NextResponse.json({ error: 'பொருத்தம் கணிக்கவில்லை. மீண்டும் முயற்சிக்கவும்.' }, { status: 500 });
  }
}
