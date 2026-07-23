import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  try {
    const charts = await prisma.horoscopeChart.findMany({
      where: { profile: { userId: guard.auth.userId } },
      orderBy: { generatedAt: 'desc' },
      take: 20,
      select: {
        id: true,
        rasi: true,
        lagna: true,
        nakshatra: true,
        dashaLord: true,
        generatedAt: true,
        profile: { select: { id: true, fullName: true, birthPlace: true, dob: true } }
      }
    });
    return NextResponse.json({ charts });
  } catch {
    return NextResponse.json({ error: 'ஜாதக வரலாறு பெற முடியவில்லை' }, { status: 500 });
  }
}
