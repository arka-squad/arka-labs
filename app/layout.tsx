import './globals.css';

export const metadata = {
  title: 'Arka — R1',
  description: 'Arka Labs — déploiement initial',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body style={{ backgroundColor: 'var(--arka-bg)', fontFamily: 'Poppins, ui-sans-serif, system-ui' }}>
        {children}
      </body>
    </html>
  );
}
