// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/access/Ownable.sol";

import "./MarketItem.sol";

contract MarketItemFactory is Ownable {
    event MarketItemCreated(address indexed itemAddress, address indexed owner);

    mapping(address => address) public collectionToOwner;
    mapping(address => address[]) public ownerToCollections;

    address[] public collections;

    function createMarketItem(
        string memory _name,
        string memory _symbol
    ) external {
        MarketItem marketItem = new MarketItem(_name, _symbol);
        marketItem.transferOwnership(msg.sender);
        collections.push(address(marketItem));

        collectionToOwner[address(marketItem)] = msg.sender;
        ownerToCollections[msg.sender].push(address(marketItem));
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

    function getCollectionCount() external view returns (uint256) {
        return collections.length;
    }
}
