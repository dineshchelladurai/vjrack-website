import crypto from "crypto";
import { Request } from "express";
import { loginAttempts, MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS, adminSessions } from "./state.js";

export function getClientIp(req: Request): string {
  return (
    (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown"
  );
}

export function isLockedOut(ip: string): { locked: boolean; remainingMs: number } {
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

export function recordFailedAttempt(ip: string): void {
  const record = loginAttempts.get(ip) || { count: 0, lockUntil: 0 };
  record.count += 1;
  if (record.count >= MAX_LOGIN_ATTEMPTS) {
    record.lockUntil = Date.now() + LOCKOUT_DURATION_MS;
  }
  loginAttempts.set(ip, record);
}

export function clearAttempts(ip: string): void {
  loginAttempts.delete(ip);
}

export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("hex");
}

export function cleanExpiredSessions(): void {
  const now = Date.now();
  adminSessions.forEach((expiry, token) => {
    if (now > expiry) {
      adminSessions.delete(token);
    }
  });
}
