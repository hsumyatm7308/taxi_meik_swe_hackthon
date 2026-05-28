import { auth } from "../src/lib/auth.js";
import prisma from "../src/lib/prisma.js";
import type { Request, Response, NextFunction } from "express";

function parseCookieHeader(header: string | undefined) {
  const cookies: Record<string, string> = {};
  if (!header) {
    return cookies;
  }

  for (const part of header.split(";")) {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey || rawValue.length === 0) {
      continue;
    }

    cookies[rawKey] = decodeURIComponent(rawValue.join("="));
  }

  return cookies;
}

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

    if (session?.user?.id) {
      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user || !user.isActive) {
        return res.status(403).json({ error: "Forbidden" });
      }

      (req as any).user = user;
      (req as any).session = session.session;
      return next();
    }

    const cookies = parseCookieHeader(req.headers.cookie);
    const accessToken = cookies.accessToken || cookies.session;
    if (!accessToken) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const account = await prisma.account.findFirst({
      where: {
        accessToken,
        accessTokenExpiresAt: { gt: new Date() },
      },
      select: {
        user: true,
      },
    });

    if (!account || !account.user.isActive) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    (req as any).user = account.user;
    (req as any).session = {
      token: accessToken,
    };
    return next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
