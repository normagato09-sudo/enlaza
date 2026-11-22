"use server";

import { refresh } from "next/cache";
import { query } from "./db";
import {
  CATEGORIES,
  PAY_TYPES,
  SKILLS,
  looksLikeScam,
  type Category,
  type PayType,
  type SkillKey,
  type Slot,
} from "./data";
import { getAdById, newId } from "./queries";
import { getCurrentUser, isAdmin } from "./session";

type Result<T = object> = ({ ok: true } & T) | { ok: false; error: string };

const REPORTS_TO_HIDE = 3;

export type NewAdInput = {
  category: Category;
  pay: PayType;
  title: string;
  description: string;
  skill: SkillKey;
  lang: "es" | "en";
  weeks: 1 | 4;
  slots: { name: string; taken: boolean }[];
};

export async function createAd(input: NewAdInput): Promise<Result<{ id: string; review: boolean }>> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (user.banned) return { ok: false, error: "banned" };

  const title = String(input.title ?? "").trim().slice(0, 90);
  const description = String(input.description ?? "").trim().slice(0, 1000);
  if (!CATEGORIES.includes(input.category)) return { ok: false, error: "category" };
  if (!PAY_TYPES.includes(input.pay)) return { ok: false, error: "pay" };
  if (!SKILLS.includes(input.skill)) return { ok: false, error: "skill" };
  if (title.length < 8) return { ok: false, error: "title" };
  if (description.length < 20) return { ok: false, error: "description" };

  const lang = input.lang === "en" ? "en" : "es";
  const weeks = input.weeks === 1 ? 1 : 4;
  const slots: Slot[] =
    input.category === "equipo"
      ? (input.slots ?? [])
          .map((s) => ({ name: String(s.name ?? "").trim().slice(0, 60), taken: Boolean(s.taken) }))
          .filter((s) => s.name)
          .slice(0, 12)
          .map((s) => (s.taken ? { name: s.name, takenBy: user.username } : { name: s.name }))
      : [];

  const review = looksLikeScam(`${title} ${description}`);
  const id = newId();
  await query(
    `INSERT INTO ads (id, user_id, category, pay, title, description, skill, lang, slots, status, expires_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10, now() + ($11 || ' days')::interval)`,
    [id, user.id, input.category, input.pay, title, description, input.skill, lang, JSON.stringify(slots), review ? "review" : "active", String(weeks * 7)],
  );
  return { ok: true, id, review };
}

export async function applyToSlot(adId: string, slot: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (user.banned) return { ok: false, error: "banned" };
  const ad = await getAdById(adId);
  if (!ad || ad.status !== "active") return { ok: false, error: "notfound" };
  if (ad.user.id === user.id) return { ok: false, error: "own" };
  const target = ad.slots.find((s) => s.name === slot);
  if (!target || target.takenBy) return { ok: false, error: "slot" };
  await query(
    "INSERT INTO applications (ad_id, slot, user_id) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING",
    [adId, slot, user.id],
  );
  refresh();
  return { ok: true };
}

/** La persona que publicó acepta a alguien para un puesto: el puesto queda cubierto. */
export async function acceptApplicant(adId: string, slot: string, username: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  const ad = await getAdById(adId);
  if (!ad || ad.user.id !== user.id) return { ok: false, error: "forbidden" };
  const slots = ad.slots.map((s) => (s.name === slot ? { ...s, takenBy: username } : s));
  await query("UPDATE ads SET slots = $2::jsonb WHERE id = $1", [adId, JSON.stringify(slots)]);
  await query("DELETE FROM applications WHERE ad_id = $1 AND slot = $2", [adId, slot]);
  refresh();
  return { ok: true };
}

export async function reportAd(adId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (user.banned) return { ok: false, error: "banned" };
  await query("INSERT INTO reports (ad_id, user_id) VALUES ($1,$2) ON CONFLICT DO NOTHING", [adId, user.id]);
  const rows = await query<{ n: number }>("SELECT count(*)::int AS n FROM reports WHERE ad_id = $1", [adId]);
  if ((rows[0]?.n ?? 0) >= REPORTS_TO_HIDE) {
    await query("UPDATE ads SET status = 'review' WHERE id = $1", [adId]);
  }
  refresh();
  return { ok: true };
}

export async function renewAd(adId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  await query(
    "UPDATE ads SET expires_at = now() + interval '28 days' WHERE id = $1 AND user_id = $2",
    [adId, user.id],
  );
  refresh();
  return { ok: true };
}

export async function deleteAd(adId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  await query("DELETE FROM ads WHERE id = $1 AND user_id = $2", [adId, user.id]);
  return { ok: true };
}

// ---------- Moderación (solo moderadores) ----------

async function requireAdmin() {
  const user = await getCurrentUser();
  return user && isAdmin(user) ? user : null;
}

/** Aprueba un anuncio: vuelve a ser visible y se borran sus denuncias. */
export async function approveAd(adId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  await query("UPDATE ads SET status = 'active' WHERE id = $1", [adId]);
  await query("DELETE FROM reports WHERE ad_id = $1", [adId]);
  refresh();
  return { ok: true };
}

/** Descarta las denuncias de un anuncio que sigue visible. */
export async function dismissReports(adId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  await query("DELETE FROM reports WHERE ad_id = $1", [adId]);
  refresh();
  return { ok: true };
}

export async function adminDeleteAd(adId: string): Promise<Result> {
  if (!(await requireAdmin())) return { ok: false, error: "forbidden" };
  await query("DELETE FROM ads WHERE id = $1", [adId]);
  refresh();
  return { ok: true };
}

/** Bloquea a una persona: sus anuncios dejan de verse y no puede publicar ni apuntarse. */
export async function setBanned(userId: string, banned: boolean): Promise<Result> {
  const admin = await requireAdmin();
  if (!admin) return { ok: false, error: "forbidden" };
  if (admin.id === userId) return { ok: false, error: "self" };
  await query("UPDATE users SET banned = $2 WHERE discord_id = $1", [userId, banned]);
  refresh();
  return { ok: true };
}
