// Configuration file for the blockchain project

export const API_URL = "http://localhost:5001"; // Backend API base URL
export const GANACHE_URL = "http://127.0.0.1:7545"; // Ganache RPC URL
export const NETWORK_ID = 5777; // Ganache network ID

export const GAS_LIMIT = 3000000; // Default gas limit for transactions

// MetaMask configuration
export const METAMASK_NETWORK_CONFIG = {
  chainId: `0x${NETWORK_ID.toString(16)}`, // Convert network ID to hexadecimal
  chainName: "Localhost 7545",
  rpcUrls: [GANACHE_URL],
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  blockExplorerUrls: ["http://localhost:7545"], // Optional if block explorer is available
};
