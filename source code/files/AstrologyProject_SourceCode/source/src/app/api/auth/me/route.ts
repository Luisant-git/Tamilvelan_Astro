import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  try {
    const user = await prisma.user.findUnique({
      where: { id: guard.auth.userId },
      select: { id: true, name: true, email: true, mobile: true, isAdmin: true, createdAt: true }
    });
    if (!user) return NextResponse.json({ error: 'பயனர் கிடைக்கவில்லை' }, { status: 404 });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'பயனர் விவரம் பெற முடியவில்லை' }, { status: 500 });
  }
}
