// Css import
import '../styles/globals.css'
import "../styles/Home.sass"

// NextJs import
import type { AppProps } from 'next/app'
import Head from 'next/head'

// Custom hooks import
import { useSystemTheme } from '../hooks/useSystemTheme'

// Dependencies import
import '@rainbow-me/rainbowkit/styles.css';

import {
  darkTheme,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';
import NavBar from '../components/navbar'


const { chains, provider } = configureChains(
  [chain.polygonMumbai],
  [
    alchemyProvider({ apiKey: process.env.NEXT_PUBLIC_ALCHEMY_POLYGON_API_KEY! }),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'Kichō',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

export default function App({ Component, pageProps }: AppProps) {
  const theme = useSystemTheme()
  return <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider theme={
      darkTheme({
        accentColor: '#ED4739',
      })
    } chains={chains}>
      <Head>
        <title>Kichō</title>
        <link rel="icon" href={`/images/favicon-${theme}.ico`} />
      </Head>
      <section>
        <NavBar />
        <Component {...pageProps} />
      </section>
    </RainbowKitProvider>
  </WagmiConfig>
}
