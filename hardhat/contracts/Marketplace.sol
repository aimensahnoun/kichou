// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./MarketItem.sol";

error MarketPlace__CollectionDoesNotExist(address collection);
error MarketPlace__OnlyCollectionOwnerCanMint(address collection);
error MarketPlace__CannotMintToZeroAddress(address to);
error MarketPlace__OnlyOwnerCanSellNFT();
error MarketPlace__PriceCannotBeZero();
error MarketPlace__PuttingNFTOnSaleFailed();
error MarketPlace__RemovingNFTFromSaleFailed();
error MarketPlace__CannotMakeOfferOnOwnNFT();
error MarketPlace__OfferDoesNotExist();
error MarketPlace__CannotBuyOwnNFT();
error MarketPlace__OfferedFundsAreLowerThenPrice();
error MarketPlace__FundsAreZero();
error MarketPlace__CannotBuyNFTThatIsNotForSale();
error MarketPlace__CollectionNameCannotBeEmpty();
error MarketPlace__CollectionSymbolCannotBeEmpty();
error MarketPlace__NFTNotForSale();

contract MarketPlace is Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _collectionCounter;
    Counters.Counter private _totalNFTCounter;

    event MarketItemCreated(address indexed itemAddress, address indexed owner);

    uint256 public marketPlacePercentage = 10;
    uint256 private marketPlaceProfit = 0;

    struct Offers {
        address buyer;
        uint256 price;
    }

    struct NFT {
        address collection;
        address owner;
        uint256 tokenId;
        uint256 price;
        bool isForSale;
    }

    mapping(address => address) public collectionToOwner;
    mapping(address => address[]) public ownerToCollections;
    mapping(address => address[]) public userToOwnedCollections;
    mapping(address => mapping(address => bool))
        public doesUserOwnNFTInCollection;
    mapping(address => NFT[]) private _ownerToNFTs;
    mapping(address => mapping(uint256 => NFT)) public nfts;
    mapping(address => mapping(uint256 => Offers[])) public nftToOffers;

    // A way to track if a user has made an offer on a specific NFT
    mapping(address => mapping(string => bool)) private _hasUserMadeOfferOnNFT;
    mapping(address => mapping(string => uint256)) private userNFTOFferIndex;

    address[] public collections;

    // Collection Methods
    function createMarketItem(
        string memory _name,
        string memory _symbol
    ) external {
        if (keccak256(bytes(_name)) == keccak256(bytes(""))) {
            revert MarketPlace__CollectionNameCannotBeEmpty();
        }

        if (keccak256(bytes(_symbol)) == keccak256(bytes(""))) {
            revert MarketPlace__CollectionSymbolCannotBeEmpty();
        }

        MarketItem marketItem = new MarketItem(_name, _symbol);
        collections.push(address(marketItem));
        collectionToOwner[address(marketItem)] = msg.sender;
        ownerToCollections[msg.sender].push(address(marketItem));
        _collectionCounter.increment();
        emit MarketItemCreated(address(marketItem), msg.sender);
    }

    function getCollections() external view returns (address[] memory) {
        return collections;
    }

    function getCollectionsForOwner(
        address _owner
    ) external view returns (address[] memory) {
        return ownerToCollections[_owner];
    }

    function getOwnerOfCollection(
        address _collection
    ) external view returns (address) {
        return collectionToOwner[_collection];
    }

    function collectionCount() external view returns (uint256) {
        return _collectionCounter.current();
    }

    // NFT Methods
    function mintNFT(
        address _collection,
        address _to,
        string memory _tokenURI
    ) external {
        address collectionOwner = collectionToOwner[_collection];

        // Check if the collection exists
        if (collectionOwner == address(0)) {
            revert MarketPlace__CollectionDoesNotExist(_collection);
        }

        // Check if the caller is the owner of the collection
        if (collectionOwner != msg.sender) {
            revert MarketPlace__OnlyCollectionOwnerCanMint(_collection);
        }

        // Check if the recipient is not the zero address
        if (_to == address(0)) {
            revert MarketPlace__CannotMintToZeroAddress(_to);
        }

        MarketItem marketItem = MarketItem(_collection);
        uint256 tokenId = marketItem.safeMint(_to, _tokenURI);

        nfts[_collection][tokenId] = NFT({
            collection: _collection,
            owner: _to,
            tokenId: tokenId,
            price: 0,
            isForSale: false
        });

        bool doesUserOwnNFT = doesUserOwnNFTInCollection[_to][_collection];

        if (!doesUserOwnNFT) {
            userToOwnedCollections[_to].push(_collection);
            doesUserOwnNFTInCollection[_to][_collection] = true;
        }

        _ownerToNFTs[_to].push(
            NFT({
                collection: _collection,
                owner: _to,
                tokenId: tokenId,
                price: 0,
                isForSale: false
            })
        );
        _totalNFTCounter.increment();
    }

    function getCollectionByUser(
        address _owner
    ) external view returns (address[] memory) {
        return (userToOwnedCollections[_owner]);
    }

    function totalNFTCount() external view returns (uint256) {
        return _totalNFTCounter.current();
    }

    // NFT Owner Methods
    function putNFTForSale(
        address _collection,
        uint256 _tokenId,
        uint256 _price
    ) external {
        MarketItem marketItem = MarketItem(_collection);

        if (marketItem.ownerOf(_tokenId) != msg.sender) {
            revert MarketPlace__OnlyOwnerCanSellNFT();
        }

        if (_price == 0) {
            revert MarketPlace__PriceCannotBeZero();
        }

        nfts[_collection][_tokenId].price = _price;
        nfts[_collection][_tokenId].isForSale = true;
    }

    function removeNFTFromSale(address _collection, uint256 _tokenId) external {
        MarketItem marketItem = MarketItem(_collection);

        NFT memory nft = nfts[_collection][_tokenId];

        if (marketItem.ownerOf(_tokenId) != msg.sender) {
            revert MarketPlace__OnlyOwnerCanSellNFT();
        }

        if (!nft.isForSale) {
            revert MarketPlace__NFTNotForSale();
        }

        nfts[_collection][_tokenId].price = 0;
        nfts[_collection][_tokenId].isForSale = false;
    }

    // NFT Buyer Methods
    function makeOfferForNFT(
        address _collection,
        uint256 _tokenId
    ) external payable {
        MarketItem marketItem = MarketItem(_collection);

        if (marketItem.ownerOf(_tokenId) == msg.sender) {
            revert MarketPlace__CannotMakeOfferOnOwnNFT();
        }

        if (msg.value == 0) {
            revert MarketPlace__PriceCannotBeZero();
        }

        nftToOffers[_collection][_tokenId].push(
            Offers({buyer: msg.sender, price: msg.value})
        );

        _hasUserMadeOfferOnNFT[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ] = true;

        userNFTOFferIndex[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ] = nftToOffers[_collection][_tokenId].length - 1;
    }

    function widthdrawOfferForNFT(
        address _collection,
        uint256 _tokenId
    ) external {
        MarketItem marketItem = MarketItem(_collection);

        if (marketItem.ownerOf(_tokenId) == msg.sender) {
            revert MarketPlace__CannotMakeOfferOnOwnNFT();
        }

        if (
            !_hasUserMadeOfferOnNFT[msg.sender][
                string(abi.encodePacked(_collection, _tokenId))
            ]
        ) {
            revert MarketPlace__OfferDoesNotExist();
        }

        uint256 offerIndex = userNFTOFferIndex[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ];

        Offers memory offer = nftToOffers[_collection][_tokenId][offerIndex];
        uint256 offersLength = nftToOffers[_collection][_tokenId].length;

        if (offer.buyer != msg.sender) {
            revert MarketPlace__OfferDoesNotExist();
        }

        nftToOffers[_collection][_tokenId][offerIndex] = nftToOffers[
            _collection
        ][_tokenId][offersLength - 1];

        delete nftToOffers[_collection][_tokenId][offersLength - 1];

        _hasUserMadeOfferOnNFT[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ] = false;

        payable(msg.sender).transfer(offer.price);
    }

    function acceptOfferForNFT(
        address _collection,
        uint256 _tokenId,
        address _buyer
    ) external {
        MarketItem marketItem = MarketItem(_collection);

        if (marketItem.ownerOf(_tokenId) != msg.sender) {
            revert MarketPlace__OnlyOwnerCanSellNFT();
        }

        if (
            !_hasUserMadeOfferOnNFT[_buyer][
                string(abi.encodePacked(_collection, _tokenId))
            ]
        ) {
            revert MarketPlace__OfferDoesNotExist();
        }

        uint256 offerIndex = userNFTOFferIndex[_buyer][
            string(abi.encodePacked(_collection, _tokenId))
        ];

        Offers memory offer = nftToOffers[_collection][_tokenId][offerIndex];
        uint256 offersLength = nftToOffers[_collection][_tokenId].length;

        if (offer.buyer != _buyer) {
            revert MarketPlace__OfferDoesNotExist();
        }

        marketItem.safeTransferFrom(msg.sender, _buyer, _tokenId);

        nfts[_collection][_tokenId].owner = _buyer;

        nftToOffers[_collection][_tokenId][offerIndex] = nftToOffers[
            _collection
        ][_tokenId][offersLength - 1];

        delete nftToOffers[_collection][_tokenId][offersLength - 1];

        _hasUserMadeOfferOnNFT[_buyer][
            string(abi.encodePacked(_collection, _tokenId))
        ] = false;

        uint256 marketPlaceFee = offer.price * (marketPlacePercentage / 100);

        marketPlaceProfit += marketPlaceFee;

        payable(msg.sender).transfer(offer.price - marketPlaceFee);
    }

    function rejectOfferForNFT(
        address _collection,
        uint256 _tokenId,
        address _buyer
    ) external {
        MarketItem marketItem = MarketItem(_collection);

        if (marketItem.ownerOf(_tokenId) != msg.sender) {
            revert MarketPlace__OnlyOwnerCanSellNFT();
        }

        if (
            !_hasUserMadeOfferOnNFT[_buyer][
                string(abi.encodePacked(_collection, _tokenId))
            ]
        ) {
            revert MarketPlace__OfferDoesNotExist();
        }

        uint256 offerIndex = userNFTOFferIndex[_buyer][
            string(abi.encodePacked(_collection, _tokenId))
        ];

        Offers memory offer = nftToOffers[_collection][_tokenId][offerIndex];
        uint256 offersLength = nftToOffers[_collection][_tokenId].length;

        if (offer.buyer != _buyer) {
            revert MarketPlace__OfferDoesNotExist();
        }

        nftToOffers[_collection][_tokenId][offerIndex] = nftToOffers[
            _collection
        ][_tokenId][offersLength - 1];

        delete nftToOffers[_collection][_tokenId][offersLength - 1];

        _hasUserMadeOfferOnNFT[_buyer][
            string(abi.encodePacked(_collection, _tokenId))
        ] = false;

        payable(_buyer).transfer(offer.price);
    }

    function buyNFT(address _collection, uint256 _tokenId) external payable {
        MarketItem marketItem = MarketItem(_collection);

        if (marketItem.ownerOf(_tokenId) == msg.sender) {
            revert MarketPlace__CannotBuyOwnNFT();
        }

        if (msg.value == 0) {
            revert MarketPlace__FundsAreZero();
        }

        NFT memory nft = nfts[_collection][_tokenId];

        if (!nft.isForSale) {
            revert MarketPlace__CannotBuyNFTThatIsNotForSale();
        }

        if (msg.value < nft.price) {
            revert MarketPlace__OfferedFundsAreLowerThenPrice();
        }

        address oldOwner = marketItem.ownerOf(_tokenId);

        marketItem.safeTransferFrom(oldOwner, msg.sender, _tokenId);

        nfts[_collection][_tokenId].owner = msg.sender;
        nfts[_collection][_tokenId].price = msg.value;
        nfts[_collection][_tokenId].isForSale = false;

        uint256 marketPlaceFee = msg.value * (marketPlacePercentage / 100);

        marketPlaceProfit += marketPlaceFee;

        payable(oldOwner).transfer(msg.value - marketPlaceFee);
    }

    function hasUserMadeOfferOnNFT(
        address _user,
        address _collection,
        uint256 _tokenId
    ) external view returns (bool) {
        return
            _hasUserMadeOfferOnNFT[_user][
                string(abi.encodePacked(_collection, _tokenId))
            ];
    }

    function ownerToNFTs(address _owner) external view returns (NFT[] memory) {
        return _ownerToNFTs[_owner];
    }

    // MarketPlace Owner Methods
    function withdrawMarketPlaceProfit() external onlyOwner {
        payable(msg.sender).transfer(marketPlaceProfit);
    }
}
