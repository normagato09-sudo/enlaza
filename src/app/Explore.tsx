"use client";

import { useMemo, useState } from "react";
import { AdCard } from "@/components/AdCard";
import { categoryDot } from "@/components/ui";
import {
  NICHES,
  roleCategories,
  type Ad,
  type Category,
  type NicheKey,
  type PayType,
  type Role,
  type SkillKey,
} from "@/lib/data";
import Link from "next/link";
import { useLang } from "@/lib/i18n";
import { useStored, writeStored } from "@/lib/store";

type Tab = "todos" | Category;
type Sort = "new" | "rep" | "exp";

const payTypes: PayType[] = ["pagado", "voluntario", "reparto"];
const payBox: Record<PayType, string> = {
  pagado: "border-ink bg-chip",
  voluntario: "border-[#B8B8B0] bg-white",
  reparto: "border-reparto bg-reparto-bg",
};
const skillKeys: SkillKey[] = ["diseno", "programacion", "video", "bots", "redes", "voz"];

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

export function Explore({ ads, loginError }: { ads: Ad[]; loginError?: boolean }) {
  const { t } = useLang();
  const role = useStored<Role>("enlaza-rol", "todo");
  const [tab, setTab] = useState<Tab>("todos");
  const [query, setQuery] = useState("");
  const [typed, setTyped] = useState("");
  const [pays, setPays] = useState<PayType[]>([]);
  const [skills, setSkills] = useState<SkillKey[]>([]);
  const [niches, setNiches] = useState<NicheKey[]>([]);
  const [onlyRep, setOnlyRep] = useState(false);
  const [langs, setLangs] = useState<("es" | "en")[]>(["es", "en"]);
  const [sort, setSort] = useState<Sort>("new");

  const allowed = roleCategories[role] ?? roleCategories.todo;

  const roles: { id: Role; label: string; hint: string }[] = [
    { id: "trabajar", label: t.rTrabajar, hint: t.hTrabajar },
    { id: "contratar", label: t.rContratar, hint: t.hContratar },
    { id: "proyecto", label: t.rProyecto, hint: t.hProyecto },
    { id: "todo", label: t.rTodo, hint: t.hTodo },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: "todos" as Tab, label: role === "todo" ? t.all : t.forYou },
    ...(allowed.length > 1
      ? allowed.map((c) => ({ id: c as Tab, label: t[c] }))
      : []),
  ];

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = ads.filter((ad) => {
      if (!allowed.includes(ad.category)) return false;
      if (tab !== "todos" && ad.category !== tab) return false;
      if (pays.length && !pays.includes(ad.pay)) return false;
      if (skills.length && !skills.includes(ad.skill)) return false;
      if (niches.length && !(ad.niche && niches.includes(ad.niche))) return false;
      if (!langs.includes(ad.lang)) return false;
      if (onlyRep && !(ad.user.confirmed > 0)) return false;
      if (q) {
        const haystack = `${ad.title} ${ad.description} ${ad.user.username} ${t.skills[ad.skill]}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === "rep") return b.user.confirmed - a.user.confirmed;
      if (sort === "exp") return a.expiresAt.localeCompare(b.expiresAt);
      return b.createdAt.localeCompare(a.createdAt);
    });
  }, [ads, allowed, tab, pays, skills, niches, langs, onlyRep, query, sort, t]);

  const clear = () => {
    setPays([]);
    setSkills([]);
    setNiches([]);
    setOnlyRep(false);
    setLangs(["es", "en"]);
    setQuery("");
    setTyped("");
  };

  const currentHint = roles.find((r) => r.id === role)?.hint;

  return (
    <main>
      {loginError && (
        <p role="alert" className="mx-auto mt-6 max-w-[1240px] rounded-xl border border-[#F1B9B9] bg-[#FFF7F7] px-4 py-3 text-sm text-danger">
          {t.loginError}
        </p>
      )}
      <section className="mx-auto flex max-w-[1240px] flex-col gap-5 px-6 pt-14 pb-7">
        <h1 className="m-0 max-w-[860px] font-display text-[clamp(34px,5vw,56px)] leading-[1.05] font-bold tracking-tight">
          {t.heroTitle}
        </h1>
        <p className="m-0 max-w-[680px] text-lg leading-normal text-muted">{t.heroText}</p>
        <form
          role="search"
          className="flex max-w-[760px] flex-wrap gap-2.5"
          onSubmit={(e) => {
            e.preventDefault();
            setQuery(typed);
          }}
        >
          <label htmlFor="buscar" className="sr-only">
            {t.searchLabel}
          </label>
          <div className="flex min-h-[54px] flex-[1_1_360px] items-center gap-2.5 rounded-xl border border-field bg-white px-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#6B6B73"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              id="buscar"
              type="search"
              value={typed}
              onChange={(e) => {
                setTyped(e.target.value);
                setQuery(e.target.value);
              }}
              placeholder={t.searchPh}
              className="min-w-0 flex-1 border-0 bg-transparent text-base text-ink outline-none placeholder:text-subtle"
            />
          </div>
          <button
            type="submit"
            className="min-h-[54px] cursor-pointer rounded-xl bg-ink px-6 text-base font-semibold text-white"
          >
            {t.search}
          </button>
        </form>
        <div className="flex flex-wrap gap-[18px] text-sm text-muted">
          {[t.trust1, t.trust2, t.trust3].map((s) => (
            <span key={s} className="flex items-center gap-1.5">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1E7A4C"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
              {s}
            </span>
          ))}
        </div>
      </section>

      <section aria-label={t.roleTitle} className="mx-auto max-w-[1240px] px-6 pb-5">
        <div className="flex flex-wrap items-center gap-3 rounded-[14px] border border-line bg-white px-[18px] py-4">
          <span className="text-[15px] font-bold">{t.roleTitle}</span>
          <div role="group" className="flex flex-auto flex-wrap gap-2">
            {roles.map((r) => {
              const on = r.id === role;
              return (
                <button
                  key={r.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => {
                    writeStored("enlaza-rol", r.id);
                    setTab("todos");
                  }}
                  className={`min-h-11 cursor-pointer rounded-full border-[1.5px] px-4 text-sm font-semibold ${
                    on
                      ? "border-servicios bg-servicios-bg text-[#1E3291]"
                      : "border-field bg-white text-ink"
                  }`}
                >
                  {r.label}
                </button>
              );
            })}
          </div>
          <span className="text-sm text-muted">{currentHint}</span>
        </div>
      </section>

      {tabs.length > 1 && (
        <section aria-label={t.sections} className="mx-auto max-w-[1240px] px-6">
          <div role="tablist" className="flex flex-wrap gap-2 border-b border-line pb-3">
            {tabs.map((tb) => {
              const on = tb.id === tab;
              const color =
                tb.id === "todos"
                  ? "border-ink bg-ink"
                  : tb.id === "servicios"
                    ? "border-servicios bg-servicios"
                    : tb.id === "trabajo"
                      ? "border-trabajo bg-trabajo"
                      : tb.id === "alianza"
                        ? "border-alianza bg-alianza"
                        : "border-equipo bg-equipo";
              return (
                <button
                  key={tb.id}
                  type="button"
                  role="tab"
                  aria-selected={on}
                  onClick={() => setTab(tb.id)}
                  className={`flex min-h-11 cursor-pointer items-center gap-2 rounded-[10px] border px-4 text-[15px] font-semibold ${
                    on ? `${color} text-white` : "border-field bg-white text-ink"
                  }`}
                >
                  {tb.id !== "todos" && (
                    <span
                      className={`h-2.5 w-2.5 rounded-full ${
                        on ? "bg-white" : categoryDot[tb.id as Category]
                      }`}
                    />
                  )}
                  {tb.label}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <div className="mx-auto flex max-w-[1240px] flex-wrap items-start gap-8 px-6 pt-6 pb-16">
        <aside
          aria-label={t.filters}
          className="flex max-w-[280px] flex-[1_1_240px] flex-col gap-6 rounded-[14px] border border-line bg-white p-5"
        >
          <div className="flex items-center justify-between">
            <h2 className="m-0 font-display text-lg font-bold">{t.filters}</h2>
            <button
              type="button"
              onClick={clear}
              className="min-h-11 cursor-pointer border-0 bg-transparent text-sm font-semibold text-servicios"
            >
              {t.clear}
            </button>
          </div>

          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 text-sm font-semibold">{t.fType}</legend>
            {payTypes.map((p) => (
              <label key={p} className="flex items-center gap-2.5 text-[15px]">
                <input
                  type="checkbox"
                  className="h-[18px] w-[18px]"
                  checked={pays.includes(p)}
                  onChange={() => setPays((v) => toggle(v, p))}
                />
                <span className={`h-2.5 w-2.5 rounded-[3px] border-[1.5px] ${payBox[p]}`} />
                {t[p]}
              </label>
            ))}
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 text-sm font-semibold">{t.fSkill}</legend>
            {skillKeys.map((s) => (
              <label key={s} className="flex items-center gap-2.5 text-[15px]">
                <input
                  type="checkbox"
                  className="h-[18px] w-[18px]"
                  checked={skills.includes(s)}
                  onChange={() => setSkills((v) => toggle(v, s))}
                />
                {t.skills[s]}
              </label>
            ))}
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 text-sm font-semibold">{t.fNiche}</legend>
            {NICHES.map((n) => (
              <label key={n} className="flex items-center gap-2.5 text-[15px]">
                <input
                  type="checkbox"
                  className="h-[18px] w-[18px]"
                  checked={niches.includes(n)}
                  onChange={() => setNiches((v) => toggle(v, n))}
                />
                {t.niches[n]}
              </label>
            ))}
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 text-sm font-semibold">{t.fRep}</legend>
            <label className="flex items-center gap-2.5 text-[15px]">
              <input
                type="checkbox"
                className="h-[18px] w-[18px]"
                checked={onlyRep}
                onChange={() => setOnlyRep((v) => !v)}
              />
              {t.fRep1}
            </label>
          </fieldset>

          <fieldset className="m-0 flex flex-col gap-2.5 border-0 p-0">
            <legend className="mb-2.5 text-sm font-semibold">{t.fLang}</legend>
            <div className="flex flex-wrap gap-2">
              {(["es", "en"] as const).map((l) => (
                <label
                  key={l}
                  className="flex items-center gap-1.5 rounded-full border border-field px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={langs.includes(l)}
                    onChange={() => setLangs((v) => toggle(v, l))}
                  />
                  {l === "es" ? "Español" : "English"}
                </label>
              ))}
            </div>
          </fieldset>
        </aside>

        <section aria-label={t.adsCount} className="flex min-w-0 flex-[999_1_560px] flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="m-0 text-[15px] text-muted" aria-live="polite">
              <strong className="text-ink">{results.length}</strong> {t.adsCount}
            </p>
            <label className="flex items-center gap-2 text-sm text-muted">
              {t.sort}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as Sort)}
                className="min-h-10 rounded-lg border border-field bg-white px-2.5 text-sm font-medium text-ink"
              >
                <option value="new">{t.sortNew}</option>
                <option value="rep">{t.sortRep}</option>
                <option value="exp">{t.sortExp}</option>
              </select>
            </label>
          </div>
          {ads.length === 0 ? (
            <div className="flex flex-col items-center gap-3 rounded-[14px] border border-dashed border-field bg-white px-8 py-12 text-center">
              <h2 className="m-0 font-display text-2xl font-bold">{t.emptyTitle}</h2>
              <p className="m-0 max-w-[460px] text-muted">{t.emptyText}</p>
              <Link
                href="/publicar"
                className="mt-2 flex min-h-11 items-center rounded-[10px] bg-servicios px-5 font-semibold text-white no-underline hover:text-white"
              >
                {t.publish}
              </Link>
            </div>
          ) : results.length === 0 ? (
            <p className="m-0 rounded-[14px] border border-dashed border-field bg-white p-8 text-center text-muted">
              {t.emptyFiltered}
            </p>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-4">
              {results.map((ad) => (
                <AdCard key={ad.id} ad={ad} />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
