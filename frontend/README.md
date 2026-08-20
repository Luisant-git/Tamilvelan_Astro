# தமிழ்வேலன் / TamilVelan — Frontend

Website frontend for the Tamil astrology application — Next.js 14 App Router, all pages are client components (`'use client'`), all data comes from the [backend/](../backend) API over REST (no server-side data fetching, no shared process with the backend). Split out from a previously-unified frontend+backend project.

## Stack

- **Next.js 14** (App Router) — UI only, no API routes
- **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **axios** for API calls, **react-hot-toast** for notifications, **lucide-react** for icons

## Project layout

```
frontend/
├── public/                    # manifest.json, service worker (PWA)
├── src/
│   ├── app/
│   │   ├── layout.tsx          # Root layout (AuthProvider + Navbar + Footer)
│   │   ├── page.tsx            # Home (rasi picker + features)
│   │   ├── jathagam/           # Horoscope generator
│   │   ├── porutham/           # 10-porutham marriage matching
│   │   ├── kadhal/             # Love match by names
│   │   ├── panchang/           # Today's panchang
│   │   ├── ariggai/            # Paid PDF reports listing (protected)
│   │   ├── aalosanai/          # Astrologer consultation booking (protected)
│   │   ├── admin/              # Admin dashboard (admin-only)
│   │   ├── login/ register/    # Auth forms
│   │   └── ... (other feature pages)
│   ├── components/             # Navbar, Footer, HoroscopeChart, ProtectedRoute, ...
│   ├── context/AuthContext.tsx # Client-side auth state (localStorage JWT)
│   └── lib/
│       ├── api.ts              # axios client — baseURL from NEXT_PUBLIC_API_URL
│       ├── planetLabels.ts     # Small display-only constant (extracted from the backend's astrology.ts)
│       └── tamilCalendar.ts, holidays.ts, muhurtham.ts, panchaPakshi.ts  # Client-side calendar/muhurtham calculations
└── package.json
```

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Create .env from the template and point it at your running backend
cp .env.example .env

# 3. Start the dev server
npm run dev
```

Runs at **http://localhost:3001**. Requires the [backend](../backend) running and reachable at whatever `NEXT_PUBLIC_API_URL` points to (defaults to `http://localhost:3000`).

## Deploying (Vercel)

Import this repo/folder as a Vercel project (framework preset: Next.js, root directory: `frontend`). Set `NEXT_PUBLIC_API_URL` in Vercel's project env vars to the deployed backend's URL — it's inlined at build time, so it must be set *before* each build/deploy that needs a new value. No other config needed; Vercel handles the build/start lifecycle itself.

## Environment variables

See [.env.example](.env.example).

| Variable | Purpose |
| --- | --- |
| `NEXT_PUBLIC_API_URL` | Backend origin only (no `/api` suffix, no trailing slash) — e.g. `http://localhost:3000` |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client-exposed Razorpay key (not yet used in any code) |

## Notes

- Auth is a stateless `Authorization: Bearer <jwt>` header attached by `src/lib/api.ts`'s axios interceptor, token stored in `localStorage` — no cookies, so no same-origin/credentialed-CORS requirement with the backend.
- If you see CORS errors in the browser console, confirm the backend's `middleware.ts` allows this frontend's origin (`localhost`/LAN-IP origins are already auto-allowed; anything else needs adding to the backend's `CORS_ALLOWED_ORIGINS`).
- Tamil UI uses Noto Sans Tamil / Noto Serif Tamil via Google Fonts (loaded in [globals.css](src/app/globals.css)).
