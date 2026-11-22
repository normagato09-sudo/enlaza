"use server";

import { refresh } from "next/cache";
import { query } from "./db";
import {
  CATEGORIES,
  NICHES,
  PAY_TYPES,
  SKILLS,
  looksLikeScam,
  type Category,
  type NicheKey,
  type PayType,
  type SkillKey,
  type Slot,
} from "./data";
import { getAdById, getUserByUsername, newId } from "./queries";
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
  niche: NicheKey | null;
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

  const niche = input.niche && NICHES.includes(input.niche) ? input.niche : null;
  if (input.category === "alianza" && !niche) return { ok: false, error: "niche" };
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
    `INSERT INTO ads (id, user_id, category, pay, title, description, skill, lang, slots, status, expires_at, niche)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9::jsonb,$10, now() + ($11 || ' days')::interval, $12)`,
    [id, user.id, input.category, input.pay, title, description, input.skill, lang, JSON.stringify(slots), review ? "review" : "active", String(weeks * 7), niche],
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
  const member = await getUserByUsername(username);
  if (member && member.id !== user.id) await confirmPair(user.id, member.id);
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

// ---------- Mensajes ----------

export async function sendMessage(toUsername: string, body: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (user.banned) return { ok: false, error: "banned" };
  const text = String(body ?? "").trim().slice(0, 2000);
  if (!text) return { ok: false, error: "empty" };
  const to = await getUserByUsername(toUsername);
  if (!to || to.id === user.id) return { ok: false, error: "notfound" };
  await query("INSERT INTO messages (from_id, to_id, body) VALUES ($1, $2, $3)", [user.id, to.id, text]);
  refresh();
  return { ok: true };
}

// ---------- Colaboraciones y valoraciones ----------

/** Deja la colaboración entre dos personas confirmada y suma 1 a la reputación de ambas. */
async function confirmPair(aId: string, bId: string) {
  const existing = await query<{ id: string; status: string }>(
    `SELECT id, status FROM collaborations
     WHERE LEAST(a_id, b_id) = LEAST($1, $2) AND GREATEST(a_id, b_id) = GREATEST($1, $2)`,
    [aId, bId],
  );
  if (existing[0]?.status === "confirmed") return;
  if (existing[0]) {
    await query("UPDATE collaborations SET status = 'confirmed' WHERE id = $1", [existing[0].id]);
  } else {
    await query("INSERT INTO collaborations (id, a_id, b_id, status) VALUES ($1, $2, $3, 'confirmed')", [newId(), aId, bId]);
  }
  await query("UPDATE users SET confirmed_count = confirmed_count + 1 WHERE discord_id IN ($1, $2)", [aId, bId]);
}

/** "Hemos colaborado": la otra persona tiene que confirmarlo. */
export async function requestCollab(otherId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (user.banned) return { ok: false, error: "banned" };
  if (user.id === otherId) return { ok: false, error: "self" };
  await query(
    "INSERT INTO collaborations (id, a_id, b_id) VALUES ($1, $2, $3) ON CONFLICT DO NOTHING",
    [newId(), user.id, otherId],
  );
  refresh();
  return { ok: true };
}

export async function confirmCollab(collabId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  const rows = await query<{ a_id: string; b_id: string; status: string }>(
    "SELECT a_id, b_id, status FROM collaborations WHERE id = $1",
    [collabId],
  );
  const c = rows[0];
  if (!c || c.b_id !== user.id || c.status !== "pending") return { ok: false, error: "forbidden" };
  await confirmPair(c.a_id, c.b_id);
  refresh();
  return { ok: true };
}

export async function declineCollab(collabId: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  await query("DELETE FROM collaborations WHERE id = $1 AND b_id = $2 AND status = 'pending'", [collabId, user.id]);
  refresh();
  return { ok: true };
}

export async function leaveReview(collabId: string, body: string): Promise<Result> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, error: "login" };
  if (user.banned) return { ok: false, error: "banned" };
  const text = String(body ?? "").trim().slice(0, 400);
  if (text.length < 5) return { ok: false, error: "empty" };
  const rows = await query<{ a_id: string; b_id: string; status: string }>(
    "SELECT a_id, b_id, status FROM collaborations WHERE id = $1",
    [collabId],
  );
  const c = rows[0];
  if (!c || c.status !== "confirmed" || (c.a_id !== user.id && c.b_id !== user.id)) {
    return { ok: false, error: "forbidden" };
  }
  const toId = c.a_id === user.id ? c.b_id : c.a_id;
  await query(
    "INSERT INTO reviews (collab_id, from_id, to_id, body) VALUES ($1, $2, $3, $4) ON CONFLICT DO NOTHING",
    [collabId, user.id, toId, text],
  );
  refresh();
  return { ok: true };
}
