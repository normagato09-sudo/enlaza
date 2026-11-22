import { Suspense } from "react";
import { NeedLogin } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/session";
import { PublishForm } from "./PublishForm";

async function PublishContent() {
  const user = await getCurrentUser();
  if (!user) return <NeedLogin next="/publicar" />;
  return <PublishForm username={user.username} />;
}

export default function Publicar() {
  return (
    <Suspense fallback={<main className="mx-auto max-w-[820px] px-6 pt-8" aria-busy="true" />}>
      <PublishContent />
    </Suspense>
  );
}
