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
