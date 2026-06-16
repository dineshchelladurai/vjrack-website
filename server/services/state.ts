import { getAdminConfig, updateAdminConfig } from '../db.js';

// Load admin config from database
export const adminConfig = getAdminConfig();
// If no password is set in the database (e.g. fresh installation), generate a secure one-time setup password
if (!adminConfig.passwordHash) {
  const crypto = require('crypto');
  const bcrypt = require('bcryptjs');
  const tempPassword = crypto.randomBytes(6).toString('hex');
  console.log('================================================================');
  console.log('🔒 FIRST-TIME SETUP: No admin password found.');
  console.log(`🔑 Your temporary login password is: ${tempPassword}`);
  console.log('⚠️  Please log in and change this immediately from the Settings panel!');
  console.log('================================================================');
  
  const tempHash = bcrypt.hashSync(tempPassword, 10);
  updateAdminConfig({ passwordHash: tempHash });
  adminConfig.passwordHash = tempHash;
}

export let ADMIN_PASSWORD_HASH = adminConfig.passwordHash;

export let adminTotpSecret: string | null = adminConfig.totpSecret;

export function saveAdminTotpSecret(secret: string) {
  adminTotpSecret = secret;
  updateAdminConfig({ totpSecret: secret });
}

// Active admin sessions: token -> expiry timestamp
export const adminSessions = new Map<string, number>();
export const SESSION_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

// Rate limiting for login attempts
export const loginAttempts = new Map<string, { count: number; lockUntil: number }>();
export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes

export const passwordResetTokens = new Map<string, { expiry: number }>();

// Enquiry Rate Limiter
export const enquiryRateLimits = new Map<string, { count: number; windowStart: number }>();
export const MAX_ENQUIRIES_PER_WINDOW = 3;
export const ENQUIRY_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
