'use client';

import { useAccount } from 'wagmi';
import { Avatar, generateAvatars } from '@/lib/avatars';

export default function AvatarGrid() {
  const { address } = useAccount();
  const avatars = generateAvatars(100);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4 p-6">
      {avatars.map((avatar) => (
        <div
          key={avatar.id}
          className={`relative group rounded-xl border overflow-hidden bg-white shadow-sm transition hover:shadow-md ${
            avatar.minted ? 'border-emerald-300' : 'border-gray-200'
          }`}
        >
          <div className="aspect-square bg-gray-100 flex items-center justify-center">
            <img
              src={avatar.imageUrl}
              alt={avatar.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <div className="p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-gray-700">{avatar.name}</span>
              {avatar.minted && (
                <span className="text-[10px] uppercase tracking-wide bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Minted</span>
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-1">
              {avatar.traits.map((t) => (
                <span
                  key={t.key + t.value}
                  className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                >
                  {t.key}: {t.value}
                </span>
              ))}
            </div>
            {address && !avatar.minted && (
              <button
                onClick={() => {
                  // placeholder — mint flow handled by MintButton
                }}
                className="mt-3 w-full py-1.5 rounded-md bg-gray-900 text-white text-xs hover:bg-gray-800 transition"
              >
                Mint
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
