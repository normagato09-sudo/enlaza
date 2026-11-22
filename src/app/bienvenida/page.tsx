"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CURRENT_USER, LangToggle } from "@/components/SiteHeader";
import { Avatar, CheckIcon, LogoMark } from "@/components/ui";
import type { Role } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { writeStored } from "@/lib/store";

type Choice = Exclude<Role, "todo">;

const style: Record<Choice, { on: string; icon: string; check: string; path: string }> = {
  trabajar: {
    on: "border-trabajo bg-trabajo-bg",
    icon: "bg-trabajo-bg text-trabajo",
    check: "border-trabajo bg-trabajo",
    path: "M4 7h16v12H4zM9 7V5h6v2",
  },
  contratar: {
    on: "border-servicios bg-servicios-bg",
    icon: "bg-servicios-bg text-servicios",
    check: "border-servicios bg-servicios",
    path: "M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0",
  },
  proyecto: {
    on: "border-equipo bg-equipo-bg",
    icon: "bg-equipo-bg text-equipo",
    check: "border-equipo bg-equipo",
    path: "M5 21V4l7 4 7-4v17",
  },
};

export default function Bienvenida() {
  const { t } = useLang();
  const router = useRouter();
  const [selected, setSelected] = useState<Choice[]>(["trabajar"]);

  const options: { id: Choice; title: string; text: string; sees: string }[] = [
    { id: "trabajar", title: t.rTrabajar, text: t.wTrabajarText, sees: t.wTrabajarSees },
    { id: "contratar", title: t.rContratar, text: t.wContratarText, sees: t.wContratarSees },
    { id: "proyecto", title: t.rProyecto, text: t.wProyectoText, sees: t.wProyectoSees },
  ];

  const finish = () => {
    // Una opción: filtramos por ella. Varias: se ve todo.
    const role: Role = selected.length === 1 ? selected[0] : "todo";
    writeStored("enlaza-rol", role);
    router.push("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="mx-auto flex w-full max-w-[1040px] items-center gap-2.5 px-6 py-5">
        <LogoMark />
        <span className="flex-1 font-display text-[22px] font-bold">Enlaza</span>
        <span className="text-sm text-muted">{t.step}</span>
        <LangToggle />
      </header>

      <main className="mx-auto flex w-full max-w-[1040px] flex-col gap-7 px-6 pt-8 pb-16">
        <div className="flex items-center gap-3.5">
          <Avatar name={CURRENT_USER.username} color={CURRENT_USER.color} size={56} />
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold text-trabajo">{t.connected}</span>
            <span className="text-lg font-bold">{t.hello(CURRENT_USER.username)}</span>
          </div>
        </div>
        <div className="flex flex-col gap-2.5">
          <h1 className="m-0 font-display text-[clamp(30px,4vw,44px)] leading-tight font-bold">
            {t.welcomeTitle}
          </h1>
          <p className="m-0 text-[17px] leading-normal text-muted">{t.welcomeText}</p>
        </div>

        <div className="grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-4">
          {options.map((o) => {
            const on = selected.includes(o.id);
            const s = style[o.id];
            return (
              <button
                key={o.id}
                type="button"
                aria-pressed={on}
                onClick={() =>
                  setSelected((v) =>
                    v.includes(o.id) ? v.filter((x) => x !== o.id) : [...v, o.id],
                  )
                }
                className={`flex min-h-60 cursor-pointer flex-col items-start gap-3 rounded-[18px] border-2 p-[22px] text-left text-ink ${
                  on ? s.on : "border-line bg-white"
                }`}
              >
                <span className="flex w-full items-center justify-between">
                  <span className={`flex h-[52px] w-[52px] items-center justify-center rounded-[14px] ${s.icon}`}>
                    <svg
                      width="26"
                      height="26"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <path d={s.path} />
                    </svg>
                  </span>
                  <span
                    className={`flex h-[26px] w-[26px] items-center justify-center rounded-full border-2 text-white ${
                      on ? s.check : "border-field bg-white"
                    }`}
                  >
                    {on && <CheckIcon />}
                  </span>
                </span>
                <span className="font-display text-[22px] font-bold">{o.title}</span>
                <span className="text-[15px] leading-normal text-muted">{o.text}</span>
                <span className="text-[13px] font-semibold text-servicios">{o.sees}</span>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-line pt-6">
          <Link
            href="/"
            onClick={() => writeStored("enlaza-rol", "todo")}
            className="flex min-h-11 items-center text-[15px] font-semibold no-underline"
          >
            {t.seeAll}
          </Link>
          <button
            type="button"
            disabled={selected.length === 0}
            onClick={finish}
            className="min-h-[52px] cursor-pointer rounded-xl bg-servicios px-7 text-base font-bold text-white disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            {selected.length === 0 ? t.pickOne : t.continue}
          </button>
        </div>
      </main>
    </div>
  );
}
