import Web3 from "web3";
import contractData from "./contracts/IdentityVerification.json";

const getContractInstance = async () => {
  if (!window.ethereum) {
    throw new Error("MetaMask not found. Please install MetaMask to use this application.");
  }

  // Initialize Web3 with MetaMask's provider
  const web3 = new Web3(window.ethereum);

  try {
    // Request account access
    await window.ethereum.request({ method: "eth_requestAccounts" });

    // Get the current network ID
    const networkId = await web3.eth.net.getId();

    // Check if the contract is deployed on the current network
    if (!contractData.networks[networkId]) {
      throw new Error("Contract not deployed on the current network! Please switch to the Ganache network.");
    }

    // Create contract instance
    const contractInstance = new web3.eth.Contract(
      contractData.abi,
      contractData.networks[networkId].address
    );

    // Get the user's Ethereum account address
    const accounts = await web3.eth.getAccounts();

    return { web3, contractInstance, userAddress: accounts[0] };
  } catch (error) {
    console.error("Error setting up Web3 or fetching contract instance:", error);
    throw error;
  }
};

export default getContractInstance;
