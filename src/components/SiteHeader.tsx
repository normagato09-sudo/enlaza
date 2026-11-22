"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang, type Lang } from "@/lib/i18n";
import { Avatar, LogoMark } from "./ui";

/** Usuario de ejemplo hasta que conectemos el inicio de sesión con Discord. */
export const CURRENT_USER = { username: "kairo.dev", color: "#7A3FC4" };

export function LangToggle() {
  const { lang, setLang, t } = useLang();
  const options: Lang[] = ["es", "en"];
  return (
    <div
      role="group"
      aria-label={t.langLabel}
      className="flex overflow-hidden rounded-[10px] border border-field"
    >
      {options.map((l) => (
        <button
          key={l}
          type="button"
          aria-pressed={lang === l}
          onClick={() => setLang(l)}
          className={`min-h-[42px] min-w-11 cursor-pointer text-sm font-bold ${
            lang === l ? "bg-ink text-white" : "bg-white text-ink"
          }`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function SiteHeader() {
  const { t } = useLang();
  const pathname = usePathname();
  if (pathname === "/bienvenida") return null;

  const nav = [
    { href: "/", label: t.navExplore, active: pathname === "/" },
    {
      href: `/perfil/${CURRENT_USER.username}`,
      label: t.navProfile,
      active: pathname.startsWith("/perfil"),
    },
  ];

  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center gap-x-4 gap-y-3 px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 text-ink no-underline hover:text-ink">
          <LogoMark />
          <span className="font-display text-[22px] font-bold">Enlaza</span>
        </Link>
        <nav aria-label="Principal" className="flex flex-auto flex-wrap gap-1">
          {nav.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              aria-current={n.active ? "page" : undefined}
              className={`rounded-lg px-3.5 py-2.5 no-underline ${
                n.active
                  ? "bg-chip font-semibold text-ink"
                  : "font-medium text-muted hover:text-ink"
              }`}
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2.5">
          <LangToggle />
          <Link
            href={`/perfil/${CURRENT_USER.username}`}
            className="hidden min-h-11 items-center gap-2 rounded-[10px] border border-field bg-white py-0 pr-3.5 pl-1.5 sm:flex text-[15px] font-semibold text-ink no-underline hover:text-ink"
          >
            <Avatar name={CURRENT_USER.username} color={CURRENT_USER.color} size={32} />
            {CURRENT_USER.username}
          </Link>
          <Link
            href="/publicar"
            className="flex min-h-11 items-center gap-2 rounded-[10px] bg-servicios px-[18px] text-[15px] font-semibold text-white no-underline hover:bg-[#1E3291] hover:text-white"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.4"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {t.publish}
          </Link>
        </div>
      </div>
    </header>
  );
}
