# தமிழ்வேலன் / TamilVelan — Backend

Backend API for the Tamil astrology application — Next.js 14 App Router used purely for its API route handlers (no pages), backed by Prisma + PostgreSQL. Split out from a previously-unified frontend+backend project; the [frontend/](../frontend) is now a separate, independently deployable project that calls this one over HTTP.

## Stack

- **Next.js 14** (App Router) — API routes only, no pages
- **TypeScript**
- **Prisma** + **PostgreSQL** for persistence
- **JWT** (jsonwebtoken) for stateless `Authorization: Bearer <jwt>` auth (no cookies/sessions)
- **axios** (used server-side for outbound geocoding calls)

## Project layout

```
backend/
├── prisma/
│   ├── schema.prisma        # DB models (User, BirthProfile, HoroscopeChart, ...)
│   ├── migrations/
│   └── seed.ts
├── src/
│   ├── middleware.ts         # CORS + rate-limiting for /api/*
│   ├── lib/
│   │   ├── prisma.ts         # Prisma client singleton
│   │   ├── auth.ts           # JWT sign/verify, Bearer-token guards
│   │   └── astrology.ts      # Chart computation (Vedic astrology math, dasha, dosham, porutham)
│   └── app/api/              # All route handlers
│       ├── auth/{login,register,me}/route.ts
│       ├── horoscope/{generate,geocode,daily/[rasi],history}/route.ts
│       ├── marriage/{match,history}/route.ts
│       ├── kadhal/match/route.ts
│       ├── panchang/today/route.ts
│       ├── consultation/{astrologers,book,list}/route.ts
│       ├── profile/{create,list,[id]}/route.ts
│       ├── reports/list/route.ts
│       ├── admin/{stats,charts,matches,astrologers,users}/route.ts
│       └── health/route.ts
└── package.json
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from the template and fill in real values
cp .env.example .env

# 3. Generate Prisma client and apply migrations
npm run db:generate
npm run db:migrate

# 4. Start the dev server
npm run dev
```

Runs at **http://localhost:3000**.

## Deploying (Render)

`npm start` runs `next start`, which binds to whatever `next start` here defaults to — but Render always injects its own `$PORT` env var, and `next start` reads `process.env.PORT` natively whenever no `-p` flag is passed, so Render's dynamic port assignment just works. Locally (no `$PORT` set) it falls back to Next's own default, 3000, matching `npm run dev`. Set all the env vars from `.env.example` in Render's dashboard, plus `DATABASE_URL` pointed at a real PostgreSQL instance. Build command: `npm install && npm run db:generate && npm run build`. Start command: `npm start`.

## Environment variables

See [.env.example](.env.example).

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Token signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `VEDASTRO_API_URL` | External chart API (optional — local fallback used otherwise) |
| `GOOGLE_MAPS_API_KEY` | Geocoding for birthplace → lat/lng |
| `CORS_ALLOWED_ORIGINS` | Comma-separated extra allowed origins for the frontend, beyond localhost/LAN-IP (already auto-allowed) |
| `RAZORPAY_*`, `TWILIO_*`, `AWS_*` | Payments, SMS, S3 (used by report/payment flows) |

## API surface

All routes are under `/api`. Auth-protected routes expect `Authorization: Bearer <jwt>`.

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/health` | — |
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| GET | `/api/auth/me` | user |
| POST | `/api/horoscope/generate` | user |
| GET | `/api/horoscope/geocode?place=...` | — |
| GET | `/api/horoscope/daily/[rasi]` | — |
| GET | `/api/horoscope/history` | user |
| POST | `/api/marriage/match` | user |
| GET | `/api/marriage/history` | user |
| POST | `/api/kadhal/match` | — |
| GET | `/api/panchang/today` | — |
| GET | `/api/consultation/astrologers` | — |
| POST | `/api/consultation/book` | user |
| GET | `/api/consultation/list` | user |
| GET | `/api/reports/list` | user |
| GET | `/api/admin/stats` | admin |

## CORS

`src/middleware.ts` already auto-allows any `localhost`/private-LAN-IP origin at any port (covers local frontend dev and Expo web/device testing). For a frontend deployed elsewhere, add its origin to `CORS_ALLOWED_ORIGINS` (comma-separated).

## Process management (pm2)

`ecosystem.config.js` (in this folder) defines both this app (`jothidam-backend`, port 3000) and the sibling `frontend/` app (`jothidam-frontend`, port 3001) as pm2 apps — one file, two entries, since they're deployed together on this host. Start both with:

```bash
pm2 start ecosystem.config.js
pm2 save   # persist the process list, or a pm2/daemon restart will forget it
```

## Notes

- Chart math in `src/lib/astrology.ts` currently uses a deterministic placeholder for `calculatePlanetsLocal` — wire in `swisseph` or the VedAstro API for production-grade calculations.
- Admin access: flip `isAdmin` on a user row in the DB (no public registration path grants admin).
- Mobile app (`AstrologyMobileApp/JothidamUserApp`) calls this same API — kept on port 3000 specifically so its built APK's hardcoded backend URL didn't need to change.
