// SPDX-License-Identifier: MIT
const { ethers } = require("hardhat");

/**
 * @title DeployAIAgentsAvatars
 * @dev Hardhat deployment script for the AIAgentsAvatars NFT collection on Polygon.
 */
async function main() {
    const [deployer] = await ethers.getSigners();

    console.log("Deploying AIAgentsAvatars with the account:", deployer.address);
    console.log("Account balance (ETH):", (await deployer.getBalance()).toString());

    const baseIpfsCid = "QmYourBaseIpfsCidHere"; // Replace with your IPFS base CID

    const AIAgentsAvatars = await ethers.getContractFactory("AIAgentsAvatars");
    const collection = await AIAgentsAvatars.deploy(
        "AI Agents Avatars",
        "AIAV",
        baseIpfsCid
    );

    await collection.waitForDeployment();

    const [owner] = await ethers.getSigners();
    console.log("AIAgentsAvatars deployed to:", await collection.getAddress());
    console.log("Owner set to:", owner.address);

    // Mint the first batch (optional — owner can mint via contract directly)
    const mintCount = 10;
    for (let i = 0; i < mintCount; i++) {
        const ipfsCid = `QmMint${i + 1}`; // Replace with real IPFS CIDs
        await collection.mint(owner.address, ipfsCid);
    }

    console.log(`Minted ${mintCount} avatars. Max supply: 100.`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
