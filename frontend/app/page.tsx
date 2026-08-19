import WalletBar from '@/components/WalletBar';
import AvatarGrid from '@/components/AvatarGrid';
import MintButton from '@/components/MintButton';
import { TOTAL } from '@/lib/avatars';

export default function Home() {
  return (
    <main>
      <WalletBar />
      <section className="px-6 py-8 space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">AI Agents Avatars</h1>
          <p className="mt-1 text-sm text-gray-600">
            {TOTAL} generative agents. Five traits each, drawn from the token&apos;s own metadata.
          </p>
        </div>
        <MintButton />
      </section>
      <AvatarGrid />
    </main>
  );
}
