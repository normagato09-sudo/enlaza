"use client";

import Link from "next/link";
import { getUser, timeAgo, type Ad } from "@/lib/data";
import { useLang } from "@/lib/i18n";
import { Avatar, CategoryChip, ClockIcon, PayChip } from "./ui";

export function AdCard({ ad }: { ad: Ad }) {
  const { t, lang } = useLang();
  const user = getUser(ad.user);

  return (
    <article className="flex flex-col gap-3 rounded-[14px] border border-line bg-white p-5">
      <div className="flex flex-wrap items-center gap-1.5">
        <CategoryChip category={ad.category} />
        <PayChip pay={ad.pay} />
      </div>
      <h3 className="m-0 font-display text-[19px] leading-tight font-bold">
        <Link href={`/anuncio/${ad.id}`} className="text-ink no-underline hover:underline">
          {ad.title}
        </Link>
      </h3>
      <p className="m-0 text-[15px] leading-normal text-muted">{ad.text}</p>
      {ad.slots && ad.slots.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ad.slots.map((s) => (
            <span
              key={s.name}
              className={`rounded-md px-2 py-1 text-xs font-semibold ${
                s.takenBy
                  ? "bg-chip text-subtle line-through"
                  : "border border-dashed border-equipo bg-white text-equipo"
              }`}
            >
              {s.name} · {s.takenBy ? t.slotTaken : t.slotFree}
            </span>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between gap-2 text-[13px] text-subtle">
        <span>{timeAgo(ad.postedHoursAgo, lang)}</span>
        <span className="flex items-center gap-1">
          <ClockIcon />
          {t.expiresIn(ad.expiresInDays)}
        </span>
      </div>
      <div className="mt-auto flex items-center justify-between gap-2 border-t border-line-2 pt-3">
        <Link
          href={`/perfil/${ad.user}`}
          className="flex min-w-0 items-center gap-2 text-ink no-underline hover:text-ink"
        >
          <Avatar name={ad.user} color={user?.color ?? "#45454D"} />
          <span className="flex min-w-0 flex-col">
            <span className="truncate text-sm font-semibold">{ad.user}</span>
            <span className="text-xs font-semibold text-trabajo">
              {user && user.confirmed > 0 ? t.repCount(user.confirmed) : t.repNew}
            </span>
          </span>
        </Link>
        <Link
          href={`/anuncio/${ad.id}`}
          className="flex min-h-11 flex-none items-center text-sm font-semibold no-underline"
        >
          {t.view} →
        </Link>
      </div>
    </article>
  );
}
