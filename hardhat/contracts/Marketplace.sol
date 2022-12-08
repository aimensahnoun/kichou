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

    uint256 public constant MARKETPLACEPERCENTAGE = 10;
    uint256 public marketPlaceProfit = 0;

    struct Offers {
        address buyer;
        uint256 price;
    }

    struct NFT {
        bool isForSale;
        address collection;
        address owner;
        uint256 tokenId;
        uint256 price;
        uint256 indexInArray;
    }

    mapping(address => address) public collectionToOwner;
    mapping(address => address[]) public ownerToCollections;
    mapping(address => address[]) public userToOwnedCollections;
    mapping(address => mapping(address => bool))
        public doesUserOwnNFTInCollection;
    mapping(address => NFT[]) private _ownerToNFTs;
    mapping(address => mapping(uint256 => NFT)) public nfts;

    mapping(address => mapping(uint256 => Offers[])) private _nftToOffers;
    // A way to track if a user has made an offer on a specific NFT
    mapping(address => mapping(string => bool)) private _hasUserMadeOfferOnNFT;
    mapping(address => mapping(string => uint256)) private userNFTOFferIndex;

    address[] public collections;

    // Collection Methods
    function createMarketItem(
        string calldata _name,
        string calldata _symbol
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
        string calldata _tokenURI
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

        bool doesUserOwnNFT = doesUserOwnNFTInCollection[_to][_collection];

        if (!doesUserOwnNFT) {
            userToOwnedCollections[_to].push(_collection);
            doesUserOwnNFTInCollection[_to][_collection] = true;
        }

        uint256 newNFTIndex = _ownerToNFTs[_to].length;

        NFT memory newNFT = NFT({
            collection: _collection,
            owner: _to,
            tokenId: tokenId,
            price: 0,
            indexInArray: newNFTIndex,
            isForSale: false
        });

        nfts[_collection][tokenId] = newNFT;

        _ownerToNFTs[_to].push(newNFT);

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

        _nftToOffers[_collection][_tokenId].push(
            Offers({buyer: msg.sender, price: msg.value})
        );

        _hasUserMadeOfferOnNFT[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ] = true;

        userNFTOFferIndex[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ] = _nftToOffers[_collection][_tokenId].length - 1;
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

        Offers memory offer = _nftToOffers[_collection][_tokenId][offerIndex];
        uint256 offersLength = _nftToOffers[_collection][_tokenId].length;

        if (offer.buyer != msg.sender) {
            revert MarketPlace__OfferDoesNotExist();
        }

        _nftToOffers[_collection][_tokenId][offerIndex] = _nftToOffers[
            _collection
        ][_tokenId][offersLength - 1];

        delete _nftToOffers[_collection][_tokenId][offersLength - 1];

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

        // Getting offer index from Offers array
        uint256 offerIndex = userNFTOFferIndex[_buyer][
            string(abi.encodePacked(_collection, _tokenId))
        ];

        // Getting offer from Offers array
        Offers memory offer = _nftToOffers[_collection][_tokenId][offerIndex];

        // Getting length of Offers array
        uint256 offersLength = _nftToOffers[_collection][_tokenId].length;

        if (offer.buyer != _buyer) {
            revert MarketPlace__OfferDoesNotExist();
        }

        // Transfering NFT to buyer
        marketItem.safeTransferFrom(msg.sender, _buyer, _tokenId);

        // Removing offer from Offers array
        _nftToOffers[_collection][_tokenId][offerIndex] = _nftToOffers[
            _collection
        ][_tokenId][offersLength - 1];

        delete _nftToOffers[_collection][_tokenId][offersLength - 1];

        // Getting NFT from nfts mapping
        NFT memory nft = nfts[_collection][_tokenId];

        // Removing NFT from previous owner NFT array
        uint256 nftIndex = nft.indexInArray;
        uint256 nftsLength = _ownerToNFTs[msg.sender].length;

        _ownerToNFTs[msg.sender][nftIndex] = _ownerToNFTs[msg.sender][
            nftsLength - 1
        ];
        delete _ownerToNFTs[msg.sender][nftsLength - 1];

        // Getting new index of NFT in array
        uint256 newNFTIndex = _ownerToNFTs[_buyer].length;

        // Updating NFT details
        nft.indexInArray = newNFTIndex;
        nft.price = 0;
        nft.isForSale = false;
        nft.owner = _buyer;

        // Adding NFT to new owner NFT array
        _ownerToNFTs[_buyer].push(nft);

        // Updating nfts mapping
        nfts[_collection][_tokenId] = nft;

        // Updating _hasUserMadeOfferOnNFT mapping
        _hasUserMadeOfferOnNFT[_buyer][
            string(abi.encodePacked(_collection, _tokenId))
        ] = false;

        // Calculating market place fee
        uint256 marketPlaceFee = offer.price / MARKETPLACEPERCENTAGE;
        marketPlaceProfit += marketPlaceFee;

        // Transfering NFT price to seller
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

        Offers memory offer = _nftToOffers[_collection][_tokenId][offerIndex];
        uint256 offersLength = _nftToOffers[_collection][_tokenId].length;

        if (offer.buyer != _buyer) {
            revert MarketPlace__OfferDoesNotExist();
        }

        _nftToOffers[_collection][_tokenId][offerIndex] = _nftToOffers[
            _collection
        ][_tokenId][offersLength - 1];

        delete _nftToOffers[_collection][_tokenId][offersLength - 1];

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

        // Updaing NFT details
        nft.owner = msg.sender;
        nft.price = msg.value;
        nft.isForSale = false;

        // Removing NFT from previous owner NFT array
        uint256 nftIndex = nft.indexInArray;
        uint256 nftsLength = _ownerToNFTs[oldOwner].length;
        _ownerToNFTs[oldOwner][nftIndex] = _ownerToNFTs[oldOwner][
            nftsLength - 1
        ];
        delete _ownerToNFTs[oldOwner][nftsLength - 1];

        // Adding NFT to new owner NFT array
        uint256 newNFTIndex = _ownerToNFTs[msg.sender].length;
        nft.indexInArray = newNFTIndex;
        _ownerToNFTs[msg.sender].push(nft);

        // Updating nfts mapping
        nfts[_collection][_tokenId] = nft;

        uint256 marketPlaceFee = msg.value / MARKETPLACEPERCENTAGE;

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

    function getOffersForNFT(
        address _collection,
        uint256 _tokenId
    ) external view returns (Offers[] memory) {
        return _nftToOffers[_collection][_tokenId];
    }

    // MarketPlace Owner Methods
    function withdrawMarketPlaceProfit() external onlyOwner {
        payable(msg.sender).transfer(marketPlaceProfit);
    }

   
}
