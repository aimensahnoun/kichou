import { ethers } from "ethers";
import { useQuery } from "@tanstack/react-query";
import * as MarketItemFactory from "../const/contracts/MarketItemFactory.json";

export const getCollection = async () => {
  try {
    // Load contract from address ethers
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI
    );

    const marketItemFactory = new ethers.Contract(
      "0x38D480F32F2118348817f37d7366bFeAfFD5a14e",
      MarketItemFactory.abi,
      provider
    );

    const collections = await marketItemFactory.getCollections();

    return collections;
  } catch (e) {
    console.error(e);
  }
};

export const useGetNFTCollections = () => {
  return useQuery(["collections"], getCollection);
};
