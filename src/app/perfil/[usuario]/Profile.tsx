"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar, CategoryChip, PayChip } from "@/components/ui";
import { renewAd } from "@/lib/actions";
import { daysUntil, isExpired, monthYear, type Ad, type PublicUser } from "@/lib/data";
import { useLang } from "@/lib/i18n";

export function Profile({ user, ads, isMe }: { user: PublicUser; ads: Ad[]; isMe: boolean }) {
  const { t, lang } = useLang();
  const [pending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  const copyUser = async () => {
    try {
      await navigator.clipboard.writeText(user.username);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  return (
    <main className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-6 px-6 pt-8 pb-16">
      <aside className="flex max-w-[360px] flex-[1_1_300px] flex-col gap-4">
        <div className="flex flex-col items-start gap-3.5 rounded-2xl border border-line bg-white p-6">
          <Avatar name={user.username} src={user.avatarUrl} size={84} />
          <div className="flex min-w-0 flex-col gap-1">
            <h1 className="m-0 font-display text-[28px] font-bold break-all">{user.username}</h1>
            {user.displayName && <span className="text-sm text-muted">{user.displayName}</span>}
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-trabajo-bg px-2 py-1 text-xs font-semibold text-trabajo">
              {t.verified}
            </span>
            <span className="rounded-md bg-chip px-2 py-1 text-xs font-semibold text-ink-2">
              {t.memberSince(monthYear(user.memberSince, lang))}
            </span>
          </div>
          {!isMe && (
            <>
              <button
                type="button"
                onClick={copyUser}
                className="min-h-[46px] w-full cursor-pointer rounded-[10px] bg-servicios text-[15px] font-semibold text-white"
              >
                {copied ? t.copiedUser : t.copyDiscord}
              </button>
              <p className="m-0 text-xs text-muted">{t.contactNote}</p>
            </>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 font-display text-[22px] font-bold">{t.reputation}</h2>
            <span className="text-[13px] text-muted">{t.reputationNote}</span>
          </div>
          <div className="flex flex-col gap-1 self-start rounded-xl bg-fog p-3.5">
            <span className="font-display text-[28px] font-bold">{user.confirmed}</span>
            <span className="text-[13px] text-muted">{t.confirmed}</span>
          </div>
          <p className="m-0 text-[13px] text-muted">{t.reviewsRule}</p>
          {user.confirmed === 0 && <p className="m-0 text-sm text-subtle">{t.noReviews}</p>}
        </section>

        <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-white p-6">
          <h2 className="m-0 font-display text-[22px] font-bold">{t.myAds}</h2>
          {ads.length === 0 && (
            <div className="flex flex-wrap items-center gap-3">
              <p className="m-0 text-sm text-subtle">{t.profileEmpty}</p>
              {isMe && (
                <Link
                  href="/publicar"
                  className="flex min-h-11 items-center rounded-[10px] bg-servicios px-4 text-sm font-semibold text-white no-underline hover:text-white"
                >
                  {t.publish}
                </Link>
              )}
            </div>
          )}
          {ads.map((ad) => {
            const days = daysUntil(ad.expiresAt);
            const expired = isExpired(ad.expiresAt);
            const soon = isMe && (expired || days <= 3);
            return (
              <div
                key={ad.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3.5 ${
                  soon ? "border-[#F3C98B] bg-[#FFFAF2]" : "border-line-2"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <Link href={`/anuncio/${ad.id}`} className="font-bold break-words text-ink no-underline hover:underline">
                    {ad.title}
                  </Link>
                  <div className="flex flex-wrap gap-1.5">
                    <CategoryChip category={ad.category} />
                    <PayChip pay={ad.pay} />
                  </div>
                </div>
                {soon ? (
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => startTransition(async () => void (await renewAd(ad.id)))}
                    className="min-h-11 cursor-pointer rounded-[10px] bg-ink px-4 text-sm font-semibold text-white disabled:opacity-60"
                  >
                    {expired ? `${t.expired} · ${t.renew}` : t.renew}
                  </button>
                ) : (
                  <span
                    className={`rounded-md px-2 py-1 text-[13px] font-semibold ${
                      ad.status === "review" ? "bg-warn-bg text-warn" : "bg-trabajo-bg text-trabajo"
                    }`}
                  >
                    {ad.status === "review" ? t.inReview : `${t.active} · ${t.expiresIn(days)}`}
                  </span>
                )}
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
