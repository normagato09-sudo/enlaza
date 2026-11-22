import "server-only";

import { randomBytes } from "node:crypto";
import { query } from "./db";
import type { Ad, Application, Category, PayType, PublicUser, SkillKey, Slot } from "./data";

export type UserRow = {
  discord_id: string;
  username: string;
  display_name: string | null;
  avatar: string | null;
  confirmed_count: number;
  created_at: string | Date;
  banned?: boolean;
};

type AdRow = {
  id: string;
  user_id: string;
  category: Category;
  pay: PayType;
  title: string;
  description: string;
  skill: SkillKey;
  lang: "es" | "en";
  slots: Slot[] | string;
  status: "active" | "review";
  created_at: string | Date;
  expires_at: string | Date;
} & {
  u_username: string;
  u_display_name: string | null;
  u_avatar: string | null;
  u_confirmed: number;
  u_created_at: string | Date;
  u_banned: boolean;
  report_count?: number;
};

const iso = (v: string | Date) => new Date(v).toISOString();

function avatarUrl(id: string, avatar: string | null) {
  if (!avatar) return null;
  if (avatar.startsWith("http")) return avatar;
  return `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=128`;
}

export function toPublicUser(r: UserRow): PublicUser {
  return {
    id: r.discord_id,
    username: r.username,
    displayName: r.display_name,
    avatarUrl: avatarUrl(r.discord_id, r.avatar),
    confirmed: Number(r.confirmed_count) || 0,
    memberSince: iso(r.created_at),
    banned: Boolean(r.banned),
  };
}

function toAd(r: AdRow): Ad {
  return {
    id: r.id,
    category: r.category,
    pay: r.pay,
    title: r.title,
    description: r.description,
    skill: r.skill,
    lang: r.lang,
    slots: typeof r.slots === "string" ? JSON.parse(r.slots) : r.slots ?? [],
    status: r.status,
    createdAt: iso(r.created_at),
    expiresAt: iso(r.expires_at),
    user: toPublicUser({
      discord_id: r.user_id,
      username: r.u_username,
      display_name: r.u_display_name,
      avatar: r.u_avatar,
      confirmed_count: r.u_confirmed,
      created_at: r.u_created_at,
      banned: r.u_banned,
    }),
  };
}

const AD_SELECT = `
  SELECT a.*, u.username AS u_username, u.display_name AS u_display_name,
         u.avatar AS u_avatar, u.confirmed_count AS u_confirmed, u.created_at AS u_created_at,
         u.banned AS u_banned
  FROM ads a JOIN users u ON u.discord_id = a.user_id`;

/** Anuncios visibles para todo el mundo: activos y sin caducar. */
export async function listActiveAds(): Promise<Ad[]> {
  const rows = await query<AdRow>(
    `${AD_SELECT} WHERE a.status = 'active' AND a.expires_at > now() AND NOT u.banned ORDER BY a.created_at DESC LIMIT 500`,
  );
  return rows.map(toAd);
}

export async function getAdById(id: string): Promise<Ad | null> {
  const rows = await query<AdRow>(`${AD_SELECT} WHERE a.id = $1`, [id]);
  return rows[0] ? toAd(rows[0]) : null;
}

export async function getUserByUsername(username: string): Promise<PublicUser | null> {
  const rows = await query<UserRow>(
    "SELECT * FROM users WHERE lower(username) = lower($1) ORDER BY created_at LIMIT 1",
    [username],
  );
  return rows[0] ? toPublicUser(rows[0]) : null;
}

export async function listAdsByUser(userId: string, includeHidden: boolean): Promise<Ad[]> {
  const rows = await query<AdRow>(
    `${AD_SELECT} WHERE a.user_id = $1 ${includeHidden ? "" : "AND a.status = 'active' AND a.expires_at > now()"} ORDER BY a.created_at DESC`,
    [userId],
  );
  return rows.map(toAd);
}

export async function listApplications(adId: string): Promise<Application[]> {
  const rows = await query<UserRow & { slot: string; applied_at: string | Date }>(
    `SELECT ap.slot, ap.created_at AS applied_at, u.*
     FROM applications ap JOIN users u ON u.discord_id = ap.user_id
     WHERE ap.ad_id = $1 ORDER BY ap.created_at`,
    [adId],
  );
  return rows.map((r) => ({ slot: r.slot, createdAt: iso(r.applied_at), user: toPublicUser(r) }));
}

export async function myApplicationSlots(adId: string, userId: string): Promise<string[]> {
  const rows = await query<{ slot: string }>(
    "SELECT slot FROM applications WHERE ad_id = $1 AND user_id = $2",
    [adId, userId],
  );
  return rows.map((r) => r.slot);
}

export async function hasReported(adId: string, userId: string) {
  const rows = await query("SELECT 1 FROM reports WHERE ad_id = $1 AND user_id = $2", [adId, userId]);
  return rows.length > 0;
}

export async function upsertUser(u: {
  id: string;
  username: string;
  displayName: string | null;
  avatar: string | null;
}): Promise<{ isNew: boolean }> {
  const rows = await query<{ inserted: boolean }>(
    `INSERT INTO users (discord_id, username, display_name, avatar)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (discord_id) DO UPDATE
       SET username = EXCLUDED.username, display_name = EXCLUDED.display_name, avatar = EXCLUDED.avatar
     RETURNING (xmax = 0) AS inserted`,
    [u.id, u.username, u.displayName, u.avatar],
  );
  return { isNew: Boolean(rows[0]?.inserted) };
}

/** Para moderar: anuncios en revisión y anuncios activos con alguna denuncia. */
export async function listForModeration(): Promise<{ ad: Ad; reports: number }[]> {
  const rows = await query<AdRow>(
    `${AD_SELECT.replace("FROM ads a", ", (SELECT count(*)::int FROM reports r WHERE r.ad_id = a.id) AS report_count FROM ads a")}
     WHERE a.status = 'review'
        OR EXISTS (SELECT 1 FROM reports r WHERE r.ad_id = a.id)
     ORDER BY (a.status = 'review') DESC, a.created_at DESC
     LIMIT 200`,
  );
  return rows.map((r) => ({ ad: toAd(r), reports: Number(r.report_count) || 0 }));
}

export async function listBannedUsers(): Promise<PublicUser[]> {
  const rows = await query<UserRow>("SELECT * FROM users WHERE banned ORDER BY username");
  return rows.map(toPublicUser);
}

export function newId() {
  return randomBytes(6).toString("base64url");
}
