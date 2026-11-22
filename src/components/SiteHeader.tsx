"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Viewer } from "@/lib/data";
import { useLang, type Lang } from "@/lib/i18n";
import { Avatar, LogoMark } from "./ui";

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

export function LoginButton({ next, className = "" }: { next?: string; className?: string }) {
  const { t } = useLang();
  const pathname = usePathname();
  const target = next ?? pathname ?? "/";
  return (
    <a
      href={`/api/auth/login?next=${encodeURIComponent(target)}`}
      className={`flex min-h-11 items-center gap-2 rounded-[10px] bg-[#5865F2] px-4 text-[15px] font-semibold text-white no-underline hover:bg-[#4752C4] hover:text-white ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M19.3 5.3A16.6 16.6 0 0015.2 4l-.5 1a15.4 15.4 0 00-5.4 0L8.8 4a16.6 16.6 0 00-4.1 1.3C2.1 9.1 1.4 12.8 1.7 16.5a16.7 16.7 0 005.1 2.5l1.1-1.7a10.8 10.8 0 01-1.7-.8l.4-.3a11.9 11.9 0 0010.8 0l.4.3a10.8 10.8 0 01-1.7.8l1.1 1.7a16.6 16.6 0 005.1-2.5c.4-4.3-.7-8-3-11.2zM8.7 14.2c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2zm6.6 0c-1 0-1.8-.9-1.8-2s.8-2 1.8-2 1.8.9 1.8 2-.8 2-1.8 2z" />
      </svg>
      {t.login}
    </a>
  );
}

export function SiteHeader({ user }: { user: Viewer | null }) {
  const { t } = useLang();
  const pathname = usePathname();
  if (pathname === "/bienvenida") return null;

  const nav: { href: string; label: string; active: boolean; badge?: number }[] = [
    { href: "/", label: t.navExplore, active: pathname === "/" },
  ];
  if (user) {
    nav.push({
      href: "/mensajes",
      label: t.navMessages,
      active: pathname.startsWith("/mensajes"),
      badge: user.unread,
    });
    nav.push({
      href: `/perfil/${user.username}`,
      label: t.navProfile,
      active: pathname === `/perfil/${user.username}`,
    });
    if (user.isAdmin) {
      nav.push({ href: "/moderacion", label: t.modNav, active: pathname === "/moderacion" });
    }
  }

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
              {n.badge ? (
                <span className="ml-1.5 rounded-full bg-danger px-1.5 py-0.5 text-xs font-bold text-white">
                  {n.badge}
                </span>
              ) : null}
            </Link>
          ))}
        </nav>
        <div className="flex flex-wrap items-center gap-2.5">
          <LangToggle />
          {user ? (
            <>
              <Link
                href={`/perfil/${user.username}`}
                className="hidden min-h-11 items-center gap-2 rounded-[10px] border border-field bg-white py-0 pr-3.5 pl-1.5 text-[15px] font-semibold text-ink no-underline hover:text-ink sm:flex"
              >
                <Avatar name={user.username} src={user.avatarUrl} size={32} />
                {user.username}
              </Link>
              <form action="/api/auth/logout" method="post">
                <button
                  type="submit"
                  className="min-h-11 cursor-pointer rounded-[10px] border-0 bg-transparent px-2 text-sm font-semibold text-muted hover:text-ink"
                >
                  {t.logout}
                </button>
              </form>
            </>
          ) : (
            <LoginButton />
          )}
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

/** Aviso para páginas que necesitan sesión. */
export function NeedLogin({ next }: { next: string }) {
  const { t } = useLang();
  return (
    <main className="mx-auto flex max-w-[560px] flex-col items-start gap-4 px-6 pt-16 pb-16">
      <h1 className="m-0 font-display text-[32px] font-bold">{t.needLoginTitle}</h1>
      <p className="m-0 text-base text-muted">{t.needLoginText}</p>
      <LoginButton next={next} />
    </main>
  );
}
