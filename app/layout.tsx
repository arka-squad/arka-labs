import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Arka Console",
  description: "Console Arka — v0.1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="min-h-screen bg-[#0C1319] text-slate-100">{children}</body>
    </html>
  );
}
