import { Request, Response, NextFunction } from "express";
import { adminSessions } from "../services/state.js";

export function requireAdmin(
  req: Request,
  res: Response,
  next: NextFunction
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
