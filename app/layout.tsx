import "../styles/base.css";
import "../design-system/tokens.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arka — Cockpit IA pour piloter vos projets (chat multi‑agents)",
  description:
    "Pilotez vos projets avec des assistants IA : chat multi‑agents, recettes de gouvernance, observabilité et preuves partageables.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}

