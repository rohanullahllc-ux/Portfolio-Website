const express = require("express");
const path = require("path");
const crypto = require("crypto");
const multer = require("multer");
const { readDb, writeDb, nextId } = require("../data/store");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

const THEMES = ["charcoal-orange", "midnight-blue", "slate-purple", "emerald-dark"];
const DEFAULT_ADMIN_PASSWORD = "Admin@123";

// ---- Login rate limiting (basic brute-force protection) ----
const loginAttempts = new Map(); // ip -> { count, firstAttemptAt }
const MAX_ATTEMPTS = 8;
const WINDOW_MS = 10 * 60 * 1000;

function isRateLimited(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry) return false;
  if (Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    loginAttempts.delete(ip);
    return false;
  }
  return entry.count >= MAX_ATTEMPTS;
}

function recordFailedAttempt(ip) {
  const entry = loginAttempts.get(ip);
  if (!entry || Date.now() - entry.firstAttemptAt > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, firstAttemptAt: Date.now() });
  } else {
    entry.count += 1;
  }
}

function clearAttempts(ip) {
  loginAttempts.delete(ip);
}

// ---- Image upload ----
// In production (CLOUDINARY_URL set) uploads go to Cloudinary, which survives
// restarts/redeploys. Locally, they're saved straight to disk for simplicity.
const USE_CLOUDINARY = !!process.env.CLOUDINARY_URL;
const cloudinary = USE_CLOUDINARY ? require("cloudinary").v2 : null;

const uploadDir = path.join(__dirname, "..", "..", "public", "images", "uploads");
const storage = USE_CLOUDINARY
  ? multer.memoryStorage()
  : multer.diskStorage({
      destination: (req, file, cb) => cb(null, uploadDir),
      filename: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const safeExt = [".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg"].includes(ext) ? ext : "";
        cb(null, `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${safeExt}`);
      },
    });
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"];
    cb(null, allowed.includes(file.mimetype));
  },
});

function uploadToCloudinary(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "portfolio" }, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

// ---- Public content ----
router.get("/content", (req, res) => {
  const db = readDb();
  const { admin, messages, ...publicData } = db;
  res.json(publicData);
});

// ---- Contact form submissions ----
router.post("/contact-submit", (req, res) => {
  const { name, email, projectType, budget, message } = req.body || {};
  if (!name || !email || !message) {
    return res.status(400).json({ error: "Name, email, and message are required" });
  }
  const db = readDb();
  const item = {
    id: nextId(db.messages),
    name: String(name).slice(0, 200),
    email: String(email).slice(0, 200),
    projectType: String(projectType || "").slice(0, 200),
    budget: String(budget || "").slice(0, 200),
    message: String(message).slice(0, 5000),
    receivedAt: new Date().toISOString(),
  };
  db.messages.push(item);
  writeDb(db);
  res.json({ ok: true });
});

router.get("/admin/messages", requireAuth, (req, res) => {
  const db = readDb();
  res.json(db.messages.slice().reverse());
});

router.delete("/admin/messages/:id", requireAuth, (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.messages = db.messages.filter((m) => m.id !== id);
  writeDb(db);
  res.json({ ok: true });
});

// ---- Auth ----
router.get("/admin/session", (req, res) => {
  const isAdmin = !!(req.session && req.session.isAdmin);
  const db = readDb();
  res.json({ isAdmin, isDefaultPassword: db.admin.password === DEFAULT_ADMIN_PASSWORD });
});

router.post("/admin/login", (req, res) => {
  const ip = req.ip;
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }
  const { username, password } = req.body || {};
  const db = readDb();
  if (username === db.admin.username && password === db.admin.password) {
    clearAttempts(ip);
    req.session.isAdmin = true;
    return res.json({ ok: true });
  }
  recordFailedAttempt(ip);
  return res.status(401).json({ error: "Invalid username or password" });
});

router.post("/admin/logout", (req, res) => {
  req.session.destroy(() => res.json({ ok: true }));
});

router.post("/admin/change-password", requireAuth, (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const db = readDb();
  if (currentPassword !== db.admin.password) {
    return res.status(401).json({ error: "Current password is incorrect" });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  db.admin.password = newPassword;
  writeDb(db);
  res.json({ ok: true });
});

// ---- Password recovery via email ----
const resetTokens = new Map(); // token -> { expires }
const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hour

async function sendResetEmail(toEmail, resetUrl) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY not set — cannot send password reset email");
    return;
  }
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Portfolio Admin <onboarding@resend.dev>",
      to: [toEmail],
      subject: "Reset your Admin Panel password",
      html: `<p>Someone requested a password reset for your portfolio site's Admin Panel.</p>
             <p><a href="${resetUrl}">Click here to set a new password</a> (valid for 1 hour).</p>
             <p>If you didn't request this, you can safely ignore this email.</p>`,
    }),
  });
  if (!response.ok) {
    throw new Error(`Resend API error: ${response.status} ${await response.text()}`);
  }
}

router.post("/admin/forgot-password", async (req, res) => {
  const ip = req.ip;
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: "Too many attempts. Try again later." });
  }
  const { email } = req.body || {};
  const db = readDb();
  const matches = typeof email === "string" && email.trim().toLowerCase() === db.contact.email.toLowerCase();

  if (matches) {
    const token = crypto.randomBytes(32).toString("hex");
    resetTokens.set(token, { expires: Date.now() + RESET_TOKEN_TTL_MS });
    const resetUrl = `${req.protocol}://${req.get("host")}/admin.html?reset=${token}`;
    try {
      await sendResetEmail(db.contact.email, resetUrl);
    } catch (err) {
      console.error("Password reset email failed:", err.message);
    }
  } else {
    recordFailedAttempt(ip);
  }
  // Always respond the same way whether or not the email matched, so this
  // endpoint can't be used to discover the admin's recovery email address.
  res.json({ ok: true });
});

router.post("/admin/reset-password", (req, res) => {
  const { token, newPassword } = req.body || {};
  const entry = token && resetTokens.get(token);
  if (!entry || Date.now() > entry.expires) {
    resetTokens.delete(token);
    return res.status(400).json({ error: "This reset link is invalid or has expired." });
  }
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ error: "New password must be at least 8 characters" });
  }
  const db = readDb();
  db.admin.password = newPassword;
  writeDb(db);
  resetTokens.delete(token);
  res.json({ ok: true });
});

// ---- Image upload (protected) ----
router.post("/admin/upload", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No valid image file uploaded" });
  }
  if (USE_CLOUDINARY) {
    try {
      const result = await uploadToCloudinary(req.file.buffer);
      return res.json({ url: result.secure_url });
    } catch (err) {
      return res.status(502).json({ error: "Image upload to Cloudinary failed" });
    }
  }
  res.json({ url: `/images/uploads/${req.file.filename}` });
});

// ---- Theme ----
router.put("/admin/theme", requireAuth, (req, res) => {
  const { theme } = req.body || {};
  if (!THEMES.includes(theme)) {
    return res.status(400).json({ error: "Unknown theme" });
  }
  const db = readDb();
  db.theme = theme;
  writeDb(db);
  res.json({ ok: true, theme });
});

// ---- Home ----
router.put("/admin/home", requireAuth, (req, res) => {
  const db = readDb();
  db.home = { ...db.home, ...req.body };
  writeDb(db);
  res.json({ ok: true, home: db.home });
});

// ---- About ----
router.put("/admin/about", requireAuth, (req, res) => {
  const db = readDb();
  db.about = { ...db.about, ...req.body };
  writeDb(db);
  res.json({ ok: true, about: db.about });
});

// ---- Contact ----
router.put("/admin/contact", requireAuth, (req, res) => {
  const db = readDb();
  db.contact = { ...db.contact, ...req.body };
  writeDb(db);
  res.json({ ok: true, contact: db.contact });
});

// ---- Services CRUD ----
router.post("/admin/services", requireAuth, (req, res) => {
  const db = readDb();
  const item = { id: nextId(db.services), ...req.body };
  db.services.push(item);
  writeDb(db);
  res.json({ ok: true, item });
});

router.put("/admin/services/:id", requireAuth, (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const idx = db.services.findIndex((s) => s.id === id);
  if (idx === -1) return res.status(404).json({ error: "Service not found" });
  db.services[idx] = { ...db.services[idx], ...req.body, id };
  writeDb(db);
  res.json({ ok: true, item: db.services[idx] });
});

router.delete("/admin/services/:id", requireAuth, (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.services = db.services.filter((s) => s.id !== id);
  writeDb(db);
  res.json({ ok: true });
});

// ---- Awards CRUD ----
router.post("/admin/awards", requireAuth, (req, res) => {
  const db = readDb();
  const item = { id: nextId(db.awards), ...req.body };
  db.awards.push(item);
  writeDb(db);
  res.json({ ok: true, item });
});

router.put("/admin/awards/:id", requireAuth, (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const idx = db.awards.findIndex((a) => a.id === id);
  if (idx === -1) return res.status(404).json({ error: "Award not found" });
  db.awards[idx] = { ...db.awards[idx], ...req.body, id };
  writeDb(db);
  res.json({ ok: true, item: db.awards[idx] });
});

router.delete("/admin/awards/:id", requireAuth, (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.awards = db.awards.filter((a) => a.id !== id);
  writeDb(db);
  res.json({ ok: true });
});

// ---- Portfolio projects CRUD ----
router.put("/admin/portfolio/categories", requireAuth, (req, res) => {
  const { categories } = req.body || {};
  if (!Array.isArray(categories)) {
    return res.status(400).json({ error: "categories must be an array" });
  }
  const db = readDb();
  db.portfolio.categories = categories;
  writeDb(db);
  res.json({ ok: true, categories });
});

router.post("/admin/portfolio/projects", requireAuth, (req, res) => {
  const db = readDb();
  const item = { id: nextId(db.portfolio.projects), ...req.body };
  db.portfolio.projects.push(item);
  writeDb(db);
  res.json({ ok: true, item });
});

router.put("/admin/portfolio/projects/:id", requireAuth, (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  const idx = db.portfolio.projects.findIndex((p) => p.id === id);
  if (idx === -1) return res.status(404).json({ error: "Project not found" });
  db.portfolio.projects[idx] = { ...db.portfolio.projects[idx], ...req.body, id };
  writeDb(db);
  res.json({ ok: true, item: db.portfolio.projects[idx] });
});

router.delete("/admin/portfolio/projects/:id", requireAuth, (req, res) => {
  const db = readDb();
  const id = Number(req.params.id);
  db.portfolio.projects = db.portfolio.projects.filter((p) => p.id !== id);
  writeDb(db);
  res.json({ ok: true });
});

module.exports = router;
