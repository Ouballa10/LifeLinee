# LifeLine

LifeLine is a mobile-first emergency medical web app with a React + Vite frontend, Firebase Auth, an Express API that can run on Vercel, and Supabase PostgreSQL for persistent medical profiles.

## Structure

```text
LifeLine/
|-- frontend/
|   |-- public/
|   |   |-- manifest.json
|   |   |-- icons/
|   |   |-- robots.txt
|   |   `-- index.html
|   |-- src/
|   |   |-- assets/
|   |   |   |-- images/
|   |   |   |-- icons/
|   |   |   `-- logo.png
|   |   |-- components/
|   |   |   |-- ui/
|   |   |   |-- layout/
|   |   |   `-- medical/
|   |   |-- pages/
|   |   |   |-- auth/
|   |   |   |-- main/
|   |   |   |-- profile/
|   |   |   |-- qr/
|   |   |   |-- emergency/
|   |   |   `-- Splash.jsx
|   |   |-- routes/
|   |   |-- context/
|   |   |-- services/
|   |   |-- hooks/
|   |   |-- utils/
|   |   |-- styles/
|   |   |-- pwa/
|   |   |-- App.jsx
|   |   `-- main.jsx
|   |-- index.html
|   `-- package.json
|-- backend/
|   |-- src/
|   |   |-- config/
|   |   |-- controllers/
|   |   |-- models/
|   |   |-- routes/
|   |   |-- middlewares/
|   |   |-- services/
|   |   |-- utils/
|   |   `-- app.js
|   |-- server.js
|   |-- .env
|   `-- package.json
|-- docs/
|   |-- presentation.pdf
|   |-- cahier_de_charge.pdf
|   |-- uml/
|   `-- screenshots/
`-- README.md
```

## Frontend status

- Splash, login, register, home, dashboard, profile, medical form, QR, scanner, and public emergency pages are wired.
- Email/password and Google login use Firebase Auth.
- Public emergency pages can read safe emergency fields from Supabase through the `public_emergency_profiles` view.
- PWA support files and manifest placeholders are included.

## Backend status

- Express routes now use Supabase/PostgreSQL through `@supabase/supabase-js`; MongoDB/Mongoose is no longer used.
- Private profile reads/updates verify the Firebase ID token, then use the Supabase service role key server-side only.
- `qr_token` is stable and unique per medical profile.

## Supabase setup

1. Create a Supabase project.
2. Open the Supabase SQL Editor.
3. Paste and run [`supabase/schema.sql`](supabase/schema.sql).
4. Copy your Supabase project URL, anon key, and service role key.

The service role key belongs only in backend/Vercel server environment variables. Never put it in `frontend/.env`.

## Run locally

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Backend:

```bash
cd backend
npm install
npm run dev
```

Create env files from the examples first:

```bash
copy frontend\.env.example frontend\.env
copy backend\.env.example backend\.env
```

## Notes

- `frontend/index.html` remains the active Vite entry point. `frontend/public/index.html` is included only to mirror your requested tree.
- Some docs and icon assets are placeholder files so the structure is complete and ready for real project material.

## Firebase Auth

The frontend uses Firebase Auth for email/password and Google login. Enable both providers in Firebase Authentication.

Setup:

```bash
cd frontend
npm install
```

Then create `frontend/.env` from `frontend/.env.example` and fill in your Firebase project values:

```bash
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Also set server-side variables in `backend/.env` or Vercel:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
FIREBASE_API_KEY=...
FRONTEND_URL=http://localhost:5173
```

## Vercel environment variables

Frontend:

```bash
VITE_API_URL=/api
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Backend/API:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
FIREBASE_API_KEY=...
FRONTEND_URL=https://your-vercel-domain.vercel.app
```

Important: after a `git pull` that adds new dependencies such as `@supabase/supabase-js`, each teammate must run `npm install` inside `frontend` and `backend`.
