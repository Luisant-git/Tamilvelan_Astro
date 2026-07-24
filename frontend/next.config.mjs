/** @type {import('next').NextConfig} */

// Same var that src/lib/api.ts uses for the actual API calls — reusing it here
// means the CSP always matches wherever the backend really is, with nothing
// to remember to edit by hand when that changes (e.g. moving to Render).
const backendOrigin = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(self), browsing-topics=()'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      // Backend now lives at a different origin than the frontend (previously
      // same-origin '/api', a single unified app) — the browser's fetch/XHR
      // calls from src/lib/api.ts need the backend's origin(s) allow-listed
      // here, or they'd be blocked by CSP even though CORS allows them.
      `connect-src 'self' https://vedastro.org https://api.prokerala.com ${backendOrigin} http://localhost:3000`,
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob:",
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; ')
  }
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
