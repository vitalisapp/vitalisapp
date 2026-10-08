# Vitalis

Monorepo for Vitalis — fitness tracking with AI coaching.

* `backend/` — Express 5 + MySQL 8 + Socket.io API (see `backend/README.md`)
* `frontend/` — Vite 8 + React 19 + Tailwind 4 PWA (see `frontend/README.md`)

## Quickstart

Prerequisites: Node >=20, MySQL 8.

```powershell
# backend
Copy-Item backend/.env.example backend/.env
Set-Location backend; npm install; npm run db:migrate; npm run dev

# frontend (new terminal)
Copy-Item frontend/.env.example frontend/.env
Set-Location frontend; npm install; npm run dev
```

Backend: http://localhost:3000/api/health — Frontend: http://localhost:5173

> Secrets: never commit `.env`. Only `.env.example` is tracked.
