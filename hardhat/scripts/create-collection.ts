import { ethers } from "hardhat";

import TokenItemFactory from "../artifacts/contracts/MarketItemFactory.sol/MarketItemFactory.json";

async function main() {
  const provider = new ethers.providers.JsonRpcProvider(
    process.env.MUMBAI_RPC_URL as string
  );

  const wallet = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    provider
  );

  const balance = await wallet.getBalance();

  console.log("Wallet balance : ", ethers.utils.formatEther(balance));
  //   Get contract from address
  const contractAddress = "0x38D480F32F2118348817f37d7366bFeAfFD5a14e";

  const contract = new ethers.Contract(
    contractAddress,
    TokenItemFactory.abi,
    wallet
  );

  let collections = await contract.getCollections();

  console.log("Collections: ", collections);

  const transaction = await contract.createMarketItem("DevWars", "Dev");

  await transaction.wait();

  console.log("Created Collection");

  collections = await contract.getCollections();

  console.log("Collections: ", collections);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
