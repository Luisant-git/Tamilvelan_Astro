import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  try {
    const profiles = await prisma.birthProfile.findMany({
      where: { userId: guard.auth.userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        dob: true,
        birthTime: true,
        birthPlace: true,
        latitude: true,
        longitude: true,
        isDefault: true,
        createdAt: true
      }
    });
    return NextResponse.json({ profiles });
  } catch {
    return NextResponse.json({ error: 'பிறப்பு விவரங்கள் பெற முடியவில்லை' }, { status: 500 });
  }
}
