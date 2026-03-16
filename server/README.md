# Podcast backend

Node.js API for the podcast site: contact form submissions and health check.

## Run

From this directory:

```bash
npm install
npm start
```

Server listens on **http://localhost:3000** (or `PORT` from `.env`).

## Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check. Returns `{ "ok": true }`. |
| POST | `/api/contact` | Submit contact form. Body: `first_name`, `last_name`, `email`, `subject`, `message`. |

## Frontend

The same server serves the static frontend. Open:

**http://localhost:3000/The%20podcast%20website%20code.html**

The contact form in that page posts to `/api/contact` on the same origin.

## Environment

Copy `.env.example` to `.env` and adjust if needed:

- `PORT` – Server port (default `3000`).
- `DB_PATH` – SQLite file path (default `./data/podcast.db`).
- `CORS_ORIGINS` – Allowed origins, comma-separated (default includes `http://localhost:8000` and `http://localhost:3000`).
- `CONTACT_RATE_LIMIT_MAX` – Max contact submissions per 15 minutes (default `10`).
- `CAPTCHA_VERIFY_URL`, `CAPTCHA_SECRET` – Optional; leave empty to skip captcha.

## Data

Contact submissions are stored in SQLite at `./data/podcast.db`. The table is created automatically on first run.
