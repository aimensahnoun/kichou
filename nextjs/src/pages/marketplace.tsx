// NextJS import
import Head from 'next/head';

// React import
import { useState } from 'react';

// Depenedencies import
import { AnimatePresence, motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { If, Else, Then } from 'react-if';

// Components import
import Collection from '../components/collection';
import { useGetNFTCollections } from '../hooks/collection';

// Utils import
import { navbarHightAtom } from "../utils/global-state";
import Image from 'next/image';
import CreateCollectionModal from '../components/create-collection-modal';


export default function Marketplace() {
    // React Query
    const { data: collections, isLoading } = useGetNFTCollections()


    // Local State
    const [isCreateCollectionModalOpen, setIsCreateCollectionModalOpen] = useState(false)

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
            <Else >
                <div className='p-2 overflow-scroll w-full h-full'>
                    <div className='flex w-full items-center justify-between mb-4'>
                        <span className='font-bold text-2xl'>Marketplace
                        </span>

                        <motion.button
                            onClick={() => setIsCreateCollectionModalOpen(true)}

                            className='p-2 rounded-lg bg-kichou-red'>New Collection</motion.button>
                    </div>
                    <div className='grid gap-4 grid-cols-5 grid-rows-5'>
                        {

                            collections!.map((collectionAddress: string, index: number) => {
                                return <Collection collectionAddress={collectionAddress} key={collectionAddress} />
                            })
                        }
                    </div>
                </div>
            </Else>
        </If>


        <AnimatePresence>
            {
                isCreateCollectionModalOpen &&
                <CreateCollectionModal setIsModalOpen={setIsCreateCollectionModalOpen}  />
            }
        </AnimatePresence>

    </motion.main>
}

