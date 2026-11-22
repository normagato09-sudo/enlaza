"use client";

import Link from "next/link";
import { useState } from "react";
import { AdCard } from "@/components/AdCard";
import { CURRENT_USER } from "@/components/SiteHeader";
import { WarnIcon } from "@/components/ui";
import {
  looksLikeScam,
  type Ad,
  type Category,
  type PayType,
  type SkillKey,
} from "@/lib/data";
import { useLang } from "@/lib/i18n";

type SlotDraft = { name: string; taken: boolean };

const kindStyle: Record<Category, { on: string; dot: string }> = {
  servicios: { on: "border-servicios bg-servicios-bg", dot: "bg-servicios" },
  trabajo: { on: "border-trabajo bg-trabajo-bg", dot: "bg-trabajo" },
  equipo: { on: "border-equipo bg-equipo-bg", dot: "bg-equipo" },
};
const payOn: Record<PayType, string> = {
  pagado: "border-ink bg-chip",
  voluntario: "border-muted bg-white",
  reparto: "border-reparto bg-reparto-bg",
};
const skillKeys: SkillKey[] = ["programacion", "diseno", "video", "bots", "redes", "voz", "otra"];

const fieldClass =
  "rounded-[10px] border border-field bg-white px-3.5 text-base text-ink placeholder:text-subtle";

export default function Publicar() {
  const { t } = useLang();
  const [kind, setKind] = useState<Category | null>(null);
  const [pay, setPay] = useState<PayType | null>(null);
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [skill, setSkill] = useState<SkillKey>("programacion");
  const [adLang, setAdLang] = useState<"es" | "en">("es");
  const [weeks, setWeeks] = useState<1 | 4>(4);
  const [slots, setSlots] = useState<SlotDraft[]>([
    { name: "", taken: true },
    { name: "", taken: false },
  ]);
  const [errors, setErrors] = useState<string[]>([]);
  const [preview, setPreview] = useState<Ad | null>(null);

  const scam = looksLikeScam(`${title} ${desc}`);

  const kinds: { id: Category; hint: string }[] = [
    { id: "servicios", hint: t.kServiciosHint },
    { id: "trabajo", hint: t.kTrabajoHint },
    { id: "equipo", hint: t.kEquipoHint },
  ];
  const pays: { id: PayType; hint: string }[] = [
    { id: "pagado", hint: t.pPagadoHint },
    { id: "voluntario", hint: t.pVoluntarioHint },
    { id: "reparto", hint: t.pRepartoHint },
  ];

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!kind) errs.push(t.errType);
    if (!pay) errs.push(t.errPay);
    if (title.trim().length < 8) errs.push(t.errTitle);
    if (desc.trim().length < 20) errs.push(t.errDesc);
    setErrors(errs);
    if (errs.length || !kind || !pay) return;
    const named = slots.filter((s) => s.name.trim());
    setPreview({
      id: "borrador",
      category: kind,
      pay,
      title: title.trim(),
      text: desc.trim(),
      body: [desc.trim()],
      skill,
      lang: adLang,
      user: CURRENT_USER.username,
      postedHoursAgo: 0,
      expiresInDays: weeks * 7,
      slots:
        kind === "equipo" && named.length
          ? named.map((s) => ({
              name: s.name.trim(),
              takenBy: s.taken ? CURRENT_USER.username : undefined,
            }))
          : undefined,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (preview) {
    return (
      <main className="mx-auto flex max-w-[820px] flex-col gap-6 px-6 pt-8 pb-16">
        <div className="flex flex-col gap-2" role="status">
          <h1 className="m-0 font-display text-[38px] font-bold">{t.doneTitle}</h1>
          <p className="m-0 text-base text-muted">{t.doneText}</p>
        </div>
        <div className="max-w-[420px]">
          <AdCard ad={preview} />
        </div>
        <div>
          <button
            type="button"
            onClick={() => setPreview(null)}
            className="min-h-[50px] cursor-pointer rounded-[10px] border border-field bg-white px-[22px] text-base font-semibold text-ink"
          >
            {t.edit}
          </button>
        </div>
      </main>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="mx-auto flex max-w-[820px] flex-col gap-7 px-6 pt-8 pb-16"
    >
      <div className="flex flex-col gap-2">
        <Link
          href="/"
          className="flex min-h-11 items-center self-start text-[15px] font-semibold no-underline"
        >
          {t.cancel}
        </Link>
        <h1 className="m-0 font-display text-[38px] font-bold tracking-tight">{t.pubTitle}</h1>
        <p className="m-0 text-base text-muted">{t.pubSub}</p>
      </div>

      {errors.length > 0 && (
        <div role="alert" className="rounded-xl border border-[#F1B9B9] bg-[#FFF7F7] px-4 py-3 text-sm text-danger">
          <ul className="m-0 pl-5">
            {errors.map((er) => (
              <li key={er}>{er}</li>
            ))}
          </ul>
        </div>
      )}

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-3 text-[17px] font-bold">{t.q1}</legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {kinds.map((k) => {
            const on = kind === k.id;
            return (
              <button
                key={k.id}
                type="button"
                aria-pressed={on}
                onClick={() => setKind(k.id)}
                className={`flex min-h-[116px] cursor-pointer flex-col items-start gap-2 rounded-[14px] border-2 p-[18px] text-left text-ink ${
                  on ? kindStyle[k.id].on : "border-line bg-white"
                }`}
              >
                <span className={`h-3.5 w-3.5 rounded-full ${kindStyle[k.id].dot}`} />
                <span className="text-[17px] font-bold">{t[k.id]}</span>
                <span className="text-sm leading-snug text-muted">{k.hint}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-3 text-[17px] font-bold">
          {t.q2} <span className="text-danger">*</span>
        </legend>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-3">
          {pays.map((p) => {
            const on = pay === p.id;
            return (
              <button
                key={p.id}
                type="button"
                aria-pressed={on}
                onClick={() => setPay(p.id)}
                className={`flex min-h-[84px] cursor-pointer flex-col items-start gap-1 rounded-xl border-2 px-4 py-3.5 text-left text-ink ${
                  on ? payOn[p.id] : "border-line bg-white"
                }`}
              >
                <span className="text-base font-bold">{t[p.id]}</span>
                <span className="text-[13px] leading-snug text-muted">{p.hint}</span>
              </button>
            );
          })}
        </div>
        <p className="m-0 text-[13px] text-muted">{t.q2note}</p>
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-4 border-0 p-0">
        <legend className="mb-3 text-[17px] font-bold">{t.q3}</legend>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="titulo" className="text-[15px] font-semibold">
            {t.title}
          </label>
          <input
            id="titulo"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={kind ? t.titlePh[kind] : t.titlePh.servicios}
            maxLength={90}
            className={`min-h-[50px] ${fieldClass}`}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="desc" className="text-[15px] font-semibold">
            {t.description}
          </label>
          <textarea
            id="desc"
            rows={4}
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder={t.descPh}
            maxLength={1000}
            className={`resize-y py-3 leading-normal ${fieldClass} ${scam ? "border-[#E8A33D]" : ""}`}
          />
          {scam && (
            <div
              role="alert"
              className="flex items-start gap-2.5 rounded-[10px] border border-[#F3C98B] bg-warn-bg px-3.5 py-3 text-sm leading-normal text-warn"
            >
              <WarnIcon />
              <span>
                <strong>{t.scamTitle}</strong> {t.scamText}
              </span>
            </div>
          )}
        </div>
        <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="hab" className="text-[15px] font-semibold">
              {t.skill}
            </label>
            <select
              id="hab"
              value={skill}
              onChange={(e) => setSkill(e.target.value as SkillKey)}
              className={`min-h-[50px] ${fieldClass}`}
            >
              {skillKeys.map((s) => (
                <option key={s} value={s}>
                  {t.skills[s]}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="idioma" className="text-[15px] font-semibold">
              {t.adLang}
            </label>
            <select
              id="idioma"
              value={adLang}
              onChange={(e) => setAdLang(e.target.value as "es" | "en")}
              className={`min-h-[50px] ${fieldClass}`}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </fieldset>

      {kind === "equipo" && (
        <fieldset className="m-0 flex flex-col gap-3 rounded-[14px] border border-[#F3C9A8] bg-[#FFFAF5] p-[18px]">
          <legend className="px-1.5 text-[17px] font-bold">{t.q4team}</legend>
          <p className="m-0 text-sm text-muted">{t.q4note}</p>
          {slots.map((s, i) => (
            <div
              key={i}
              className="flex flex-wrap items-center gap-2.5 rounded-[10px] border border-line bg-white px-3 py-2.5"
            >
              <label className="sr-only" htmlFor={`slot-${i}`}>
                {t.newSlotPh}
              </label>
              <input
                id={`slot-${i}`}
                value={s.name}
                placeholder={t.newSlotPh}
                onChange={(e) =>
                  setSlots((v) => v.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))
                }
                className="min-h-10 min-w-0 flex-[1_1_200px] rounded-lg border border-field px-3 text-[15px]"
              />
              <button
                type="button"
                aria-pressed={s.taken}
                onClick={() =>
                  setSlots((v) => v.map((x, j) => (j === i ? { ...x, taken: !x.taken } : x)))
                }
                className={`min-h-10 min-w-[110px] cursor-pointer rounded-lg border-[1.5px] text-sm font-semibold ${
                  s.taken
                    ? "border-solid border-[#B8B8B0] bg-chip text-muted"
                    : "border-dashed border-equipo bg-white text-equipo"
                }`}
              >
                {s.taken ? t.taken : t.free}
              </button>
              <button
                type="button"
                onClick={() => setSlots((v) => v.filter((_, j) => j !== i))}
                className="min-h-10 cursor-pointer rounded-lg border-0 bg-transparent px-2 text-sm font-semibold text-subtle"
              >
                {t.remove}
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setSlots((v) => [...v, { name: "", taken: false }])}
            className="min-h-11 cursor-pointer self-start rounded-[10px] border border-dashed border-equipo bg-white px-3.5 text-sm font-semibold text-equipo"
          >
            {t.addSlot}
          </button>
        </fieldset>
      )}

      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0">
        <legend className="mb-3 text-[17px] font-bold">
          {kind === "equipo" ? "5" : "4"}. {t.duration}
        </legend>
        <div className="flex flex-wrap gap-2.5">
          {([1, 4] as const).map((w) => (
            <label
              key={w}
              className={`flex min-h-11 items-center gap-2 rounded-[10px] px-3.5 ${
                weeks === w ? "border-2 border-servicios bg-servicios-bg" : "border border-field bg-white"
              }`}
            >
              <input
                type="radio"
                name="cad"
                checked={weeks === w}
                onChange={() => setWeeks(w)}
                className="h-[18px] w-[18px]"
              />
              {w === 1 ? t.week1 : t.week4}
            </label>
          ))}
        </div>
        <p className="m-0 text-[13px] text-muted">{t.durationNote}</p>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="submit"
          className="min-h-[50px] cursor-pointer rounded-[10px] bg-servicios px-[26px] text-base font-semibold text-white"
        >
          {t.submit}
        </button>
      </div>
    </form>
  );
}
