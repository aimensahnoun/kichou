// Depenedencies import
import { useQueryClient } from "@tanstack/react-query"
import { ethers } from "ethers"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Else, If, Then } from "react-if"


// Constants import
import { prefetchCollectionsNFTs, useGetCollectionFromAddress } from "../hooks/collection"

const NFT = ({ nft }: { nft: any }) => {



    return <Link href={`/collection`}>
        <div className="w-[14rem] h-[14rem] bg-gray-500/25 shadow-lg backdrop-blur rounded-lg backdrop-filter">

            <div className="w-full h-full mb-2 relative">
                <img src={nft?.image} alt="Collection First NFT" className="w-full h-full rounded-lg" />
            </div>
            <div className="absolute z-10 bottom-0 bg-slate-400/20 p-2 rounded-lg backdrop-blur-sm h-fit w-full ">
                <span>{nft?.name}</span>
            </div>

        </div>
    </Link>
}

export default NFT