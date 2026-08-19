// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalties.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";

/**
 * @title AIAgentsAvatars
 * @dev 100-piece ERC-721 collection with owner-only minting, 2.5% royalty,
 *      pausable mint, and IPFS-backed metadata URIs.
 */
contract AIAgentsAvatars is
    ERC721,
    ERC721URIStorage,
    Pausable,
    Ownable,
    ERC721Royalties,
    ERC721Enumerable
{
    uint256 private constant _MAX_SUPPLY = 100;
    uint256 private _nextTokenId;

    /**
     * @dev Emitted when an avatar is minted.
     */
    event AvatarMinted(address indexed to, uint256 indexed tokenId, string ipfsCid);

    constructor(
        string memory name,
        string memory symbol,
        string memory baseIpfsCid
    )
        ERC721(name, symbol)
        ERC721URIStorage(baseIpfsCid)
    {}

    /**
     * @dev Mint a single avatar. Only callable by the owner while minting is not paused
     *      and the max supply of 100 has not been reached.
     * @param to The recipient address.
     * @param ipfsCid The IPFS content identifier for this avatar's metadata.
     */
    function mint(address to, string calldata ipfsCid)
        external
        whenNotPaused
         onlyOwner
    {
        require(_nextTokenId < _MAX_SUPPLY, "AIAgentsAvatars: max supply reached");
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, string(abi.encodePacked(ipfsCid, ".json")));

        emit AvatarMinted(to, tokenId, ipfsCid);
    }

    /**
     * @dev Override to set royalties to 2.5%.
     */
    function royaltyInfo(
        uint256 tokenId,
        uint256 salePrice
    )
        public
        view
        override
        returns (address receiver, uint256 royaltyAmount)
    {
        return (owner(), (salePrice * 250) / 10_000);
    }

    /**
     * @dev Override to return the total supply.
     */
    function _update(
        address operator,
        address from,
        address to,
        uint256 tokenId,
        uint256 value,
        bytes calldata data
    )
        internal
        override(ERC721, ERC721Enumerable)
    {
        super._update(operator, from, to, tokenId, value, data);
    }
}
