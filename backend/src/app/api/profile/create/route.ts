import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const guard = requireAuth(req);
  if (!guard.ok) return guard.response;

  const body = (await req.json().catch(() => ({}))) as Record<string, string | number | boolean>;
  const { fullName, dob, birthTime, birthPlace, latitude, longitude, isDefault } = body;

  if (!fullName || !dob || !birthTime || !birthPlace) {
    return NextResponse.json({ error: 'பெயர், தேதி, நேரம், இடம் தேவை' }, { status: 400 });
  }

  try {
    if (isDefault) {
      await prisma.birthProfile.updateMany({
        where: { userId: guard.auth.userId, isDefault: true },
        data: { isDefault: false }
      });
    }

    const profile = await prisma.birthProfile.create({
      data: {
        userId: guard.auth.userId,
        fullName: fullName as string,
        dob: new Date(dob as string),
        birthTime: birthTime as string,
        birthPlace: birthPlace as string,
        latitude: Number(latitude) || 0,
        longitude: Number(longitude) || 0,
        isDefault: Boolean(isDefault)
      }
    });
    return NextResponse.json({ profile }, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'பிறப்பு விவரம் சேமிக்க முடியவில்லை' }, { status: 500 });
  }
}
