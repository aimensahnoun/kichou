// NextJS import
import Head from 'next/head';
import { useRouter } from 'next/router';

// Depenedencies import
import { BsImages } from 'react-icons/bs';
import { AiOutlineLoading3Quarters, AiOutlineUser, AiOutlineWallet } from 'react-icons/ai';
import { useAtom } from 'jotai';
import { useAccount, useSigner } from 'wagmi';
import { AnimatePresence, motion } from 'framer-motion';
import { Else, If, Then } from 'react-if';

// Custom components import
import NFT from '../../../../components/nft';


// Utils import
import { navbarHightAtom } from "../../../../utils/global-state"

// Hooks import
import { useGetAllCollectionsNfts, useGetCollectionFromAddress, useGetNFTCollections } from '../../../../hooks/collection';
import { useGetNFTById, usePutNFTForSale, useRemoveFromSale } from '../../../../hooks/nft';
import { useState } from 'react';
import { ethers } from 'ethers';


export default function Collection() {

    // Local state
    const [isPuttingForSale, setIsPuttingForSale] = useState(false);
    const [price, setPrice] = useState<string>("");

    // Global state
    const [navbarHight] = useAtom(navbarHightAtom);

    // Wagmi hooks
    const { address } = useAccount()
    const { data: signer } = useSigner()

    // Router
    const router = useRouter()
    const { id, nftid } = router.query


    //  React Query
    const { data: nftData, isLoading: loadingNFT } = useGetNFTById(id as string, parseInt(nftid! as string))

    const { mutateAsync: putForSale, isLoading: puttingForSale } = usePutNFTForSale(
        id as string,
        nftid as string,

    )

    const { mutateAsync: removeFromSale, isLoading: removingFromSale } = useRemoveFromSale(
        signer!,
        id as string,
        nftid as string,
    )

    if (loadingNFT) return <div>Loading...</div>

    if (!loadingNFT && nftData == null && id !== undefined && nftid !== undefined) {
        router.replace("/404")
    }


    // Methods
    const canPutForSale = () => {
        return nftData?.owner === address && !nftData?.isForSale && !puttingForSale && parseFloat(price) > 0 && id !== undefined && nftid !== undefined
    }


    return <main className='w-full flex p-6 gap-x-[5rem] items-center' style={{
        height: `calc(100vh - ${navbarHight}px)`,
    }}>
        <div className='flex h-[75%] w-full   gap-x-[5rem]'>
            <img className='h-full w-[25rem] rounded-lg shadow-lg object-cover border-[1px] border-white/40' alt="NFT Image" src={nftData?.image} />

            <div className='flex flex-col gap-y-4'>
                <span className='text-2xl font-bold'>{nftData?.name}</span>
                <span>{nftData?.description}</span>
                <div className='flex items-center gap-x-2'>
                    <span className='font-bold'>Edition:</span>
                    <span>{nftData?.edition}</span>
                </div>
                <div className="w-full border-[1px] bg-slate-200/20 backdrop-blur-sm rounded-lg" />

                <label className='font-bold'>Attributes: </label>
                <div className='flex gap-2 gap-y-2 flex-wrap'>
                    {nftData?.attributes.map((attribute: any , index : number) => <div key={index} className='flex items-center gap-x-2'>
                        <span className='p-2 rounded-lg bg-slate-400/40 font-bold'>{attribute.trait_type}</span>
                    </div>)}
                </div>

                <div className='flex items-center gap-x-2'>
                    <AiOutlineWallet className='text-xl' />
                    <span className='font-bold'>Owner:</span>
                    <div className='flex items-center gap-x-2'>
                        <span>{nftData?.owner}</span>
                    </div>
                </div>

                <div className='flex items-center gap-x-2'>
                    <AiOutlineUser className='text-xl' />
                    <span className='font-bold'>Artist:</span>
                    <div className='flex items-center gap-x-2'>
                        <span>{nftData?.artist}</span>
                    </div>
                </div>
                <div className='mt-auto flex-col justify-start items-center'>
                    <If condition={address == nftData?.owner}>
                        <Then >
                            <If condition={!nftData?.isForSale}>

                                <Then>
                                    <div className='w-full flex items-center justify-start'>
                                        <button onClick={() => setIsPuttingForSale(true)} className='p-2 rounded-lg bg-slate-400/40 font-bold'>Put for sale</button>
                                    </div>


                                    <AnimatePresence>
                                        {isPuttingForSale && <motion.div

                                            initial={{ opacity: 0, width: 0 }}
                                            animate={{
                                                opacity: 1, y: 0, width: '100%',
                                                transition: {
                                                    duration: 0.2,
                                                    ease: "easeOut",
                                                }
                                            }}

                                            exit={{
                                                opacity: 0, y: 0, width: 0,
                                                transition: {
                                                    duration: 0.2,
                                                    ease: "easeOut",
                                                }
                                            }}

                                            className='flex items-center mt-4 gap-x-2'>
                                            {/* Price inpurt */}
                                            <input
                                                onChange={(e) => {
                                                    if (parseFloat(e.target.value) < 0) {
                                                        e.target.value = Math.abs(parseFloat(e.target.value)).toString()
                                                    }

                                                    setPrice(e.target.value)
                                                }}
                                                className='p-2 rounded-lg bg-slate-400/40 font-bold' type="number" placeholder='5 Avax' />
                                            <button onClick={() => {
                                                setIsPuttingForSale(false)
                                            }} className='p-2 rounded-lg bg-slate-400/40 font-bold'>X</button>

                                            <button

                                                disabled={!canPutForSale()}
                                                onClick={async () => {
                                                    await putForSale(
                                                        {
                                                            signer: signer!,
                                                            price: ethers.utils.parseEther(price)
                                                        }
                                                    )
                                                    setIsPuttingForSale(false)

                                                }}
                                                className={`p-2 rounded-lg bg-slate-400/40 font-bold  
                                        ${!canPutForSale() && 'bg-slate-400/20 cursor-not-allowed'}`}>{
                                                    puttingForSale ? <AiOutlineLoading3Quarters className='animate-spin' /> : 'Put for sale'
                                                }</button>


                                        </motion.div>}
                                    </AnimatePresence>
                                </Then>
                                <Else>
                                    <div className='w-full flex items-center justify-start'>
                                        <button onClick={async () => {
                                            await removeFromSale()
                                        }} className='p-2 rounded-lg bg-slate-400/40 font-bold'>{
                                                removingFromSale ? <AiOutlineLoading3Quarters className='animate-spin' /> : 'Remove from sale'
                                            }</button>
                                    </div>
                                </Else>
                            </If>

                        </Then>
                    </If>
                </div>
            </div>


        </div>
    </main>
}

