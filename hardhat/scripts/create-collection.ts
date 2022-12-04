import { ethers } from "hardhat";

import TokenItemFactory from "../artifacts/contracts/MarketPlace.sol/MarketPlace.json";

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
  const contractAddress = "0xC8b41537b6d6926a2a57F574F4EeaD4C84695EC5";

  const contract = new ethers.Contract(
    contractAddress,
    TokenItemFactory.abi,
    wallet
  );

  let collections = await contract.getCollections();

  console.log("Collections: ", collections);

  const transaction = await contract.createMarketItem("Kichou", "NFT");

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
