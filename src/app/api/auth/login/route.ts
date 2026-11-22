import { randomBytes } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";

/** Manda a la persona a Discord para que inicie sesión. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const next = request.nextUrl.searchParams.get("next") || "/";
  const clientId = process.env.DISCORD_CLIENT_ID;

  if (!clientId) {
    // En local, sin Discord configurado, se puede probar con una cuenta de prueba.
    if (process.env.NODE_ENV !== "production") {
      return NextResponse.redirect(new URL(`/api/auth/dev?next=${encodeURIComponent(next)}`, origin));
    }
    return new NextResponse(
      "Falta DISCORD_CLIENT_ID en las variables de entorno de Vercel.",
      { status: 500 },
    );
  }

  const state = randomBytes(16).toString("base64url");
  const url = new URL("https://discord.com/oauth2/authorize");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", `${origin}/api/auth/callback`);
  url.searchParams.set("scope", "identify");
  url.searchParams.set("state", state);

  const res = NextResponse.redirect(url);
  const opts = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 600,
  };
  res.cookies.set("enlaza_oauth_state", state, opts);
  res.cookies.set("enlaza_oauth_next", next.startsWith("/") ? next : "/", opts);
  return res;
}
