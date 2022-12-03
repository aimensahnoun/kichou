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

  const contractAddress = "0x4Fb4A6C2777f4C31c553E56D2afb171D3BEE2558";
  const contract = new ethers.Contract(
    contractAddress,
    TokenItem.abi,
    walletMumbai
  );

  //Create a transaction
  const transaction = await contract.safeMint(
    "0x93da76CFc683E1536C91d37abcfE17a60c29B578",
    "https://bafkreicjwewjpakyrnwezliomau4gfivbkycqbkem2exi6jxz2iprnzfcu.ipfs.w3s.link/?filename=1"
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
