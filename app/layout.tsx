import "./globals.css";
import { Poppins } from "next/font/google";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={poppins.className} style={{ backgroundColor: "var(--arka-bg)" }}>
        {children}
      </body>
    </html>
  );
}
