require("@nomicfoundation/hardhat-toolbox");
const fs = require("fs");
const path = require("path");

if (fs.existsSync(path.join(__dirname, ".env.local"))) {
  require("dotenv").config({ path: path.join(__dirname, ".env.local") });
} else {
  require("dotenv").config();
}

const SEPOLIA_RPC_URL = process.env.SEPOLIA_RPC_URL || "";
const rawPrivateKey = process.env.DEPLOYER_PRIVATE_KEY || "";
const isValidPrivateKey = /^0x?[0-9a-fA-F]{64}$/.test(rawPrivateKey);
const sepoliaAccounts = isValidPrivateKey
  ? [rawPrivateKey.startsWith("0x") ? rawPrivateKey : `0x${rawPrivateKey}`]
  : [];
const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || "";

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    hardhat: {
      chainId: 31337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: sepoliaAccounts,
      chainId: 11155111,
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    coinmarketcap: COINMARKETCAP_API_KEY,
    noColors: true,
  },
};
