import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, string>;
  const { astrologerId, date, timeSlot } = body;

  if (!astrologerId || !date || !timeSlot) {
    return NextResponse.json(
      { error: 'ஜோதிடர், தேதி மற்றும் நேரம் தேவை / astrologerId, date and timeSlot required' },
      { status: 400 }
    );
  }

  const astrologer = await prisma.astrologer.findUnique({ where: { id: astrologerId } });
  if (!astrologer || !astrologer.available) {
    return NextResponse.json({ error: 'ஜோதிடர் கிடைக்கவில்லை' }, { status: 404 });
  }

  // Reject obvious double-bookings of the same astrologer + slot.
  const target = new Date(date);
  if (Number.isNaN(target.getTime())) {
    return NextResponse.json({ error: 'தவறான தேதி' }, { status: 400 });
  }
  const clash = await prisma.consultation.findFirst({
    where: { astrologerId, date: target, timeSlot, status: { not: 'CANCELLED' } }
  });
  if (clash) {
    return NextResponse.json(
      { error: 'அந்த நேரம் ஏற்கனவே பதிவாகியுள்ளது. வேறு நேரம் தேர்வு செய்யவும்.' },
      { status: 409 }
    );
  }

  const consultation = await prisma.consultation.create({
    data: {
      userId: guard.auth.userId,
      astrologerId,
      date: target,
      timeSlot,
      status: 'PENDING'
    }
  });

  return NextResponse.json({
    message: 'ஆலோசனை பதிவு வெற்றி. விரைவில் தொடர்பு கொள்ளப்படும்.',
    booking: {
      id: consultation.id,
      astrologerName: astrologer.name,
      date: consultation.date,
      timeSlot: consultation.timeSlot,
      status: consultation.status
    }
  });
}
