// Depenedencies import
import { ethers } from "ethers"
import { useEffect, useState } from "react"
import { useToken, useContract } from "wagmi"

// Constants import
import * as MarketItem from "../const/contracts/MarketItem.json"

const Collection = ({ collectionAddress }: { collectionAddress: string }) => {

    const [name, setName] = useState<string>("")

    useEffect(() => {
        (async () => {
            const provider = new ethers.providers.JsonRpcProvider(process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI);

            const marketItem = new ethers.Contract(
                collectionAddress,
                MarketItem.abi,
                provider
            );

            const name = await marketItem.name();

            console.log(name);
            setName(name);
        })()
    }, [])

    return <div>
        <span>{name}</span>

    </div>
}

export default Collection