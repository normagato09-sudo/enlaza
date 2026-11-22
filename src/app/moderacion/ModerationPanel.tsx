"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Avatar, CategoryChip, PayChip, WarnIcon } from "@/components/ui";
import { adminDeleteAd, approveAd, dismissReports, setBanned } from "@/lib/actions";
import { timeAgo, type Ad, type PublicUser } from "@/lib/data";
import { useLang } from "@/lib/i18n";

type Item = { ad: Ad; reports: number; scam: boolean };

export function Forbidden() {
  const { t } = useLang();
  return (
    <main className="mx-auto max-w-[560px] px-6 pt-16 pb-16">
      <p className="m-0 rounded-xl border border-line bg-white px-4 py-3 text-muted">{t.modForbidden}</p>
    </main>
  );
}

export function ModerationPanel({
  items,
  banned,
  myId,
}: {
  items: Item[];
  banned: PublicUser[];
  myId: string;
}) {
  const { t, lang } = useLang();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const run = (fn: () => Promise<{ ok: boolean }>, confirmText?: string) => {
    if (confirmText && !window.confirm(confirmText)) return;
    startTransition(async () => {
      setError(null);
      try {
        const res = await fn();
        if (!res.ok) setError(t.genericError);
      } catch {
        setError(t.genericError);
      }
    });
  };

  const btn =
    "min-h-10 cursor-pointer rounded-lg px-3 text-sm font-semibold disabled:opacity-60";

  return (
    <main className="mx-auto flex max-w-[1000px] flex-col gap-6 px-6 pt-8 pb-16">
      <div className="flex flex-col gap-1.5">
        <h1 className="m-0 font-display text-[34px] font-bold">{t.modTitle}</h1>
        <p className="m-0 text-muted">{t.modSub}</p>
      </div>

      {error && (
        <p role="alert" className="m-0 rounded-xl border border-[#F1B9B9] bg-[#FFF7F7] px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      {items.length === 0 ? (
        <p className="m-0 rounded-[14px] border border-dashed border-field bg-white p-8 text-center text-muted">
          {t.modEmpty}
        </p>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map(({ ad, reports, scam }) => {
            const hidden = ad.status === "review";
            return (
              <article
                key={ad.id}
                className={`flex flex-col gap-3 rounded-[14px] border bg-white p-5 ${
                  hidden ? "border-[#F3C98B]" : "border-line"
                }`}
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-md px-2 py-1 text-xs font-bold ${
                      hidden ? "bg-warn-bg text-warn" : "bg-trabajo-bg text-trabajo"
                    }`}
                  >
                    {hidden ? t.modInReview : t.modVisible}
                  </span>
                  {reports > 0 && (
                    <span className="rounded-md bg-[#FFF7F7] px-2 py-1 text-xs font-bold text-danger">
                      {t.modReports(reports)}
                    </span>
                  )}
                  <CategoryChip category={ad.category} />
                  <PayChip pay={ad.pay} />
                  <span className="text-xs text-subtle">{timeAgo(ad.createdAt, lang)}</span>
                </div>
                <h2 className="m-0 font-display text-lg font-bold break-words">
                  <Link href={`/anuncio/${ad.id}`} className="text-ink no-underline hover:underline">
                    {ad.title}
                  </Link>
                </h2>
                <p className="m-0 text-sm leading-normal break-words whitespace-pre-line text-ink-2">
                  {ad.description}
                </p>
                {scam && (
                  <p className="m-0 flex items-start gap-2 text-sm text-warn">
                    <WarnIcon />
                    {t.modScam}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-2 pt-3">
                  <Link
                    href={`/perfil/${ad.user.username}`}
                    className="flex items-center gap-2 text-sm font-semibold text-ink no-underline"
                  >
                    <Avatar name={ad.user.username} src={ad.user.avatarUrl} size={28} />
                    {ad.user.username}
                    {ad.user.banned && (
                      <span className="rounded bg-[#FFF7F7] px-1.5 py-0.5 text-xs font-bold text-danger">
                        {t.modBanned}
                      </span>
                    )}
                  </Link>
                  <div className="flex flex-wrap gap-2">
                    {hidden ? (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => approveAd(ad.id))}
                        className={`${btn} bg-trabajo text-white`}
                      >
                        {t.modApprove}
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => dismissReports(ad.id))}
                        className={`${btn} border border-field bg-white text-ink`}
                      >
                        {t.modDismiss}
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => adminDeleteAd(ad.id), t.modConfirmDelete)}
                      className={`${btn} border border-[#F1B9B9] bg-white text-danger`}
                    >
                      {t.modDelete}
                    </button>
                    {ad.user.id !== myId && !ad.user.banned && (
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => setBanned(ad.user.id, true), t.modConfirmBan(ad.user.username))}
                        className={`${btn} bg-danger text-white`}
                      >
                        {t.modBan}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <section className="flex flex-col gap-3 rounded-[14px] border border-line bg-white p-5">
        <h2 className="m-0 font-display text-xl font-bold">{t.modBannedTitle}</h2>
        {banned.length === 0 ? (
          <p className="m-0 text-sm text-muted">{t.modNoBanned}</p>
        ) : (
          banned.map((u) => (
            <div key={u.id} className="flex items-center justify-between gap-3">
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Avatar name={u.username} src={u.avatarUrl} size={28} />
                {u.username}
              </span>
              <button
                type="button"
                disabled={pending}
                onClick={() => run(() => setBanned(u.id, false))}
                className={`${btn} border border-field bg-white text-ink`}
              >
                {t.modUnban}
              </button>
            </div>
          ))
        )}
      </section>
    </main>
  );
}
