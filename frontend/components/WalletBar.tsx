'use client';

import { useAccount, useBalance, useConnect, useDisconnect, useSwitchChain } from 'wagmi';
import { formatEther } from 'viem';
import { chain } from '@/lib/wagmi';

const short = (a: string) => `${a.slice(0, 6)}…${a.slice(-4)}`;

export default function WalletBar() {
  const { address, isConnected, chainId } = useAccount();
  const { connect, connectors, isPending } = useConnect();
  const { disconnect } = useDisconnect();
  const { switchChain } = useSwitchChain();
  const { data: balance } = useBalance({ address });

  const wrongChain = isConnected && chainId !== chain.id;

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 border-b bg-white">
      <div className="flex items-baseline gap-3">
        <span className="text-sm font-semibold text-gray-900">AI Agents Avatars</span>
        <span className="text-xs text-gray-500">{chain.name}</span>
      </div>

      <div className="flex items-center gap-3">
        {wrongChain && (
          <button
            onClick={() => switchChain({ chainId: chain.id })}
            className="px-3 py-1.5 rounded-md bg-amber-500 text-white text-xs hover:bg-amber-600 transition"
          >
            Switch to {chain.name}
          </button>
        )}

        {isConnected && balance && !wrongChain && (
          <span className="text-xs text-gray-500 tabular-nums">
            {Number(formatEther(balance.value)).toFixed(3)} {balance.symbol}
          </span>
        )}

        {isConnected && address && <span className="text-xs text-gray-500">{short(address)}</span>}

        <button
          onClick={() => (isConnected ? disconnect() : connect({ connector: connectors[0] }))}
          disabled={isPending || connectors.length === 0}
          className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm hover:bg-gray-800 disabled:opacity-40 transition"
        >
          {isConnected ? 'Disconnect' : isPending ? 'Connecting…' : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
}
