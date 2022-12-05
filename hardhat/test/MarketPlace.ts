import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { Contract } from "ethers";
import hre, { artifacts, ethers, network } from "hardhat";

import { MarketPlace, MarketItem } from "../typechain";

describe("Testing MarketPlace", function () {
  let marketPlace: MarketPlace;
  let marketItem: MarketItem;
  let accounts: SignerWithAddress[] = [];
  hre.run("compile");

  beforeEach(async function () {
    accounts = await ethers.getSigners();
    const MarketPlaceFactory = await ethers.getContractFactory("MarketPlace");
    marketPlace = await MarketPlaceFactory.deploy();
    await marketPlace.deployed();
    const MarketItemFactory = await ethers.getContractFactory("MarketItem");
    marketItem = await MarketItemFactory.deploy(
      "Test Collection",
      "Test Collection"
    );
    await marketItem.deployed();
  });

  describe("Collection functionality", () => {
    describe("Create a new Collection Tests", () => {
      it("Should revert if colelction name is empty", async () => {
        await expect(
          marketPlace.createMarketItem("", "")
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__CollectionNameCannotBeEmpty"
        );
      });

      it("Should revert if colelction symbol is empty", async () => {
        await expect(
          marketPlace.createMarketItem("Test", "")
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__CollectionSymbolCannotBeEmpty"
        );
      });

      it("Should be able to create a collection", async () => {
        await marketPlace.createMarketItem("Test", "Test");
        const collectionCount = await marketPlace.collectionCount();
        expect(collectionCount).to.equal(1);
      });
    });

    describe("Get Collection Tests", () => {
      it("Should be able to get a collection", async () => {
        await marketPlace.createMarketItem("Test", "Test");
        const collections = await marketPlace.getCollections();
        expect(collections.length).to.equal(1);

        const marketItemContract = await ethers.getContractAt(
          "MarketItem",
          collections[0]
        );

        const collectionName = await marketItemContract.name();
        const collectionSymbol = await marketItemContract.symbol();

        expect(collectionName).to.equal("Test");
        expect(collectionSymbol).to.equal("Test");
      });
    });

    describe("Get Collection for owner Tests", () => {
      it("Should be able to get a collection for owner", async () => {
        await marketPlace.createMarketItem("Test", "Test");
        const collections = await marketPlace.getCollectionsForOwner(
          accounts[0].address
        );
        expect(collections.length).to.equal(1);

        const marketItemContract = await ethers.getContractAt(
          "MarketItem",
          collections[0]
        );

        const collectionName = await marketItemContract.name();
        const collectionSymbol = await marketItemContract.symbol();

        expect(collectionName).to.equal("Test");
        expect(collectionSymbol).to.equal("Test");
      });
    });

    describe("Get Collection By Owner functionality", () => {
      it("Should be able to get collection by owner", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        const collectionsFromOwner = await marketPlace.getCollectionsForOwner(
          accounts[0].address
        );

        expect(collectionsFromOwner.length).to.equal(1);
        expect(collectionsFromOwner[0]).to.equal(collections[0]);
      });
    });
    describe("Get owner of collection", () => {
      it("Should be able to get owner of collection", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        const owner = await marketPlace.getOwnerOfCollection(collections[0]);

        expect(owner).to.equal(accounts[0].address);
      });
    });
  });

  describe("NFT functionality", () => {
    describe("Mint NFT tests", () => {
      it("Should revert if collection does not exist", async () => {
        await expect(
          marketPlace.mintNFT(
            accounts[0].address,
            accounts[0].address,
            "asdadwdawdawda"
          )
        ).to.be.revertedWithCustomError(
          marketPlace,
          `MarketPlace__CollectionDoesNotExist`
        );
      });

      it("Should revert if non owner tries to mint NFT", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await expect(
          marketPlace
            .connect(accounts[1])
            .mintNFT(collections[0], accounts[0].address, "URI")
        ).to.be.revertedWithCustomError(
          marketPlace,
          `MarketPlace__OnlyCollectionOwnerCanMint`
        );
      });

      it("Should revert if recpient address is a zero address", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await expect(
          marketPlace.mintNFT(
            collections[0],
            ethers.constants.AddressZero,
            "URI"
          )
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__CannotMintToZeroAddress"
        );
      });

      it("Should be able to mint NFT", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        const NFTcount = await marketPlace.totalNFTCount();

        expect(NFTcount).to.equal(1);
      });
    });

    describe("Get NFTs By Owner functionality", () => {
      it("Should be able to get NFTs by owner", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        const NFTsFromOwner = await marketPlace.getNFTsByUserAndCollection(
          accounts[0].address,
          collections[0]
        );

        expect(NFTsFromOwner.length).to.equal(1);
      });
    });

    describe("Get the amount of NFTs minted by the marketplace", () => {
      it("Should be able to get the amount of NFTs minted by the marketplace", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        const NFTcount = await marketPlace.totalNFTCount();

        expect(NFTcount).to.equal(1);
      });
    });

    describe("Put NFT to sale", () => {
      it("Should revert if not owner", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.connect(accounts[1]).putNFTForSale(collections[0], 1, 1)
        ).to.be.revertedWithCustomError(
          marketPlace,
          `MarketPlace__OnlyOwnerCanSellNFT`
        );
      });

      it("Should revert if price is zero", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.putNFTForSale(collections[0], 1, 0)
        ).to.be.revertedWithCustomError(
          marketPlace,
          `MarketPlace__PriceCannotBeZero`
        );
      });

      it("Should be able to put NFT for Sale", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        const nfts = await marketPlace.getNFTsByUserAndCollection(
          accounts[0].address,
          collections[0]
        );

        const collectionContract = await ethers.getContractAt(
          "MarketItem",
          collections[0]
        );

        await collectionContract.approve(marketPlace.address, nfts[0]);

        await marketPlace.putNFTForSale(collections[0], 1, 10);

        const nft = await marketPlace.nfts(collections[0], 1);

        expect(parseInt(nft.price.toString())).to.equal(10);

        expect(nft.isForSale).to.equal(true);
      });
    });

    describe("Remove NFT from sale", () => {
      it("Should revert if not onwer", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.connect(accounts[1]).removeNFTFromSale(collections[0], 1)
        ).to.be.revertedWithCustomError(
          marketPlace,
          `MarketPlace__OnlyOwnerCanSellNFT`
        );
      });

      it("Should revert if NFT is not for sale", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.removeNFTFromSale(collections[0], 1)
        ).to.be.revertedWithCustomError(
          marketPlace,
          `MarketPlace__NFTNotForSale`
        );
      });

      it("Should be able to remove NFT from sale", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");


        const collectionContract = await ethers.getContractAt(
          "MarketItem",
          collections[0]
        )

        await collectionContract.approve(marketPlace.address, 1);

        await marketPlace.putNFTForSale(collections[0], 1, 10);

        await collectionContract.setApprovalForAll(marketPlace.address, false);
        
        await marketPlace.removeNFTFromSale(collections[0], 1);

        const nft = await marketPlace.nfts(collections[0], 1);

        expect(nft.price).to.equal(0);
        expect(nft.isForSale).to.equal(false);
      });
    });
  });
});
