import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../../lib/prisma';
import { requireAdmin } from '../../../../../lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, string | number | boolean | null>;
  const data: Record<string, string | number | boolean | null> = {};
  if (body.name !== undefined) data.name = String(body.name);
  if (body.specialization !== undefined) data.specialization = String(body.specialization);
  if (body.experienceYrs !== undefined) data.experienceYrs = Number(body.experienceYrs);
  if (body.ratePerHour !== undefined) data.ratePerHour = Number(body.ratePerHour);
  if (body.bio !== undefined) data.bio = body.bio === null ? null : String(body.bio);
  if (body.photoUrl !== undefined) data.photoUrl = body.photoUrl === null ? null : String(body.photoUrl);
  if (body.available !== undefined) data.available = !!body.available;

  try {
    const astrologer = await prisma.astrologer.update({ where: { id: params.id }, data });
    return NextResponse.json({ astrologer });
  } catch {
    return NextResponse.json({ error: 'புதுப்பிக்க முடியவில்லை' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    await prisma.consultation.deleteMany({ where: { astrologerId: params.id } });
    await prisma.astrologer.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'நீக்க முடியவில்லை' }, { status: 500 });
  }
}
