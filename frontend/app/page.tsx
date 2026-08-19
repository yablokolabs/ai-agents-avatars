import { Providers } from '@/lib/wagmi';
import WalletBar from '@/components/WalletBar';
import AvatarGrid from '@/components/AvatarGrid';
import MintButton from '@/components/MintButton';
import AdminDashboard from '@/components/AdminDashboard';
import MintStatusBanner from '@/components/MintStatusBanner';

export default function Home() {
  return (
    <Providers>
      <WalletBar />
      <MintStatusBanner />
      <AvatarGrid />
      <MintButton />
      <AdminDashboard />
    </Providers>
  );
}
