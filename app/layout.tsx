
import '../styles/base.css';
import '../styles/site.base.css';
import '../styles/site.components.css';
import '../styles/site.utilities.css';
import '../design-system/tokens.css';


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className="min-h-screen">{children}</body>
    </html>
  );
}
