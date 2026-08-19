'use client';

import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi';
import { useEffect, useState } from 'react';

export default function WalletBar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { data: balance } = useBalance({
    address: isConnected ? address : undefined,
    watch: isConnected,
  });

  const [status, setStatus] = useState('Disconnected');

  useEffect(() => {
    if (isConnected) {
      setStatus('Connected');
      const eth = balance ? parseFloat(ethers.utils.formatEther(balance)) : 0;
      setStatus(`Connected — ${eth.toFixed(4)} ETH`);
    } else {
      setStatus('Disconnected');
    }
  }, [isConnected, balance]);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b bg-white">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-gray-700">AI Agents Avatars</span>
        <span className="text-xs text-gray-500">Polygon</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-xs text-gray-500">{status}</span>
        <button
          onClick={() => {
            if (isConnected) disconnect();
            else connect({ connector: connectors[0] });
          }}
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800 transition"
        >
          {isConnected ? 'Disconnect' : 'Connect Wallet'}
        </button>
      </div>
    </div>
  );
}
