// NextJS import
import Head from 'next/head';
import { useRouter } from 'next/router';

// Depenedencies import
import { BsImages } from 'react-icons/bs';
import { AiOutlineUser } from 'react-icons/ai';
import { useAtom } from 'jotai';
// Custom components import
import NFT from '../../components/nft';

// Utils import
import { navbarHightAtom } from "../../utils/global-state"

// Hooks import
import { useGetAllCollectionsNfts, useGetCollectionFromAddress, useGetNFTCollections } from '../../hooks/collection';
import { Else, If, Then } from 'react-if';


export default function Collection() {

    // Global state
    const [navbarHight] = useAtom(navbarHightAtom);

    // Router
    const router = useRouter()
    const { id } = router.query

    // React Query
    const { data: allCollections, isLoading: areCollectionsLoading, isFetched: areCollectionsFetched } = useGetNFTCollections()
    const { data: collection, isLoading: isLoadingCollection, isFetched } = useGetCollectionFromAddress(id as string)
    const { data: allNfts, isLoading: isLoadingNFTS } = useGetAllCollectionsNfts(id as string)

    // If the collection is not found, redirect to the 404 page
    if (areCollectionsFetched && (allCollections.length === 0 || allCollections.filter((collection: string) => collection === id).length === 0)) {
        router.replace("/404")
    }


    if (isLoadingCollection || areCollectionsLoading || isLoadingNFTS) {
        return <div>Loading...</div>
    }

    return <main className='w-full' style={{
        height: `calc(100vh - ${navbarHight}px)`,
    }}>
        <Head>
            <title>Kichō | {collection?.name}</title>

            {/* OG */}
            <meta property="og:title" content={`Kichō | ${collection?.name}`} />
            <meta property="og:description" content={`
                Kichō NFT MarketPlace displaying : ${collection?.name}
            `} />
            <meta property="og:image" content={collection?.nftCount > 0 ? collection?.NFTData.image : `https://www.kichou.xyz/empty-collection.png`} />

            {/* Twitter */}
            <meta name="twitter:title" content={`Kichō | ${collection?.name}`} />
            <meta name="twitter:description" content={`
                Kichō NFT MarketPlace displaying : ${collection?.name}
            `} />

            <meta name="twitter:image" content={collection?.nftCount > 0 ? collection?.NFTData.image : `https://www.kichou.xyz/empty-collection.png`} />

            {/* Telegram */}
            <meta name="telegram:title" content={`Kichō | ${collection?.name}`} />
            <meta name="telegram:description" content={`
                Kichō NFT MarketPlace displaying : ${collection?.name}
            `} />

            <meta name="telegram:image" content={collection?.nftCount > 0 ? collection?.NFTData.image : `https://www.kichou.xyz/empty-collection.png`} />




        </Head>

        <div className='w-full h-fit p-4 bg-slate-400/20 backdrop-blur-sm flex  rounded-b-2xl relative flex-col gap-y-4'>
            <div className='flex items-center justify-center w-full '>

                <img className='w-[10rem] h-[10rem] object-cover rounded-lg border-none self-center' src={collection?.nftCount > 0 ? collection?.NFTData.image : `https://www.kichou.xyz/empty-collection.png`} />
            </div>

            <span className='text-2xl font-bold'>{collection?.name}</span>
            <div className='flex items-center gap-x-4'>
                <div className='flex items-center gap-x-2'>
                    <BsImages className='text-lg' />
                    <span>{collection?.nftCount} NFTs</span>
                </div>

                <div className='flex items-center gap-x-2'>
                    <AiOutlineUser className='text-lg' />
                    <span>Created by: {collection?.owner}</span>
                </div>
            </div>
        </div>

        <div className='w-full p-4 overflow-scroll flex flex-col'>
            <span className='font-bold text-xl mb-4'>NFTs:</span>


            <If condition={collection?.nftCount === 0}>

                <Then>
                    <div className='w-full h-full flex flex-col gap-y-4 items-center justify-center'>

                        <img src='/empty-collection.png' className='w-[25] h-[25rem] object-cover rounded-lg' alt='Empty Collection'/>

                        <span className='text-2xl font-bold'>No NFTs in this collection</span>

                    </div>
                </Then>
                <Else>
                    <div className='grid gap-4 grid-cols-5 grid-rows-5'>
                        {
                            allNfts?.map((nft: any, index: number) => {
                                return <NFT key={index} nft={nft} />
                            })
                        }
                    </div>
                </Else>
            </If>

        </div>


    </main>
}

