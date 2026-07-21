import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  try {
    const matches = await prisma.marriageMatch.findMany({
      where: { userId: guard.auth.userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        brideName: true,
        groomName: true,
        totalScore: true,
        createdAt: true
      }
    });
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ error: 'பொருத்த வரலாறு பெற முடியவில்லை' }, { status: 500 });
  }
}
