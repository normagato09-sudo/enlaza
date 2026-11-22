"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Avatar } from "@/components/ui";
import { sendMessage } from "@/lib/actions";
import { timeAgo, type Message, type PublicUser } from "@/lib/data";
import { useLang } from "@/lib/i18n";

export function Thread({ other, messages }: { other: PublicUser; messages: Message[] }) {
  const { t, lang } = useLang();
  const router = useRouter();
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const endRef = useRef<HTMLDivElement>(null);

  // Mira si hay mensajes nuevos cada 10 segundos.
  useEffect(() => {
    const id = window.setInterval(() => router.refresh(), 10_000);
    return () => window.clearInterval(id);
  }, [router]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ block: "end" });
  }, [messages.length]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const body = text.trim();
    if (!body) return;
    startTransition(async () => {
      setError(null);
      try {
        const res = await sendMessage(other.username, body);
        if (res.ok) setText("");
        else setError(t.genericError);
      } catch {
        setError(t.genericError);
      }
    });
  };

  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-4 px-6 pt-6 pb-10">
      <Link href="/mensajes" className="flex min-h-11 items-center self-start text-[15px] font-semibold no-underline">
        {t.backToMessages}
      </Link>
      <Link
        href={`/perfil/${other.username}`}
        className="flex items-center gap-3 self-start text-ink no-underline hover:text-ink"
      >
        <Avatar name={other.username} src={other.avatarUrl} size={44} />
        <h1 className="m-0 font-display text-2xl font-bold">{t.conversationWith(other.username)}</h1>
      </Link>

      <section
        aria-live="polite"
        className="flex max-h-[60vh] min-h-[280px] flex-col gap-2.5 overflow-y-auto rounded-[14px] border border-line bg-white p-4"
      >
        {messages.length === 0 && <p className="m-auto text-sm text-muted">{t.noMessagesYet}</p>}
        {messages.map((m) => (
          <div key={m.id} className={`flex max-w-[80%] flex-col gap-1 ${m.fromMe ? "self-end items-end" : "self-start"}`}>
            <p
              className={`m-0 rounded-2xl px-3.5 py-2.5 text-[15px] leading-normal break-words whitespace-pre-line ${
                m.fromMe ? "bg-servicios text-white" : "bg-chip text-ink"
              }`}
            >
              {m.body}
            </p>
            <span className="text-[11px] text-subtle">
              {m.fromMe ? t.you : other.username} · {timeAgo(m.createdAt, lang)}
            </span>
          </div>
        ))}
        <div ref={endRef} />
      </section>

      {error && (
        <p role="alert" className="m-0 rounded-xl border border-[#F1B9B9] bg-[#FFF7F7] px-4 py-3 text-sm text-danger">
          {error}
        </p>
      )}

      <form onSubmit={submit} className="flex flex-wrap gap-2.5">
        <label htmlFor="msg" className="sr-only">
          {t.messagePh}
        </label>
        <textarea
          id="msg"
          rows={2}
          value={text}
          maxLength={2000}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              e.currentTarget.form?.requestSubmit();
            }
          }}
          placeholder={t.messagePh}
          className="min-w-0 flex-[1_1_300px] resize-y rounded-[10px] border border-field bg-white px-3.5 py-3 text-base text-ink placeholder:text-subtle"
        />
        <button
          type="submit"
          disabled={pending || !text.trim()}
          className="min-h-[50px] cursor-pointer self-end rounded-[10px] bg-servicios px-6 text-base font-semibold text-white disabled:opacity-60"
        >
          {t.send}
        </button>
      </form>
    </main>
  );
}
