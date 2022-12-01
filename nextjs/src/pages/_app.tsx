import '../styles/globals.css'
import "../styles/Home.sass"
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { useSystemTheme } from '../hooks/useSystemTheme'

export default function App({ Component, pageProps }: AppProps) {
  const theme = useSystemTheme()
  return <>
    <Head>
      <title>Kichō</title>
      <link rel="icon" href={`/images/favicon-${theme}.ico`} />
    </Head>
    <Component {...pageProps} /></>
}
