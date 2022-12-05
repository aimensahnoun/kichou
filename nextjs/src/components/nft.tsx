// Depenedencies import
import { useQueryClient } from "@tanstack/react-query"
import { ethers } from "ethers"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Else, If, Then } from "react-if"


// Constants import
import { prefetchCollectionsNFTs, useGetCollectionFromAddress } from "../hooks/collection"
import { usePrefetchNFTByID } from "../hooks/nft"

const NFT = ({ nft, collectionId, nftIndex }: { nft: any, collectionId: string, nftIndex: number }) => {


    // React Query
    usePrefetchNFTByID(collectionId, nftIndex)

    return <Link href={`/collection/${collectionId}/${nftIndex}`}>
        <div className="w-[90vw] h-[17rem] md:w-[14rem] md:h-[14rem] bg-gray-500/25 shadow-lg backdrop-blur rounded-lg backdrop-filter relative">

            <div className="w-full h-full mb-2 relative">
                <img src={nft?.image} alt="Collection First NFT" className="w-full h-full rounded-lg" />

            </div>
            {
                nft?.isForSale &&
                <div className="absolute z-10 top-0 right-0  bg-slate-400/20 p-2 rounded-lg backdrop-blur-sm h-fit w-fit flex items-center gap-2">
                    <img src="/avalanche-logo.svg" className="w-5 h-5" />
                    <span className="text-xs font-bold">{nft?.price} AVAX</span>
                </div>}

            <div className="absolute z-10 bottom-0 bg-slate-400/20 p-2 rounded-lg backdrop-blur-sm h-fit w-full ">
                <span>{nft?.name}</span>
            </div>

        </div>
    </Link>
}

export default NFT