import { Suspense } from "react";
import { NeedLogin } from "@/components/SiteHeader";
import { getCurrentUser } from "@/lib/session";
import { Welcome } from "./Welcome";

async function WelcomeContent() {
  const user = await getCurrentUser();
  if (!user) return <NeedLogin next="/bienvenida" />;
  return <Welcome user={user} />;
}

export default function Bienvenida() {
  return (
    <Suspense fallback={null}>
      <WelcomeContent />
    </Suspense>
  );
}
