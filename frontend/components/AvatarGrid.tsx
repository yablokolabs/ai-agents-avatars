'use client';

import { useReadContract } from 'wagmi';
import { avatars } from '@/lib/avatars';
import { CONTRACT_ABI, CONTRACT_ADDRESS, isDeployed } from '@/lib/contract';

export default function AvatarGrid() {
  const { data: minted } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'totalMinted',
    query: { enabled: isDeployed },
  });

  const mintedCount = typeof minted === 'bigint' ? Number(minted) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 px-6 pb-10">
      {avatars.map((avatar) => {
        const isMinted = avatar.id < mintedCount;
        return (
          <figure
            key={avatar.id}
            className={`rounded-xl border overflow-hidden bg-white shadow-sm transition hover:shadow-md ${
              isMinted ? 'border-emerald-300' : 'border-gray-200'
            }`}
          >
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              width={512}
              height={512}
              loading="lazy"
              className="w-full aspect-square object-cover bg-gray-100"
            />
            <figcaption className="p-3">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-medium text-gray-800">{avatar.name}</span>
                {isMinted && (
                  <span className="text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">
                    Minted
                  </span>
                )}
              </div>
              <dl className="mt-2 flex flex-wrap gap-1">
                {avatar.traits.map((t) => (
                  <div
                    key={t.key}
                    className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                  >
                    <dt className="sr-only">{t.key}</dt>
                    <dd>{t.value}</dd>
                  </div>
                ))}
              </dl>
            </figcaption>
          </figure>
        );
      })}
    </div>
  );
}
