const express = require("express");
const { db } = require("../db");
const { sendContactNotification } = require("../mailer");

const router = express.Router();

const ALLOWED_SUBJECTS = new Set([
  "Guest Suggestion",
  "Collaboration",
  "General Question",
  "Media Inquiry",
  "Other",
]);

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const insertContactSubmission = db.prepare(`
  INSERT INTO contact_submissions (
    first_name,
    last_name,
    email,
    subject,
    message,
    created_at
  ) VALUES (?, ?, ?, ?, ?, ?)
`);

function normalizeValue(value) {
  if (typeof value !== "string") return "";
  return value.trim();
}

async function verifyCaptchaToken(captchaToken) {
  const verificationUrl = process.env.CAPTCHA_VERIFY_URL;
  const verificationSecret = process.env.CAPTCHA_SECRET;

  if (!verificationUrl || !verificationSecret) return true;
  if (!captchaToken) return false;

  try {
    const verificationResponse = await fetch(verificationUrl, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: verificationSecret,
        response: captchaToken,
      }),
    });

    if (!verificationResponse.ok) return false;

    const verificationResult = await verificationResponse.json();
    return Boolean(verificationResult && verificationResult.success);
  } catch (_error) {
    return false;
  }
}

router.post("/", async (req, res) => {
  const website = normalizeValue(req.body.website);

  // Honeypot for bot filtering: pretend success, skip insert.
  if (website) {
    return res.status(201).json({ ok: true });
  }

  const firstName = normalizeValue(req.body.first_name);
  const lastName = normalizeValue(req.body.last_name);
  const email = normalizeValue(req.body.email).toLowerCase();
  const subject = normalizeValue(req.body.subject);
  const message = normalizeValue(req.body.message);
  const captchaToken = normalizeValue(req.body.captcha_token);

  if (!firstName || !lastName || !email || !subject || !message) {
    return res.status(400).json({ ok: false, error: "All fields are required." });
  }

  if (firstName.length > 100 || lastName.length > 100) {
    return res.status(400).json({ ok: false, error: "Name is too long." });
  }

  if (email.length > 254) {
    return res.status(400).json({ ok: false, error: "Email is too long." });
  }

  if (subject.length > 100 || !ALLOWED_SUBJECTS.has(subject)) {
    return res.status(400).json({ ok: false, error: "Invalid subject." });
  }

  if (message.length > 5000) {
    return res.status(400).json({ ok: false, error: "Message is too long." });
  }

  if (!EMAIL_REGEX.test(email)) {
    return res.status(400).json({ ok: false, error: "Invalid email format." });
  }

  const captchaVerified = await verifyCaptchaToken(captchaToken);
  if (!captchaVerified) {
    return res.status(400).json({ ok: false, error: "Captcha verification failed." });
  }

  const createdAt = new Date().toISOString();

  try {
    const result = insertContactSubmission.run(
      firstName,
      lastName,
      email,
      subject,
      message,
      createdAt
    );

    // Email failure should not fail API success.
    try {
      await sendContactNotification({
        first_name: firstName,
        last_name: lastName,
        email,
        subject,
        message,
        created_at: createdAt,
      });
    } catch (_mailErr) {
      // keep API success even if email fails
    }

    return res.status(201).json({ ok: true, id: result.lastInsertRowid });
  } catch (_error) {
    return res.status(500).json({ ok: false, error: "Failed to save submission." });
  }
});

module.exports = router;