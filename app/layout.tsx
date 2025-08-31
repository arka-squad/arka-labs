import "./globals.css";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ backgroundColor: "var(--arka-bg)" }}>
        {children}
      </body>
    </html>
  );
}
