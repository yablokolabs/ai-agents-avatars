'use client';

import { useAccount, useContractWrite, useReadContract } from 'wagmi';
import { ethers } from 'ethers';

const CONTRACT_ADDRESS =
  process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000';
const CONTRACT_ABI = [
  'function mint(address to) payable',
  'function getTokenURI(uint256 tokenId) view returns (string)',
  'function maxSupply() view returns (uint256)',
];

export default function MintButton() {
  const { address } = useAccount();
  const { write, isLoading: isWriting } = useContractWrite({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'mint',
    args: [address],
    value: ethers.parseEther('0.05'),
  });

  const { data: maxSupply } = useReadContract({
    address: CONTRACT_ADDRESS,
    abi: CONTRACT_ABI,
    functionName: 'maxSupply',
  });

  const [gasEstimate, setGasEstimate] = useState<bigint | null>(null);
  const [gasPrice, setGasPrice] = useState<bigint | null>(null);

  if (address) {
    const estimate = write?.estimateGas || null;
    if (estimate) setGasEstimate(estimate);
  }

  const totalCost = gasEstimate && gasPrice
    ? gasEstimate.mul(gasPrice)
    : null;

  if (!address) {
    return (
      <div className="p-6 text-center text-sm text-gray-500">
        Connect your wallet to mint an avatar.
      </div>
    );
  }

  return (
    <div className="p-6 border rounded-xl bg-white">
      <h3 className="text-sm font-semibold text-gray-800 mb-2">Mint Avatar</h3>
      <p className="text-xs text-gray-500 mb-3">
        Estimated gas: {totalCost ? ethers.utils.formatEther(totalCost) : '...'} MATIC
      </p>
      <button
        onClick={() => {
          if (write) write();
        }}
        disabled={isWriting}
        className="w-full py-2.5 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50 transition"
      >
        {isWriting ? 'Minting...' : 'Mint Avatar'}
      </button>
    </div>
  );
}
