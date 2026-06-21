# Sonora Backend

Express + PostgreSQL (Prisma) + Redis API for Sonora.

## Quick start

```bash
cp .env.example .env   # fill in JAMENDO_CLIENT_ID at minimum
npm install
npm run prisma:migrate
npm run seed             # optional demo account
npm run dev
```

Server runs on `http://localhost:5000` by default. Health check at `/health`.

## API reference

All responses follow `{ success: boolean, data?, message?, details? }`.
Authenticated routes expect `Authorization: Bearer <accessToken>`.

### Auth — `/api/auth`
| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/register` | – | Create an account |
| POST | `/login` | – | Returns access token + sets refresh cookie |
| POST | `/refresh` | cookie | Rotates refresh token, returns new access token |
| POST | `/logout` | cookie | Revokes current session |
| POST | `/logout-all` | required | Revokes every session for the user |
| GET | `/me` | required | Current user |

### Music — `/api/music`
| Method | Path | Description |
|---|---|---|
| GET | `/search?q=&type=tracks\|artists&genre=` | Search Jamendo, Redis-cached |
| GET | `/popular?genre=` | Popular tracks |
| GET | `/genres` | Curated genre tag list |
| GET | `/artists/:artistId/tracks` | Tracks by a Jamendo artist ID |
| GET | `/tracks/:jamendoId` | Resolve + cache a single track |

### Playlists — `/api/playlists` (all require auth except viewing public ones)
| Method | Path | Description |
|---|---|---|
| POST | `/` | Create playlist |
| GET | `/me` | Your playlists |
| GET | `/:id` | A playlist (owner or public only) |
| PATCH | `/:id` | Update name/description/visibility |
| DELETE | `/:id` | Delete |
| POST | `/:id/tracks` | Add a track (body: `{ jamendoId }`) |
| DELETE | `/:id/tracks/:trackId` | Remove a track |
| PATCH | `/:id/reorder` | Reorder (body: `{ trackIds: [...] }`) |

### Library — `/api/library` (all require auth)
| Method | Path | Description |
|---|---|---|
| POST | `/likes` | Like a track (body: `{ jamendoId }`) |
| DELETE | `/likes/:trackId` | Unlike |
| GET | `/likes` | Your liked tracks |
| POST | `/recently-played` | Record a play (body: `{ jamendoId }`) |
| GET | `/recently-played` | Recent history |
| POST | `/follows` | Follow an artist |
| DELETE | `/follows/:artistName` | Unfollow |
| GET | `/follows` | Followed artists |

### Users — `/api/users`
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/:username` | – | Public profile + public playlists |
| PATCH | `/me` | required | Update your own profile |

## Notes on design choices

- **Tracks table is a cache, not a source of truth.** Jamendo owns the
  actual audio; we cache metadata locally so playlists/likes have stable
  internal foreign keys.
- **Refresh tokens are tracked in both Redis and Postgres.** Redis for
  fast O(1) validation/revocation on every request; Postgres for an audit
  trail (login history, device list) that survives a Redis flush.
- **Rate limiting is Redis-backed**, not in-memory — required once you're
  running multiple API replicas, since an in-memory limiter would only see
  traffic hitting that one process.
