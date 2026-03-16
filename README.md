# Professional Perspectives Podcast Frontend

Single-page podcast website with a Node.js backend for secure contact form submissions.

## What this project includes

- Static frontend in `The podcast website code.html`
- Backend API in `server/` (Express + SQLite)
- Contact form persistence to SQLite
- Optional email notifications for new contact submissions
- Basic abuse protection (rate limiting, honeypot, validation, CORS)

## Tech stack

- Frontend: HTML, CSS, vanilla JavaScript
- Backend: Node.js, Express
- Database: SQLite (`better-sqlite3`)
- Email: Nodemailer (SMTP)

## Project structure

```text
.
├── The podcast website code.html
├── README.md
└── server
    ├── index.js
    ├── db.js
    ├── mailer.js
    ├── routes
    │   └── contact.js
    ├── package.json
    ├── .env.example
    └── data
        └── podcast.db   (generated at runtime)
```

## Quick start

### 1) Install dependencies

```bash
cd server
npm install
```

### 2) Configure environment

Copy `server/.env.example` to `server/.env` and set values as needed.

Required/common values:

- `PORT` (default `3000`)
- `DB_PATH` (default `./data/podcast.db`)
- `CORS_ORIGINS` (comma-separated allowed origins)
- `CONTACT_RATE_LIMIT_MAX` (requests per 15 minutes per IP)

Optional captcha values:

- `CAPTCHA_VERIFY_URL`
- `CAPTCHA_SECRET`

Optional email notification values:

- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASS`
- `CONTACT_NOTIFY_TO`

### 3) Start the app

```bash
npm start
```

Then open:

`http://localhost:3000/The%20podcast%20website%20code.html`

## API

### Health check

- `GET /health`
- Response:

```json
{ "ok": true }
```

### Submit contact form

- `POST /api/contact`
- JSON body:

```json
{
  "first_name": "Akshaj",
  "last_name": "Shandilya",
  "email": "name@example.com",
  "subject": "Guest Suggestion",
  "message": "Hi there!",
  "website": "",
  "captcha_token": ""
}
```

- Success response:

```json
{ "ok": true, "id": 1 }
```

## Security behavior

- **Rate limiting** on `/api/contact`
- **CORS allowlist** from `CORS_ORIGINS`
- **Input validation**: required fields, length caps, subject allowlist, email format
- **Honeypot field** (`website`) for bot filtering
- **Optional captcha verification**
- **Parameterized SQL** for inserts
- **HTTPS redirect support** in production behind a proxy

## Database

The SQLite table is created automatically on startup:

- Table: `contact_submissions`
- Columns:
  - `id` (PK autoincrement)
  - `first_name`
  - `last_name`
  - `email`
  - `subject`
  - `message`
  - `created_at`

Database file default:

`server/data/podcast.db`

## Export submissions to CSV

From repo root:

```bash
sqlite3 "./server/data/podcast.db" -header -csv \
"SELECT id, first_name, last_name, email, subject, message, created_at FROM contact_submissions ORDER BY id ASC;" \
> "./server/data/submission.csv"
```

## Common troubleshooting

### 403 Origin not allowed

The request origin is not in `CORS_ORIGINS`.

- Add the exact origin (for example `http://localhost:3000`, `http://localhost:8000`, `http://127.0.0.1:8000`, `http://[::1]:8000`)
- Restart backend after changing `.env`

### 429 Too many requests

Rate limit was reached.

- Wait for the 15-minute window to reset, or
- Increase `CONTACT_RATE_LIMIT_MAX` for local testing

### Email not sending

- Ensure SMTP values are set correctly
- For Gmail, use an **App Password** (not account password)
- Ensure `CONTACT_NOTIFY_TO` is set

## Scripts

From `server/`:

- `npm start` - start backend
- `npm run dev` - start backend (same command currently)
- `npm run audit` - run dependency audit

## Notes

- Keep secrets only in local `.env` files.
- Do not commit database files, exports, or credentials.
- `.gitignore` is configured to exclude common generated and sensitive files.
