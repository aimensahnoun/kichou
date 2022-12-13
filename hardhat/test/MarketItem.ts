import { Description } from "@ethersproject/properties";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import hre, { artifacts, ethers, network } from "hardhat";

import { MarketPlace, MarketItem } from "../typechain";

describe("MarketItem", function () {
  let marketItem: MarketItem;
  let accounts: SignerWithAddress[] = [];
  hre.run("compile");

  beforeEach(async function () {
    accounts = await ethers.getSigners();

    const MarketItemFactory = await ethers.getContractFactory("MarketItem");
    marketItem = await MarketItemFactory.deploy(
      "Test Collection",
      "Test Collection"
    );
    await marketItem.deployed();
  });

  describe("Deployment", () => {
    it("Should set the right owner", async () => {
      expect(await marketItem.owner()).to.equal(accounts[0].address);
    });

    it("Should set the right name", async () => {
      expect(await marketItem.name()).to.equal("Test Collection");
    });
  });

  describe("Minting", () => {
    it("Should revert if a non owner tries to mint an NFT", async () => {
      await expect(
        marketItem.connect(accounts[1]).safeMint(accounts[1].address, "URI")
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("Should be able to mint an NFT", async () => {
      await marketItem.safeMint(accounts[1].address, "URI");
      const nftCount = await marketItem.getNFTCount();

      expect(nftCount).to.equal(1);
    });
  });

  describe("Burning", () => {
    it("Should revert if a non owner tries to burn an NFT", async () => {
      await marketItem.safeMint(accounts[0].address, "URI");
      await expect(marketItem.connect(accounts[1]).burn(1)).to.be.revertedWith(
        "ERC721: caller is not token owner or approved"
      );
    });

    it("Should be able to burn an NFT", async () => {
      await marketItem.safeMint(accounts[1].address, "URI");
      await marketItem.connect(accounts[1]).burn(1);
    });
  });

  describe("Getting an NFT URI", () => {
    it("Should be able to get an NFT uri", async () => {
      await marketItem.safeMint(accounts[1].address, "URI");
      const uri = await marketItem.tokenURI(1);

      expect(uri).to.equal("URI");
    });
  });
});
