// Depenedencies import
import { ethers } from "ethers"
import Image from "next/image"
import Link from "next/link"
import { useEffect, useState } from "react"
import { Else, If, Then } from "react-if"
import { useToken, useContract } from "wagmi"

// Constants import
import * as MarketItem from "../const/contracts/MarketItem.json"
import { useGetCollectionFromAddress } from "../hooks/collection"

const Collection = ({ collectionAddress }: { collectionAddress: string }) => {

    // React Query
    const { data: collection, isLoading, isFetched } = useGetCollectionFromAddress(collectionAddress)

    if (isLoading) {
        return <div className="w-[14rem] h-[14rem] bg-gray-500/25 shadow-lg backdrop-blur rounded-lg backdrop-filter">

            <div className="w-full h-[80%] mb-2 relative bg-gray-500/20 animate-pulse" />

            <div className="bg-gray-500/20 w-full h-[10%] rounded-xl animate-pulse " />

        </div>
    }

    if (isFetched && !collection) {
        return null
    }

    return <Link href={`/collection/${collectionAddress}`}>
        <div className="w-[14rem] h-[14rem] bg-gray-500/25 shadow-lg backdrop-blur rounded-lg backdrop-filter">

            <div className="w-full h-full mb-2 relative">
                <If condition={collection?.nftCount === 0}>
                    <Then >
                        <Image className="object-cover rounded-lg" src="/empty-collection.png" fill alt="Image placehoder" />
                    </Then>
                    <Else>
                        <img src={collection?.NFTData?.image} alt="Collection First NFT" className="w-full h-full rounded-lg" />
                    </Else>
                </If>
            </div>
            <div className="absolute z-10 bottom-0 bg-slate-400/20 p-2 rounded-lg backdrop-blur-sm h-fit w-full ">
                <span>{collection?.name}</span>
            </div>

        </div>
    </Link>
}

export default Collection