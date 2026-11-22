import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { isExpired } from "@/lib/data";
import { getAdById, hasReported, listApplications, myApplicationSlots } from "@/lib/queries";
import { getViewer } from "@/lib/session";
import { AdDetail } from "./AdDetail";

async function AdContent({ params }: { params: PageProps<"/anuncio/[id]">["params"] }) {
  await connection();
  const { id } = await params;
  const [ad, me] = await Promise.all([getAdById(id), getViewer()]);
  const isOwner = Boolean(me && ad && ad.user.id === me.id);
  const expired = ad ? isExpired(ad.expiresAt) : true;
  // Los anuncios en revisión o caducados solo los ve quien los publicó.
  const hidden = ad ? ad.status !== "active" || expired || ad.user.banned : true;
  if (!ad || (hidden && !isOwner && !me?.isAdmin)) notFound();

  const [applications, mySlots, reported] = await Promise.all([
    isOwner ? listApplications(ad.id) : Promise.resolve([]),
    me && !isOwner ? myApplicationSlots(ad.id, me.id) : Promise.resolve([]),
    me ? hasReported(ad.id, me.id) : Promise.resolve(false),
  ]);

  return (
    <AdDetail
      ad={ad}
      me={me}
      isOwner={isOwner}
      expired={expired}
      applications={applications}
      mySlots={mySlots}
      reported={reported}
    />
  );
}

export default function AnuncioPage(props: PageProps<"/anuncio/[id]">) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-[1240px] px-6 pt-6" aria-busy="true" />}>
      <AdContent params={props.params} />
    </Suspense>
  );
}
