import type { Metadata } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Enlaza · Servicios, trabajo y equipo para tu proyecto",
  description:
    "Ofrece tus servicios, encuentra trabajo o arma el equipo de tu proyecto. Todo en un solo sitio, con tu perfil de Discord.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="flex min-h-full flex-col font-sans">
        <SiteHeader />
        <div className="flex-1">{children}</div>
      </body>
    </html>
  );
}
