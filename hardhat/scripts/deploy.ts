import { ethers } from "hardhat";

async function main() {
  const MarketItemFactory = await ethers.getContractFactory(
    "MarketPlace"
  );

  const marketItemFactory = await MarketItemFactory.deploy();

  await marketItemFactory.deployed();

  console.log("MarketPlace deployed to:", marketItemFactory.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
