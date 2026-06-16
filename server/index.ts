import "dotenv/config";
import express from "express";
import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import fs from "fs";
import { authenticator } from "otplib";
import QRCode from "qrcode";
import multer from "multer";
import sharp from "sharp";
import helmet from "helmet";
import compression from "compression";
import rateLimit from "express-rate-limit";
import {
  insertEnquiry, getAllEnquiries,
  insertBlogPost, getAllBlogPosts, deleteBlogPost,
  getHiddenImages, setHiddenImages,
  getCustomImages, setCustomImages,
  getAdminConfig, updateAdminConfig,
  getCustomAssets, updateCustomAsset, deleteCustomAsset
} from "./db.js";
import nodemailer from "nodemailer";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Admin Authentication ────────────────────────────────────────────────────
// Load admin config from database
const adminConfig = getAdminConfig();

// If no password is set in the database (e.g. fresh installation), generate a secure one-time setup password
if (!adminConfig.passwordHash) {
  const tempPassword = crypto.randomBytes(6).toString('hex');
  console.log('================================================================');
  console.log('🔒 FIRST-TIME SETUP: No admin password found.');
  console.log(`🔑 Your temporary login password is: ${tempPassword}`);
  console.log('⚠️  Please log in and change this immediately from the Settings panel!');
  console.log('================================================================');
  
  // Hash and save the temp password
  const tempHash = bcrypt.hashSync(tempPassword, 10);
  updateAdminConfig({ passwordHash: tempHash });
  adminConfig.passwordHash = tempHash;
}

let ADMIN_PASSWORD_HASH = adminConfig.passwordHash;

const DATA_DIR = path.resolve(__dirname, "..", "data");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let adminTotpSecret: string | null = adminConfig.totpSecret;

function saveAdminTotpSecret(secret: string) {
  adminTotpSecret = secret;
  updateAdminConfig({ totpSecret: secret });
}

// Setup Nodemailer
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Active admin sessions: token → expiry timestamp
const adminSessions = new Map<string, number>();
const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

// Rate limiting for login attempts
const loginAttempts = new Map<string, { count: number; lockUntil: number }>();
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

function getClientIp(req: express.Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

function isLockedOut(ip: string): { locked: boolean; remainingMs: number } {
  const record = loginAttempts.get(ip);
  if (!record) return { locked: false, remainingMs: 0 };
  if (Date.now() < record.lockUntil) {
    return { locked: true, remainingMs: record.lockUntil - Date.now() };
  }
  // Lockout expired, reset
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    loginAttempts.delete(ip);
  }
  return { locked: false, remainingMs: 0 };
}

function recordFailedAttempt(ip: string): void {
  const record = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  loginAttempts.set(ip, record);
}

function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

function cleanExpiredSessions(): void {
  const now = Date.now();
  adminSessions.forEach((expiry, token) => {
    if (now > expiry) {
      adminSessions.delete(token);
    }
  });
}

// Clean expired sessions every 10 minutes
setInterval(cleanExpiredSessions, 10 * 60 * 1000);

// ─── Server Setup ────────────────────────────────────────────────────────────

async function startServer() {
  const app = express();
  const server = createServer(app);

  // Trust first proxy (needed for rate limiting by IP behind reverse proxy)
  app.set("trust proxy", 1);

  // Compression for all responses
  app.use(compression());

  // Helmet security headers (base layer — we add custom CSP below)
  app.use(
    helmet({
      contentSecurityPolicy: false, // We set CSP manually below
      crossOriginEmbedderPolicy: false, // Allow loading external images
    })
  );

  // Parse JSON bodies with size limit to prevent DoS
  app.use(express.json({ limit: "10kb" }));

  // Global Rate Limiter to prevent DoS and memory leaks
  const globalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many requests, please try again later." }
  });
  app.use(globalLimiter);

  // Stricter rate limiter for enquiries and login
  const strictLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // Limit each IP to 10 strict requests per windowMs
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: "Too many attempts, please try again later." }
  });
  app.use("/api/enquiry", strictLimiter);
  app.use("/api/admin/login", strictLimiter);

  // Security headers
  app.use((_req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("X-Frame-Options", "DENY");
    res.setHeader("X-XSS-Protection", "1; mode=block");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=(self), payment=()"
    );
    res.setHeader(
      "Content-Security-Policy",
      [
        "default-src 'self'",
        "script-src 'self'", // Removed 'unsafe-inline' for better XSS protection
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
        "font-src 'self' https://fonts.gstatic.com",
        "img-src 'self' data:",
        "media-src 'self'",
        "connect-src 'self' https://api.web3forms.com",
        "frame-ancestors 'none'", // Prevents Clickjacking
        "base-uri 'self'",
        "form-action 'self' https://api.web3forms.com",
      ].join("; ")
    );
    // HSTS — enforce HTTPS (only effective when served over HTTPS)
    if (_req.secure || _req.headers["x-forwarded-proto"] === "https") {
      res.setHeader(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains"
      );
    }
    next();
  });

  // ─── Centralized Admin Auth Middleware ─────────────────────────────────
  function requireAdmin(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ): void {
    const authHeader = req.headers.authorization;
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const expiry = adminSessions.get(token);
    if (!expiry || Date.now() > expiry) {
      adminSessions.delete(token);
      res.status(401).json({ success: false, error: "Session expired" });
      return;
    }

    next();
  }

  // ─── Admin API Routes ────────────────────────────────────────────────

  // POST /api/admin/login — authenticate admin
  app.post("/api/admin/login", async (req, res) => {
    const ip = getClientIp(req);
    const { locked, remainingMs } = isLockedOut(ip);

    if (locked) {
      res.status(429).json({
        success: false,
        error: `Too many failed attempts. Try again in ${Math.ceil(remainingMs / 1000)} seconds.`,
      });
      return;
    }

    const { password, code } = req.body;

    if (!password || typeof password !== "string") {
      res.status(400).json({ success: false, error: "Password is required" });
      return;
    }

    // Prevent DoS via extremely long passwords exhausting bcrypt CPU
    if (password.length > 128) {
      res.status(400).json({ success: false, error: "Password is too long" });
      return;
    }

    if (!(await bcrypt.compare(password, ADMIN_PASSWORD_HASH as string))) {
      recordFailedAttempt(ip);
      const record = loginAttempts.get(ip);
      const attemptsLeft = MAX_LOGIN_ATTEMPTS - (record?.count || 0);

      res.status(401).json({
        success: false,
        error:
          attemptsLeft > 0
            ? `Incorrect password. ${attemptsLeft} attempt${attemptsLeft !== 1 ? "s" : ""} remaining.`
            : `Too many failed attempts. Locked for ${LOCKOUT_DURATION_MS / 1000} seconds.`,
      });
      return;
    }

    // Password is correct.
    // If no TOTP secret is configured, require setup.
    if (!adminTotpSecret) {
      // If client hasn't provided a code, generate QR code for setup
      if (!code) {
        const secret = authenticator.generateSecret();
        const otpauth = authenticator.keyuri('admin', 'VJRack', secret);
        try {
          const qrCodeUrl = await QRCode.toDataURL(otpauth);
          // Return the temporary secret so client can send it back with code to verify
          res.json({ success: true, requiresSetup: true, qrCodeUrl, tempSecret: secret });
        } catch (e) {
          res.status(500).json({ success: false, error: "Failed to generate QR code" });
        }
        return;
      } else {
        // Verify setup code
        const { tempSecret } = req.body;
        if (!tempSecret || !authenticator.check(code, tempSecret)) {
          res.status(401).json({ success: false, error: "Invalid authenticator code" });
          return;
        }
        // Valid setup! Save the secret.
        saveAdminTotpSecret(tempSecret);
      }
    } else {
      // TOTP secret is configured.
      if (!code) {
        res.json({ success: true, requires2FA: true });
        return;
      }

      if (!authenticator.check(code, adminTotpSecret)) {
        recordFailedAttempt(ip);
        res.status(401).json({ success: false, error: "Invalid authenticator code" });
        return;
      }
    }

    // Success — clear attempts and create session
    clearAttempts(ip);
    const token = generateSessionToken();
    adminSessions.set(token, Date.now() + SESSION_DURATION_MS);

    res.json({ success: true, token });
  });

  // POST /api/admin/verify — check if session token is valid
  app.post("/api/admin/verify", (req, res) => {
    const { token } = req.body;

    if (!token || typeof token !== "string") {
      res.json({ valid: false });
      return;
    }

    const expiry = adminSessions.get(token);
    if (!expiry || Date.now() > expiry) {
      adminSessions.delete(token);
      res.json({ valid: false });
      return;
    }

    res.json({ valid: true });
  });

  // POST /api/admin/logout — invalidate session
  app.post("/api/admin/logout", (req, res) => {
    const { token } = req.body;
    if (token) {
      adminSessions.delete(token);
    }
    res.json({ success: true });
  });

  // POST /api/admin/forgot-password
  app.post("/api/admin/forgot-password", async (req, res) => {
    try {
      const config = getAdminConfig();
      if (!config.recoveryEmail) {
        res.status(400).json({ success: false, error: "No recovery email configured. Please contact support." });
        return;
      }

      // Generate a secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpiry = Date.now() + 15 * 60 * 1000; // 15 mins
      updateAdminConfig({ resetToken, resetTokenExpiry });

      const resetLink = `${req.protocol}://${req.get('host')}/admin/reset-password?token=${resetToken}`;

      await emailTransporter.sendMail({
        from: `"VJRack Admin" <${process.env.SMTP_USER}>`,
        to: config.recoveryEmail,
        subject: "VJRack Admin - Password Reset",
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your VJRack admin panel.</p>
          <p>Click the link below to set a new password. This link expires in 15 minutes.</p>
          <a href="${resetLink}">${resetLink}</a>
          <br/><br/>
          <p>If you did not request this, you can safely ignore this email.</p>
        `
      });

      res.json({ success: true, message: "If an email is configured, a recovery link has been sent." });
    } catch (error) {
      console.error("Forgot password error:", error);
      res.status(500).json({ success: false, error: "Failed to process request." });
    }
  });

  // POST /api/admin/reset-password
  app.post("/api/admin/reset-password", async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword || newPassword.length < 8 || newPassword.length > 128) {
      res.status(400).json({ success: false, error: "Invalid request or password length." });
      return;
    }

    const config = getAdminConfig();

    if (!config.resetToken || config.resetToken !== token || !config.resetTokenExpiry || Date.now() > config.resetTokenExpiry) {
      res.status(400).json({ success: false, error: "Invalid or expired token." });
      return;
    }

    // Hash new password and clear token
    const newHash = await bcrypt.hash(newPassword, 10);
    updateAdminConfig({
      passwordHash: newHash,
      resetToken: null,
      resetTokenExpiry: null,
      totpSecret: null // Highly recommended to reset 2FA on password reset
    });

    ADMIN_PASSWORD_HASH = newHash; // Update memory cache

    // Clear all existing sessions
    adminSessions.clear();

    res.json({ success: true, message: "Password updated successfully. Please log in." });
  });

  // POST /api/admin/settings
  app.post("/api/admin/settings", requireAdmin, async (req, res) => {
    const { newPassword, recoveryEmail } = req.body;
    let updates: any = {};

    if (newPassword) {
      if (newPassword.length < 8 || newPassword.length > 128) {
        res.status(400).json({ success: false, error: "Password must be 8-128 characters." });
        return;
      }
      updates.passwordHash = await bcrypt.hash(newPassword, 10);
      ADMIN_PASSWORD_HASH = updates.passwordHash;
    }

    if (recoveryEmail !== undefined) {
      if (recoveryEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recoveryEmail)) {
        res.status(400).json({ success: false, error: "Invalid email format." });
        return;
      }
      updates.recoveryEmail = recoveryEmail;
    }

    if (Object.keys(updates).length > 0) {
      updateAdminConfig(updates);
    }

    const currentConfig = getAdminConfig();
    res.json({
      success: true,
      settings: {
        recoveryEmail: currentConfig.recoveryEmail || ''
      }
    });
  });

  // GET /api/admin/settings
  app.get("/api/admin/settings", requireAdmin, (req, res) => {
    const config = getAdminConfig();
    res.json({
      success: true,
      settings: {
        recoveryEmail: config.recoveryEmail || ''
      }
    });
  });

  // ─── Enquiry API ──────────────────────────────────────────────────────

  // File-based enquiry store migrated to SQLite

  // Image Uploads Setup
  const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Serve uploads statically
  app.use("/uploads", express.static(UPLOADS_DIR));

  const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;
  const ALLOWED_MIMETYPES = /^image\/(jpeg|png|gif|webp)$/;

  const storage = multer.memoryStorage();

  const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_EXTENSIONS.test(file.originalname) && ALLOWED_MIMETYPES.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
      }
    }
  });

  // ─── Batch Upload (multi-image) ───────────────────────────────────────
  const MAX_BATCH_SIZE = 10; // Maximum 10 images per upload batch

  const batchUpload = multer({
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB per file
      files: MAX_BATCH_SIZE,
    },
    fileFilter: (_req, file, cb) => {
      if (ALLOWED_EXTENSIONS.test(file.originalname) && ALLOWED_MIMETYPES.test(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only image files (JPG, PNG, GIF, WebP) are allowed'));
      }
    }
  });

  // POST /api/gallery/upload-batch — admin-only: upload up to 10 images at once
  app.post("/api/gallery/upload-batch", requireAdmin, batchUpload.array("images", MAX_BATCH_SIZE), async (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files || files.length === 0) {
      res.status(400).json({ success: false, error: "No images provided" });
      return;
    }

    if (files.length > MAX_BATCH_SIZE) {
      res.status(400).json({ success: false, error: `Maximum ${MAX_BATCH_SIZE} images allowed per upload` });
      return;
    }

    const { category } = req.body;
    // alt can be a JSON array or a single string
    let altTexts: string[] = [];
    try {
      if (req.body.alts) {
        altTexts = JSON.parse(req.body.alts);
      }
    } catch { /* ignore parse errors */ }

    const results: { success: boolean; id?: string; fileName?: string; error?: string }[] = [];
    const newImages: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const uniqueSuffix = Date.now() + '-' + i + '-' + crypto.randomBytes(4).toString('hex');
        const fullFileName = `image-${uniqueSuffix}.webp`;
        const thumbFileName = `image-${uniqueSuffix}-thumb.webp`;
        const fullPath = path.join(UPLOADS_DIR, fullFileName);
        const thumbPath = path.join(UPLOADS_DIR, thumbFileName);

        // Process full-size image (max 1920px wide, 80% quality)
        await sharp(file.buffer)
          .resize(1920, null, { withoutEnlargement: true })
          .webp({ quality: 80 })
          .toFile(fullPath);

        // Process thumbnail (max 400px wide, 70% quality)
        await sharp(file.buffer)
          .resize(400, null, { withoutEnlargement: true })
          .webp({ quality: 70 })
          .toFile(thumbPath);

        const imageId = "custom-" + Date.now() + "-" + i;
        const newImage = {
          id: imageId,
          src: `/uploads/${fullFileName}`,
          thumbnailSrc: `/uploads/${thumbFileName}`,
          category: category || 'Commercial Racks',
          alt: altTexts[i] || file.originalname.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ') || 'Uploaded image'
        };

        newImages.push(newImage);
        results.push({ success: true, id: imageId, fileName: file.originalname });
      } catch (err) {
        console.error(`Failed to process image ${i} (${file.originalname}):`, err);
        results.push({ success: false, fileName: file.originalname, error: "Processing failed" });
      }
    }

    // Save all successfully processed images at once
    if (newImages.length > 0) {
      const currentImages = getCustomImages();
      currentImages.push(...newImages);
      setCustomImages(currentImages);
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    res.json({
      success: successCount > 0,
      message: `${successCount} image${successCount !== 1 ? 's' : ''} uploaded${failCount > 0 ? `, ${failCount} failed` : ''}`,
      results,
      customImages: getCustomImages()
    });
  });

  type Enquiry = {
    id: number;
    name: string;
    email: string;
    phone: string;
    productInterest: string;
    message: string;
    source: string;
    createdAt: string;
  };

  type BlogPost = {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    date: string;
    readTime: string;
    author: string;
    category: string;
    tags: string[];
  };

  // In-memory arrays removed — using SQLite via server/db.ts

  // Basic HTML/script sanitizer — strip tags and dangerous chars
  function sanitizeInput(input: string): string {
    return input
      .replace(/<[^>]*>/g, "") // Strip HTML tags
      .replace(/[<>'"]/g, "") // Remove angle brackets and quotes
      .trim();
  }

  // GET /api/admin/enquiries/download — admin-only: download enquiries as CSV
  app.get("/api/admin/enquiries/download", (req, res) => {
    try {
      let token = req.query.token as string;
      if (!token) {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ success: false, error: "Unauthorized" });
        }
        token = authHeader.split(" ")[1];
      }
      
      const adminConfig = getAdminConfig();
      const expiry = adminSessions.get(token);
      if (!expiry || Date.now() > expiry) {
        return res.status(401).json({ success: false, error: "Invalid or expired token" });
      }

      const { range } = req.query;
      let allEnquiries = getAllEnquiries();

      if (range === 'last_month') {
        const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
        allEnquiries = allEnquiries.filter((enq: any) => new Date(enq.createdAt).getTime() >= thirtyDaysAgo);
      }

      if (allEnquiries.length === 0) {
        return res.status(404).json({ success: false, error: "No enquiries found for the selected range." });
      }

      const headers = ['ID', 'Date', 'Name', 'Email', 'Phone', 'Product Interest', 'Source', 'Message'];
      
      const escapeCsv = (str: any) => {
        if (!str) return '""';
        const stringified = String(str);
        if (stringified.includes(',') || stringified.includes('"') || stringified.includes('\n')) {
          return `"${stringified.replace(/"/g, '""')}"`;
        }
        return stringified;
      };

      const csvRows = allEnquiries.map((enq: any) => [
        enq.id,
        escapeCsv(new Date(enq.createdAt).toLocaleString()),
        escapeCsv(enq.name),
        escapeCsv(enq.email),
        escapeCsv(enq.phone),
        escapeCsv(enq.productInterest),
        escapeCsv(enq.source),
        escapeCsv(enq.message)
      ].join(','));

      const csvData = [headers.join(','), ...csvRows].join('\n');

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="vjrack_enquiries_${range === 'last_month' ? 'last_month' : 'all'}_${Date.now()}.csv"`);
      res.send(csvData);
    } catch (error) {
      console.error("Error generating CSV:", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // POST /api/enquiry — submit an enquiry from popup or contact page
  app.post("/api/enquiry", (req, res) => {
    const ip = getClientIp(req);
    const { name, email, phone, productInterest, message, source } = req.body;

    // ── Validate required fields ────────────────────────────
    if (
      !name ||
      !email ||
      !phone ||
      !message ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof phone !== "string" ||
      typeof message !== "string"
    ) {
      res
        .status(400)
        .json({ success: false, error: "All required fields must be filled." });
      return;
    }

    // ── Length checks ───────────────────────────────────────
    if (name.length > 100) {
      res
        .status(400)
        .json({ success: false, error: "Name is too long (max 100 characters)." });
      return;
    }
    if (email.length > 254) {
      res
        .status(400)
        .json({ success: false, error: "Email is too long." });
      return;
    }
    if (phone.length > 20) {
      res
        .status(400)
        .json({ success: false, error: "Phone number is too long." });
      return;
    }
    if (message.length > 2000) {
      res
        .status(400)
        .json({
          success: false,
          error: "Message is too long (max 2000 characters).",
        });
      return;
    }

    // ── Email format ────────────────────────────────────────
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      res
        .status(400)
        .json({ success: false, error: "Invalid email address." });
      return;
    }

    // ── Phone format ────────────────────────────────────────
    const phoneClean = phone.replace(/[\s\-()]/g, "");
    if (!/^\+?\d{7,15}$/.test(phoneClean)) {
      res
        .status(400)
        .json({ success: false, error: "Invalid phone number." });
      return;
    }

    // ── Sanitize & store ────────────────────────────────────
    const enquiry = {
      name: sanitizeInput(name).substring(0, 100),
      email: sanitizeInput(email).substring(0, 254),
      phone: sanitizeInput(phone).substring(0, 20),
      productInterest: sanitizeInput(
        (typeof productInterest === "string" ? productInterest : "Not specified")
      ).substring(0, 100),
      message: sanitizeInput(message).substring(0, 2000),
      source:
        source === "popup" || source === "contact_page"
          ? source
          : "direct",
      createdAt: new Date().toISOString(),
    };

    const newId = insertEnquiry(enquiry);

    // Log enquiry without PII (GDPR / data protection compliance)
    console.log(
      `[Enquiry #${newId}] source=${enquiry.source} | category=${enquiry.productInterest}`
    );

    // Send email notification to Admin if configured
    try {
      const config = getAdminConfig();
      const salesEmail = 'sales@vjrack.com';
      const recipients = config.recoveryEmail ? `${salesEmail}, ${config.recoveryEmail}` : salesEmail;

      emailTransporter.sendMail({
        from: `"VJRack Website" <${process.env.SMTP_USER}>`,
        to: recipients,
          subject: `New Enquiry: ${enquiry.productInterest}`,
          html: `
            <h2>New Enquiry Received!</h2>
            <p><strong>Name:</strong> ${enquiry.name}</p>
            <p><strong>Email:</strong> ${enquiry.email}</p>
            <p><strong>Phone:</strong> ${enquiry.phone}</p>
            <p><strong>Category:</strong> ${enquiry.productInterest}</p>
            <p><strong>Source:</strong> ${enquiry.source}</p>
            <br/>
            <h3>Message:</h3>
            <p>${enquiry.message}</p>
          `
        }).catch(err => console.error("Failed to send enquiry email notification:", err));
    } catch (err) {
      console.error("Error setting up email notification:", err);
    }

    res.json({ success: true, message: "Enquiry submitted successfully." });
  });

  // GET /api/enquiries — admin-only: list all enquiries
  app.get("/api/enquiries", requireAdmin, (_req, res) => {
    res.json({ success: true, enquiries: getAllEnquiries() });
  });

  // ─── Blog API ─────────────────────────────────────────────────────────

  // GET /api/blog — get all custom blog posts
  app.get("/api/blog", (req, res) => {
    res.json({ success: true, posts: getAllBlogPosts() });
  });

  // POST /api/blog — admin-only: create a new post
  app.post("/api/blog", requireAdmin, (req, res) => {

    const { title, excerpt, content, readTime, category, tags } = req.body;

    if (!title || !content || !category) {
      res.status(400).json({ success: false, error: "Missing required fields" });
      return;
    }

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

    const newPost: BlogPost = {
      id: "post-" + Date.now() + "-" + crypto.randomBytes(4).toString("hex"),
      title: sanitizeInput(title).substring(0, 200),
      slug,
      excerpt: sanitizeInput(excerpt || "").substring(0, 500),
      content: sanitizeInput(content).substring(0, 50000), // Sanitized server-side too
      date: new Date().toISOString(),
      readTime: sanitizeInput(readTime || "5 min read").substring(0, 20),
      author: "Admin",
      category: sanitizeInput(category).substring(0, 50),
      tags: Array.isArray(tags) ? tags.map(t => sanitizeInput(t).substring(0, 30)) : []
    };

    insertBlogPost(newPost);
    res.json({ success: true, post: newPost });
  });

  // DELETE /api/blog/:id — admin-only: delete a post
  app.delete("/api/blog/:id", requireAdmin, (req, res) => {

    const { id } = req.params;
    const success = deleteBlogPost(id);
    if (success) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, error: "Post not found" });
    }
  });

  // ─── Static Files ────────────────────────────────────────────────────

  // Serve static files from dist/public in production
  const staticPath =
    process.env.NODE_ENV === "production"
      ? path.resolve(__dirname, "public")
      : path.resolve(__dirname, "..", "dist", "public");

  app.use(
    express.static(staticPath, {
      dotfiles: "deny",
      index: false,
    })
  );

  // ─── Gallery API Routes ──────────────────────────────────────────────

  // GET /api/gallery/hidden — public: get list of hidden image IDs
  app.get("/api/gallery/hidden", (_req, res) => {
    res.json({ success: true, hiddenImages: getHiddenImages() });
  });

  // POST /api/gallery/hidden — admin-only: update hidden images list
  app.post("/api/gallery/hidden", requireAdmin, (req, res) => {
    const { hiddenImages } = req.body;

    if (!Array.isArray(hiddenImages)) {
      res.status(400).json({ success: false, error: "hiddenImages must be an array" });
      return;
    }

    // Ensure all items are strings to prevent injection/type issues
    const newIds = hiddenImages.filter(id => typeof id === 'string').map(id => id.substring(0, 100));
    setHiddenImages(newIds);

    res.json({ success: true, hiddenImages: newIds });
  });

  // GET /api/gallery/custom — public: get custom images
  app.get("/api/gallery/custom", (_req, res) => {
    res.json({ success: true, customImages: getCustomImages() });
  });

  // POST /api/gallery/custom — admin-only: update custom images list
  app.post("/api/gallery/custom", requireAdmin, (req, res) => {
    const { customImages } = req.body;

    if (!Array.isArray(customImages)) {
      res.status(400).json({ success: false, error: "customImages must be an array" });
      return;
    }

    setCustomImages(customImages);

    res.json({ success: true, customImages: customImages });
  });

  // DELETE /api/gallery/custom/:id — admin-only: delete a custom image
  app.delete("/api/gallery/custom/:id", requireAdmin, (req, res) => {
    const { id } = req.params;
    let customImages = getCustomImages();
    
    // Find image to maybe delete file later (optional, keeping it simple for now)
    const initialLength = customImages.length;
    customImages = customImages.filter(img => img.id !== id);
    
    if (customImages.length === initialLength) {
      res.status(404).json({ success: false, error: "Image not found" });
      return;
    }

    setCustomImages(customImages);
    res.json({ success: true, customImages: customImages });
  });

  // --- Custom Assets API (Categories & Products Images) ---
  app.get("/api/custom-assets", (_req, res) => {
    res.json(getCustomAssets());
  });

  app.post("/api/admin/custom-assets/upload", requireAdmin, upload.single("image"), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No image file provided" });
      }

      const { id } = req.body;
      if (!id) {
        return res.status(400).json({ error: "Missing asset ID (category or product ID)" });
      }

      // Convert to webp
      const filename = `asset-${id}-${Date.now()}.webp`;
      const filepath = path.join(UPLOADS_DIR, filename);

      await sharp(req.file.buffer)
        .webp({ quality: 80 })
        .resize({ width: 800, withoutEnlargement: true })
        .toFile(filepath);

      const assetUrl = `/uploads/${filename}`;
      updateCustomAsset(id, assetUrl);

      res.json({ success: true, url: assetUrl, id });
    } catch (error) {
      console.error("Asset upload error:", error);
      res.status(500).json({ error: "Failed to upload asset" });
    }
  });

  app.post("/api/admin/custom-assets/reset", requireAdmin, (req, res) => {
    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ error: "Missing asset ID" });
    }
    
    deleteCustomAsset(id);
    res.json({ success: true });
  });

  // Handle client-side routing - serve index.html for all routes
  app.get("*", (_req, res) => {
    res.sendFile(path.join(staticPath, "index.html"));
  });

  // ─── Global Error Handler ───────────────────────────────────────────
  // Must be last middleware — catches unhandled errors
  app.use(
    (
      err: Error,
      _req: express.Request,
      res: express.Response,
      _next: express.NextFunction
    ) => {
      console.error("Unhandled error:", err.message);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  );

  const port = process.env.PORT || 5000;

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
