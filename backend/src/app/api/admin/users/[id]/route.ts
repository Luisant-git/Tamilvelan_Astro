import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAdmin } from '../../../../../lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as { isAdmin?: boolean };
  try {
    const user = await prisma.user.update({
      where: { id: params.id },
      data: { isAdmin: !!body.isAdmin },
      select: { id: true, isAdmin: true }
    });
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ error: 'புதுப்பிக்க முடியவில்லை' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  if (params.id === guard.auth.userId) {
    return NextResponse.json({ error: 'உங்கள் சொந்த கணக்கை நீக்க முடியாது' }, { status: 400 });
  }

  try {
    await prisma.horoscopeChart.deleteMany({ where: { profile: { userId: params.id } } });
    await prisma.birthProfile.deleteMany({ where: { userId: params.id } });
    await prisma.marriageMatch.deleteMany({ where: { userId: params.id } });
    await prisma.report.deleteMany({ where: { userId: params.id } });
    await prisma.consultation.deleteMany({ where: { userId: params.id } });
    await prisma.payment.deleteMany({ where: { userId: params.id } });
    await prisma.user.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'நீக்க முடியவில்லை' }, { status: 500 });
  }
}
