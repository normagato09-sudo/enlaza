import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import {
  getCollabState,
  getUserByUsername,
  listAdsByUser,
  listPendingCollabs,
  listReviews,
} from "@/lib/queries";
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
  const [ads, reviews, collab, pending] = await Promise.all([
    listAdsByUser(user.id, isMe),
    listReviews(user.id),
    me && !isMe ? getCollabState(me.id, user.id) : Promise.resolve(null),
    isMe ? listPendingCollabs(user.id) : Promise.resolve([]),
  ]);
  return (
    <Profile
      user={user}
      ads={ads}
      isMe={isMe}
      loggedIn={Boolean(me)}
      reviews={reviews}
      collab={collab}
      pending={pending}
    />
  );
}

export default function PerfilPage(props: PageProps<"/perfil/[usuario]">) {
  return (
    <Suspense fallback={<main className="mx-auto max-w-[1240px] px-6 pt-8" aria-busy="true" />}>
      <ProfileContent params={props.params} />
    </Suspense>
  );
}
