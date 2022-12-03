import { ethers } from "hardhat";

import TokenItem from "../artifacts/contracts/MarketItem.sol/MarketItem.json";

async function main() {
  //Connect to the contract on
  const providerMumbai = new ethers.providers.JsonRpcProvider(
    process.env.MUMBAI_RPC_URL as string
  );

  const walletMumbai = new ethers.Wallet(
    process.env.PRIVATE_KEY as string,
    providerMumbai
  );

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
  const contract = new ethers.Contract(
    contractAddress,
    TokenItem.abi,
    walletMumbai
  );

  //Get the signer

  //Create a transaction
  const transaction = await contract.createMarketItem(
    "DevWars",
    "Dev"
  );

  //Wait for the transaction to be mined
  await transaction.wait();

  console.log("Created Collection");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
