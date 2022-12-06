"use client"
// NextJS import
import Image from "next/image"

// React import
import { useEffect, useRef } from "react"


// Dependencies import
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAtom } from "jotai"

// Utils import
import { navbarHightAtom } from "../utils/global-state"
import Link from "next/link"
import { useAccount } from "wagmi"

const NavBar = () => {

    // Global state
    const [_navbarHight, setNavbarHight] = useAtom(navbarHightAtom)

    // Ref
    const navbarRef = useRef<HTMLDivElement>(null)

    // Wagmi 
    const { isConnected , address } = useAccount()

    // UseEffects
    useEffect(() => {
        const height = navbarRef.current?.clientHeight;
        if (height) setNavbarHight(height)
    }, [navbarRef.current])



    // Constants
    const tabs = [
        {
            name: "Marketplace",
            href: "/marketplace",
        },
        {
            name: "My NFTs",
            href: `/${address}`,
        },
        // {
        //     name: "Offers",
        //     href: "/offers",
        // },
    ]

    return <nav ref={navbarRef} className='flex w-full items-center justify-between  p-4 border-b-[1px] border-b-kichou-gray'>

        <div className="flex gap-x-7 items-center">
            <Link href="/">
                <div className='flex items-center gap-x-4'>
                    <Image src="/logo.svg" alt='Kichō Logo' width={70} height={70} />
                    <div className='flex flex-col'>
                        <span className='font-bold text-3xl'>Kichō</span>
                        <span className='text-kichou-gray font-bold text-xl'>貴重</span>
                    </div>

                </div>
            </Link>
            <div className="flex items-center gap-x-4">
                {
                    tabs.map((tab) => {
                        return <Link key={tab.href} href={tab.href}
                            className={"text-kichou-gray duration-200 hover:text-white text-shadow"} >
                            {tab.name}
                        </Link>
                    })
                }
            </div>
        </div>
        <ConnectButton label='Get Started' />
    </nav>
}

export default NavBar