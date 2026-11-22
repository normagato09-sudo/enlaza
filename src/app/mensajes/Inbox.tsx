"use client";

import Link from "next/link";
import { Avatar } from "@/components/ui";
import { timeAgo, type Conversation } from "@/lib/data";
import { useLang } from "@/lib/i18n";

export function Inbox({ conversations }: { conversations: Conversation[] }) {
  const { t, lang } = useLang();
  return (
    <main className="mx-auto flex max-w-[760px] flex-col gap-5 px-6 pt-8 pb-16">
      <h1 className="m-0 font-display text-[34px] font-bold">{t.messagesTitle}</h1>
      {conversations.length === 0 ? (
        <p className="m-0 rounded-[14px] border border-dashed border-field bg-white p-8 text-center text-muted">
          {t.noConversations}
        </p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {conversations.map((c) => (
            <li key={c.user.id}>
              <Link
                href={`/mensajes/${c.user.username}`}
                className="flex items-center gap-3 rounded-[14px] border border-line bg-white px-4 py-3.5 text-ink no-underline hover:border-field hover:text-ink"
              >
                <Avatar name={c.user.username} src={c.user.avatarUrl} size={44} />
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="flex items-center justify-between gap-2">
                    <span className={`truncate ${c.unread ? "font-bold" : "font-semibold"}`}>{c.user.username}</span>
                    <span className="flex-none text-xs text-subtle">{timeAgo(c.lastAt, lang)}</span>
                  </span>
                  <span className={`truncate text-sm ${c.unread ? "font-semibold text-ink" : "text-muted"}`}>
                    {c.last}
                  </span>
                </span>
                {c.unread > 0 && (
                  <span className="flex-none rounded-full bg-danger px-2 py-0.5 text-xs font-bold text-white">
                    {c.unread}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
