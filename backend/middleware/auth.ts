import { auth } from "../src/lib/auth.js";
import type { Request, Response, NextFunction } from "express";

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  try {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
      if (value) {
        if (Array.isArray(value)) {
          value.forEach((v) => headers.append(key, v));
        } else {
          headers.set(key, value);
        }
      }
    }

    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as any).user = session.user;
    (req as any).session = session.session;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
