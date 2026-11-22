"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Avatar,
  CategoryChip,
  FlagIcon,
  PayChip,
  ShieldIcon,
} from "@/components/ui";
import { getAd, getUser, timeAgo } from "@/lib/data";
import { useLang } from "@/lib/i18n";

export function AdDetail({ id }: { id: string }) {
  const { t, lang } = useLang();
  const ad = getAd(id)!;
  const user = getUser(ad.user);
  const [joined, setJoined] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  const share = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-[1240px] flex-col gap-5 px-6 pt-6 pb-16">
      <Link
        href="/"
        className="flex min-h-11 items-center gap-1.5 self-start text-[15px] font-semibold no-underline"
      >
        {t.back}
      </Link>

      <div className="flex flex-wrap items-start gap-6">
        <article className="flex min-w-0 flex-[999_1_560px] flex-col gap-[22px] rounded-2xl border border-line bg-white p-8">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip category={ad.category} />
            <PayChip pay={ad.pay} />
            <span className="text-sm text-subtle">
              {t.published(timeAgo(ad.postedHoursAgo, lang))} · {t.expiresIn(ad.expiresInDays)}
            </span>
          </div>
          <h1 className="m-0 font-display text-[38px] leading-[1.1] font-bold tracking-tight">
            {ad.title}
          </h1>

          <div className="flex items-center gap-2.5 rounded-xl bg-trabajo-bg px-3.5 py-3 text-sm text-[#14532D]">
            <ShieldIcon />
            <span>
              <strong>{t.autoCheck}</strong> {t.autoCheckText}
            </span>
          </div>

          {ad.slots && ad.slots.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="m-0 font-display text-xl font-bold">{t.teamSlots}</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                {ad.slots.map((s) =>
                  s.takenBy ? (
                    <div
                      key={s.name}
                      className="flex flex-col gap-2 rounded-xl border border-line bg-[#FAFAF8] px-4 py-3.5"
                    >
                      <span className="font-bold">{s.name}</span>
                      <span className="flex items-center gap-1.5 text-sm text-subtle">
                        <Avatar
                          name={s.takenBy}
                          color={getUser(s.takenBy)?.color ?? "#DB2777"}
                          size={22}
                        />
                        {t.takenBy(s.takenBy)}
                      </span>
                    </div>
                  ) : (
                    <div
                      key={s.name}
                      className="flex flex-col gap-2.5 rounded-xl border-2 border-dashed border-equipo bg-white px-4 py-3.5"
                    >
                      <span className="font-bold">{s.name}</span>
                      {s.detail && <span className="text-sm text-muted">{s.detail}</span>}
                      {joined === s.name ? (
                        <p role="status" className="m-0 text-sm font-semibold text-trabajo">
                          {t.joined}
                        </p>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setJoined(s.name)}
                          className="min-h-11 cursor-pointer rounded-[10px] bg-equipo text-sm font-semibold text-white"
                        >
                          {t.joinSlot}
                        </button>
                      )}
                    </div>
                  ),
                )}
              </div>
            </section>
          )}

          <section className="flex flex-col gap-2.5">
            <h2 className="m-0 font-display text-xl font-bold">{t.about}</h2>
            {ad.body.map((p, i) => (
              <p key={i} className="m-0 text-base leading-relaxed text-ink-2">
                {p}
              </p>
            ))}
          </section>

          <div className="flex flex-wrap gap-2.5 border-t border-line-2 pt-5">
            <button
              type="button"
              aria-pressed={saved}
              onClick={() => setSaved((v) => !v)}
              className="min-h-11 cursor-pointer rounded-[10px] border border-field bg-white px-4 text-sm font-semibold text-ink"
            >
              {saved ? t.saved : t.save}
            </button>
            <button
              type="button"
              onClick={share}
              className="min-h-11 cursor-pointer rounded-[10px] border border-field bg-white px-4 text-sm font-semibold text-ink"
            >
              {copied ? t.copied : t.share}
            </button>
            <button
              type="button"
              disabled={reported}
              onClick={() => setReported(true)}
              className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[#F1B9B9] bg-white px-4 text-sm font-semibold text-danger disabled:cursor-default"
            >
              <FlagIcon />
              {reported ? t.reported : t.report}
            </button>
          </div>
        </article>

        <aside className="flex max-w-[380px] flex-[1_1_300px] flex-col gap-4">
          {user && (
            <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
              <Link
                href={`/perfil/${user.username}`}
                className="flex items-center gap-3 text-ink no-underline hover:text-ink"
              >
                <Avatar name={user.username} color={user.color} size={56} />
                <span className="flex flex-col gap-0.5">
                  <span className="text-[17px] font-bold">{user.username}</span>
                  <span className="text-sm text-subtle">{t.viewProfile}</span>
                </span>
              </Link>
              <div className="grid grid-cols-2 gap-2.5">
                <div className="flex flex-col gap-0.5 rounded-[10px] bg-fog px-3 py-2.5">
                  <span className="font-display text-[22px] font-bold">{user.confirmed}</span>
                  <span className="text-xs text-muted">{t.confirmed}</span>
                </div>
                <div className="flex flex-col gap-0.5 rounded-[10px] bg-fog px-3 py-2.5">
                  <span className="font-display text-[22px] font-bold">{user.reports}</span>
                  <span className="text-xs text-muted">{t.reports}</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md bg-trabajo-bg px-2 py-1 text-xs font-semibold text-trabajo">
                  {t.verified}
                </span>
                <span className="rounded-md bg-chip px-2 py-1 text-xs font-semibold text-ink-2">
                  {t.memberSince(user.memberSince)}
                </span>
              </div>
              <button
                type="button"
                className="min-h-12 cursor-pointer rounded-[10px] bg-servicios text-base font-semibold text-white"
              >
                {t.message}
              </button>
            </div>
          )}
          <div className="flex flex-col gap-2 rounded-2xl border border-[#F1DFA8] bg-[#FFF8E6] p-5">
            <h2 className="m-0 text-[15px] font-bold text-[#6B4E00]">{t.safetyTitle}</h2>
            <ul className="m-0 list-disc pl-[18px] text-sm leading-relaxed text-[#4A3A10]">
              <li>{t.safety1}</li>
              <li>{t.safety2}</li>
              <li>{t.safety3}</li>
            </ul>
          </div>
        </aside>
      </div>
    </main>
  );
}
