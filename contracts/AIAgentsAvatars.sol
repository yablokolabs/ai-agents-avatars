// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/common/ERC2981.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title AIAgentsAvatars
 * @dev 100-piece ERC-721 collection with a fixed-price public mint, owner-only
 *      batch minting, a pausable sale, and 2.5% ERC-2981 royalties. Metadata
 *      lives in a single pinned IPFS directory addressed by token id.
 */
contract AIAgentsAvatars is ERC721, ERC2981, Pausable, Ownable {
    using Strings for uint256;

    uint256 public constant MAX_SUPPLY = 100;
    uint96 private constant _ROYALTY_BPS = 250;

    uint256 public immutable mintPrice;
    uint256 public totalMinted;

    string private _collectionCid;

    event AvatarMinted(address indexed to, uint256 indexed tokenId);

    constructor(
        string memory name_,
        string memory symbol_,
        string memory collectionCid,
        uint256 mintPrice_
    ) ERC721(name_, symbol_) Ownable(msg.sender) {
        _collectionCid = collectionCid;
        mintPrice = mintPrice_;
        _setDefaultRoyalty(msg.sender, _ROYALTY_BPS);
    }

    /// @dev Buy a single avatar at the fixed mint price.
    function mint() external payable whenNotPaused {
        require(msg.value == mintPrice, "AIAgentsAvatars: incorrect payment");
        _mintOne(msg.sender);
    }

    /// @dev Seed the collection without payment. Owner only.
    function ownerMint(address to, uint256 quantity) external onlyOwner {
        for (uint256 i = 0; i < quantity; ++i) {
            _mintOne(to);
        }
    }

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    function withdraw() external onlyOwner {
        (bool sent, ) = payable(owner()).call{value: address(this).balance}("");
        require(sent, "AIAgentsAvatars: withdraw failed");
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        return string.concat("ipfs://", _collectionCid, "/", tokenId.toString(), ".json");
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC2981)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function _mintOne(address to) private {
        uint256 tokenId = totalMinted;
        require(tokenId < MAX_SUPPLY, "AIAgentsAvatars: sold out");
        totalMinted = tokenId + 1;
        _safeMint(to, tokenId);
        emit AvatarMinted(to, tokenId);
    }
}
