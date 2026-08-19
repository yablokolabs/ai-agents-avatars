import './globals.css';

export const metadata = {
  title: 'AI Agents Avatars — Mint',
  description: 'Mint an AI Agents Avatar on Polygon',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
