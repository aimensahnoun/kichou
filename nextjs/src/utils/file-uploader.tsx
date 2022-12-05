import { Web3Storage } from 'web3.storage'

const client = new Web3Storage({ token: process.env.NEXT_PUBLIC_WEB3STORAGE! })

export function makeFileObjects(NFTMatadata: any) {

    const blob = new Blob([JSON.stringify(NFTMatadata)], { type: 'application/json' })

    const file = new File([blob], 'metadata.json')
    return file
}

export async function uploadFile(file: any) {
    const cid = await client.put([file])

    console.log("Files stored at: ", cid)

    const url = `https://w3s.link/ipfs/${cid}/metadata.json`

    return url
}