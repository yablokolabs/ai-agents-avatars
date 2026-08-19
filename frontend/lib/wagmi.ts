import { WagmiConfig, configureChains, createConfig } from 'wagmi';
import { polygon, polygonMumbai } from 'wagmi/chains';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygonMumbai],
  [
    new MetaMaskConnector(),
    new WalletConnectConnector({
      projectId: process.env.WALLETCONNECT_PROJECT_ID || '',
    }),
  ]
);

const config = createConfig({
  autoConnect: true,
  connectors: [
    new MetaMaskConnector(),
    new WalletConnectConnector({
      projectId: process.env.WALLETCONNECT_PROJECT_ID || '',
    }),
  ],
  publicClient,
  webSocketPublicClient,
  chains,
});

export function Providers({ children }: { children: React.ReactNode }) {
  return <WagmiConfig config={config}>{children}</WagmiConfig>;
}

export { config };
