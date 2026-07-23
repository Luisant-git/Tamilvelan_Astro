import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  const profile = await prisma.birthProfile.findUnique({ where: { id: params.id } });
  if (!profile || profile.userId !== guard.auth.userId) {
    return NextResponse.json({ error: 'பிறப்பு விவரம் கிடைக்கவில்லை' }, { status: 404 });
  }
  return NextResponse.json({ profile });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, string | number | boolean>;
  const existing = await prisma.birthProfile.findUnique({ where: { id: params.id } });
  if (!existing || existing.userId !== guard.auth.userId) {
    return NextResponse.json({ error: 'பிறப்பு விவரம் கிடைக்கவில்லை' }, { status: 404 });
  }

  // Only specific fields are updatable.
  const data: Record<string, unknown> = {};
  if (typeof body.fullName === 'string') data.fullName = body.fullName;
  if (typeof body.birthTime === 'string') data.birthTime = body.birthTime;
  if (typeof body.birthPlace === 'string') data.birthPlace = body.birthPlace;
  if (typeof body.dob === 'string') data.dob = new Date(body.dob);
  if (typeof body.latitude === 'number') data.latitude = body.latitude;
  if (typeof body.longitude === 'number') data.longitude = body.longitude;

  if (body.isDefault === true) {
    // Demote any other default, then promote this one.
    await prisma.birthProfile.updateMany({
      where: { userId: guard.auth.userId, isDefault: true, NOT: { id: existing.id } },
      data: { isDefault: false }
    });
    data.isDefault = true;
  } else if (body.isDefault === false) {
    data.isDefault = false;
  }

  const profile = await prisma.birthProfile.update({ where: { id: existing.id }, data });
  return NextResponse.json({ profile });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  try {
    const profile = await prisma.birthProfile.findUnique({ where: { id: params.id } });
    if (!profile || profile.userId !== guard.auth.userId) {
      return NextResponse.json({ error: 'பிறப்பு விவரம் கிடைக்கவில்லை' }, { status: 404 });
    }
    await prisma.horoscopeChart.deleteMany({ where: { profileId: profile.id } });
    await prisma.birthProfile.delete({ where: { id: profile.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'நீக்க முடியவில்லை' }, { status: 500 });
  }
}
