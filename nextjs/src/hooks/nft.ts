import { BigNumber, ethers, Signer } from "ethers";
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
import { useSigner } from "wagmi";

// Methods
export const getCollectionFromAddress = async (
  address: string,
  nftId: number
) => {
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
    const nftCount = await marketItem.getNFTCount();

    if (nftCount.toNumber() < nftId) {
      return null;
    }

    const nftURI = await marketItem.tokenURI(nftId);
    const NFTData = await axios.get(nftURI);
    const nftStruct = await marketPlace.nfts(address, nftId);

    const parsedNFTStruct = {
      collectionAddress: nftStruct.collection,
      owner: nftStruct.owner,
      tokenID: nftStruct.tokenId.toString(),
      price: ethers.utils.formatEther(nftStruct.price),
      isForSale: nftStruct.isForSale,
    };

    return {
      ...NFTData.data,
      ...parsedNFTStruct,
    };
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

export const mintNFT = async (
  signer: Signer,
  collectionAddress: string,
  to: string,
  tokenURI: string
) => {
  try {
    if (!signer) return alert("Invalid signer");

    const marketItem = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MarketItemFactory.abi,
      signer
    );

    const mint = await marketItem.mintNFT(collectionAddress, to, tokenURI);

    await mint.wait();

    return mint;
  } catch (e) {
    console.error(e);
  }
};

export const putNFTForSale = async (
  signer: Signer,
  collectionAddress: string,
  tokenId: string,
  price: BigNumber
) => {
  if (!signer) return alert("Invalid signer");

  try {
    const marketPlace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MarketItemFactory.abi,
      signer
    );

    const collectionContract = new ethers.Contract(
      collectionAddress,
      MarketItem.abi,
      signer
    );

    console.log(collectionAddress, tokenId, price);


    const approve = await collectionContract.approve(
      MARKETPLACE_ADDRESS,
      tokenId
    );

    await approve.wait();

    console.log("Approved -----------------")

      console.log(collectionAddress, tokenId, price);

    const putForSale = await marketPlace.putNFTForSale(
      collectionAddress,
      tokenId,
      price
    );

    await putForSale.wait();
  } catch (e) {
    console.error(e);
    alert("Error putting NFT for sale");
  }
};

export const removeNFTFromSale = async (
  singer: Signer,
  collectionAddress: string,
  tokenId: string
) => {
  if (!singer) return alert("Invalid signer");

  try {
    const marketPlace = new ethers.Contract(
      MARKETPLACE_ADDRESS,
      MarketItemFactory.abi,
      singer
    );

    const collectionContract = new ethers.Contract(
      collectionAddress,
      MarketItem.abi,
      singer
    );

    const removeApprovalForAll = await collectionContract.setApprovalForAll(
      MARKETPLACE_ADDRESS,
      false
    );

    await removeApprovalForAll.wait();

    const remove = await marketPlace.removeNFTFromSale(
      collectionAddress,
      tokenId
    );

    await remove.wait();
  } catch (e) {
    console.error(e);
    alert("Error removing NFT from sale");
  }
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

export const useMintNFT = () => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: {
      signer: Signer;
      collectionAddress: string;
      to: string;
      tokenURI: string;
    }) => mintNFT(data.signer, data.collectionAddress, data.to, data.tokenURI),
    {
      onSuccess: (data: {
        signer: Signer;
        collectionAddress: string;
        to: string;
        tokenURI: string;
      }) => {
        queryClient.invalidateQueries([
          "collectionsNFTs",
          data.collectionAddress,
        ]);
      },
    }
  );
};

export const usePutNFTForSale = (
  collectionAddress: string,
  tokenId: string
) => {
  const queryClient = useQueryClient();

  return useMutation(
    (data: { signer: Signer; price: BigNumber }) =>
      putNFTForSale(data.signer, collectionAddress, tokenId, data.price),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["NFT", collectionAddress, tokenId]);
      },
    }
  );
};

export const useRemoveFromSale = (
  signer: Signer,
  collectionAddress: string,
  tokenId: string
) => {
  const queryClient = useQueryClient();

  return useMutation(
    () => removeNFTFromSale(signer, collectionAddress, tokenId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["NFT", collectionAddress, tokenId]);
      },
    }
  );
};
