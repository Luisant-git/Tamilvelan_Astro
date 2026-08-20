import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { signToken, verifyOtp } from '../../../../lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { identifier, otp } = body as Record<string, string>;
  const id = (identifier || '').trim();

  const errors: { field: string; msg: string }[] = [];
  const isEmail = EMAIL_RE.test(id);
  const isMobile = MOBILE_RE.test(id);
  if (!id) errors.push({ field: 'identifier', msg: 'மின்னஞ்சல் அல்லது மொபைல் எண் தேவை' });
  else if (!isEmail && !isMobile) errors.push({ field: 'identifier', msg: 'சரியான மின்னஞ்சல் அல்லது 10-இலக்க மொபைல் எண் தேவை' });
  if (!otp) errors.push({ field: 'otp', msg: 'OTP தேவை' });
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  if (!verifyOtp(otp)) {
    return NextResponse.json({ error: 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findFirst({
      where: isEmail ? { email: id } : { mobile: id }
    });
    if (!user) {
      return NextResponse.json({ error: 'இந்த மின்னஞ்சல்/மொபைலுக்கு கணக்கு இல்லை.' }, { status: 404 });
    }

    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });
    return NextResponse.json({
      message: 'வரவேற்கிறோம்!',
      token,
      user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'உள்நுழைவு தோல்வியடைந்தது.' }, { status: 500 });
  }
}
