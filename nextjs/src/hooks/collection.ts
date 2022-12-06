import { ethers, Signer } from "ethers";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import * as MarketItemFactory from "../const/contracts/MarketItemFactory.json";
import * as MarketItem from "../const/contracts/MarketItem.json";
import axios from "axios";
import { useEffect } from "react";
import { MARKETPLACE_ADDRESS } from "../const/contracts/contractInfo";
import { prefetchNFTByID } from "./nft";

// Methods
export const getAllCollections = async () => {
  try {
    // Load contract from address ethers
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_FUJI
    );

    const marketItemFactory = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MarketItemFactory.abi,
      provider
    );

    const collections = await marketItemFactory.getCollections();

    return collections;
  } catch (e) {
    console.error(e);
  }
};

export const getCollectionFromAddress = async (address: string) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_FUJI
    );

    const marketItem = new ethers.Contract(address, MarketItem.abi, provider);

    const marketPlace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MarketItemFactory.abi,
      provider
    );

    // Getting collection information
    const collectionName = await marketItem.name();
    const collectionSymbol = await marketItem.symbol();
    const nftCount = await marketItem.getNFTCount();
    const owner = await marketPlace.collectionToOwner(address);

    // Getting the first URI of the first NFT in the collection
    const firstNftURI =
      nftCount.toNumber() > 0 ? await marketItem.tokenURI(1) : null;

    const NFTData = firstNftURI ? await axios.get(firstNftURI) : null;

    return {
      name: collectionName,
      symbol: collectionSymbol,
      nftCount: nftCount.toNumber(),
      NFTData: NFTData ? NFTData.data : null,
      owner,
    };
  } catch (e) {
    console.error(e);
  }
};

export const getAllCollectionsNftsCount = async (address: string) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_FUJI
    );

    const marketItem = new ethers.Contract(address, MarketItem.abi, provider);

    const marketPlace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MarketItemFactory.abi,
      provider
    );

    const nftCount = await marketItem.getNFTCount();

    return [...Array(nftCount.toNumber())];
  } catch (e) {
    console.error(e);
  }
};

export const prefetchAllCollectionNFT = async (
  queryClient: QueryClient,
  address: string
) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_FUJI
    );

    const marketItem = new ethers.Contract(address, MarketItem.abi, provider);

    const nftCount = await marketItem.getNFTCount();

    for (let i = 1; i <= nftCount.toNumber(); i++) {
      await prefetchNFTByID(queryClient, address, i);
    }
  } catch (e) {
    console.error(e);
  }
};

export const prefetchCollections = async (queryClient: QueryClient) => {
  await queryClient.prefetchQuery({
    queryKey: ["collections"],
    queryFn: getAllCollections,
  });
};

export const prefetchCollectionsNFTsCount = async (
  queryClient: QueryClient,
  address: string
) => {
  try {
    await queryClient.prefetchQuery({
      queryKey: ["collectionsNFTs", address],
      queryFn: () => getAllCollectionsNftsCount(address),
    });
  } catch (e) {
    console.error(e);
  }
};

export const createCollection = async (
  signer: Signer,
  name: string,
  symbol: string
) => {
  if (!signer) return;

  try {
    const marketItemFactory = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MarketItemFactory.abi,
      signer
    );

    const tx = await marketItemFactory.createMarketItem(name, symbol);

    await tx.wait();

    return tx;
  } catch (e) {
    console.error(e);
  }
};

// Hooks
export const useGetNFTCollections = () => {
  return useQuery(["collections"], getAllCollections);
};

export const useGetCollectionFromAddress = (address: string) => {
  return useQuery(["collection", address], () =>
    getCollectionFromAddress(address)
  );
};

export const useGetAllCollectionsNftsCount = (address: string) => {
  return useQuery(["collectionsNFTs", address], () =>
    getAllCollectionsNftsCount(address)
  );
};

export const usePrefetchCollections = async () => {
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      await prefetchCollections(queryClient);
    })();
  }, []);
};

export const usePrefetchCollectionsNFTs = async (address: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      await prefetchCollectionsNFTsCount(queryClient, address);
    })();
  }, []);
};

export const useCreateCollection = (
  signer: Signer,
  name: string,
  symbol: string
) => {
  const queryClient = useQueryClient();

  return useMutation(() => createCollection(signer, name, symbol), {
    onSuccess: () => {
      queryClient.invalidateQueries(["collections"]);
    },
  });
};

export const usePrefetchAllCollectionNFT = async (address: string) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      await prefetchAllCollectionNFT(queryClient, address);
    })();
  }, []);
};
