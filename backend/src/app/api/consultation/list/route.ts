import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAuth } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  const rows = await prisma.consultation.findMany({
    where: { userId: guard.auth.userId },
    orderBy: { createdAt: 'desc' },
    include: { astrologer: { select: { name: true } } }
  });

  const bookings = rows.map(r => ({
    id: r.id,
    astrologerName: r.astrologer.name,
    date: r.date,
    timeSlot: r.timeSlot,
    status: r.status,
    createdAt: r.createdAt
  }));

  return NextResponse.json({ bookings });
}
