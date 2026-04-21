# LifeLine

LifeLine is a mobile-first emergency medical web app with a React frontend and an Express backend. The current scaffold now follows a cleaner feature-based structure so the project can grow into authentication, medical profile, QR generation, scanner flow, and emergency access.

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

- Splash, login, register, home, dashboard, profile, medical form, QR, scanner, and emergency preview pages are wired.
- Auth and profile data are currently persisted in local storage so the UI can be used before full backend integration.
- PWA support files and manifest placeholders are included.

## Backend status

- Express routes are scaffolded for auth, user profile, QR, and emergency access.
- `MedicalProfile` and `EmergencyLog` models were added to match the requested architecture.
- Controllers currently return structured starter responses and are ready for real database logic.

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

## Notes

- `frontend/index.html` remains the active Vite entry point. `frontend/public/index.html` is included only to mirror your requested tree.
- Some docs and icon assets are placeholder files so the structure is complete and ready for real project material.

## Firebase Google Auth

The frontend now includes Google login with Firebase.

Setup:

```bash
cd frontend
npm install
```

Then create `frontend/.env` from `frontend/.env.example` and fill in your Firebase project values:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Also enable the Google provider in the Firebase console.

Important: after a `git pull` that adds new dependencies such as `firebase`, each teammate must run `npm install` again inside `frontend`.
