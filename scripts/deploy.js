const hre = require("hardhat");
const { ethers } = hre;

async function main() {
    try {
        const [deployer] = await ethers.getSigners();
        const deployerAddress = await deployer.getAddress();
        console.log("Deploying contracts with the account:", deployerAddress);

        // Deploy CEToken
        const CEToken = await ethers.getContractFactory("CEToken");
        const ceToken = await CEToken.deploy(deployerAddress);
        await ceToken.waitForDeployment();
        const ceTokenAddress = await ceToken.getAddress();
        console.log("CEToken deployed to:", ceTokenAddress);

        console.log("\n--- CEToken deployed successfully ---");
        console.log("CEToken:", ceTokenAddress);
        console.log("Initial supply: 1,000,000,000 CE tokens");
        console.log("Owner:", deployerAddress);
        console.log("----------------------------------------");

    } catch (error) {
        console.error("Deployment failed:", error);
        process.exit(1);
    }
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
