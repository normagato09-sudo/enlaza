/**
 * Datos de ejemplo (paso 1).
 * En el siguiente paso esto se sustituye por la base de datos.
 */

export type Category = "servicios" | "trabajo" | "equipo";
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

export type Slot = { name: string; detail?: string; takenBy?: string };

export type Ad = {
  id: string;
  category: Category;
  pay: PayType;
  title: string;
  text: string;
  body: string[];
  skill: SkillKey;
  lang: "es" | "en";
  user: string;
  postedHoursAgo: number;
  expiresInDays: number;
  slots?: Slot[];
};

export type Review = { from: string; text: string };

export type User = {
  username: string;
  color: string;
  headline: string;
  bio: string;
  languages: string;
  memberSince: string;
  confirmed: number;
  finished: number;
  reports: number;
  communities: string[];
  reviews: Review[];
  portfolio: { title: string; tag: string }[];
};

/** Qué secciones ve cada objetivo elegido en la bienvenida. */
export const roleCategories: Record<Role, Category[]> = {
  trabajar: ["equipo"],
  contratar: ["servicios", "trabajo"],
  proyecto: ["trabajo", "servicios", "equipo"],
  todo: ["servicios", "trabajo", "equipo"],
};

export const users: User[] = [
  {
    username: "kairo.dev",
    color: "#7A3FC4",
    headline: "Programador y guionista · Barcelona",
    bio: "Hago juegos en Roblox y me encanta escribir historias. Busco gente con ganas para terminar proyectos de verdad.",
    languages: "Español · English",
    memberSince: "nov. 2026",
    confirmed: 3,
    finished: 1,
    reports: 0,
    communities: ["CIFA", "Comunidad de ejemplo"],
    reviews: [
      { from: "mira.art", text: "Cumple lo que dice y avisa si va con retraso. Repetiría." },
      { from: "botsmith", text: "Muy buen guion para nuestro evento. Rápido y claro." },
    ],
    portfolio: [
      { title: "Mini juego de carreras", tag: "Programación · Roblox" },
      { title: "Guion del evento de verano", tag: "Guion" },
    ],
  },
  {
    username: "martaedits",
    color: "#C2410C",
    headline: "Editora de vídeo",
    bio: "Edito vídeos para creadores: cortes, subtítulos, efectos y miniaturas.",
    languages: "Español",
    memberSince: "nov. 2026",
    confirmed: 7,
    finished: 6,
    reports: 0,
    communities: ["Comunidad de ejemplo"],
    reviews: [{ from: "nil.street", text: "Entrega rápida y muy cuidada." }],
    portfolio: [{ title: "Vídeo de presentación de marca", tag: "Edición de vídeo" }],
  },
  {
    username: "lu.design",
    color: "#0F766E",
    headline: "Diseñadora gráfica",
    bio: "Logos, banners y paquetes de marca para servidores y proyectos.",
    languages: "Español · Català",
    memberSince: "nov. 2026",
    confirmed: 0,
    finished: 0,
    reports: 0,
    communities: ["CIFA"],
    reviews: [],
    portfolio: [{ title: "Identidad para un servidor de arte", tag: "Diseño" }],
  },
  {
    username: "nil.street",
    color: "#1D4ED8",
    headline: "Fundador de una marca de ropa",
    bio: "Diseño ropa urbana y estoy montando mi primera marca.",
    languages: "Español · Català",
    memberSince: "nov. 2026",
    confirmed: 2,
    finished: 1,
    reports: 0,
    communities: [],
    reviews: [{ from: "martaedits", text: "Sabe lo que quiere y paga a tiempo." }],
    portfolio: [],
  },
  {
    username: "botsmith",
    color: "#4338CA",
    headline: "Desarrollador de bots de Discord",
    bio: "Bots a medida: tickets, niveles, verificación y minijuegos.",
    languages: "Español · English",
    memberSince: "nov. 2026",
    confirmed: 12,
    finished: 11,
    reports: 0,
    communities: ["Comunidad de ejemplo"],
    reviews: [{ from: "kairo.dev", text: "El bot funcionó a la primera." }],
    portfolio: [{ title: "Bot de tickets y niveles", tag: "Bots de Discord" }],
  },
  {
    username: "pau.veu",
    color: "#B91C1C",
    headline: "Actor de doblaje",
    bio: "Castellano neutro y catalán. Micro y espacio de grabación en casa.",
    languages: "Español · Català",
    memberSince: "nov. 2026",
    confirmed: 4,
    finished: 4,
    reports: 0,
    communities: ["CIFA"],
    reviews: [{ from: "kairo.dev", text: "Voz clara y muy profesional." }],
    portfolio: [{ title: "Doblaje de un corto animado", tag: "Doblaje y voz" }],
  },
];

export const ads: Ad[] = [
  {
    id: "equipo-rol-roblox",
    category: "equipo",
    pay: "reparto",
    title: "Equipo para un juego de rol en Roblox",
    text: "Tenemos la historia, el mapa y una artista. Buscamos programación y sonido.",
    body: [
      "Un juego de rol en Roblox ambientado en una ciudad medieval. Ya tenemos la historia, el mapa principal y los primeros personajes.",
      "Nos organizamos por Discord unas horas a la semana. Al unirte, firmamos un acuerdo sencillo que deja claro qué aporta y qué recibe cada uno.",
    ],
    skill: "programacion",
    lang: "es",
    user: "kairo.dev",
    postedHoursAgo: 2,
    expiresInDays: 28,
    slots: [
      { name: "Arte", takenBy: "mira.art" },
      { name: "Guion", takenBy: "kairo.dev" },
      { name: "Programación (Luau)", detail: "Sistema de combate e inventario" },
      { name: "Sonido y música", detail: "Efectos y 3–4 temas" },
    ],
  },
  {
    id: "edito-videos",
    category: "servicios",
    pay: "pagado",
    title: "Edito vídeos para YouTube y TikTok",
    text: "Cortes, subtítulos, efectos y miniaturas. Portafolio en mi perfil.",
    body: [
      "Edito vídeos para creadores de contenido: cortes, subtítulos, efectos, música y miniaturas.",
      "Entrego en 2–4 días según la duración. Pídeme presupuesto por mensaje.",
    ],
    skill: "video",
    lang: "es",
    user: "martaedits",
    postedHoursAgo: 5,
    expiresInDays: 13,
  },
  {
    id: "disenadora-primer-proyecto",
    category: "trabajo",
    pay: "voluntario",
    title: "Diseñadora gráfica buscando primer proyecto",
    text: "Logos, banners y paquetes de marca para servidores. Quiero ganar experiencia en equipo.",
    body: [
      "Hago logos, banners y paquetes de marca. Busco un equipo donde ganar experiencia y ampliar mi portafolio.",
    ],
    skill: "diseno",
    lang: "es",
    user: "lu.design",
    postedHoursAgo: 26,
    expiresInDays: 27,
  },
  {
    id: "socio-marca-ropa",
    category: "equipo",
    pay: "reparto",
    title: "Socio/a para lanzar una marca de ropa",
    text: "Tengo los diseños y proveedor. Busco a alguien para redes y ventas.",
    body: [
      "Tengo los diseños y un proveedor. Busco a alguien que lleve las redes sociales y las ventas, con reparto de beneficios.",
    ],
    skill: "redes",
    lang: "es",
    user: "nil.street",
    postedHoursAgo: 30,
    expiresInDays: 20,
    slots: [
      { name: "Diseño", takenBy: "nil.street" },
      { name: "Redes sociales y ventas", detail: "Instagram y TikTok" },
    ],
  },
  {
    id: "bots-discord-medida",
    category: "servicios",
    pay: "pagado",
    title: "Creo bots de Discord a medida",
    text: "Tickets, niveles, verificación y minijuegos para tu servidor.",
    body: ["Bots a medida para tu servidor: tickets, niveles, verificación y minijuegos."],
    skill: "bots",
    lang: "es",
    user: "botsmith",
    postedHoursAgo: 50,
    expiresInDays: 5,
  },
  {
    id: "voice-actor",
    category: "trabajo",
    pay: "pagado",
    title: "Voice actor looking for projects",
    text: "Spanish and Catalan voice. Home recording setup.",
    body: ["Spanish (Spain) and Catalan voice actor with a home recording setup."],
    skill: "voz",
    lang: "en",
    user: "pau.veu",
    postedHoursAgo: 75,
    expiresInDays: 25,
  },
];

export function getUser(username: string) {
  return users.find((u) => u.username === username);
}

export function getAd(id: string) {
  return ads.find((a) => a.id === id);
}

export function timeAgo(hours: number, lang: "es" | "en") {
  if (hours < 24) return lang === "es" ? `hace ${hours} h` : `${hours} h ago`;
  const d = Math.floor(hours / 24);
  if (lang === "es") return `hace ${d} ${d === 1 ? "día" : "días"}`;
  return `${d} ${d === 1 ? "day" : "days"} ago`;
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
