import { NextRequest, NextResponse } from 'next/server';

// CORS allow-list. Browser-based clients (Expo web, the website itself) are
// same-origin or need an explicit Access-Control-Allow-Origin to read a
// response at all — native iOS/Android HTTP clients ignore this entirely.
// Dev origins (localhost / private LAN IPs, any port) are allowed
// automatically so Expo web and LAN-IP device testing work without editing
// this file per machine. Additional production origins can be added via the
// CORS_ALLOWED_ORIGINS env var (comma-separated, e.g.
// "https://app.example.com,https://www.example.com") without code changes.
const DEV_ORIGIN_RE = /^https?:\/\/(localhost|127\.0\.0\.1|192\.168\.\d{1,3}\.\d{1,3}|10\.\d{1,3}\.\d{1,3}\.\d{1,3}|172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3})(:\d+)?$/;

const EXTRA_ALLOWED_ORIGINS = (process.env.CORS_ALLOWED_ORIGINS ?? '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

function getAllowedOrigin(req: NextRequest): string | null {
  const origin = req.headers.get('origin');
  if (!origin) return null;
  if (DEV_ORIGIN_RE.test(origin) || EXTRA_ALLOWED_ORIGINS.includes(origin)) {
    return origin;
  }
  return null;
}

function withCors(res: NextResponse, req: NextRequest): NextResponse {
  const allowedOrigin = getAllowedOrigin(req);
  if (allowedOrigin) {
    res.headers.set('Access-Control-Allow-Origin', allowedOrigin);
    res.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.headers.set('Vary', 'Origin');
  }
  return res;
}

// In-memory rate limit store (per-IP, resets on restart)
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

const RATE_LIMITS: Record<string, { limit: number; windowMs: number }> = {
  '/api/auth/login':    { limit: 10,  windowMs: 15 * 60 * 1000 }, // 10 tries / 15 min
  '/api/auth/register': { limit: 5,   windowMs: 60 * 60 * 1000 }, // 5 tries / hour
  '/api/':              { limit: 100, windowMs: 60 * 1000 },       // 100 req / min general
};

function getIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '127.0.0.1'
  );
}

function checkRateLimit(ip: string, path: string): boolean {
  const ruleKey = Object.keys(RATE_LIMITS).find(k => path.startsWith(k)) ?? '/api/';
  const rule = RATE_LIMITS[ruleKey];
  if (!rule) return true;

  const key = `${ip}:${ruleKey}`;
  const now = Date.now();
  const entry = rateLimitMap.get(key);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(key, { count: 1, resetAt: now + rule.windowMs });
    return true;
  }

  entry.count += 1;
  if (entry.count > rule.limit) return false;
  return true;
}

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Browser preflight — answer directly, before rate-limiting/UA checks
  // (preflights are automatic, not user actions, and shouldn't burn quota).
  if (pathname.startsWith('/api/') && req.method === 'OPTIONS') {
    return withCors(new NextResponse(null, { status: 204 }), req);
  }

  // Only rate-limit API routes
  if (pathname.startsWith('/api/')) {
    const ip = getIp(req);
    const allowed = checkRateLimit(ip, pathname);

    if (!allowed) {
      return withCors(new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': '60',
          }
        }
      ), req);
    }
  }

  const res = NextResponse.next();

  // Block requests with suspicious headers
  const userAgent = req.headers.get('user-agent') ?? '';
  if (!userAgent && pathname.startsWith('/api/')) {
    return withCors(new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' }
    }), req);
  }

  return withCors(res, req);
}

export const config = {
  matcher: ['/api/:path*'],
};
