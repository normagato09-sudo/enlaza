import { notFound } from "next/navigation";
import { ads, getAd } from "@/lib/data";
import { AdDetail } from "./AdDetail";

export function generateStaticParams() {
  return ads.map((a) => ({ id: a.id }));
}

export default async function AnuncioPage({ params }: PageProps<"/anuncio/[id]">) {
  const { id } = await params;
  const ad = getAd(id);
  if (!ad) notFound();
  return <AdDetail id={ad.id} />;
}
