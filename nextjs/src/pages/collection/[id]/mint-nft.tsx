// Next import
import { useRouter } from 'next/router'

// Dependency imports
import { useAtom } from 'jotai'
import validator from "validator"

// Utills import
import {
    navbarHightAtom
} from "../../../utils/global-state"

// Hooks import
import { useGetNFTCollections } from "../../../hooks/collection"
import { useState } from 'react'
import { makeFileObjects, uploadFile } from '../../../utils/file-uploader'
import { useMintNFT } from '../../../hooks/nft'
import { useSigner } from 'wagmi'

export default function MintNFT() {

    // Local state
    const [nftName, setNFTName] = useState('')
    const [nftDescription, setNFTDescription] = useState('')
    const [nftImageURl, setNFTImageURl] = useState('')
    const [nftEdition, setNFTEdition] = useState(0)
    const [nftArtist, setNFTArtist] = useState('')
    const [nftAttributes, setNFTAttributes] = useState('')
    const [receiverAddress, setReceiverAddress] = useState('')
    const [nftUri, setNFTUri] = useState('')
    const [isMintingNFT, setIsMintingNFT] = useState(false)

    // Global state
    const [navbarHight] = useAtom(navbarHightAtom)

    // Router
    const router = useRouter()
    const { id } = router.query

    console.log(id)

    // Wagmi hooks
    const { data: signer, isLoading: loadingSigner, isError: failedLoadingSİnger } = useSigner()

    // React Query
    const { data: allCollections, isLoading: areCollectionsLoading, isFetched: areCollectionsFetched } = useGetNFTCollections()

    const { mutateAsync: mintNFT, isSuccess: mintedSuccessfully, isError: unableToMint } = useMintNFT()


    if (id && !areCollectionsLoading && areCollectionsFetched && (allCollections.length === 0 || allCollections.filter((collection: string) => collection === id).length === 0)) {
        router.replace("/404")
    }

    if (areCollectionsLoading) {
        return <div>Loading...</div>
    }

    // Methods
    const isFormInputValid = () => {
        return nftName.length > 0 && nftDescription.length > 0 && nftImageURl.length > 0 && nftEdition > 0 && nftArtist.length > 0 && nftAttributes.length > 0 && validator.isURL(nftImageURl) && validator.isEthereumAddress(receiverAddress) && !areCollectionsLoading && !loadingSigner && !failedLoadingSİnger
    }

    const uploadDataAndMintNFT = async () => {
        if (!isFormInputValid() || isMintingNFT) return
        try {
            setIsMintingNFT(true)
            const NFTMatadata = {
                name: nftName,
                description: nftDescription,
                image: nftImageURl,
                edition: nftEdition,
                artist: nftArtist,
                attributes: nftAttributes.split(',').map((attribute: string) => {
                    return {
                        "trait_type": attribute,
                        "value": "INSERT"
                    }
                })
            }

            const file = makeFileObjects(NFTMatadata)

            const url = await uploadFile(file)

            setNFTUri(url)

            console.log(`Matadata stored at: ${url}`)

            await mintNFT(
                {
                    signer: signer!,
                    collectionAddress: id as string,
                    to: receiverAddress,
                    tokenURI: url
                }
            )

            router.replace(`/collection/${id}`)

            setIsMintingNFT(false)

        } catch (error) {
            setIsMintingNFT(false)
            console.log(error)
        }
    }

    return <main className='w-full p-4 flex flex-col overflow-scroll' style={{
        height: `calc(100vh - ${navbarHight}px)`
    }}>
        <span className='text-2xl font-bold mb-4'>Mint NFT</span>

        <section className='flex w-full min-h-fit gap-x-4'>
            {/* Form */}
            <aside className='w-full lg:w-[50%] p-4  border-[1px] rounded-lg border-white/40'>

                {/* NFT Name */}
                <div className='flex flex-col gap-y-4'>
                    <label htmlFor="collectionName">NFT Name</label>
                    <input
                        onChange={(e) => {
                            setNFTName(e.target.value)
                        }}
                        type="text" name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg outline-none" />
                </div>

                {/* NFT Description */}
                <div className='flex flex-col gap-y-4 mt-4'>
                    <label htmlFor="collectionName">NFT Description</label>
                    <textarea
                        onChange={(e) => {
                            setNFTDescription(e.target.value)
                        }}
                        name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg resize-none outline-none" />
                </div>

                {/* NFT Image */}
                <div className='flex flex-col gap-y-4 mt-4'>
                    <label htmlFor="collectionName">NFT Image URL</label>
                    <input
                        onChange={(e) => {
                            setNFTImageURl(e.target.value)
                        }}
                        type="text" name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg outline-none" />
                    {
                        nftImageURl.length > 0 && !validator.isURL(nftImageURl) &&
                        <span className='text-sm text-red-500'>Invalid URL</span>
                    }
                </div>

                {/* NFT Edition */}
                <div className='flex flex-col gap-y-4 mt-4'>
                    <label htmlFor="collectionName">NFT Edition</label>
                    <input
                        onChange={(e) => {
                            if (parseInt(e.target.value) < 0) {
                                e.target.value = '0'
                            }
                            setNFTEdition(parseInt(e.target.value))
                        }}
                        type="number" name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg outline-none" />
                </div>

                {/* NFT Artist */}
                <div className='flex flex-col gap-y-4 mt-4'>
                    <label htmlFor="collectionName">NFT Artist</label>
                    <input
                        onChange={(e) => {
                            setNFTArtist(e.target.value)
                        }}
                        type="text" name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg outline-none" />
                </div>

                {/* NFT Attributes , a input form that takes tags and makes them into chips when space is added */}
                <div className='flex flex-col gap-y-4 mt-4'>
                    <label htmlFor="collectionName">NFT Attributes</label>
                    <input
                        onChange={(e) => {
                            setNFTAttributes(e.target.value)
                        }}
                        type="text" name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg outline-none" />
                    <span className='text-sm'>Seperate with a comma (,)</span>
                </div>

                {/* Reciver Address */}
                <div className='flex flex-col gap-y-4 mt-4'>
                    <label htmlFor="collectionName">Receiver Address</label>
                    <input
                        onChange={(e) => {
                            setReceiverAddress(e.target.value)
                        }}
                        type="text" name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg outline-none" />
                    {
                        receiverAddress.length > 0 && !validator.isEthereumAddress(receiverAddress) &&
                        <span className='text-sm text-red-500'>Invalid Ethereum Address</span>
                    }
                </div>

                {/* Submit Button */}

                <button
                    onClick={uploadDataAndMintNFT}
                    disabled={!isFormInputValid()}
                    className={`w-full p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg outline-none mt-4 ${!isFormInputValid() ? 'cursor-not-allowed opacity-40' : ''
                        }`}>{isMintingNFT ? "Loading.." : " Mint NFT"}</button>
            </aside>

            {/* Preview */}

            <aside className='hidden lg:w-[50%] border-[1px] rounded-lg border-white/40 relative'>
                {nftImageURl.length > 0 && <img src={nftImageURl} className="w-full     h-full object-cover rounded-lg" alt="NFT-Image" />}
                <div className='absolute p-4 z-10 bottom-0 left-0 bg-slate-400/20 rounded-lg backdrop-blur-sm h-fit w-full'>
                    <span className='text-xl font-bold'>{nftName}</span>
                </div>

            </aside>
        </section>
    </main>
}