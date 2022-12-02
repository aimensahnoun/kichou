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

  const contractAddress = "0x25A5E50A9A8fFa2Afe5b3B0e7cDc00876Cf56cfB";
  const contract = new ethers.Contract(
    contractAddress,
    TokenItem.abi,
    walletMumbai
  );

  //Get the signer

  //Create a transaction
  const transaction = await contract.safeMint(
    "0x03671423327Cfab41C21060Ed4Bf7f1a4179BcD5",
    "https://bafybeidmeh7o7ru3z3valfxkounhuvswss657tqld2mzkjw3f6vslpcqmq.ipfs.w3s.link/42"
  );

  //Wait for the transaction to be mined
  await transaction.wait();

  console.log("Minted NFT");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
