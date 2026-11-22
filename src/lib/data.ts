/** Tipos y utilidades compartidos entre servidor y navegador. */

export type Category = "servicios" | "trabajo" | "equipo" | "alianza";
export type PayType = "pagado" | "voluntario" | "reparto";
export type SkillKey =
  | "diseno"
  | "programacion"
  | "video"
  | "bots"
  | "redes"
  | "voz"
  | "otra";
export type Role = "trabajar" | "contratar" | "proyecto" | "todo";

export const CATEGORIES: Category[] = ["servicios", "trabajo", "equipo", "alianza"];

export type NicheKey =
  | "gaming"
  | "arte"
  | "musica"
  | "tecnologia"
  | "crecimiento"
  | "educacion"
  | "contenido"
  | "moda"
  | "deporte"
  | "otro";
export const NICHES: NicheKey[] = [
  "gaming",
  "arte",
  "musica",
  "tecnologia",
  "crecimiento",
  "educacion",
  "contenido",
  "moda",
  "deporte",
  "otro",
];
export const PAY_TYPES: PayType[] = ["pagado", "voluntario", "reparto"];
export const SKILLS: SkillKey[] = ["programacion", "diseno", "video", "bots", "redes", "voz", "otra"];

export type Slot = { name: string; detail?: string; takenBy?: string };

export type PublicUser = {
  id: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  confirmed: number;
  memberSince: string; // ISO
  banned: boolean;
};

export type Viewer = PublicUser & { isAdmin: boolean; unread: number };

export type ModerationItem = Ad & { reports: number; scam: boolean };

export type Ad = {
  id: string;
  category: Category;
  pay: PayType;
  title: string;
  description: string;
  skill: SkillKey;
  lang: "es" | "en";
  slots: Slot[];
  niche: NicheKey | null;
  status: "active" | "review";
  createdAt: string; // ISO
  expiresAt: string; // ISO
  user: PublicUser;
};

export type Message = { id: string; fromMe: boolean; body: string; createdAt: string };
export type Conversation = { user: PublicUser; last: string; lastAt: string; unread: number };
export type Review = { from: PublicUser; body: string; createdAt: string };
export type CollabState =
  | { kind: "none" }
  | { kind: "sent" }
  | { kind: "received"; id: string }
  | { kind: "confirmed"; id: string; reviewed: boolean };
export type PendingCollab = { id: string; user: PublicUser; createdAt: string };

export type Application = { slot: string; user: PublicUser; createdAt: string };

/** Qué secciones ve cada objetivo elegido en la bienvenida. */
export const roleCategories: Record<Role, Category[]> = {
  trabajar: ["equipo"],
  contratar: ["servicios", "trabajo"],
  proyecto: ["trabajo", "servicios", "equipo", "alianza"],
  todo: ["servicios", "trabajo", "equipo", "alianza"],
};

export function hoursSince(iso: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 3_600_000));
}

export function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000));
}

export function isExpired(iso: string) {
  return new Date(iso).getTime() < Date.now();
}

export function timeAgo(iso: string, lang: "es" | "en") {
  const hours = hoursSince(iso);
  if (hours < 1) return lang === "es" ? "hace un momento" : "just now";
  if (hours < 24) return lang === "es" ? `hace ${hours} h` : `${hours} h ago`;
  const d = Math.floor(hours / 24);
  if (lang === "es") return `hace ${d} ${d === 1 ? "día" : "días"}`;
  return `${d} ${d === 1 ? "day" : "days"} ago`;
}

export function monthYear(iso: string, lang: "es" | "en") {
  return new Date(iso).toLocaleDateString(lang === "es" ? "es-ES" : "en-GB", {
    month: "short",
    year: "numeric",
  });
}

/** Color estable para el avatar sin foto, a partir del nombre. */
export function colorFor(name: string) {
  const palette = ["#7A3FC4", "#C2410C", "#0F766E", "#1D4ED8", "#4338CA", "#B91C1C", "#0E7490", "#A21CAF"];
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return palette[h % palette.length];
}

/** Detección sencilla de señales de estafa en el texto de un anuncio. */
const scamPatterns = [
  /pag(ar|a|ues|o)\b.{0,30}(adelantado|antes)/i,
  /por adelantado/i,
  /upfront|in advance|pay (first|before)/i,
  /contraseñ|password|c[oó]digo de verificaci|verification code/i,
  /tarjeta|card number|bizum.{0,20}antes/i,
];

export function looksLikeScam(text: string) {
  return scamPatterns.some((p) => p.test(text));
}
