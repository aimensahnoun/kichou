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
error MarketPlace__UserAlreadyMadeOffer();

/// @title A NFT Marketplace contract
/// @author Aimen Sahnoun
/// @notice This contract is created to allow users to create collections of NFTs and sell them on Kichō, and might have other features in the future
contract MarketPlace is Ownable {
    // Counters are used to keep track of the number of collections and NFTs
    using Counters for Counters.Counter;
    Counters.Counter private _collectionCounter;
    Counters.Counter private _totalNFTCounter;

    // Events
    event MarketItemCreated(address indexed itemAddress, address indexed owner);

    // Variables
    ///@dev This variable is used to keep track of the percentage of the marketplace profit
    uint256 public constant MARKETPLACEPERCENTAGE = 10;
    ///@dev This variable is used to keep track of the total amount of profit the marketplace has made
    uint256 public marketPlaceProfit = 0;

    // Structs
    ///@dev This struct is used to keep track of the offers made on a specific NFT
    struct Offers {
        address buyer;
        uint256 price;
    }

    ///@dev This struct is used to keep track of the NFTs owned by a user.
    struct NFT {
        bool isForSale;
        address collection;
        address owner;
        uint256 tokenId;
        uint256 price;
        uint256 indexInArray;
    }

    // Mappings
    ///@dev This mapping is used to keep track of the creators of the collections (collection address => owner address)
    mapping(address => address) public collectionToOwner;
    ///@dev This mapping is used to keep track of the collections created by a user (user address => collection address[])
    mapping(address => address[]) public ownerToCollections;

    ///@dev This mapping is used to keep track if a user owns an NFT in a specific collection (user address => collection address => bool)
    mapping(address => mapping(address => bool))
        public doesUserOwnNFTInCollection;

    ///@dev This mapping is used to keep track of the NFTs owned by a user (user address => NFT[])
    mapping(address => NFT[]) private _ownerToNFTs;

    ///@dev This mapping is used to keep track of an NFT in a collection (collection address => token id => NFT)
    mapping(address => mapping(uint256 => NFT)) public nfts;

    ///@dev This mapping is used to keep track of the offers made on a specific NFT (collection address => token id => Offers[])
    mapping(address => mapping(uint256 => Offers[])) private _nftToOffers;

    ///@dev This mapping is used to keep track if a user has made an offer on a specific NFT (user address => (collection address + token id) => bool)
    mapping(address => mapping(string => bool)) private _hasUserMadeOfferOnNFT;

    ///@dev This mapping is used to keep track of the index of an offer in the offers array (user address => (collection address + token id) => index)
    mapping(address => mapping(string => uint256)) private userNFTOFferIndex;

    // Arrays
    ///@dev This array is used to keep track of all the collections created on the marketplace
    address[] public collections;

    // Collection Methods
    ///@dev This function is used to create a new collection
    ///@param _name The name of the collection
    ///@param _symbol The symbol of the collection
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

    ///@dev This function is used to get all the collections created on the marketplace
    function getCollections() external view returns (address[] memory) {
        return collections;
    }

    ///@dev This function is used to get all the collections created by a specific user
    ///@param _owner The address of the user
    function getCollectionsForOwner(
        address _owner
    ) external view returns (address[] memory) {
        return ownerToCollections[_owner];
    }

    ///@dev This function is used to get the owner of a specific collection
    ///@param _collection The address of the collection
    function getOwnerOfCollection(
        address _collection
    ) external view returns (address) {
        return collectionToOwner[_collection];
    }

    ///@dev This function is used to get the number of collections created on the marketplace
    function collectionCount() external view returns (uint256) {
        return _collectionCounter.current();
    }

    // NFT Methods
    ///@dev This function is used mint a new NFT in a collection, This can only be called by the owner of the collection
    ///@param _collection The address of the collection
    ///@param _to The address of the recipient
    ///@param _tokenURI The token URI of the NFT, this is the metadata of the NFT (image, name, description, etc.)
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

        // Get collection instance
        MarketItem marketItem = MarketItem(_collection);

        // Mint NFT
        uint256 tokenId = marketItem.safeMint(_to, _tokenURI);

        bool doesUserOwnNFT = doesUserOwnNFTInCollection[_to][_collection];

        // If the user does not own an NFT in the collection, add the collection to the user's collection array
        if (!doesUserOwnNFT) {
            doesUserOwnNFTInCollection[_to][_collection] = true;
        }

        // Add NFT to the user's NFT array
        uint256 newNFTIndex = _ownerToNFTs[_to].length;

        // Create a new NFT object
        NFT memory newNFT = NFT({
            collection: _collection,
            owner: _to,
            tokenId: tokenId,
            price: 0,
            indexInArray: newNFTIndex,
            isForSale: false
        });

        // Add the NFT to the NFT mapping
        nfts[_collection][tokenId] = newNFT;

        // Add the NFT to the user's NFT array
        _ownerToNFTs[_to].push(newNFT);

        // Increment the total NFT counter
        _totalNFTCounter.increment();
    }

    ///@dev This function is used to get all collections created by a specific user
    ///@param _owner The address of the user
    ///@return An array of all the collections created by the user
    function getCollectionByUser(
        address _owner
    ) external view returns (address[] memory) {
        return (ownerToCollections[_owner]);
    }

    ///@dev This function is used to get the count of NFTs
    function totalNFTCount() external view returns (uint256) {
        return _totalNFTCounter.current();
    }

    // NFT Owner Methods
    ///@dev This function that allows the user to put their NFT for sale
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT
    ///@param _price The price of the NFT
    function putNFTForSale(
        address _collection,
        uint256 _tokenId,
        uint256 _price
    ) external {
        // Gets instance of the collection
        MarketItem marketItem = MarketItem(_collection);

        // Check if the caller is the owner of the NFT
        if (marketItem.ownerOf(_tokenId) != msg.sender) {
            revert MarketPlace__OnlyOwnerCanSellNFT();
        }

        // Check if the price is not zero
        if (_price == 0) {
            revert MarketPlace__PriceCannotBeZero();
        }

        // Updates the NFT object with the new price and isForSale flag
        nfts[_collection][_tokenId].price = _price;
        nfts[_collection][_tokenId].isForSale = true;
    }

    ///@dev This function is used to remove an NFT from sale
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT
    function removeNFTFromSale(address _collection, uint256 _tokenId) external {
        // Gets instance of the collection
        MarketItem marketItem = MarketItem(_collection);

        // Get the NFT object
        NFT memory nft = nfts[_collection][_tokenId];

        // Check if the caller is the owner of the NFT
        if (marketItem.ownerOf(_tokenId) != msg.sender) {
            revert MarketPlace__OnlyOwnerCanSellNFT();
        }

        // Check if the NFT is for sale
        if (!nft.isForSale) {
            revert MarketPlace__NFTNotForSale();
        }

        // Update the NFT object with price and isForSale flag
        nfts[_collection][_tokenId].price = 0;
        nfts[_collection][_tokenId].isForSale = false;
    }

    // NFT Buyer Methods
    ///@dev This function is used to make an offer for an NFT
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT
    function makeOfferForNFT(
        address _collection,
        uint256 _tokenId
    ) external payable {
        bool hasUserMadeOffer = _hasUserMadeOfferOnNFT[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ];

        // Check if the user has already made an offer on the NFT
        if (hasUserMadeOffer) {
            revert MarketPlace__UserAlreadyMadeOffer();
        }

        // Get the instance of the collection
        MarketItem marketItem = MarketItem(_collection);

        // Check if the user is the owner of the NFT
        if (marketItem.ownerOf(_tokenId) == msg.sender) {
            revert MarketPlace__CannotMakeOfferOnOwnNFT();
        }

        // Checks if the value sent is not zero
        if (msg.value == 0) {
            revert MarketPlace__PriceCannotBeZero();
        }

        // Adds the offer to the NFT's offer array
        _nftToOffers[_collection][_tokenId].push(
            Offers({buyer: msg.sender, price: msg.value})
        );

        // Updates the mapping to check if the user has made an offer on the NFT
        _hasUserMadeOfferOnNFT[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ] = true;

        // Updates the mapping to get the index of the offer in the NFT's offer array
        userNFTOFferIndex[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ] = _nftToOffers[_collection][_tokenId].length - 1;
    }

    ///@dev This function is used to withdraw an offer previously made by the user
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT
    function widthdrawOfferForNFT(
        address _collection,
        uint256 _tokenId
    ) external {
        // Get the instance of the collection
        MarketItem marketItem = MarketItem(_collection);

        // Check if the user is the owner of the NFT
        if (marketItem.ownerOf(_tokenId) == msg.sender) {
            revert MarketPlace__CannotMakeOfferOnOwnNFT();
        }

        // Check if the user has made an offer on the NFT
        if (
            !_hasUserMadeOfferOnNFT[msg.sender][
                string(abi.encodePacked(_collection, _tokenId))
            ]
        ) {
            revert MarketPlace__OfferDoesNotExist();
        }

        // Get the index of the offer in the NFT's offer array
        uint256 offerIndex = userNFTOFferIndex[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ];

        // Get the offer object
        Offers memory offer = _nftToOffers[_collection][_tokenId][offerIndex];
        uint256 offersLength = _nftToOffers[_collection][_tokenId].length;

        // Remove the offer from the NFT's offer array
        _nftToOffers[_collection][_tokenId][offerIndex] = _nftToOffers[
            _collection
        ][_tokenId][offersLength - 1];

        delete _nftToOffers[_collection][_tokenId][offersLength - 1];

        // Update the mapping to check if the user has made an offer on the NFT
        _hasUserMadeOfferOnNFT[msg.sender][
            string(abi.encodePacked(_collection, _tokenId))
        ] = false;

        // Transfer the offer amount back to the user
        payable(msg.sender).transfer(offer.price);
    }

    ///@dev This function is used to accept an offer for an NFT,NFT owner needs to approve this contract to transfer the NFT before calling this function, otherwise the transaction will fail
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT
    ///@param _buyer The address of the buyer
    function acceptOfferForNFT(
        address _collection,
        uint256 _tokenId,
        address _buyer
    ) external {
        // Getting instance of the collection
        MarketItem marketItem = MarketItem(_collection);

        // Check if the caller is the owner of the NFT
        if (marketItem.ownerOf(_tokenId) != msg.sender) {
            revert MarketPlace__OnlyOwnerCanSellNFT();
        }

        // Check if the user has made an offer on the NFT
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

        // Transfering NFT to buyer
        marketItem.safeTransferFrom(msg.sender, _buyer, _tokenId);

        // Transfering NFT price to seller
        payable(msg.sender).transfer(offer.price - marketPlaceFee);
    }

    ///@dev This function is used to reject an offer for an NFT
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT
    ///@param _buyer The address of the buyer
    function rejectOfferForNFT(
        address _collection,
        uint256 _tokenId,
        address _buyer
    ) external {
        // Getting instance of the collection
        MarketItem marketItem = MarketItem(_collection);

        // Check if the caller is the owner of the NFT
        if (marketItem.ownerOf(_tokenId) != msg.sender) {
            revert MarketPlace__OnlyOwnerCanSellNFT();
        }

        // Check if the user has made an offer on the NFT
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
        uint256 offersLength = _nftToOffers[_collection][_tokenId].length;

        // Removing offer from Offers array
        _nftToOffers[_collection][_tokenId][offerIndex] = _nftToOffers[
            _collection
        ][_tokenId][offersLength - 1];
        delete _nftToOffers[_collection][_tokenId][offersLength - 1];

        // Updating _hasUserMadeOfferOnNFT mapping
        _hasUserMadeOfferOnNFT[_buyer][
            string(abi.encodePacked(_collection, _tokenId))
        ] = false;

        // Returing funds to buyer
        payable(_buyer).transfer(offer.price);
    }

    ///@dev This function is used to buy an NFT that is for sale , NFT owner needs to approve this contract to transfer the NFT before calling this function, otherwise the transaction will fail
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT

    function buyNFT(address _collection, uint256 _tokenId) external payable {
        // Getting instance of the collection
        MarketItem marketItem = MarketItem(_collection);

        // Check if the caller is not the owner of the NFT
        if (marketItem.ownerOf(_tokenId) == msg.sender) {
            revert MarketPlace__CannotBuyOwnNFT();
        }

        // Check if the attached funds are greater then 0
        if (msg.value == 0) {
            revert MarketPlace__FundsAreZero();
        }

        // Getting NFT from nfts mapping
        NFT memory nft = nfts[_collection][_tokenId];

        // Check if the NFT is for sale
        if (!nft.isForSale) {
            revert MarketPlace__CannotBuyNFTThatIsNotForSale();
        }

        // Check if the attached funds are greater then NFT price
        if (msg.value < nft.price) {
            revert MarketPlace__OfferedFundsAreLowerThenPrice();
        }

        // Getting previous owner of the NFT
        address oldOwner = marketItem.ownerOf(_tokenId);

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

        // Calculating market place fee
        uint256 marketPlaceFee = msg.value / MARKETPLACEPERCENTAGE;
        marketPlaceProfit += marketPlaceFee;

        // Transfering NFT to buyer
        marketItem.safeTransferFrom(oldOwner, msg.sender, _tokenId);

        // Transfering NFT price to seller
        payable(oldOwner).transfer(msg.value - marketPlaceFee);
    }

    ///@dev This function is used to check whether a user has made an offer on an NFT
    ///@param _user The address of the user
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT
    ///@return bool Whether the user has made an offer on the NFT
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

    ///@dev This function is used to get all the NFTs for a user
    ///@param _owner The address of the user
    ///@return NFT[] memory The array of NFTs
    function ownerToNFTs(address _owner) external view returns (NFT[] memory) {
        return _ownerToNFTs[_owner];
    }

    ///@dev This function is used to get all the offers for an NFT
    ///@param _collection The address of the collection
    ///@param _tokenId The token id of the NFT
    ///@return Offers[] memory The array of offers
    function getOffersForNFT(
        address _collection,
        uint256 _tokenId
    ) external view returns (Offers[] memory) {
        return _nftToOffers[_collection][_tokenId];
    }

    // MarketPlace Owner Methods

    ///@dev This function is used to withdraw the market place profit can be called only by the owner of the contract
    function withdrawMarketPlaceProfit() external onlyOwner {
        payable(msg.sender).transfer(marketPlaceProfit);
    }
}
