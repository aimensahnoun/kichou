// NextJS import
import Head from 'next/head';

// Depenedencies import
import { motion } from 'framer-motion';

// Components import
import Collection from '../components/collection';
import { useGetNFTCollections } from '../hooks/marketplace';



export default function Marketplace() {

    const { data: collections , isLoading } = useGetNFTCollections()

    if(isLoading) {
        return <div>Loading...</div>
    }

    return <motion.main className='p-4'>
        <Head>
            <title>Kichō | Marketplace</title>

            {/* OG */}
            <meta property="og:title" content="Kichō | Marketplace" />
            <meta property="og:description" content="Kichō is a NFT marketplace for the Kichō NFT collection." />
            <meta property="og:image" content="https://kicho.io/hero.png" />

        </Head>

        {
            collections.map((collectionAddress: string, index: number) => {
                return <Collection collectionAddress={collectionAddress} key={collectionAddress} />
            })
        }

    </motion.main>
}

