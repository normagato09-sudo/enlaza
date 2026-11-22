"use client";

import { colorFor, type Category, type PayType } from "@/lib/data";
import { useLang } from "@/lib/i18n";

export const categoryStyle: Record<Category, string> = {
  servicios: "bg-servicios-bg text-servicios",
  trabajo: "bg-trabajo-bg text-trabajo",
  equipo: "bg-equipo-bg text-equipo",
};

export const categoryDot: Record<Category, string> = {
  servicios: "bg-servicios",
  trabajo: "bg-trabajo",
  equipo: "bg-equipo",
};

const payStyle: Record<PayType, string> = {
  pagado: "bg-chip text-ink border-ink",
  voluntario: "bg-white text-muted border-[#B8B8B0]",
  reparto: "bg-reparto-bg text-reparto border-reparto",
};

export function CategoryChip({ category }: { category: Category }) {
  const { t } = useLang();
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[13px] font-semibold ${categoryStyle[category]}`}
    >
      {t[category]}
    </span>
  );
}

export function PayChip({ pay }: { pay: PayType }) {
  const { t } = useLang();
  return (
    <span
      className={`rounded-full border-[1.5px] px-2.5 py-1 text-[13px] font-semibold ${payStyle[pay]}`}
    >
      {t[pay]}
    </span>
  );
}

export function Avatar({
  name,
  src,
  size = 34,
}: {
  name: string;
  src?: string | null;
  size?: number;
}) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt=""
        width={size}
        height={size}
        className="flex-none rounded-full object-cover"
        style={{ width: size, height: size }}
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      className="flex flex-none items-center justify-center rounded-full font-bold text-white"
      style={{ width: size, height: size, background: colorFor(name), fontSize: size * 0.4 }}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-[10px] bg-ink"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.56}
        height={size * 0.56}
        viewBox="0 0 24 24"
        fill="none"
        stroke="#FFFFFF"
        strokeWidth="2.2"
        strokeLinecap="round"
        aria-hidden="true"
      >
        <path d="M9 15l6-6" />
        <path d="M11 6l1.5-1.5a4.2 4.2 0 016 6L17 12" />
        <path d="M13 18l-1.5 1.5a4.2 4.2 0 01-6-6L7 12" />
      </svg>
    </span>
  );
}

export function CheckIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

export function ClockIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

export function FlagIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 21V4h12l-1.5 4L16 12H4" />
    </svg>
  );
}

export function ShieldIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="flex-none"
    >
      <path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

export function WarnIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="mt-px flex-none"
    >
      <path d="M12 3l10 18H2z" />
      <path d="M12 10v4M12 17.5v.5" />
    </svg>
  );
}
