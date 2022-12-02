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
}
