import abi from './abi.json';

/** Set once the collection is deployed; until then the site runs in gallery mode. */
export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as
  | `0x${string}`
  | undefined;

export const CONTRACT_ABI = abi;

export const isDeployed = Boolean(CONTRACT_ADDRESS);
