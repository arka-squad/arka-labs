import './globals.css';

export const metadata = {
  title: 'Arka Labs',
  description: 'Arka Labs — déploiement initial',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: 'system-ui, sans-serif', margin: 0, padding: 24 }}>
        {children}
      </body>
    </html>
  );
}
