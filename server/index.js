require("dotenv").config();

const path = require("path");
const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { initializeSchema } = require("./db");
const contactRouter = require("./routes/contact");

const app = express();

initializeSchema();
app.set("trust proxy", 1);

const corsOrigins = (process.env.CORS_ORIGINS || "http://localhost:8000,http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        return callback(null, true);
      }
      if (corsOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error("Origin not allowed by CORS"));
    },
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  })
);

app.use(express.json({ limit: "10kb" }));

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.headers["x-forwarded-proto"] &&
    req.headers["x-forwarded-proto"] !== "https"
  ) {
    return res.redirect(308, `https://${req.headers.host}${req.originalUrl}`);
  }
  return next();
});

app.use((req, res, next) => {
  const startedAt = Date.now();
  res.on("finish", () => {
    const durationMs = Date.now() - startedAt;
    console.log(`${req.method} ${req.path} ${res.statusCode} ${durationMs}ms`);
  });
  next();
});

const contactRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: Number(process.env.CONTACT_RATE_LIMIT_MAX || 10),
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    ok: false,
    error: "Too many requests. Please try again later.",
  },
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/", (_req, res) => {
  res.redirect(302, "/The%20podcast%20website%20code.html");
});

app.use("/api/contact", contactRateLimiter, contactRouter);

// Serve frontend (HTML and assets) from project root so one server runs both
app.use(express.static(path.join(__dirname, "..")));

app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "Not found." });
});

app.use((err, _req, res, _next) => {
  if (err && err.message === "Origin not allowed by CORS") {
    return res.status(403).json({ ok: false, error: "Origin not allowed." });
  }
  return res.status(500).json({ ok: false, error: "Internal server error." });
});

const port = Number(process.env.PORT || 3000);

app.listen(port, () => {
  console.log(`Contact API listening on http://localhost:${port}`);
});
