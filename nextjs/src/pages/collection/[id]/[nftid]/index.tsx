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
import { useAccount } from 'wagmi';


export default function Collection() {

    // Global state
    const [navbarHight] = useAtom(navbarHightAtom);

    // Wagmi hooks
    const { address } = useAccount()

    // Router
    const router = useRouter()
    const { id, nftid } = router.query

    //  React Query
    const { data: nftData, isLoading: loadingNFT } = useGetNFTById(id as string, parseInt(nftid! as string))

    if (loadingNFT) return <div>Loading...</div>

    if (!loadingNFT) {

    }


    return <main className='w-full flex p-6 gap-x-[5rem] items-center' style={{
        height: `calc(100vh - ${navbarHight}px)`,
    }}>
        <div className='flex h-[75%] w-[85%] justify-between'>
            <img className='h-full w-[25rem] rounded-lg shadow-lg object-cover' alt="NFT Image" src={nftData?.image} />

            <div className='flex flex-col gap-y-4'>
                <span className='text-2xl font-bold'>{nftData?.name}</span>
                <span>{nftData?.description}</span>
                <div className='flex items-center gap-x-2'>
                    <span className='font-bold'>Edition:</span>
                    <span>{nftData?.edition}</span>
                </div>
                <div className="w-full border-[1px] bg-slate-200/20 backdrop-blur-sm rounded-lg" />

                <label className='font-bold'>Attributes: </label>
                <div className='flex flex-col gap-y-2'>
                    {nftData?.attributes.map((attribute: any) => <div key={attribute} className='flex items-center gap-x-2 flex-wrap'>
                        <span className='p-2 rounded-lg bg-slate-400/40 font-bold'>{attribute.trait_type}</span>
                    </div>)}
                </div>

                <div className='flex items-center gap-x-2'>
                    <AiOutlineUser className='text-xl' />
                    <span className='font-bold'>Owner:</span>
                    <div className='flex items-center gap-x-2'>
                        <span>{nftData?.owner}</span>
                    </div>
                </div>
                <div className='mt-auto flex justify-start items-center justify-center'>
                    <If condition={address == nftData?.owner}>
                        <Then>
                            <button className='p-2 rounded-lg bg-slate-400/40 font-bold'>Put for sale</button>
                        </Then>
                    </If>
                </div>
            </div>


        </div>
    </main>
}

