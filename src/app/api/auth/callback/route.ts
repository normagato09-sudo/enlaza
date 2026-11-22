import { NextResponse, type NextRequest } from "next/server";
import { upsertUser } from "@/lib/queries";
import { SESSION_COOKIE, createSessionValue, sessionCookieOptions } from "@/lib/session";

type DiscordUser = {
  id: string;
  username: string;
  global_name: string | null;
  avatar: string | null;
};

/** Discord vuelve aquí después de que la persona inicie sesión. */
export async function GET(request: NextRequest) {
  const origin = request.nextUrl.origin;
  const code = request.nextUrl.searchParams.get("code");
  const state = request.nextUrl.searchParams.get("state");
  const savedState = request.cookies.get("enlaza_oauth_state")?.value;
  const next = request.cookies.get("enlaza_oauth_next")?.value || "/";
  const fail = (reason: string) =>
    NextResponse.redirect(new URL(`/?login_error=${encodeURIComponent(reason)}`, origin));

  if (!code || !state || !savedState || state !== savedState) return fail("state");

  const clientId = process.env.DISCORD_CLIENT_ID;
  const clientSecret = process.env.DISCORD_CLIENT_SECRET;
  if (!clientId || !clientSecret) return fail("config");

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "authorization_code",
      code,
      redirect_uri: `${origin}/api/auth/callback`,
    }),
  });
  if (!tokenRes.ok) return fail("token");
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) return fail("token");

  const meRes = await fetch("https://discord.com/api/users/@me", {
    headers: { Authorization: `Bearer ${token.access_token}` },
  });
  if (!meRes.ok) return fail("user");
  const me = (await meRes.json()) as DiscordUser;

  const { isNew } = await upsertUser({
    id: me.id,
    username: me.username,
    displayName: me.global_name,
    avatar: me.avatar,
  });

  const res = NextResponse.redirect(new URL(isNew ? "/bienvenida" : next, origin));
  res.cookies.set(SESSION_COOKIE, createSessionValue(me.id), sessionCookieOptions);
  res.cookies.delete("enlaza_oauth_state");
  res.cookies.delete("enlaza_oauth_next");
  return res;
}
