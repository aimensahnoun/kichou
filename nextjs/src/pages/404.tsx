// NextJS import
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'

// Dependencies import
import { motion } from "framer-motion";


const container = {
    hidden: { opacity: 1, scale: 0 },
    visible: {
        opacity: 1,
        scale: 1,
        transition: {
            delayChildren: 0.3,
            staggerChildren: 0.5
        }
    }
} as const;

const item = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1
    }
} as const;

export default function FourOhFour() {

    const router = useRouter()

    return <motion.main className='w-screen h-screen flex flex-col items-center justify-center gap-y-6' variants={container}
        initial="hidden"
        animate="visible">

        <Head>
            <title>Kichō | Wonder Not Found</title>

            <meta name="description" content="Kichō is a wonderland of NFTs" />

            <meta property="og:title" content="Kichō | Wonder Not Found" />
            <meta property="og:description" content="Kichō is a wonderland of NFTs" />
            <meta property="og:image" content="https://www.kichou.xyz/404.png" />

            <meta property="twitter:title" content="Kichō | Wonder Not Found" />
            <meta property="twitter:description" content="Kichō is a wonderland of NFTs" />
            <meta property="twitter:image" content="https://www.kichou.xyz/404.png" />

            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:creator" content="@aimensahnoun" />



        </Head>

        <motion.div variants={item} className='relative w-fit h-fit rounded-xl duration-300 hover:scale-105 item'>
            <Image alt='Wonder Not Found' src="/404.png" className='object-contain rounded-xl' width={500} height={500} />
        </motion.div>

        <motion.span className='font-bold text-xl text-center' variants={item} >404 | Your wonder is yet to be found </motion.span>

        <motion.button variants={item} onClick={() => {
            router.replace('/')
        }} className='p-2 rounded-lg bg-kichou-red item '>
            Go Back Home
        </motion.button>
    </motion.main>
}