import { connection } from "next/server";
import { Suspense } from "react";
import { NeedLogin } from "@/components/SiteHeader";
import { listConversations } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { Inbox } from "./Inbox";

async function InboxContent() {
  await connection();
  const me = await getCurrentUser();
  if (!me) return <NeedLogin next="/mensajes" />;
  const conversations = await listConversations(me.id);
  return <Inbox conversations={conversations} />;
}

export default function MensajesPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-[760px] px-6 pt-8" aria-busy="true" />}>
      <InboxContent />
    </Suspense>
  );
}
