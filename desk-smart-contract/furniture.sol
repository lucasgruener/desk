// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

contract Furniture is ERC721, ERC721Burnable, AccessControl {
    using Counters for Counters.Counter;
    using SafeMath for uint256;

    Counters.Counter private _tokenIds;

    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");

    uint256 private _maxSupply;
    string private _baseTokenURI;
    uint256 private _mintingFee;
    address private _feeWallet;

    constructor(uint256 maxSupply, string memory baseTokenURI)
        ERC721("Furniture", "FRT")
    {
        _maxSupply = maxSupply;
        _baseTokenURI = baseTokenURI;
        _mintingFee = 1000000000000000000; // Initial minting fee
        _feeWallet = msg.sender; // Initial fee wallet

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _setupRole(MINTER_ROLE, msg.sender);
    }

    function setBaseTokenURI(string memory baseTokenURI)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _baseTokenURI = baseTokenURI;
    }

    function safeMint(address to) public onlyRole(MINTER_ROLE) {
        require(_tokenIds.current() < _maxSupply, "Max supply reached");

        uint256 tokenId = _generateRandomTokenId();
        _safeMint(to, tokenId);
        _tokenIds.increment();
    }

    function setMintingFee(uint256 newMintingFee)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _mintingFee = newMintingFee;
    }

    function getMintingFee() public view returns (uint256) {
        return _mintingFee;
    }

    function setFeeWallet(address newFeeWallet)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        _feeWallet = newFeeWallet;
    }

    function mintWithFee() public payable {
        require(_tokenIds.current() < _maxSupply, "Max supply reached");
        require(msg.value >= _mintingFee, "Insufficient funds");

        uint256 tokenId = _generateRandomTokenId();
        _safeMint(msg.sender, tokenId);
        _tokenIds.increment();

        // Transfer minting fee to the designated fee wallet
        payable(_feeWallet).transfer(_mintingFee);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function getBaseURI() public view returns (string memory) {
        return _baseTokenURI;
    }

    function setMaxSupply(uint256 newMaxSupply)
        public
        onlyRole(DEFAULT_ADMIN_ROLE)
    {
        require(
            newMaxSupply > _tokenIds.current(),
            "New max supply should be greater than current total supply"
        );
        _maxSupply = newMaxSupply;
    }

    function getMaxSupply() public view returns (uint256) {
        return _maxSupply;
    }

    function getTotalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    function _generateRandomTokenId() private view returns (uint256) {
        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    _tokenIds.current()
                )
            )
        );
        uint256 tokenId = randomNumber % _maxSupply;

        // Check if the generated tokenId has already been minted
        if (_exists(tokenId)) {
            // Find an available tokenId by iterating through the range
            for (uint256 i = 1; i <= _maxSupply; i++) {
                tokenId = (tokenId + 1) % _maxSupply;
                if (!_exists(tokenId)) {
                    break;
                }
            }
        }

        return tokenId;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
