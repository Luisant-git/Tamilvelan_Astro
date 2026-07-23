# தமிழ்வேலன் / TamilVelan — Astrology Project

A Tamil astrology application: horoscope generation, marriage/love matching, daily panchang, consultation booking, and more — available as a website and a mobile app, both backed by one shared API.

Three independent projects:

```
AstrologyMobileApp/   # Expo / React Native mobile app (Android/iOS)
backend/              # Next.js API (all /api/* routes, Prisma + PostgreSQL)
frontend/             # Next.js website (all pages, calls backend/ over REST)
```

## Architecture

`frontend/` and `backend/` used to be a single unified Next.js app (same process, same origin). They're now fully separate, independently deployable projects that talk to each other over HTTP:

- **`backend/`** is a Next.js app used purely for its API routes (no pages) — see [backend/README.md](backend/README.md).
- **`frontend/`** is a Next.js app with all the pages (no API routes) — calls `backend/` via `NEXT_PUBLIC_API_URL` — see [frontend/README.md](frontend/README.md).
- **`AstrologyMobileApp/JothidamUserApp/`** is the Expo mobile app, calling the same backend via `EXPO_PUBLIC_API_URL` — completely independent of the other two, untouched by the frontend/backend split.

## Quick start (local dev)

```bash
# Backend (port 3000)
cd backend
npm install
cp .env.example .env   # fill in real values
npm run db:generate && npm run db:migrate
npm run dev

# Frontend (port 3001), in a separate terminal
cd frontend
npm install
cp .env.example .env   # NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev

# Mobile app, in a separate terminal
cd AstrologyMobileApp/JothidamUserApp
npm install
npx expo start
```

## Production process management

`backend/ecosystem.config.js` defines both `backend/` and `frontend/` as pm2 apps (they're deployed together on the same host). See [backend/README.md](backend/README.md#process-management-pm2).

## Deployment targets

- **Backend** → any Node host that can run `next build && next start` (e.g. Render) — needs `DATABASE_URL` pointed at a real PostgreSQL instance.
- **Frontend** → Vercel (or any static/Node host for Next.js) — needs `NEXT_PUBLIC_API_URL` pointed at wherever the backend is deployed.
- **Mobile app** → EAS Build → Play Store / App Store, or sideloaded APK — needs `EXPO_PUBLIC_API_URL` pointed at the deployed backend.
