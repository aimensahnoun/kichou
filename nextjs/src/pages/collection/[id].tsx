// NextJS import
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useMemo } from 'react';

// API
import { getAllCollections, getCollectionFromAddress, useGetCollectionFromAddress } from "../../hooks/collection";

export default function Collection({
    collection
}: {
    collection: any
}) {



    return <main>
        <Head>
            <title>Kichō | {collection.name}</title>
            {/* Meta */}
            <meta property='og:type' content='website' />
            <meta property='og:title' content={`Kichō | ${collection.name}`} />
            <meta property='og:description' content={`Kichō NFT Marketplace displaying : ${collection.name}`} />
            <meta property='og:image' content={collection.nftCount > 0 ? collection.NFTData.image : "https://www.kichou.xyz/empy-collection.png"} />
            <meta property='og:image:width' content='1200' />
            <meta property='og:image:height' content='630' />
            <meta property='og:site_name' content='Kichō' />
            <meta property='og:locale' content='en_US' />

            {/* Twitter Meta */}
            <meta name='twitter:card' content='summary_large_image' />
            <meta name='twitter:creator' content='@aimensahnoun' />
            <meta name='twitter:title' content={`Kichō | ${collection.name}`} />
            <meta name='twitter:description' content={`Kichō NFT Marketplace displaying : ${collection.name}`} />
            <meta name='twitter:image' content={collection.nftCount > 0 ? collection.NFTData.image : "https://www.kichou.xyz/empy-collection.png"} />
            <meta name='twitter:image:width' content='1200' />
            <meta name='twitter:image:height' content='630' />

            {/* Telegram meta */}
            <meta name="telegram:title" content={`Kichō | ${collection.name}`} />
            <meta name="telegram:description" content={`Kichō NFT Marketplace displaying : ${collection.name}`} />
            <meta name="telegram:image" content={collection.nftCount > 0 ? collection.NFTData.image : "https://www.kichou.xyz/empy-collection.png"} />
            <meta name="telegram:image:alt" content={`Kichō | ${collection.name}`} />
            <meta name="telegram:creator" content="@aimensahnoun" />



        </Head>

        <span>{JSON.stringify(collection)}</span>
    </main>
}

export const getStaticProps = async (context: any) => {

    const { id } = context.params
    const collection = await getCollectionFromAddress(id)

    return {
        props: {
            collection,

        },
        revalidate: 1
    }
};

//Generate a basic GetStaticPaths for the page
export async function getStaticPaths() {
    const collections = await getAllCollections()

    console.log("Fetching the data", collections)

    const paths = collections.map((collection: string) => ({
        params: { id: collection },
    }))

    return { paths, fallback: false }
}