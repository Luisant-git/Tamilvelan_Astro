# தமிழ்வேலன் / TamilVelan — Viyazhan Jothidam

Unified Tamil astrology web application built as a single Next.js 14 (App Router) project — frontend pages and backend API routes live in the same codebase.

## Stack

- **Next.js 14** (App Router) — both UI and API routes
- **React 18** + **TypeScript**
- **Tailwind CSS** for styling (plus inline styles for Tamil typography accents)
- **Prisma** + **PostgreSQL** for persistence
- **JWT** (jsonwebtoken) + **bcryptjs** for auth
- **react-hot-toast**, **lucide-react**, **axios** for UX

## Project layout

```
source/
├── prisma/schema.prisma       # DB models (User, BirthProfile, HoroscopeChart, ...)
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout (AuthProvider + Navbar + Footer)
│   │   ├── page.tsx           # Home (rasi picker + features)
│   │   ├── jathagam/          # Horoscope generator
│   │   ├── porutham/          # 10-porutham marriage matching
│   │   ├── kadhal/            # Love match by names
│   │   ├── panchang/          # Today's panchang
│   │   ├── ariggai/           # Paid PDF reports listing (protected)
│   │   ├── aalosanai/         # Astrologer consultation booking (protected)
│   │   ├── admin/             # Admin dashboard (admin-only)
│   │   ├── login/             # Login form
│   │   ├── register/          # Sign-up form
│   │   └── api/               # Backend route handlers
│   │       ├── auth/{login,register}/route.ts
│   │       ├── horoscope/{generate,geocode,daily/[rasi]}/route.ts
│   │       ├── marriage/match/route.ts
│   │       ├── kadhal/match/route.ts
│   │       ├── panchang/today/route.ts
│   │       ├── consultation/{astrologers,book}/route.ts
│   │       ├── reports/list/route.ts
│   │       ├── admin/stats/route.ts
│   │       └── health/route.ts
│   ├── components/            # Navbar, Footer, HoroscopeChart, ProtectedRoute
│   ├── context/AuthContext.tsx
│   └── lib/                   # prisma, auth, api, astrology helpers
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

App runs at http://localhost:3000.

## Environment variables

See [.env.example](.env.example). Required for full functionality:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Token signing secret |
| `JWT_EXPIRES_IN` | Token lifetime (default `7d`) |
| `VEDASTRO_API_URL` | External chart API (optional — local fallback used otherwise) |
| `GOOGLE_MAPS_API_KEY` | Geocoding for birthplace → lat/lng |
| `RAZORPAY_*`, `TWILIO_*`, `AWS_*` | Payments, SMS, S3 (used by report/payment flows) |

## API surface

All API routes are under `/api`. Auth-protected routes expect `Authorization: Bearer <jwt>` (axios client in [src/lib/api.ts](src/lib/api.ts) attaches this automatically).

| Method | Path | Auth |
| --- | --- | --- |
| GET | `/api/health` | — |
| POST | `/api/auth/register` | — |
| POST | `/api/auth/login` | — |
| POST | `/api/horoscope/generate` | user |
| GET | `/api/horoscope/geocode?place=...` | — |
| GET | `/api/horoscope/daily/[rasi]` | — |
| POST | `/api/marriage/match` | user |
| POST | `/api/kadhal/match` | — |
| GET | `/api/panchang/today` | — |
| GET | `/api/consultation/astrologers` | — |
| POST | `/api/consultation/book` | user |
| GET | `/api/reports/list` | user |
| GET | `/api/admin/stats` | admin |

## Notes

- Tamil UI uses Noto Sans Tamil / Noto Serif Tamil via Google Fonts (loaded in [globals.css](src/app/globals.css)).
- Chart math in [src/lib/astrology.ts](src/lib/astrology.ts) currently uses a deterministic placeholder for `calculatePlanetsLocal` — wire in `swisseph` or the VedAstro API for production-grade calculations.
- Admin access: flip `isAdmin` on a user row in the DB (no public registration path grants admin).
