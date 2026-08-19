import './globals.css';
import type { Metadata } from 'next';
import { Providers } from '@/lib/wagmi';

export const metadata: Metadata = {
  title: 'AI Agents Avatars — Mint',
  description: 'A 100-piece generative NFT collection of AI agent avatars on Polygon Amoy.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
