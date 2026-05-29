import type { Request, Response } from "express";
import { fromNodeHeaders } from "better-auth/node";
import { auth } from "./auth.js";
import prisma from "./prisma.js";
import { buildSessionTokens, getCookieOptions, hashToken, persistTokens } from "./auth-service.js";

export type AuthUser = {
  id: string;
  role: "OWNER" | "DRIVER" | "ADMIN";
  isActive: boolean;
};

export async function getAuthUser(req: Request, res: Response): Promise<AuthUser | null> {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (session?.user) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, role: true, isActive: true },
    });

    return user;
  }

  const accessToken = req.cookies?.accessToken || req.cookies?.session;
  if (accessToken) {
    const account = await prisma.account.findFirst({
      where: {
        accessToken,
        accessTokenExpiresAt: { gt: new Date() },
      },
      select: { userId: true },
    });

    if (account) {
      return prisma.user.findUnique({
        where: { id: account.userId },
        select: { id: true, role: true, isActive: true },
      });
    }
  }

  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return null;

  const refreshAccount = await prisma.account.findFirst({
    where: {
      refreshToken: hashToken(refreshToken),
      refreshTokenExpiresAt: { gt: new Date() },
    },
    select: { userId: true },
  });

  if (!refreshAccount) return null;

  const tokens = buildSessionTokens();
  await persistTokens(refreshAccount.userId, tokens);
  res.cookie("accessToken", tokens.accessToken, getCookieOptions(15 * 60 * 1000));
  res.cookie("refreshToken", tokens.refreshToken, getCookieOptions(30 * 24 * 60 * 60 * 1000));
  res.cookie("session", tokens.accessToken, getCookieOptions(15 * 60 * 1000));

  const user = await prisma.user.findUnique({
    where: { id: refreshAccount.userId },
    select: { id: true, role: true, isActive: true },
  });

  return user;
}

export async function requireUser(req: Request, res: Response, roles?: AuthUser["role"][]) {
  const user = await getAuthUser(req, res);

  if (!user) {
    res.status(401).json({ error: "Authentication required" });
    return null;
  }

  if (!user.isActive) {
    res.status(403).json({ error: "Account is disabled" });
    return null;
  }

  if (roles && !roles.includes(user.role)) {
    res.status(403).json({ error: "You do not have permission to access this resource" });
    return null;
  }

  return user;
}
