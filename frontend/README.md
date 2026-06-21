# Sonora Frontend

React + Redux Toolkit + Tailwind CSS v4, built with Vite.

## Stack

- **React 18** + **React Router 6**
- **Redux Toolkit** for state (auth, player, playlists, library, search)
- **Tailwind CSS v4** for styling — CSS-first config via `@theme` in
  `src/styles/global.css`, compiled through the `@tailwindcss/vite` plugin
  (no `tailwind.config.js` / `postcss.config.js` needed, that's the v4 way)
- **axios** for API calls, with an interceptor that auto-refreshes expired
  access tokens
- **lucide-react** for icons

## Design tokens

All colors, fonts, etc. live in `src/styles/global.css` inside an `@theme`
block, which is how Tailwind v4 expects custom design tokens — no separate
config file. Defining `--color-accent`, `--color-elevated`, etc. there
automatically generates matching utilities: `bg-accent`, `text-accent`,
`border-elevated`, and so on, used throughout the app.

The one exception is the seek/volume slider thumbs (`::-webkit-slider-thumb`
has no Tailwind utility), which stays as a small plain-CSS block in the
same file under a `.player-slider` class.

## Getting started

```bash
cp .env.example .env   # set VITE_API_BASE_URL if your backend isn't on :5000
npm install
npm run dev
```

Runs on `http://localhost:5173` by default. Needs the Sonora backend
running (see the backend's own README) for anything beyond static pages.

## Scripts

- `npm run dev` — Vite dev server with HMR
- `npm run build` — production build to `dist/`
- `npm run preview` — preview the production build locally
- `npm run lint` — ESLint

## Structure

```
src/
├── app/store.js          # Redux store
├── features/              # one folder per domain: auth, player, playlists,
│                           # library, search, profile, home — each with its
│                           # slice + page components colocated
├── components/             # shared UI: Button, Input, TrackRow, TrackCard,
│                           # PlayerBar, Sidebar, Topbar, ProtectedRoute
├── layouts/                # MainLayout (sidebar+player chrome), AuthLayout
├── services/                # axios instance + per-domain API modules
├── hooks/                   # useAuth, usePlayer (owns the <audio> element),
│                           # useDebounce
└── styles/global.css        # Tailwind v4 entry + @theme tokens
```
