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

// Methods
export const getCollectionFromAddress = async (
  address: string,
  nftId: number
) => {
  try {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI
    );

    const marketItem = new ethers.Contract(address, MarketItem.abi, provider);

    // Getting collection information
    const nftCount = await marketItem.getNFTCount();

    if (nftCount.toNumber() < nftId) {
      return null;
    }

    const nftURI = await marketItem.tokenURI(nftId);
    const NFTData = await axios.get(nftURI);

    return NFTData.data;
  } catch (e) {
    console.error(e);
  }
};

export const prefetchNFTByID = async (
  queryClient: QueryClient,
  collectionAddress: string,
  NFTId: number
) => {
  await queryClient.prefetchQuery({
    queryKey: ["NFT", collectionAddress, NFTId],
    queryFn: () => getCollectionFromAddress(collectionAddress, NFTId),
  });
};

// Hooks
export const useGetNFTById = (collectionAddress: string, NFTId: number) => {
  return useQuery(["NFT", collectionAddress, NFTId], () =>
    getCollectionFromAddress(collectionAddress, NFTId)
  );
};

export const usePrefetchNFTByID = async (
  collectionAddress: string,
  NFTId: number
) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    (async () => {
      await prefetchNFTByID(queryClient, collectionAddress, NFTId);
    })();
  }, []);
};
