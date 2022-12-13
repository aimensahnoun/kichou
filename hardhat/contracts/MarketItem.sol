// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error MarketItem__CannotMintToZeroAddress(address to);
error MarketItem__OnlyOwnerCanMint(address collection);

error MarketItem__DoesNotHavePermissionToBurn();

/// @title MarketItem - A contract for a single NFT collection
/// @author Aimen Sahnoun
contract MarketItem is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    /// @dev Constructor for the MarketItem contract, which inherits from the ERC721 contract, increments the token counter in order to start from 1 and not 0
    /// @param _collectionName The name of the NFT collection
    /// @param _collectionSymbol The symbol of the NFT collection
    constructor(
        string memory _collectionName,
        string memory _collectionSymbol
    ) ERC721(_collectionName, _collectionSymbol) {
        _tokenIdCounter.increment();
    }

    /// @dev Mints a new NFT and sets the token URI
    /// @param to The address of the owner of the NFT
    /// @param uri The token URI of the NFT
    function safeMint(
        address to,
        string calldata uri
    ) public onlyOwner returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        return tokenId;
    }

    function _burn(
        uint256 tokenId
    ) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }



    /// @dev Returns the token URI of an NFT
    /// @param tokenId The ID of the NFT
    /// @return The token URI of the NFT
    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    /// @dev Returns the number of NFTs in the collection
    /// @return The number of NFTs in the collection
    function getNFTCount() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
}
