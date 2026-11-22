import { connection } from "next/server";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getUserByUsername, listAdsByUser } from "@/lib/queries";
import { getCurrentUser } from "@/lib/session";
import { Profile } from "./Profile";

async function ProfileContent({ params }: { params: PageProps<"/perfil/[usuario]">["params"] }) {
  await connection();
  const { usuario } = await params;
  const [user, me] = await Promise.all([
    getUserByUsername(decodeURIComponent(usuario)),
    getCurrentUser(),
  ]);
  if (!user) notFound();
  const isMe = me?.id === user.id;
  const ads = await listAdsByUser(user.id, isMe);
  return <Profile user={user} ads={ads} isMe={isMe} />;
}

export default function PerfilPage(props: PageProps<"/perfil/[usuario]">) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-[1240px] px-6 pt-8" aria-busy="true" />}>
      <ProfileContent params={props.params} />
    </Suspense>
  );
}
