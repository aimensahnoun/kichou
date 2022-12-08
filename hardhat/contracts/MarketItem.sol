// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

error MarketItem__CannotMintToZeroAddress(address to);
error MarketItem__OnlyOwnerCanMint(address collection);
error MarketItem__OnlyOwnerCanSetNFTForSale();

contract MarketItem is ERC721, ERC721URIStorage, ERC721Burnable, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    constructor(
        string memory _collectionName,
        string memory _collectionSymbol
    ) ERC721(_collectionName, _collectionSymbol) {
        _tokenIdCounter.increment();
    }

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

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function getNFTCount() public view returns (uint256) {
        return _tokenIdCounter.current() - 1;
    }
}
