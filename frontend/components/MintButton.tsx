'use client';

import { useAccount, useReadContract, useWaitForTransactionReceipt, useWriteContract } from 'wagmi';
import { formatEther } from 'viem';
import { CONTRACT_ABI, CONTRACT_ADDRESS, isDeployed } from '@/lib/contract';
import { chain } from '@/lib/wagmi';

export default function MintButton() {
  const { address, chainId } = useAccount();
  const { writeContract, data: hash, isPending, error, reset } = useWriteContract();
  const { isLoading: confirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  const read = {
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    chainId: chain.id,
    query: { enabled: isDeployed },
  } as const;
  const { data: price } = useReadContract({ ...read, functionName: 'mintPrice' });
  const { data: minted, refetch } = useReadContract({ ...read, functionName: 'totalMinted' });
  const { data: paused } = useReadContract({ ...read, functionName: 'paused' });

  const soldOut = typeof minted === 'bigint' && minted >= 100n;
  const wrongChain = Boolean(address) && chainId !== chain.id;
  const blocked = !address || wrongChain || soldOut || paused === true || price === undefined;

  if (!isDeployed) {
    return (
      <p className="text-sm text-gray-500">
        Not yet deployed — browsing the collection in preview mode.
      </p>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex items-center gap-3">
        <p className="text-sm text-emerald-700">Minted. Welcome to the collection.</p>
        <button
          onClick={() => {
            reset();
            refetch();
          }}
          className="text-xs underline text-gray-500"
        >
          Mint another
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        onClick={() =>
          writeContract({
            address: CONTRACT_ADDRESS!,
            abi: CONTRACT_ABI,
            functionName: 'mint',
            value: price as bigint,
          })
        }
        disabled={blocked || isPending || confirming}
        className="px-5 py-2.5 rounded-md bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-700 disabled:opacity-40 transition"
      >
        {isPending ? 'Confirm in wallet…' : confirming ? 'Minting…' : 'Mint an avatar'}
      </button>

      {price !== undefined && (
        <span className="text-sm text-gray-600">
          {formatEther(price as bigint)} {chain.nativeCurrency.symbol}
        </span>
      )}

      {!address && <span className="text-sm text-gray-500">Connect a wallet to mint.</span>}
      {wrongChain && <span className="text-sm text-amber-600">Switch to {chain.name} first.</span>}
      {paused === true && <span className="text-sm text-amber-600">Minting is paused.</span>}
      {soldOut && <span className="text-sm text-gray-500">All 100 have been minted.</span>}
      {error && (
        <span className="text-sm text-red-600">
          {error.message.split('\n')[0].slice(0, 120)}
        </span>
      )}
    </div>
  );
}
