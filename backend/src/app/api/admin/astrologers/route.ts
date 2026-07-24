import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { requireAdmin } from '../../../../lib/auth';

export async function GET(req: NextRequest) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  try {
    const astrologers = await prisma.astrologer.findMany({ orderBy: { name: 'asc' } });
    return NextResponse.json({ astrologers });
  } catch {
    return NextResponse.json({ error: 'பட்டியல் பெற முடியவில்லை' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const guard = requireAdmin(req);
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, string | number | boolean>;
  if (!body.name || !body.specialization) {
    return NextResponse.json({ error: 'பெயர் மற்றும் சிறப்பு துறை தேவை' }, { status: 400 });
  }

  try {
    const astrologer = await prisma.astrologer.create({
      data: {
        name: String(body.name),
        specialization: String(body.specialization),
        experienceYrs: Number(body.experienceYrs) || 0,
        ratePerHour: Number(body.ratePerHour) || 0,
        bio: body.bio ? String(body.bio) : null,
        photoUrl: body.photoUrl ? String(body.photoUrl) : null,
        available: body.available !== false
      }
    });
    return NextResponse.json({ astrologer }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'சேர்க்க முடியவில்லை' }, { status: 500 });
  }
}
