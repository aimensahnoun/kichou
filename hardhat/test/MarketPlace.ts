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

    describe("Get collection by creator", () => {
      it("Should be able to return colelction by owner", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        const collectionsByOwner = await marketPlace.getCollectionByUser(
          accounts[0].address
        );

        expect(collections[0]).to.equal(collectionsByOwner[0]);
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

        const NFTsFromOwner = await marketPlace.ownerToNFTs(
          accounts[0].address
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

        const nfts = await marketPlace.ownerToNFTs(accounts[0].address);

        const collectionContract = await ethers.getContractAt(
          "MarketItem",
          collections[0]
        );

        await collectionContract.approve(marketPlace.address, nfts[0][3]);

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
        );

        await collectionContract.approve(marketPlace.address, 1);

        await marketPlace.putNFTForSale(collections[0], 1, 10);

        await collectionContract.setApprovalForAll(marketPlace.address, false);

        await marketPlace.removeNFTFromSale(collections[0], 1);

        const nft = await marketPlace.nfts(collections[0], 1);

        expect(nft.price).to.equal(0);
        expect(nft.isForSale).to.equal(false);
      });
    });

    describe("Make an Offer for an NFT", () => {
      it("Should revert if a user has already made an offer", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace
          .connect(accounts[1])
          .makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          });

        const hasMadeOffer = await marketPlace.hasUserMadeOfferOnNFT(
          accounts[1].address,
          collections[0],
          1
        );

        expect(hasMadeOffer).to.equal(true);
        await expect(
          marketPlace.connect(accounts[1]).makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          })
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__UserAlreadyMadeOffer"
        );
      });
      it("Should revert if a user tries to make an offer on their own NFT", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          })
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__CannotMakeOfferOnOwnNFT"
        );
      });
      it("Should revert if passed value is 0", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.connect(accounts[1]).makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("0"),
          })
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__PriceCannotBeZero"
        );
      });
    });

    describe("Withdraw an offer", () => {
      it("Should revert if a user tries to withdraw on thier own NFT", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.widthdrawOfferForNFT(collections[0], 1)
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__CannotMakeOfferOnOwnNFT"
        );
      });

      it("Should revert if user doesnt have an offer on NFT", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace
            .connect(accounts[1])
            .widthdrawOfferForNFT(collections[0], 1)
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__OfferDoesNotExist"
        );
      });

      it("Should be able to withdraw an offer", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace
          .connect(accounts[1])
          .makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          });

        await marketPlace
          .connect(accounts[1])
          .widthdrawOfferForNFT(collections[0], 1);

        const nftOffers = await marketPlace.getOffersForNFT(collections[0], 1);

        expect(nftOffers[0][0]).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("Accept an offer", () => {
      it("Should revert if non-owner tries to accept offer of an NFT", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace
          .connect(accounts[1])
          .makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          });

        await expect(
          marketPlace
            .connect(accounts[1])
            .acceptOfferForNFT(collections[0], 1, accounts[1].address)
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__OnlyOwnerCanSellNFT"
        );
      });

      it("Should revert if offer does not exist", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.acceptOfferForNFT(collections[0], 1, accounts[1].address)
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__OfferDoesNotExist"
        );
      });

      it("Should be able to accept offer", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace
          .connect(accounts[1])
          .makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          });

        const collectionContract = await ethers.getContractAt(
          "MarketItem",
          collections[0]
        );

        await collectionContract.approve(marketPlace.address, 1);

        await marketPlace.acceptOfferForNFT(
          collections[0],
          1,
          accounts[1].address
        );

        const nft = await marketPlace.nfts(collections[0], 1);

        expect(nft.owner).to.equal(accounts[1].address);
      });
    });

    describe("Reject an Offer", () => {
      it("Should revert if non-owner tries to reject offer of an NFT", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace
          .connect(accounts[1])
          .makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          });

        await expect(
          marketPlace
            .connect(accounts[1])
            .rejectOfferForNFT(collections[0], 1, accounts[1].address)
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__OnlyOwnerCanSellNFT"
        );
      });

      it("Should revert if offer does not exist", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.rejectOfferForNFT(collections[0], 1, accounts[1].address)
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__OfferDoesNotExist"
        );
      });

      it("Should be able to reject offer", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace
          .connect(accounts[1])
          .makeOfferForNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          });

        await marketPlace.rejectOfferForNFT(
          collections[0],
          1,
          accounts[1].address
        );

        const nftOffers = await marketPlace.getOffersForNFT(collections[0], 1);

        expect(nftOffers[0][0]).to.equal(ethers.constants.AddressZero);
      });
    });

    describe("Buy NFT", () => {
      it("Should revert if owner tries to buy NFT", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.buyNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          })
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__CannotBuyOwnNFT"
        );
      });

      it("Should revert if passed value is 0", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.connect(accounts[1]).buyNFT(collections[0], 1, {
            value: ethers.utils.parseEther("0"),
          })
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__FundsAreZero"
        );
      });

      it("Should revert if NFT is not for sale", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await expect(
          marketPlace.connect(accounts[1]).buyNFT(collections[0], 1, {
            value: ethers.utils.parseEther("1"),
          })
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__CannotBuyNFTThatIsNotForSale"
        );
      });

      it("Should revert if passed value is lower then NFT price", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace.putNFTForSale(
          collections[0],
          1,
          ethers.utils.parseEther("1")
        );

        await expect(
          marketPlace.connect(accounts[1]).buyNFT(collections[0], 1, {
            value: ethers.utils.parseEther("0.5"),
          })
        ).to.be.revertedWithCustomError(
          marketPlace,
          "MarketPlace__OfferedFundsAreLowerThenPrice"
        );
      });

      it("Should be able to buy nft", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace.putNFTForSale(
          collections[0],
          1,
          ethers.utils.parseEther("1")
        );

        const collectionContract = await ethers.getContractAt(
          "MarketItem",
          collections[0]
        );

        await collectionContract.approve(marketPlace.address, 1);

        await marketPlace.connect(accounts[1]).buyNFT(collections[0], 1, {
          value: ethers.utils.parseEther("1"),
        });

        const nft = await marketPlace.nfts(collections[0], 1);

        expect(nft.owner).to.equal(accounts[1].address);
      });
    });

    describe("Withraw Marketplace Profits", async () => {
      it("Should revert if non-owner tries to withdraw funds", async () => {
        await expect(
          marketPlace.connect(accounts[1]).withdrawMarketPlaceProfit()
        ).to.be.revertedWith("Ownable: caller is not the owner");
      });

      it("Should be able to withdraw funds", async () => {
        await marketPlace.createMarketItem("Test", "Test");

        const collections = await marketPlace.getCollections();

        await marketPlace.mintNFT(collections[0], accounts[0].address, "URI");

        await marketPlace.putNFTForSale(
          collections[0],
          1,
          ethers.utils.parseEther("1")
        );

        const collectionContract = await ethers.getContractAt(
          "MarketItem",
          collections[0]
        );

        await collectionContract.approve(marketPlace.address, 1);

        await marketPlace.connect(accounts[1]).buyNFT(collections[0], 1, {
          value: ethers.utils.parseEther("1"),
        });

        const balanceBefore = await ethers.provider.getBalance(
          accounts[0].address
        );

        
        await marketPlace.withdrawMarketPlaceProfit();

        const balanceAfter = await ethers.provider.getBalance(
          accounts[0].address
        );

        expect(balanceAfter).to.be.gt(balanceBefore);
      });
    });
  });
});
