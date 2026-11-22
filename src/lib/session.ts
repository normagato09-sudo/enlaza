import "server-only";

import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { query } from "./db";
import type { PublicUser, Viewer } from "./data";
import { toPublicUser, type UserRow } from "./queries";

export const SESSION_COOKIE = "enlaza_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 días

function secret() {
  const s = process.env.AUTH_SECRET || process.env.DISCORD_CLIENT_SECRET;
  if (s) return s;
  if (process.env.NODE_ENV !== "production") return "solo-para-pruebas-en-local";
  throw new Error("Falta DISCORD_CLIENT_SECRET en las variables de entorno de Vercel.");
}

function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}

/** Crea el valor firmado de la cookie de sesión: id.caducidad.firma */
export function createSessionValue(userId: string) {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE;
  const payload = `${userId}.${exp}`;
  return `${payload}.${sign(payload)}`;
}

export function readSessionValue(value: string | undefined): string | null {
  if (!value) return null;
  const parts = value.split(".");
  if (parts.length !== 3) return null;
  const [userId, exp, sig] = parts;
  const expected = Buffer.from(sign(`${userId}.${exp}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return null;
  if (Number(exp) * 1000 < Date.now()) return null;
  return userId;
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: MAX_AGE,
};

/** Usuario con sesión iniciada, o null. */
export async function getCurrentUser(): Promise<PublicUser | null> {
  await connection();
  const store = await cookies();
  const userId = readSessionValue(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;
  const rows = await query<UserRow>("SELECT * FROM users WHERE discord_id = $1", [userId]);
  return rows[0] ? toPublicUser(rows[0]) : null;
}

/**
 * Moderadores: variable ENLAZA_ADMINS en Vercel con nombres de usuario
 * de Discord (o IDs) separados por comas. Ej.: "norma,lucas"
 */
export function isAdmin(user: Pick<PublicUser, "id" | "username"> | null) {
  if (!user) return false;
  const list = (process.env.ENLAZA_ADMINS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return list.includes(user.username.toLowerCase()) || list.includes(user.id);
}

export async function getViewer(): Promise<Viewer | null> {
  const user = await getCurrentUser();
  return user ? { ...user, isAdmin: isAdmin(user) } : null;
}
