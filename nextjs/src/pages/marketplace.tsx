// NextJS import
import Head from 'next/head';

// Depenedencies import
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { If, Else, Then } from 'react-if';

// Components import
import Collection from '../components/collection';
import { useGetNFTCollections } from '../hooks/marketplace';

// Utils import
import { navbarHightAtom } from "../utils/global-state";
import Image from 'next/image';


export default function Marketplace() {
    // React Query
    const { data: collections, isLoading } = useGetNFTCollections()

    // Global state
    const [navbarHeight] = useAtom(navbarHightAtom);

    if (isLoading) {
        return <div>Loading...</div>
    }

    return <motion.main className='w-full p-2' style={
        {
            height: `calc(100vh - ${navbarHeight}px)`,
        }
    }>
        <Head>
            <title>Kichō | Marketplace</title>

            {/* OG */}
            <meta property="og:title" content="Kichō | Marketplace" />
            <meta property="og:description" content="Kichō is a NFT marketplace for the Kichō NFT collection." />
            <meta property="og:image" content="https://kicho.io/hero.png" />

        </Head>

        <If condition={
            collections?.length === 0
        } >
            <Then>
                <div className='flex flex-col items-center justify-center w-full h-full gap-y-4'>
                    <Image src="/empty.png" height={400} width={400} alt="Empty Marketplace" className='rounded-xl' />
                    <h1 className='text-xl font-bold text-center'>We apologize, it seems our marketplace is currently empty</h1>
                </div>
            </Then>
            <Else>
                {
                    collections!.map((collectionAddress: string, index: number) => {
                        return <Collection collectionAddress={collectionAddress} key={collectionAddress} />
                    })
                }
            </Else>
        </If>



    </motion.main>
}

