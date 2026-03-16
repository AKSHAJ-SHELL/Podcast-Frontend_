const nodemailer = require("nodemailer");

const smtpHost = process.env.SMTP_HOST;
const smtpPort = Number(process.env.SMTP_PORT || 465);
const smtpSecure = String(process.env.SMTP_SECURE || "true") === "true";
const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;

const hasSmtpConfig = Boolean(smtpHost && smtpUser && smtpPass);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    })
  : null;

async function sendContactNotification(payload) {
  if (!transporter) {
    // SMTP not configured: skip email silently in local/dev.
    return;
  }

  const to = process.env.CONTACT_NOTIFY_TO || "shandilya.akshaj@gmail.com";
  const from = smtpUser;

  const text = [
    "New contact form submission",
    "",
    `Name: ${payload.first_name} ${payload.last_name}`,
    `Email: ${payload.email}`,
    `Subject: ${payload.subject}`,
    `Submitted: ${payload.created_at}`,
    "",
    "Message:",
    payload.message,
  ].join("\n");

  await transporter.sendMail({
    from,
    to,
    replyTo: payload.email,
    subject: `CONTRACT: ${payload.subject} | ${payload.first_name} ${payload.last_name}`,
    text,
  });
}

module.exports = { sendContactNotification };