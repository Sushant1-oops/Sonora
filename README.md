# Sonora 🎧

A full-stack music streaming web app — your own account, your own playlists,
real streaming audio, built from scratch (not a Spotify clone, no Spotify
code/assets/branding anywhere). Built as a portfolio project to demonstrate
production-style full-stack engineering: auth, caching, horizontal scaling,
and a real reverse-proxy/load-balancer setup, not just a CRUD app.

## What it does

- **Accounts** — register/login, JWT access + refresh tokens, per-user data
- **Real music** — search and stream Creative-Commons-licensed tracks via
  the [Jamendo](https://www.jamendo.com) API (no audio hosting needed)
- **Playlists** — create, reorder, make public/private, add/remove tracks
- **Library** — liked songs, recently played, followed artists
- **Player** — play/pause, next/prev, seek, volume, shuffle, repeat-one/all,
  queue management — all backed by a real HTML5 `<audio>` element
- **Profiles** — public profile pages showing a user's public playlists

## Why it's architected this way

This isn't over-engineered for its own sake — every infra piece earns its
place and is meant to be something you can explain in an interview:

| Piece | Why it's here |
|---|---|
| **Nginx (gateway)** | Single entry point; reverse-proxies `/api/*` to the backend pool and everything else to the static frontend. Also does request-rate limiting at the edge. |
| **3 backend replicas** | The Express API is fully stateless (no in-memory sessions — JWT + Redis only), so Nginx can round-robin (`least_conn`) across identical containers. This is what "horizontally scalable" actually looks like, not just a claim on a resume. |
| **Redis** | Two real jobs: (1) cache-aside layer for Jamendo search/track/popular results, so repeated queries don't hit the external API every time, and (2) fast refresh-token validation/revocation, shared across all backend replicas (so "log out everywhere" works no matter which instance handles the request). Also backs the distributed rate limiter. |
| **Postgres + Prisma** | Source of truth for users, playlists, likes, follows, history, and a local metadata cache of tracks (so playlists/likes have stable foreign keys independent of Jamendo's own IDs). |
| **JWT access (memory) + refresh (httpOnly cookie)** | Access tokens never touch localStorage (XSS-resistant); refresh tokens are httpOnly + sameSite=strict (CSRF-resistant) and rotated on every use. |

## Project structure

```
sonora/
├── backend/              # Express API
│   ├── prisma/            # schema + migrations + seed script
│   └── src/
│       ├── config/        # Prisma client, Redis client, logger
│       ├── controllers/    # HTTP layer
│       ├── services/       # business logic (auth, music, playlists, library)
│       ├── middleware/      # auth, rate limiting, error handling
│       ├── routes/
│       ├── validators/
│       └── utils/
├── frontend/              # React (Vite) SPA
│   └── src/
│       ├── app/store.js     # Redux store
│       ├── features/        # auth, player, playlists, library, search, profile, home
│       ├── components/       # shared UI (Button, TrackRow, PlayerBar, Sidebar...)
│       ├── layouts/
│       ├── services/         # axios API clients
│       └── hooks/            # useAuth, usePlayer, useDebounce
├── nginx/
│   └── nginx.conf          # reverse proxy + load balancer config
└── docker-compose.yml      # the whole stack: postgres, redis, 3x backend, frontend, nginx
```

## Getting started

### 1. Get a free Jamendo API client ID

Sign up at https://devportal.jamendo.com — it's free and instant. You'll get
a `client_id` to put in your env file.

### 2. Choose how to run it

**Option A — Docker Compose (recommended, matches the real architecture)**

```bash
cp backend/.env.docker.example backend/.env
# edit backend/.env and set JAMENDO_CLIENT_ID

docker compose up --build
```

This starts Postgres, Redis, 3 backend replicas, the frontend, and Nginx.
Visit **http://localhost** — Nginx is the only exposed port; everything
else lives on the internal Docker network.

The backend container runs `prisma migrate deploy` automatically on
startup. If you ever change `schema.prisma`, generate a new migration
locally first (see step 4) and rebuild.

**Option B — Run locally without Docker (faster iteration while coding)**

```bash
# Postgres + Redis still need to run somewhere — easiest is just their
# containers without the rest of the stack:
docker compose up postgres redis -d

cd backend
cp .env.example .env   # uses localhost, not docker service names
npm install
npm run prisma:migrate
npm run seed            # optional: creates demo@sonora.app / password123
npm run dev

# in a second terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

Frontend dev server runs on `http://localhost:5173`, backend on `:5000`.

### 3. Verify the load balancing (the fun part)

With Docker Compose running, hit the health endpoint a few times:

```bash
for i in 1 2 3 4 5 6; do curl -s http://localhost/health; echo; done
```

You'll see the `"instance"` field rotate between `backend1`, `backend2`,
`backend3` — that's Nginx actually distributing load across the replica
pool, not just a diagram on a slide.

### 4. If you change the Prisma schema

```bash
cd backend
npx prisma migrate dev --name describe_your_change
```

This generates a new migration file under `prisma/migrations/`. Commit it,
then `docker compose up --build` to apply it in containers too.

> **Note on the included initial migration:** the first migration file in
> this repo was hand-written to match `schema.prisma` (the sandbox used to
> generate this project couldn't reach Prisma's binary CDN). Run
> `npx prisma migrate dev` once after your first local setup — Prisma will
> confirm the migration matches the schema, or correct it if anything's off.

## Environment variables

See `backend/.env.example` (local dev) and `backend/.env.docker.example`
(Docker Compose) for the full list. The important ones:

- `JAMENDO_CLIENT_ID` — required, get one free at devportal.jamendo.com
- `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` — change these to long random
  strings before deploying anywhere real
- `DATABASE_URL` / `REDIS_URL` — connection strings (differ between the two
  env files above based on whether you're using Docker service names)

## Deploying for real

The README in this project assumes local Docker Compose. For a live demo
link, Oracle Cloud's Free Tier (4 ARM CPUs / 24GB RAM, genuinely free
forever, no spin-down) is a good fit since it can run the entire stack
including Postgres/Redis without the limitations of free tiers that sleep
on inactivity. Push this repo, install Docker on the instance, and
`docker compose up -d --build` works the same way it does locally.

## Tech stack

**Backend:** Node.js, Express, PostgreSQL, Prisma, Redis (ioredis), JWT,
bcryptjs, express-rate-limit + rate-limit-redis, Winston, Helmet

**Frontend:** React 18, Redux Toolkit, React Router, Axios, Vite,
lucide-react icons

**Infra:** Docker, Docker Compose, Nginx (reverse proxy + load balancer)

**External API:** Jamendo (Creative Commons music catalog + streaming)
