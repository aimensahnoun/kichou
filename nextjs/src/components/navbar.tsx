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

const NavBar = () => {

    // Global state
    const [_navbarHight, setNavbarHight] = useAtom(navbarHightAtom)

    // Ref
    const navbarRef = useRef<HTMLDivElement>(null)

    // UseEffects
    useEffect(() => {
        const height = navbarRef.current?.clientHeight;
        if (height) setNavbarHight(height)
    }, [navbarRef.current])

    return <nav ref={navbarRef} className='flex w-full items-center justify-between  p-4 border-b-[1px] border-b-kichou-gray'>
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
            <Link href="/marketplace">
                Marketplace
            </Link>
        </div>

        <ConnectButton label='Get Started' />
    </nav>
}

export default NavBar