'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const { address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const router = useRouter();

  const handleMint = async () => {
    if (!address) {
      connect({ connector: connectors[0] });
      return;
    }
    // In a real app this would call an admin-only mint function.
    // For now, redirect to home with a query param.
    router.push('/?mint=admin');
  };

  return (
    <div className="max-w-xl mx-auto p-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Admin Dashboard</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-gray-50">
          <span className="text-sm text-gray-600">Connected</span>
          <span className="text-sm font-medium">{address || 'No wallet'}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleMint}
            disabled={!address}
            className="flex-1 py-2.5 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-40 transition"
          >
            Trigger Admin Mint
          </button>
          {address && (
            <button
              onClick={disconnect}
              className="flex-1 py-2.5 rounded-md bg-gray-200 text-gray-700 text-sm hover:bg-gray-300 transition"
            >
              Disconnect
          </button>
          )}
        </div>
      </div>
    </div>
  );
}
