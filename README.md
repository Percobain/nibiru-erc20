# CE Token - Nibiru ERC20 Project

This project demonstrates the deployment of a custom ERC20 token (CE Token) on the Nibiru blockchain testnet using Hardhat.

## Contract Information

- **Contract Address**: `0xc47bA4fA2B3713Fe1B1d62b5aF18B649aD36329A`
- **Network**: Nibiru Testnet (Chain ID: 6911)
- **Token Name**: CE Token
- **Token Symbol**: CE
- **Total Supply**: 1,000,000,000 CE tokens
- **Decimals**: 18
- **Explorer**: [View on NibiScan](https://testnet.nibiscan.io/token/0xc47bA4fA2B3713Fe1B1d62b5aF18B649aD36329A?type=erc20)

## Features

The CE Token contract includes the following functionality:

- **Standard ERC20**: Full ERC20 compliance with transfer, approve, and allowance functions
- **Minting**: Owner can mint new tokens to any address
- **Burning**: Users can burn their own tokens or burn from approved addresses
- **Owner Controls**: Only the contract owner can mint tokens and withdraw stuck tokens
- **Token Recovery**: Functions to recover mistakenly sent tokens (both CE and other ERC20 tokens)

## Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- An Ethereum wallet with testnet tokens

### Installation

```shell
npm install
```

### Configuration

1. Create a `.env` file in the root directory:
```
ALCHEMY_API_KEY=your_alchemy_api_key
ETHERSCAN_API_KEY=your_etherscan_api_key
SEPOLIA_API_KEY=your_private_key_here
```

### Testing

Run the test suite:
```shell
npx hardhat test
```

Run tests with gas reporting:
```shell
REPORT_GAS=true npx hardhat test
```

### Deployment

Deploy to Nibiru testnet:
```shell
npx hardhat run scripts/deploy.js --network nibiruTestnet
```

Deploy to local network:
```shell
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Verification

Verify the deployed contract:
```shell
npx hardhat run scripts/verify.js --network nibiruTestnet
```

## Contract Functions

### Public Functions

- `transfer(address to, uint256 amount)`: Transfer tokens to another address
- `approve(address spender, uint256 amount)`: Approve spending allowance
- `burn(uint256 amount)`: Burn tokens from caller's balance
- `burnFrom(address account, uint256 amount)`: Burn tokens from approved address

### Owner-Only Functions

- `mint(address to, uint256 amount)`: Mint new tokens to specified address
- `withdrawStuckCE()`: Withdraw CE tokens sent to contract address
- `withdrawStuckERC20(IERC20 tokenContract)`: Withdraw other ERC20 tokens sent to contract

## Network Configuration

The project is configured for multiple networks:

- **Nibiru Testnet**: Chain ID 6911, RPC: `https://evm-rpc.testnet-2.nibiru.fi`
- **Sepolia**: Ethereum testnet
- **Localhost**: Local Hardhat network

## Dependencies

- **Hardhat**: Development environment
- **OpenZeppelin**: Secure smart contract library
- **Ethers.js**: Ethereum library for JavaScript
- **NibiJS**: Nibiru blockchain SDK

## License

This project is licensed under the MIT License.