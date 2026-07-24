import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../../../lib/prisma';
import { signToken, verifyOtp } from '../../../../lib/auth';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

// Sentinel value stored in the (non-nullable) passwordHash column for OTP-only users.
// bcrypt.compare will never match this, so the legacy password-login path is closed.
const OTP_ONLY_HASH = 'otp-only';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { name, email, mobile, otp } = body as Record<string, string>;

  const errors: { field: string; msg: string }[] = [];
  if (!name) errors.push({ field: 'name', msg: 'பெயர் தேவை' });
  if (!email || !EMAIL_RE.test(email)) errors.push({ field: 'email', msg: 'சரியான மின்னஞ்சல் தேவை' });
  if (!mobile || !MOBILE_RE.test(mobile)) errors.push({ field: 'mobile', msg: 'சரியான மொபைல் எண் தேவை' });
  if (!otp) errors.push({ field: 'otp', msg: 'OTP தேவை' });
  if (errors.length) return NextResponse.json({ errors }, { status: 400 });

  if (!verifyOtp(otp)) {
    return NextResponse.json({ error: 'தவறான OTP. மீண்டும் முயற்சிக்கவும்.' }, { status: 401 });
  }

  try {
    const existing = await prisma.user.findFirst({ where: { OR: [{ email }, { mobile }] } });
    if (existing) {
      return NextResponse.json(
        { error: 'இந்த மின்னஞ்சல் அல்லது மொபைல் ஏற்கனவே பதிவாகியுள்ளது.' },
        { status: 409 }
      );
    }

    const user = await prisma.user.create({
      data: { name, email, mobile, passwordHash: OTP_ONLY_HASH }
    });
    const token = signToken({ userId: user.id, isAdmin: user.isAdmin });

    return NextResponse.json(
      {
        message: 'பதிவு வெற்றிகரமாக முடிந்தது!',
        token,
        user: { id: user.id, name: user.name, email: user.email, isAdmin: user.isAdmin }
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'பதிவு தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.' }, { status: 500 });
  }
}
