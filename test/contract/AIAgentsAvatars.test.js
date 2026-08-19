const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

const BASE_CID = "QmTestBaseCid";
const PRICE = ethers.parseEther("0.01");

async function deployFixture() {
  const [owner, buyer, stranger] = await ethers.getSigners();
  const factory = await ethers.getContractFactory("AIAgentsAvatars");
  const nft = await factory.deploy("AI Agents Avatars", "AIAV", BASE_CID, PRICE);
  await nft.waitForDeployment();
  return { nft, owner, buyer, stranger };
}

describe("AIAgentsAvatars", function () {
  describe("public mint", function () {
    it("gives the token to whoever paid for it", async function () {
      const { nft, buyer } = await loadFixture(deployFixture);

      await nft.connect(buyer).mint({ value: PRICE });

      expect(await nft.ownerOf(0)).to.equal(buyer.address);
      expect(await nft.balanceOf(buyer.address)).to.equal(1n);
    });

    it("refuses a mint that underpays", async function () {
      const { nft, buyer } = await loadFixture(deployFixture);

      await expect(
        nft.connect(buyer).mint({ value: PRICE - 1n })
      ).to.be.revertedWith("AIAgentsAvatars: incorrect payment");
    });

    it("hands out sequential token ids to successive buyers", async function () {
      const { nft, buyer, stranger } = await loadFixture(deployFixture);

      await nft.connect(buyer).mint({ value: PRICE });
      await nft.connect(stranger).mint({ value: PRICE });

      expect(await nft.ownerOf(0)).to.equal(buyer.address);
      expect(await nft.ownerOf(1)).to.equal(stranger.address);
      expect(await nft.totalMinted()).to.equal(2n);
    });
  });

  describe("supply cap", function () {
    it("allows the hundredth mint and rejects the hundred-and-first", async function () {
      const { nft, owner, buyer } = await loadFixture(deployFixture);

      await nft.connect(owner).ownerMint(owner.address, 99);

      await nft.connect(buyer).mint({ value: PRICE });
      expect(await nft.ownerOf(99)).to.equal(buyer.address);

      await expect(
        nft.connect(buyer).mint({ value: PRICE })
      ).to.be.revertedWith("AIAgentsAvatars: sold out");
    });

    it("refuses an owner batch that would overshoot the cap", async function () {
      const { nft, owner } = await loadFixture(deployFixture);

      await expect(
        nft.connect(owner).ownerMint(owner.address, 101)
      ).to.be.revertedWith("AIAgentsAvatars: sold out");
    });
  });

  describe("token metadata", function () {
    it("derives each token's URI from the collection CID and its id", async function () {
      const { nft, buyer } = await loadFixture(deployFixture);

      await nft.connect(buyer).mint({ value: PRICE });

      expect(await nft.tokenURI(0)).to.equal(`ipfs://${BASE_CID}/0.json`);
    });

    it("has no URI for a token that was never minted", async function () {
      const { nft } = await loadFixture(deployFixture);

      await expect(nft.tokenURI(0)).to.be.reverted;
    });
  });

  describe("access control", function () {
    it("stops a stranger from minting for free via the owner path", async function () {
      const { nft, stranger } = await loadFixture(deployFixture);

      await expect(
        nft.connect(stranger).ownerMint(stranger.address, 1)
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });

    it("stops a stranger from pausing the sale", async function () {
      const { nft, stranger } = await loadFixture(deployFixture);

      await expect(
        nft.connect(stranger).pause()
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });

  describe("pausing", function () {
    it("blocks minting while paused and allows it again after unpausing", async function () {
      const { nft, owner, buyer } = await loadFixture(deployFixture);

      await nft.connect(owner).pause();
      await expect(
        nft.connect(buyer).mint({ value: PRICE })
      ).to.be.revertedWithCustomError(nft, "EnforcedPause");

      await nft.connect(owner).unpause();
      await nft.connect(buyer).mint({ value: PRICE });

      expect(await nft.ownerOf(0)).to.equal(buyer.address);
    });
  });

  describe("royalties", function () {
    it("directs 2.5% of a secondary sale to the collection owner", async function () {
      const { nft, owner } = await loadFixture(deployFixture);

      const [receiver, amount] = await nft.royaltyInfo(0, ethers.parseEther("100"));

      expect(receiver).to.equal(owner.address);
      expect(amount).to.equal(ethers.parseEther("2.5"));
    });

    it("announces royalty support so marketplaces honour it", async function () {
      const { nft } = await loadFixture(deployFixture);

      expect(await nft.supportsInterface("0x2a55205a")).to.equal(true);
      expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true);
    });
  });

  describe("proceeds", function () {
    it("pays out the full mint income to the owner and empties the contract", async function () {
      const { nft, owner, buyer, stranger } = await loadFixture(deployFixture);
      await nft.connect(buyer).mint({ value: PRICE });
      await nft.connect(stranger).mint({ value: PRICE });

      const before = await ethers.provider.getBalance(owner.address);
      const receipt = await (await nft.connect(owner).withdraw()).wait();
      const after = await ethers.provider.getBalance(owner.address);

      const gas = receipt.gasUsed * receipt.gasPrice;
      expect(after - before + gas).to.equal(PRICE * 2n);
      expect(await ethers.provider.getBalance(await nft.getAddress())).to.equal(0n);
    });

    it("stops a stranger from draining the proceeds", async function () {
      const { nft, buyer, stranger } = await loadFixture(deployFixture);
      await nft.connect(buyer).mint({ value: PRICE });

      await expect(
        nft.connect(stranger).withdraw()
      ).to.be.revertedWithCustomError(nft, "OwnableUnauthorizedAccount");
    });
  });
});
