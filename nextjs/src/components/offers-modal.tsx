// Dependencies import
import {
    motion,
} from "framer-motion"

import { IoCloseCircleOutline } from "react-icons/io5"
import { useAcceptOffer, useGetNFTOffers, useRejectOffer } from "../hooks/nft"
import Avatar from "boring-avatars";
import Image from "next/image";
import Link from "next/link";
import { useSigner } from "wagmi";
import { ethers } from "ethers";


const divVariant = {
    out: {
        opacity: 0,
        scale: 0,
        transition: {
            duration: 0.3,
            delay: 0.1
        }
    },
    in: {
        opacity: 1,
        y: 0,
        scale: 1,
        transition: {
            duration: 0.75,
            delay: 0.1
        }
    }
}

const OffersModal = ({
    setIsModalOpen,
    collectionAddress,
    tokenId
}: {
    setIsModalOpen: (arg: boolean) => void,
    collectionAddress: string,
    tokenId: string
}) => {

    // wagmi
    const { data: signer } = useSigner()


    // React Query
    const { data: offers, isLoading } = useGetNFTOffers(collectionAddress, tokenId)
    const { mutateAsync: acceptOffer, isLoading: accptingOffer } = useAcceptOffer()
    const { mutateAsync: rejectOffer, isLoading: rejectingOffer } = useRejectOffer()

    if (isLoading) {
        return <div>Loading...</div>
    }

    const isButtonDisabled = () => {
        return !signer || accptingOffer || rejectingOffer
    }

    return <motion.div className="fixed inset-0 bg-black/50 w-screen h-screen flex items-center justify-center">
        <motion.div
            initial="out"
            animate="in"
            exit="out"
            variants={divVariant}

            className="w-[40rem] min-h-[20rem] rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg  p-4 overflow-y-scroll">
            <div className="w-full flex justify-between items-center mb-4">
                <span className="text-xl font-bold">Offers For This NFT</span>
                <IoCloseCircleOutline onClick={() => {
                    setIsModalOpen(false)
                }} className="text-2xl cursor-pointer" />
            </div>

            <div className="
            w-full h-fit overflow-scroll
            ">
                {
                    offers?.map((offer: {
                        buyer: string,
                        offer: string,
                    }, index: number) => {

                        if (offer.buyer === ethers.constants.AddressZero) {
                            return null
                        }

                        return <div key={index} className="w-full h-fit bg-slate-400/40 rounded-lg mb-4 flex flex-col items-start justify-between p-4">
                            <div className="flex items-center">
                                <Avatar
                                    size={40}
                                    name={offer.buyer}
                                    variant="marble"
                                    colors={["#92A1C6", "#146A7C", "#F0AB3D", "#C271B4", "#C20D90"]}
                                />
                                <Link href={`/${offer.buyer}`}>
                                    <span className="ml-4">{offer.buyer}</span>
                                </Link>
                            </div>

                            <div className="flex items-center w-full justify-between">
                                <div className="flex items-center gap-x-2">

                                    <img src='/avalanche-logo.svg' className='w-5 h-5 object-cover' alt='Avalanche Logo' />
                                    <span className="mr-4">{offer.offer}</span>
                                </div>
                                <div className="flex items-center gap-x-4">
                                    <button disabled={isButtonDisabled()}
                                        onClick={
                                            async () => {

                                                await acceptOffer({
                                                    collectionAddress: collectionAddress,
                                                    tokenId: tokenId,
                                                    buyer: offer.buyer,
                                                    signer: signer!
                                                })

                                                setIsModalOpen(false)
                                            }
                                        }

                                        className="bg-slate-400/40 rounded-lg px-4 py-2">{
                                            accptingOffer ? 'Accepting...' : 'Accept'
                                        }</button>
                                    <button onClick={
                                        async () => {

                                            await rejectOffer({
                                                collectionAddress: collectionAddress,
                                                tokenId: tokenId,
                                                buyer: offer.buyer,
                                                signer: signer!
                                            })
                                        }
                                    } disabled={isButtonDisabled()} className="bg-slate-400/40 rounded-lg px-4 py-2">{
                                            rejectingOffer ? 'Rejecting...' : 'Reject'
                                        }</button>
                                </div>
                            </div>
                        </div>



                    })
                }
            </div>


        </motion.div>

    </motion.div>
}

export default OffersModal