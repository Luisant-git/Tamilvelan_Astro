import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const matches = await prisma.marriageMatch.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true, brideName: true, groomName: true, totalScore: true, createdAt: true,
        user: { select: { id: true, name: true, email: true } }
      }
    });
    return NextResponse.json({ matches });
  } catch {
    return NextResponse.json({ error: 'பொருத்த பட்டியல் பெற முடியவில்லை' }, { status: 500 });
  }
}
