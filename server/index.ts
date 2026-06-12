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
import helmet from "helmet";
import compression from "compression";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Admin Authentication ────────────────────────────────────────────────────
// Password hash MUST be provided via environment variable — no fallback
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH;
if (!ADMIN_PASSWORD_HASH) {
  console.error("FATAL: ADMIN_PASSWORD_HASH environment variable is not set.");
  console.error("Generate one with: node -e \"require('bcryptjs').hash('yourpassword', 10).then(console.log)\"");
  process.exit(1);
}

const DATA_DIR = path.resolve(__dirname, "..", "data");
const ADMIN_CONFIG_FILE = path.join(DATA_DIR, "adminConfig.json");

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

let adminTotpSecret: string | null = null;
try {
  if (fs.existsSync(ADMIN_CONFIG_FILE)) {
    const config = JSON.parse(fs.readFileSync(ADMIN_CONFIG_FILE, "utf-8"));
    adminTotpSecret = config.totpSecret || null;
  }
} catch (e) {
  console.error("Failed to load admin config:", e);
}

function saveAdminTotpSecret(secret: string) {
  adminTotpSecret = secret;
  try {
    fs.writeFileSync(ADMIN_CONFIG_FILE, JSON.stringify({ totpSecret: secret }, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to save admin config:", e);
  }
}

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
        "img-src 'self' data: https://vjrack.com https://*.vjrack.com",
        "media-src 'self' https://vjrack.com https://*.vjrack.com",
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

    if (!(await bcrypt.compare(password, ADMIN_PASSWORD_HASH))) {
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

  // ─── Enquiry API ──────────────────────────────────────────────────────

  // File-based enquiry store
  const ENQUIRIES_FILE = path.join(DATA_DIR, "enquiries.json");
  const BLOGS_FILE = path.join(DATA_DIR, "blogPosts.json");

  // Image Uploads Setup
  const UPLOADS_DIR = path.join(DATA_DIR, "uploads");
  if (!fs.existsSync(UPLOADS_DIR)) {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
  }

  // Serve uploads statically
  app.use("/uploads", express.static(UPLOADS_DIR));

  const ALLOWED_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp)$/i;
  const ALLOWED_MIMETYPES = /^image\/(jpeg|png|gif|webp)$/;

  const storage = multer.diskStorage({
    destination: function (_req, _file, cb) {
      cb(null, UPLOADS_DIR);
    },
    filename: function (_req, file, cb) {
      // Force safe extension based on mimetype instead of trusting original
      const mimeToExt: Record<string, string> = {
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/gif': '.gif',
        'image/webp': '.webp',
      };
      const safeExt = mimeToExt[file.mimetype] || '.jpg';
      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
      cb(null, file.fieldname + '-' + uniqueSuffix + safeExt);
    }
  });

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

  // POST /api/upload — admin-only: upload an image
  app.post("/api/upload", requireAdmin, upload.single("image"), (req, res) => {
    if (!req.file) {
      res.status(400).json({ success: false, error: "No image provided" });
      return;
    }

    // Return the URL to the uploaded file
    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({ success: true, url: imageUrl });
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

  let enquiries: Enquiry[] = [];
  let enquiryIdCounter = 1;
  let blogPosts: BlogPost[] = [];

  // Load existing data
  try {
    if (fs.existsSync(ENQUIRIES_FILE)) {
      const data = fs.readFileSync(ENQUIRIES_FILE, "utf-8");
      enquiries = JSON.parse(data);
      if (enquiries.length > 0) {
        enquiryIdCounter = Math.max(...enquiries.map((e) => e.id)) + 1;
      }
    }
    if (fs.existsSync(BLOGS_FILE)) {
      const data = fs.readFileSync(BLOGS_FILE, "utf-8");
      blogPosts = JSON.parse(data);
    }
  } catch (error) {
    console.error("Failed to load data from disk:", error);
  }

  function saveEnquiries() {
    try {
      fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(enquiries, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save enquiries to disk:", error);
    }
  }

  function saveBlogPosts() {
    try {
      fs.writeFileSync(BLOGS_FILE, JSON.stringify(blogPosts, null, 2), "utf-8");
    } catch (error) {
      console.error("Failed to save blog posts to disk:", error);
    }
  }

  // Per-IP rate limiting for enquiry submissions
  const enquiryRateLimits = new Map<
    string,
    { count: number; windowStart: number }
  >();
  const MAX_ENQUIRIES_PER_WINDOW = 3;
  const ENQUIRY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

  // Basic HTML/script sanitizer — strip tags and dangerous chars
  function sanitizeInput(input: string): string {
    return input
      .replace(/<[^>]*>/g, "") // Strip HTML tags
      .replace(/[<>'"]/g, "") // Remove angle brackets and quotes
      .trim();
  }

  // POST /api/enquiry — submit an enquiry from popup or contact page
  app.post("/api/enquiry", (req, res) => {
    const ip = getClientIp(req);

    // Rate limiting
    const now = Date.now();
    const rateRecord = enquiryRateLimits.get(ip);
    if (rateRecord) {
      if (now - rateRecord.windowStart < ENQUIRY_WINDOW_MS) {
        if (rateRecord.count >= MAX_ENQUIRIES_PER_WINDOW) {
          res.status(429).json({
            success: false,
            error:
              "Too many enquiries submitted. Please try again in a few minutes.",
          });
          return;
        }
        rateRecord.count += 1;
      } else {
        // Window expired, reset
        rateRecord.count = 1;
        rateRecord.windowStart = now;
      }
    } else {
      enquiryRateLimits.set(ip, { count: 1, windowStart: now });
    }

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
      id: enquiryIdCounter++,
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

    enquiries.push(enquiry);
    saveEnquiries();

    // Log enquiry without PII (GDPR / data protection compliance)
    console.log(
      `[Enquiry #${enquiry.id}] source=${enquiry.source} | category=${enquiry.productInterest}`
    );

    res.json({ success: true, message: "Enquiry submitted successfully." });
  });

  // GET /api/enquiries — admin-only: list all enquiries
  app.get("/api/enquiries", requireAdmin, (_req, res) => {
    res.json({ success: true, enquiries: [...enquiries].reverse() });
  });

  // ─── Blog API ─────────────────────────────────────────────────────────

  // GET /api/blog — get all custom blog posts
  app.get("/api/blog", (req, res) => {
    res.json({ success: true, posts: blogPosts });
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

    blogPosts.unshift(newPost);
    saveBlogPosts();
    res.json({ success: true, post: newPost });
  });

  // DELETE /api/blog/:id — admin-only: delete a post
  app.delete("/api/blog/:id", requireAdmin, (req, res) => {

    const { id } = req.params;
    const initialLength = blogPosts.length;
    blogPosts = blogPosts.filter(p => p.id !== id);

    if (blogPosts.length < initialLength) {
      saveBlogPosts();
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
