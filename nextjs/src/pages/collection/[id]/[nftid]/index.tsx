// NextJS import
import Head from 'next/head';
import { useRouter } from 'next/router';

// Depenedencies import
import { BsImages } from 'react-icons/bs';
import { AiOutlineUser } from 'react-icons/ai';
import { useAtom } from 'jotai';
// Custom components import


// Utils import
import { navbarHightAtom } from "../../../../utils/global-state"

// Hooks import
import { useGetAllCollectionsNfts, useGetCollectionFromAddress, useGetNFTCollections } from '../../../../hooks/collection';
import { Else, If, Then } from 'react-if';
import NFT from '../../../../components/nft';
import { useGetNFTById } from '../../../../hooks/nft';


export default function Collection() {

    // Global state
    const [navbarHight] = useAtom(navbarHightAtom);

    // Router
    const router = useRouter()
    const { id, nftid } = router.query


    console.log(id, nftid)


    //  React Query
    const { data: nftData , isLoading : loadingNFT} = useGetNFTById(id as string, parseInt(nftid! as string))

    if(loadingNFT) return <div>Loading...</div>


    return <main className='w-full' style={{
        height: `calc(100vh - ${navbarHight}px)`,
    }}>


        <div className='w-full h-fit p-4 bg-slate-400/20 backdrop-blur-sm flex  rounded-b-2xl relative flex-col gap-y-4'>
            <span>Hello NFT</span>
            <span>{JSON.stringify(nftData)}</span>
        </div>


    </main>
}

