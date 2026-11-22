import type { Metadata } from "next";
import { Suspense } from "react";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { LogoMark } from "@/components/ui";
import { getViewer } from "@/lib/session";

export const metadata: Metadata = {
  title: "Enlaza · Servicios, trabajo y equipo para tu proyecto",
  description:
    "Ofrece tus servicios, encuentra trabajo o arma el equipo de tu proyecto. Todo en un solo sitio, con tu perfil de Discord.",
};

async function HeaderWithUser() {
  const user = await getViewer();
  return <SiteHeader user={user} />;
}

function HeaderPlaceholder() {
  return (
    <header className="border-b border-line bg-white">
      <div className="mx-auto flex min-h-[77px] max-w-[1240px] items-center gap-2.5 px-4 py-4 sm:px-6">
        <LogoMark />
        <span className="font-display text-[22px] font-bold">Enlaza</span>
      </div>
    </header>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="flex min-h-full flex-col font-sans">
        <Suspense fallback={<HeaderPlaceholder />}>
          <HeaderWithUser />
        </Suspense>
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
