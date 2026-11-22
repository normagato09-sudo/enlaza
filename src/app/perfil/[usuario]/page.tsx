import { notFound } from "next/navigation";
import { getUser, users } from "@/lib/data";
import { Profile } from "./Profile";

export function generateStaticParams() {
  return users.map((u) => ({ usuario: u.username }));
}

export default async function PerfilPage({ params }: PageProps<"/perfil/[usuario]">) {
  const { usuario } = await params;
  const user = getUser(decodeURIComponent(usuario));
  if (!user) notFound();
  return <Profile username={user.username} />;
}
