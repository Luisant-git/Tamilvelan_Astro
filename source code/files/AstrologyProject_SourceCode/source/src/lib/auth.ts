import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

export type AuthPayload = { userId: string; isAdmin: boolean };

// Dev-mode fixed OTP. Replace with a real SMS/email gateway before production.
export const DEV_OTP = '1234';

export function verifyOtp(otp: string | undefined | null): boolean {
  return typeof otp === 'string' && otp.trim() === DEV_OTP;
}

export function signToken(payload: AuthPayload): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET is not configured');
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(payload, secret, { expiresIn } as jwt.SignOptions);
}

export function verifyToken(token: string): AuthPayload | null {
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) return null;
    return jwt.verify(token, secret) as AuthPayload;
  } catch {
    return null;
  }
}

export function getAuthFromRequest(req: NextRequest): AuthPayload | null {
  const header = req.headers.get('authorization');
  if (!header || !header.startsWith('Bearer ')) return null;
  return verifyToken(header.slice(7));
}

export function requireAuth(req: NextRequest):
  | { ok: true; auth: AuthPayload }
  | { ok: false; response: NextResponse } {
  const auth = getAuthFromRequest(req);
  if (!auth) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'அங்கீகாரம் தேவை. உள்நுழையவும்.' }, { status: 401 })
    };
  }
  return { ok: true, auth };
}

export function requireAdmin(req: NextRequest):
  | { ok: true; auth: AuthPayload }
  | { ok: false; response: NextResponse } {
  const result = requireAuth(req);
  if (!result.ok) return result;
  if (!result.auth.isAdmin) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'நிர்வாகி அனுமதி மட்டுமே.' }, { status: 403 })
    };
  }
  return result;
}
