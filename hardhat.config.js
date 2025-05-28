require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const { ALCHEMY_API_KEY, ETHERSCAN_API_KEY, SEPOLIA_API_KEY } = process.env;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  paths: {
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  etherscan: {
    apiKey: ETHERSCAN_API_KEY
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`,
      accounts: [`0x${SEPOLIA_API_KEY}`],
      chainId: 11155111,
    },
    nibiruTestnet: {
      url: "https://evm-rpc.testnet-2.nibiru.fi",
      accounts: [`0x${SEPOLIA_API_KEY}`],
      chainId: 6911,
      gasPrice: 20000000000,
    },
    hardhat: {
      // This is the default network when you run `npx hardhat test`
    }
  }
};