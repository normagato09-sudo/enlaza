import { connection } from "next/server";
import { Suspense } from "react";
import { NeedLogin } from "@/components/SiteHeader";
import { looksLikeScam } from "@/lib/data";
import { listBannedUsers, listForModeration } from "@/lib/queries";
import { getViewer } from "@/lib/session";
import { Forbidden, ModerationPanel } from "./ModerationPanel";

async function ModerationContent() {
  await connection();
  const viewer = await getViewer();
  if (!viewer) return <NeedLogin next="/moderacion" />;
  if (!viewer.isAdmin) return <Forbidden />;
  const [items, banned] = await Promise.all([listForModeration(), listBannedUsers()]);
  return (
    <ModerationPanel
      items={items.map(({ ad, reports }) => ({
        ad,
        reports,
        scam: looksLikeScam(`${ad.title} ${ad.description}`),
      }))}
      banned={banned}
      myId={viewer.id}
    />
  );
}

export default function ModeracionPage() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-[1000px] px-6 pt-8" aria-busy="true" />}>
      <ModerationContent />
    </Suspense>
  );
}
