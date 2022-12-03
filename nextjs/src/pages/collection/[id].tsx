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
    const {data : allNfts ,isLoading : isLoadingNFTS } = useGetAllCollectionsNfts(id as string)

    // If the collection is not found, redirect to the 404 page
    if (areCollectionsFetched && (allCollections.length === 0 || allCollections.filter((collection: string) => collection === id).length === 0)) {
        router.replace("/404")
    }


    if (isLoadingCollection || areCollectionsLoading || isLoadingNFTS) {
        return <div>Loading...</div>
    }

    return <main>


        <span>{JSON.stringify(allNfts)}</span>
    </main>
}

