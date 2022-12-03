import { ethers } from "ethers";
import { QueryClient, useQuery } from "@tanstack/react-query";
import * as MarketItemFactory from "../const/contracts/MarketItemFactory.json";
import * as MarketItem from "../const/contracts/MarketItem.json";
import axios from "axios";
import { useQueryClient } from "wagmi";

// Methods
export const getAllCollections = async () => {
  try {
    // Load contract from address ethers
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI
    );

    const marketItemFactory = new ethers.Contract(
      "0xC8b41537b6d6926a2a57F574F4EeaD4C84695EC5",
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
      process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI
    );

    const marketItem = new ethers.Contract(address, MarketItem.abi, provider);

    // Getting collection information
    const collectionName = await marketItem.name();
    const collectionSymbol = await marketItem.symbol();
    const nftCount = await marketItem.getNFTCount();

    // Getting the first URI of the first NFT in the collection
    const firstNftURI =
      nftCount.toNumber() > 0 ? await marketItem.tokenURI(0) : null;

    const NFTData = firstNftURI ? await axios.get(firstNftURI) : null;

    return {
      name: collectionName,
      symbol: collectionSymbol,
      nftCount: nftCount.toNumber(),
      NFTData: NFTData ? NFTData.data : null,
    };
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

// Hooks
export const useGetNFTCollections = () => {
  return useQuery(["collections"], getAllCollections);
};

export const useGetCollectionFromAddress = (address: string) => {
  return useQuery(["collection", address], () =>
    getCollectionFromAddress(address)
  );
};
