"use client";

import Link from "next/link";
import { useState } from "react";
import { CURRENT_USER } from "@/components/SiteHeader";
import { Avatar, CategoryChip, FlagIcon, PayChip } from "@/components/ui";
import { ads, getUser } from "@/lib/data";
import { useLang } from "@/lib/i18n";

const communityColors = ["#2F4AC0", "#0F766E", "#C2410C", "#7A3FC4"];

export function Profile({ username }: { username: string }) {
  const { t } = useLang();
  const user = getUser(username)!;
  const isMe = username === CURRENT_USER.username;
  const myAds = ads.filter((a) => a.user === username);
  const [renewed, setRenewed] = useState<string[]>([]);

  const stats = [
    { value: user.confirmed, label: t.confirmed },
    { value: user.finished, label: t.finished },
    { value: user.reports, label: t.reportsAccepted },
  ];

  return (
    <main className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-6 px-6 pt-8 pb-16">
      <aside className="flex max-w-[360px] flex-[1_1_300px] flex-col gap-4">
        <div className="flex flex-col items-start gap-3.5 rounded-2xl border border-line bg-white p-6">
          <Avatar name={user.username} color={user.color} size={84} />
          <div className="flex flex-col gap-1">
            <h1 className="m-0 font-display text-[28px] font-bold">{user.username}</h1>
            <span className="text-sm text-muted">{user.headline}</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="rounded-md bg-trabajo-bg px-2 py-1 text-xs font-semibold text-trabajo">
              {t.verified}
            </span>
            <span className="rounded-md bg-chip px-2 py-1 text-xs font-semibold text-ink-2">
              {user.languages}
            </span>
          </div>
          <p className="m-0 text-[15px] leading-relaxed text-ink-2">{user.bio}</p>
          {!isMe && (
            <div className="flex w-full gap-2">
              <button
                type="button"
                className="min-h-[46px] flex-1 cursor-pointer rounded-[10px] bg-servicios text-[15px] font-semibold text-white"
              >
                {t.message}
              </button>
              <button
                type="button"
                aria-label={t.report}
                className="flex min-h-[46px] w-[46px] cursor-pointer items-center justify-center rounded-[10px] border border-[#F1B9B9] bg-white text-danger"
              >
                <FlagIcon />
              </button>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3 rounded-2xl border border-line bg-white p-5">
          <h2 className="m-0 text-[15px] font-bold">{t.communities}</h2>
          <p className="m-0 text-[13px] text-muted">{t.communitiesNote}</p>
          {user.communities.length === 0 ? (
            <p className="m-0 text-sm text-subtle">—</p>
          ) : (
            <div className="flex flex-col gap-2">
              {user.communities.map((c, i) => (
                <div key={c} className="flex items-center gap-2.5">
                  <span
                    className="flex h-[30px] w-[30px] items-center justify-center rounded-lg text-xs font-bold text-white"
                    style={{ background: communityColors[i % communityColors.length] }}
                  >
                    {c.slice(0, 2).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold">{c}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-[999_1_560px] flex-col gap-5">
        <section className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="m-0 font-display text-[22px] font-bold">{t.reputation}</h2>
            <span className="text-[13px] text-muted">{t.reputationNote}</span>
          </div>
          <div className="grid grid-cols-[repeat(auto-fit,minmax(150px,1fr))] gap-3">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col gap-1 rounded-xl bg-fog p-3.5">
                <span className="font-display text-[28px] font-bold">{s.value}</span>
                <span className="text-[13px] text-muted">{s.label}</span>
              </div>
            ))}
          </div>
          <p className="m-0 text-[13px] text-muted">{t.reviewsRule}</p>
          {user.reviews.length === 0 ? (
            <p className="m-0 text-sm text-subtle">{t.noReviews}</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {user.reviews.map((r) => (
                <div key={r.from} className="flex flex-col gap-1.5 rounded-xl border border-line-2 px-4 py-3.5">
                  <div className="flex flex-wrap justify-between gap-2">
                    <Link href={`/perfil/${r.from}`} className="text-sm font-bold text-ink no-underline">
                      {r.from}
                    </Link>
                    <span className="text-xs font-semibold text-trabajo">{t.confirmedCollab}</span>
                  </div>
                  <p className="m-0 text-sm leading-normal text-ink-2">{r.text}</p>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-white p-6">
          <h2 className="m-0 font-display text-[22px] font-bold">{t.myAds}</h2>
          {myAds.length === 0 && <p className="m-0 text-sm text-subtle">—</p>}
          {myAds.map((ad) => {
            const soon = ad.expiresInDays <= 5 && !renewed.includes(ad.id);
            return (
              <div
                key={ad.id}
                className={`flex flex-wrap items-center justify-between gap-3 rounded-xl border px-4 py-3.5 ${
                  soon ? "border-[#F3C98B] bg-[#FFFAF2]" : "border-line-2"
                }`}
              >
                <div className="flex min-w-0 flex-col gap-2">
                  <Link href={`/anuncio/${ad.id}`} className="font-bold text-ink no-underline hover:underline">
                    {ad.title}
                  </Link>
                  <div className="flex flex-wrap gap-1.5">
                    <CategoryChip category={ad.category} />
                    <PayChip pay={ad.pay} />
                  </div>
                </div>
                {isMe && soon ? (
                  <button
                    type="button"
                    onClick={() => setRenewed((v) => [...v, ad.id])}
                    className="min-h-11 cursor-pointer rounded-[10px] bg-ink px-4 text-sm font-semibold text-white"
                  >
                    {t.renew}
                  </button>
                ) : (
                  <span className="rounded-md bg-trabajo-bg px-2 py-1 text-[13px] font-semibold text-trabajo">
                    {renewed.includes(ad.id)
                      ? t.renewed
                      : `${t.active} · ${t.expiresIn(ad.expiresInDays)}`}
                  </span>
                )}
              </div>
            );
          })}
        </section>

        <section className="flex flex-col gap-3.5 rounded-2xl border border-line bg-white p-6">
          <h2 className="m-0 font-display text-[22px] font-bold">{t.portfolio}</h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            {user.portfolio.map((p, i) => (
              <div key={p.title} className="flex flex-col overflow-hidden rounded-xl border border-line-2">
                <div
                  className={`flex h-[110px] items-center justify-center text-[13px] font-semibold ${
                    i % 2 ? "bg-equipo-bg text-equipo" : "bg-servicios-bg text-servicios"
                  }`}
                >
                  {p.title.slice(0, 1)}
                </div>
                <div className="flex flex-col gap-0.5 p-3">
                  <span className="text-sm font-bold">{p.title}</span>
                  <span className="text-xs text-muted">{p.tag}</span>
                </div>
              </div>
            ))}
            {user.portfolio.length === 0 && <p className="m-0 text-sm text-subtle">—</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
