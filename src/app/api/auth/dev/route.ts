import { connection, NextResponse, type NextRequest } from "next/server";
import { upsertUser } from "@/lib/queries";
import { SESSION_COOKIE, createSessionValue, sessionCookieOptions } from "@/lib/session";

/**
 * Solo para probar en local (nunca funciona en producción):
 * entra con una cuenta de prueba, p. ej. /api/auth/dev?u=prueba
 */
export async function GET(request: NextRequest) {
  await connection();
  if (process.env.NODE_ENV === "production" && !process.env.ENLAZA_ALLOW_DEV_LOGIN) {
    return new NextResponse("No disponible", { status: 404 });
  }
  const name = (request.nextUrl.searchParams.get("u") || "prueba").replace(/[^a-z0-9._]/gi, "").slice(0, 32) || "prueba";
  const next = request.nextUrl.searchParams.get("next") || "/";
  const id = `dev-${name}`;
  const { isNew } = await upsertUser({ id, username: name, displayName: null, avatar: null });
  const res = NextResponse.redirect(new URL(isNew ? "/bienvenida" : next, request.nextUrl.origin));
  res.cookies.set(SESSION_COOKIE, createSessionValue(id), sessionCookieOptions);
  return res;
}
