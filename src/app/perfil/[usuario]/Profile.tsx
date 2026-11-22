"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { LoginButton } from "@/components/SiteHeader";
import { Avatar, CategoryChip, PayChip } from "@/components/ui";
import { confirmCollab, declineCollab, leaveReview, renewAd, requestCollab } from "@/lib/actions";
import {
  daysUntil,
  isExpired,
  monthYear,
  timeAgo,
  type Ad,
  type CollabState,
  type PendingCollab,
  type PublicUser,
  type Review,
} from "@/lib/data";
import { useLang } from "@/lib/i18n";

type Props = {
  user: PublicUser;
  ads: Ad[];
  isMe: boolean;
  loggedIn: boolean;
  reviews: Review[];
  collab: CollabState | null;
  pending: PendingCollab[];
};

export function Profile({ user, ads, isMe, loggedIn, reviews, collab, pending }: Props) {
  const { t, lang } = useLang();
  const [busy, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);
  const [review, setReview] = useState("");
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean }>, after?: () => void) =>
    startTransition(async () => {
      setError(null);
      try {
        const res = await fn();
        if (res.ok) after?.();
        else setError(t.genericError);
      } catch {
        setError(t.genericError);
      }
    });

  const copyUser = async () => {
    try {
      await navigator.clipboard.writeText(user.username);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  };

  const btn = "min-h-11 cursor-pointer rounded-[10px] px-4 text-sm font-semibold disabled:opacity-60";

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
            <div className="flex w-full flex-col gap-2">
              {loggedIn ? (
                <Link
                  href={`/mensajes/${user.username}`}
                  className="flex min-h-[46px] items-center justify-center rounded-[10px] bg-servicios text-[15px] font-semibold text-white no-underline hover:text-white"
                >
                  {t.sendMessage}
                </Link>
              ) : (
                <LoginButton className="justify-center" />
              )}
              <button
                type="button"
                onClick={copyUser}
                className="min-h-11 cursor-pointer rounded-[10px] border border-field bg-white text-sm font-semibold text-ink"
              >
                {copied ? t.copiedUser : t.copyDiscord}
              </button>
            </div>
          )}
        </div>

        {!isMe && collab && (
          <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
            <h2 className="m-0 text-[15px] font-bold">{t.collabTitle}</h2>
            {collab.kind === "none" && (
              <>
                <p className="m-0 text-sm text-muted">{t.collabAsk}</p>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => run(() => requestCollab(user.id))}
                  className={`${btn} border border-field bg-white text-ink`}
                >
                  {t.collabRequest}
                </button>
              </>
            )}
            {collab.kind === "sent" && <p className="m-0 text-sm text-muted">{t.collabSent}</p>}
            {collab.kind === "received" && (
              <>
                <p className="m-0 text-sm text-ink-2">{t.collabReceived(user.username)}</p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => confirmCollab(collab.id))}
                    className={`${btn} bg-trabajo text-white`}
                  >
                    {t.collabConfirm}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => declineCollab(collab.id))}
                    className={`${btn} border border-field bg-white text-ink`}
                  >
                    {t.collabDecline}
                  </button>
                </div>
              </>
            )}
            {collab.kind === "confirmed" && (
              <>
                <p className="m-0 text-sm font-semibold text-trabajo">✓ {t.collabConfirmed}</p>
                {collab.reviewed ? (
                  <p className="m-0 text-sm text-muted">{t.reviewDone}</p>
                ) : (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      run(() => leaveReview(collab.id, review), () => setReview(""));
                    }}
                    className="flex flex-col gap-2"
                  >
                    <label htmlFor="review" className="sr-only">
                      {t.reviewPh}
                    </label>
                    <textarea
                      id="review"
                      rows={3}
                      maxLength={400}
                      value={review}
                      onChange={(e) => setReview(e.target.value)}
                      placeholder={t.reviewPh}
                      className="resize-y rounded-[10px] border border-field px-3 py-2.5 text-[15px] placeholder:text-subtle"
                    />
                    <button
                      type="submit"
                      disabled={busy || review.trim().length < 5}
                      className={`${btn} self-start bg-ink text-white`}
                    >
                      {t.reviewSend}
                    </button>
                  </form>
                )}
              </>
            )}
            {error && (
              <p role="alert" className="m-0 text-sm text-danger">
                {error}
              </p>
            )}
          </div>
        )}
      </aside>

      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        {isMe && pending.length > 0 && (
          <section className="flex flex-col gap-3 rounded-2xl border border-[#BFE3CF] bg-trabajo-bg p-5">
            <h2 className="m-0 font-display text-lg font-bold">{t.pendingCollabs}</h2>
            {pending.map((p) => (
              <div key={p.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3">
                <Link
                  href={`/perfil/${p.user.username}`}
                  className="flex items-center gap-2 text-sm font-semibold text-ink no-underline"
                >
                  <Avatar name={p.user.username} src={p.user.avatarUrl} size={30} />
                  {t.collabReceived(p.user.username)}
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => confirmCollab(p.id))}
                    className={`${btn} bg-trabajo text-white`}
                  >
                    {t.collabConfirm}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => run(() => declineCollab(p.id))}
                    className={`${btn} border border-field bg-white text-ink`}
                  >
                    {t.collabDecline}
                  </button>
                </div>
              </div>
            ))}
            {error && (
              <p role="alert" className="m-0 text-sm text-danger">
                {error}
              </p>
            )}
          </section>
        )}

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
          <h3 className="m-0 text-base font-bold">{t.reviewsTitle}</h3>
          {reviews.length === 0 ? (
            <p className="m-0 text-sm text-subtle">{t.noReviews}</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {reviews.map((r) => (
                <div key={r.from.id} className="flex flex-col gap-1.5 rounded-xl border border-line-2 px-4 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <Link
                      href={`/perfil/${r.from.username}`}
                      className="flex items-center gap-2 text-sm font-bold text-ink no-underline"
                    >
                      <Avatar name={r.from.username} src={r.from.avatarUrl} size={24} />
                      {r.from.username}
                    </Link>
                    <span className="text-xs font-semibold text-trabajo">
                      {t.confirmedCollab} · {timeAgo(r.createdAt, lang)}
                    </span>
                  </div>
                  <p className="m-0 text-sm leading-normal break-words whitespace-pre-line text-ink-2">{r.body}</p>
                </div>
              ))}
            </div>
          )}
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
                    disabled={busy}
                    onClick={() => run(() => renewAd(ad.id))}
                    className={`${btn} bg-ink text-white`}
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
