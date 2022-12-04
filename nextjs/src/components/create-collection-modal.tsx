// React import
import { useState } from "react"

// Depenedencies import
import { motion } from "framer-motion"
import { useSigner } from "wagmi"

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



const CreateCollectionModal = ({
    setIsModalOpen
}: {
    setIsModalOpen: (value: boolean) => void
}) => {

    // Local State
    const [collectionName, setCollectionName] = useState('')
    const [collectionSymbol, setCollectionSymbol] = useState('')

    // Wagmi hooks
    const { data: signer, isLoading: isLoadingSigner } = useSigner()


    // Methods
    const isFormInputValid = () => {
        return collectionName.length > 0 && collectionSymbol.length > 0 && !isLoadingSigner
    }



    return <motion.div className="fixed inset-0 bg-black/50 w-screen h-screen flex items-center justify-center">
        <motion.div
            initial="out"
            animate="in"
            exit="out"
            variants={divVariant}

            className="w-[40rem] min-h-[20rem] rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg  p-4">
            <span className="text-xl font-bold">Create a new NFT collection</span>

            <div className="flex flex-col gap-y-4 mt-4">
                <label htmlFor="collectionName">Collection Name</label>
                <input onChange={(e) => {
                    setCollectionName(e.target.value)
                }} type="text" name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg" />
            </div>

            <div className="flex flex-col gap-y-4 mt-4">
                <label htmlFor="collectionName">Collection Symbol</label>
                <input
                    onChange={(e) => {
                        setCollectionSymbol(e.target.value)
                    }}
                    type="text" name="collectionName" id="collectionName" className="p-2 rounded-lg bg-slate-400/40 backdrop-blur-sm border-[1px] border-white/40 shadow-lg" />
            </div>

            <div className="flex items-center justify-center w-full gap-x-4 mt-4">
                <motion.button
                    onClick={() => {
                        setIsModalOpen(false)
                    }}
                    className="p-2 rounded-lg bg-slate-400/40 "

                >Cancel</motion.button>

                <motion.button
                    disabled={!isFormInputValid()}
                    whileHover={{
                        scale: 1.1,
                        transition: {
                            duration: 0.1
                        }
                    }}
                    whileTap={{
                        scale: 0.9,
                        transition: {
                            duration: 0.1
                        }
                    }}
                    className={`p-2 rounded-lg bg-kichou-red ${!isFormInputValid() ? "bg-slate-400/20 cursor-not-allowed" : ""}`}>Create</motion.button>
            </div>

        </motion.div>

    </motion.div>
}


export default CreateCollectionModal