#!/usr/bin/env node
const { ethers, network, run } = require("hardhat");
require("dotenv").config();

async function main() {
  const cid = process.env.COLLECTION_CID;
  if (!cid) throw new Error("Set COLLECTION_CID in .env — run `npm run ipfs:pin` first");

  const price = ethers.parseEther(process.env.MINT_PRICE || "0.01");
  const args = ["AI Agents Avatars", "AIAV", cid, price];

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log(`Network:  ${network.name}`);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${ethers.formatEther(balance)} POL`);
  if (balance === 0n) throw new Error("Deployer has no POL — fund it from the Amoy faucet");

  const nft = await ethers.deployContract("AIAgentsAvatars", args);
  await nft.waitForDeployment();
  const address = await nft.getAddress();

  console.log(`\nDeployed to: ${address}`);
  console.log(`Mint price:  ${ethers.formatEther(price)} POL`);
  console.log(`tokenURI(0): ipfs://${cid}/0.json`);
  console.log(`\nNEXT_PUBLIC_CONTRACT_ADDRESS=${address}`);

  if (network.name !== "hardhat" && process.env.ETHERSCAN_API_KEY) {
    console.log("\nWaiting 5 confirmations before verifying…");
    await nft.deploymentTransaction().wait(5);
    try {
      await run("verify:verify", { address, constructorArguments: args });
    } catch (e) {
      console.error(`Verification failed (deploy still succeeded): ${e.message}`);
    }
  }
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
