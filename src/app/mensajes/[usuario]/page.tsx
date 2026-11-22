import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { NeedLogin } from "@/components/SiteHeader";
import { getUserByUsername, listThread } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { Thread } from "./Thread";

async function ThreadContent({ params }: { params: PageProps<"/mensajes/[usuario]">["params"] }) {
  await connection();
  const { usuario } = await params;
  const me = await getCurrentUser();
  if (!me) return <NeedLogin next={`/mensajes/${usuario}`} />;
  const other = await getUserByUsername(decodeURIComponent(usuario));
  if (!other || other.id === me.id) notFound();
  const messages = await listThread(me.id, other.id);
  return <Thread other={other} messages={messages} />;
}

export default function ConversacionPage(props: PageProps<"/mensajes/[usuario]">) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-[760px] px-6 pt-8" aria-busy="true" />}>
      <ThreadContent params={props.params} />
    </Suspense>
  );
}
