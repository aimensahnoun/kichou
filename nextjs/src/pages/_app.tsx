// Css import
import '../styles/globals.css'
import "../styles/Home.sass"

// NextJs import
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'

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

  // Router
  const router = useRouter()

  if(router.pathname === "/404"){
    return <Component {...pageProps} />
  }
  
  return <WagmiConfig client={wagmiClient}>
    <RainbowKitProvider theme={
      darkTheme({
        accentColor: '#ED4739',
      })
    } chains={chains}>
      <Head>
        <title>Kichō</title>
        <link rel="icon" href={`/images/favicon-${theme}.ico`} />

        {/* Meta */}
        <meta property='og:url' content='https://www.kichou.xyz' />
        <meta property='og:type' content='website' />
        <meta property='og:title' content='Kichō' />
        <meta property='og:description' content='Kichō is a NFT marketplace for the Polygon network, The Marketplace of Wonders.' />
        <meta property='og:image' content='https://www.kichou.xyz/hero.png' />
        <meta property='og:image:width' content='1200' />
        <meta property='og:image:height' content='630' />
        <meta property='og:site_name' content='Kichō' />
        <meta property='og:locale' content='en_US' />
        {/* Twitter Meta */}
        <meta name='twitter:card' content='summary_large_image' />
        <meta name='twitter:creator' content='@aimensahnoun' />
        <meta name='twitter:title' content='Kichō' />
        <meta name='twitter:description' content='Kichō is a NFT marketplace for the Polygon network, The Marketplace of Wonders.' />
        <meta name='twitter:image' content='https://www.kichou.xyz/hero.png' />
        {/* Telegram meta */}
        <meta name="telegram:title" content="Kichō" />
        <meta name="telegram:description" content="Kichō is a NFT marketplace for the Polygon network, The Marketplace of Wonders." />
        <meta name="telegram:image" content="https://www.kichou.xyz/hero.png" />
        <meta name="telegram:image:alt" content="Kichō" />
        <meta name="telegram:creator" content="@aimensahnoun" />

      </Head>
      <section>
        <NavBar />
        <Component {...pageProps} />
      </section>
    </RainbowKitProvider>
  </WagmiConfig>
  
}
