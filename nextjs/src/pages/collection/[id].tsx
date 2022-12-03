// NextJS import
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useGetAllCollectionsNfts, useGetCollectionFromAddress, useGetNFTCollections } from '../../hooks/collection';


export default function Collection() {

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

    return <main>

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

        <span>{JSON.stringify(allNfts)}</span>
    </main>
}

