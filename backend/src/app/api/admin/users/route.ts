import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true, name: true, email: true, mobile: true,
        isAdmin: true, createdAt: true,
        _count: {
          select: { birthProfiles: true, reports: true, consultations: true, matches: true }
        }
      }
    });
    return NextResponse.json({ users });
  } catch {
    return NextResponse.json({ error: 'பயனர் பட்டியல் பெற முடியவில்லை' }, { status: 500 });
  }
}
