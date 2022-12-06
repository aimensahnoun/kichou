// NextJS import
import Image from "next/image"
import { useRouter } from "next/router"

// Dependencies import
import { useAtom } from "jotai"
import { Else, If, Then } from "react-if"
import { useAccount } from "wagmi"

// Components import
import NFT from "../../components/nft"

// Utils
import { navbarHightAtom } from "../../utils/global-state"

// Hooks import
import { useGetOwnerNFTs } from "../../hooks/nft"

export default function MyNfts() {

    // Global state
    const [navbarHight] = useAtom(navbarHightAtom)

    // Router
    const router = useRouter()
    const { user } = router.query

    // Wagmi
    const { address } = useAccount()

    // React Query
    const { data: userNFTs, isLoading: loadingNFTs } = useGetOwnerNFTs(user as string)




    if (loadingNFTs) return <div className='flex justify-center items-center h-screen'>
        <div className='flex flex-col items-center gap-y-4'>
            <Image src='/logo.svg' alt='Kichō Logo' width={70} height={70} />
            <span className='text-2xl font-bold'>Kichō</span>
            <span className='text-xl font-bold'>貴重</span>
            <span className='text-xl font-bold'>Loading...</span>
        </div>
    </div>

    return <main className='w-full p-4' style={{
        height: `calc(100vh - ${navbarHight}px)`,
    }}> <If condition={userNFTs?.nftCount === 0}>

            <Then>
                <div className='w-full h-full flex flex-col gap-y-4 items-center justify-center'>

                    <img src='/empty-collection.png' className='w-[25] h-[25rem] object-cover rounded-lg' alt='Empty Collection' />

                    <span className='text-2xl font-bold'>User does not own any NFTs</span>

                </div>
            </Then>
            <Else>
                {
                    user === address ?
                        <span className='text-2xl font-bold mb-4'>My NFTs:</span>

                        : <span className='text-2xl font-bold mb-4'><span className="text-sm">{user}</span> NFTs:</span>
                }
                <div className='grid gap-4 grid-cols-1 grid-rows-1 lg:grid-cols-5 lg:grid-rows-5 mt-4'>
                    {
                        userNFTs?.map((nft: any, index: number) => {
                            return <NFT key={index} collectionId={nft.collectionAddress} nftIndex={nft.tokenID} />
                        })
                    }
                </div>
            </Else>
        </If>
    </main>
}