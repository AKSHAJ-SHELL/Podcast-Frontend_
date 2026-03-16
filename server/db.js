const fs = require("fs");
const path = require("path");
const Database = require("better-sqlite3");

const defaultDbPath = path.join(__dirname, "data", "podcast.db");
const dbPath = process.env.DB_PATH || defaultDbPath;

fs.mkdirSync(path.dirname(dbPath), { recursive: true });

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

function initializeSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS contact_submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      first_name TEXT NOT NULL CHECK(length(first_name) <= 100),
      last_name TEXT NOT NULL CHECK(length(last_name) <= 100),
      email TEXT NOT NULL CHECK(length(email) <= 254),
      subject TEXT NOT NULL CHECK(length(subject) <= 100),
      message TEXT NOT NULL CHECK(length(message) <= 5000),
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at
      ON contact_submissions(created_at);
  `);
}

initializeSchema();

module.exports = {
  db,
  initializeSchema,
};
