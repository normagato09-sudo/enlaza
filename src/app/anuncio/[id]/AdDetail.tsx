"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { LoginButton } from "@/components/SiteHeader";
import { Avatar, CategoryChip, FlagIcon, PayChip, ShieldIcon, WarnIcon } from "@/components/ui";
import { acceptApplicant, applyToSlot, deleteAd, renewAd, reportAd } from "@/lib/actions";
import { daysUntil, monthYear, timeAgo, type Ad, type Application, type PublicUser } from "@/lib/data";
import { useLang } from "@/lib/i18n";

type Props = {
  ad: Ad;
  me: PublicUser | null;
  isOwner: boolean;
  expired: boolean;
  applications: Application[];
  mySlots: string[];
  reported: boolean;
};

export function AdDetail({ ad, me, isOwner, expired, applications, mySlots, reported }: Props) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<"link" | "user" | null>(null);

  const run = (fn: () => Promise<{ ok: boolean }>) =>
    startTransition(async () => {
      setError(null);
      try {
        const res = await fn();
        if (!res.ok) setError(t.genericError);
      } catch {
        setError(t.genericError);
      }
    });

  const copy = async (text: string, what: "link" | "user") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
    } catch {
      setCopied(null);
    }
  };

  const remove = () => {
    if (!window.confirm(t.confirmDelete)) return;
    startTransition(async () => {
      const res = await deleteAd(ad.id);
      if (res.ok) router.push(`/perfil/${ad.user.username}`);
      else setError(t.genericError);
    });
  };

  return (
    <main className="mx-auto flex max-w-[1240px] flex-col gap-5 px-6 pt-6 pb-16">
      <Link
        href="/"
        className="flex min-h-11 items-center gap-1.5 self-start text-[15px] font-semibold no-underline"
      >
        {t.back}
      </Link>

      {isOwner && (ad.status === "review" || expired) && (
        <div
          role="status"
          className="flex items-start gap-2.5 rounded-xl border border-[#F3C98B] bg-warn-bg px-4 py-3 text-sm leading-normal text-warn"
        >
          <WarnIcon />
          <span>{ad.status === "review" ? t.reviewBanner : t.expired}</span>
        </div>
      )}

      {error && (
        <p role="alert" className="m-0 rounded-xl border border-[#F1B9B9] bg-[#FFF7F7] px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <div className="flex flex-wrap items-start gap-6">
        <article className="flex min-w-0 flex-[999_1_560px] flex-col gap-[22px] rounded-2xl border border-line bg-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <CategoryChip category={ad.category} />
            <PayChip pay={ad.pay} />
            {ad.niche && (
              <span className="rounded-full bg-chip px-2.5 py-1 text-[13px] font-semibold text-ink-2">
                {t.niches[ad.niche]}
              </span>
            )}
            <span className="text-sm text-subtle">
              {t.published(timeAgo(ad.createdAt, lang))} ·{" "}
              {expired ? t.expired : t.expiresIn(daysUntil(ad.expiresAt))}
            </span>
          </div>
          <h1 className="m-0 font-display text-[clamp(28px,4vw,38px)] leading-[1.1] font-bold tracking-tight break-words">
            {ad.title}
          </h1>

          {ad.status === "active" && (
            <div className="flex items-center gap-2.5 rounded-xl bg-trabajo-bg px-3.5 py-3 text-sm text-[#14532D]">
              <ShieldIcon />
              <span>
                <strong>{t.autoCheck}</strong> {t.autoCheckText}
              </span>
            </div>
          )}

          {ad.slots.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="m-0 font-display text-xl font-bold">{t.teamSlots}</h2>
              <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-3">
                {ad.slots.map((s) =>
                  s.takenBy ? (
                    <div
                      key={s.name}
                      className="flex flex-col gap-2 rounded-xl border border-line bg-[#FAFAF8] px-4 py-3.5"
                    >
                      <span className="font-bold break-words">{s.name}</span>
                      <span className="flex items-center gap-1.5 text-sm text-subtle">
                        <Avatar name={s.takenBy} size={22} />
                        {t.takenBy(s.takenBy)}
                      </span>
                    </div>
                  ) : (
                    <div
                      key={s.name}
                      className="flex flex-col gap-2.5 rounded-xl border-2 border-dashed border-equipo bg-white px-4 py-3.5"
                    >
                      <span className="font-bold break-words">{s.name}</span>
                      {s.detail && <span className="text-sm text-muted">{s.detail}</span>}
                      {isOwner ? null : !me ? (
                        <LoginButton className="justify-center text-sm" />
                      ) : mySlots.includes(s.name) ? (
                        <p role="status" className="m-0 text-sm font-semibold text-trabajo">
                          ✓ {t.applied}
                        </p>
                      ) : (
                        <button
                          type="button"
                          disabled={pending}
                          onClick={() => run(() => applyToSlot(ad.id, s.name))}
                          className="min-h-11 cursor-pointer rounded-[10px] bg-equipo text-sm font-semibold text-white disabled:opacity-60"
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
            <p className="m-0 text-base leading-relaxed break-words whitespace-pre-line text-ink-2">
              {ad.description}
            </p>
          </section>

          <div className="flex flex-wrap gap-2.5 border-t border-line-2 pt-5">
            <button
              type="button"
              onClick={() => copy(window.location.href, "link")}
              className="min-h-11 cursor-pointer rounded-[10px] border border-field bg-white px-4 text-sm font-semibold text-ink"
            >
              {copied === "link" ? t.copied : t.share}
            </button>
            {isOwner ? (
              <>
                {expired && (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => renewAd(ad.id))}
                    className="min-h-11 cursor-pointer rounded-[10px] bg-ink px-4 text-sm font-semibold text-white"
                  >
                    {t.renew}
                  </button>
                )}
                <button
                  type="button"
                  disabled={pending}
                  onClick={remove}
                  className="min-h-11 cursor-pointer rounded-[10px] border border-[#F1B9B9] bg-white px-4 text-sm font-semibold text-danger"
                >
                  {t.deleteAd}
                </button>
              </>
            ) : (
              me && (
                <button
                  type="button"
                  disabled={reported || pending}
                  onClick={() => run(() => reportAd(ad.id))}
                  className="flex min-h-11 cursor-pointer items-center gap-1.5 rounded-[10px] border border-[#F1B9B9] bg-white px-4 text-sm font-semibold text-danger disabled:cursor-default"
                >
                  <FlagIcon />
                  {reported ? t.reported : t.report}
                </button>
              )
            )}
          </div>
        </article>

        <aside className="flex max-w-[380px] flex-[1_1_300px] flex-col gap-4">
          {isOwner ? (
            <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-6">
              <span className="text-sm font-semibold text-servicios">{t.yourAd}</span>
              <h2 className="m-0 font-display text-xl font-bold">{t.applications}</h2>
              {applications.length === 0 ? (
                <p className="m-0 text-sm text-muted">{t.noApplications}</p>
              ) : (
                applications.map((a) => (
                  <div key={`${a.slot}-${a.user.id}`} className="flex flex-col gap-2 rounded-xl border border-line-2 p-3">
                    <Link
                      href={`/perfil/${a.user.username}`}
                      className="flex items-center gap-2 text-ink no-underline hover:text-ink"
                    >
                      <Avatar name={a.user.username} src={a.user.avatarUrl} size={30} />
                      <span className="flex flex-col">
                        <span className="text-sm font-bold">{a.user.username}</span>
                        <span className="text-xs text-muted">{t.forSlot(a.slot)}</span>
                      </span>
                    </Link>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/mensajes/${a.user.username}`}
                        className="flex min-h-10 items-center rounded-lg border border-field bg-white px-3 text-xs font-semibold text-ink no-underline hover:text-ink"
                      >
                        {t.sendMessage}
                      </Link>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => acceptApplicant(ad.id, a.slot, a.user.username))}
                        className="min-h-10 cursor-pointer rounded-lg bg-trabajo px-3 text-xs font-semibold text-white"
                      >
                        {t.accept}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
              <Link
                href={`/perfil/${ad.user.username}`}
                className="flex items-center gap-3 text-ink no-underline hover:text-ink"
              >
                <Avatar name={ad.user.username} src={ad.user.avatarUrl} size={56} />
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="truncate text-[17px] font-bold">{ad.user.username}</span>
                  <span className="text-sm text-subtle">{t.viewProfile}</span>
                </span>
              </Link>
              <div className="flex flex-wrap gap-1.5">
                <span className="rounded-md bg-trabajo-bg px-2 py-1 text-xs font-semibold text-trabajo">
                  {t.verified}
                </span>
                <span className="rounded-md bg-chip px-2 py-1 text-xs font-semibold text-ink-2">
                  {t.memberSince(monthYear(ad.user.memberSince, lang))}
                </span>
                <span className="rounded-md bg-chip px-2 py-1 text-xs font-semibold text-ink-2">
                  {ad.user.confirmed > 0 ? t.repCount(ad.user.confirmed) : t.repNew}
                </span>
              </div>
              {me ? (
                <Link
                  href={`/mensajes/${ad.user.username}`}
                  className="flex min-h-12 items-center justify-center rounded-[10px] bg-servicios text-base font-semibold text-white no-underline hover:text-white"
                >
                  {t.sendMessage}
                </Link>
              ) : (
                <LoginButton className="justify-center" />
              )}
              <button
                type="button"
                onClick={() => copy(ad.user.username, "user")}
                className="min-h-11 cursor-pointer rounded-[10px] border border-field bg-white text-sm font-semibold text-ink"
              >
                {copied === "user" ? t.copiedUser : t.copyDiscord}
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
