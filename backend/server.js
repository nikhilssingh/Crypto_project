const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const Web3 = require("web3");
const Wallet = require("ethereumjs-wallet").default;
const contractDetails = require("../blockchain/build/contracts/IdentityVerification.json");

const app = express();
const PORT = process.env.PORT || 5001;

// Web3 Initialization
const web3 = new Web3("http://127.0.0.1:7545");

// Dynamic Contract Details
const contractABI = contractDetails.abi;
const networkId = Object.keys(contractDetails.networks)[0];
const contractAddress = contractDetails.networks[networkId]?.address;

if (!contractAddress) {
  console.error("Contract address not found! Deploy the contract and restart.");
  process.exit(1);
}

const identityContract = new web3.eth.Contract(contractABI, contractAddress);

// Middleware
app.use(cors({ origin: "http://localhost:3000", optionsSuccessStatus: 200 }));
app.use(express.json());

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/digitalIdentity", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Define the User schema
const userSchema = new mongoose.Schema({
  name: String,
  emailHash: String,
  idNumber: String,
  publicKey: String,
});
const User = mongoose.model("User", userSchema);

// Routes
app.get("/", (req, res) => {
  res.send("Blockchain backend server is running!");
});

// Registration Route
app.post("/api/register/blockchain", async (req, res) => {
  try {
    const { name, email, idNumber } = req.body;
    console.log("Received Registration Data:", { name, email, idNumber });

    if (!name || !email || !idNumber) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const emailHash = crypto.createHash("sha256").update(email).digest("hex");
    const idHash = crypto.createHash("sha256").update(idNumber).digest("hex");
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    console.log("Sender Address:", sender);

    // Check if the user is already registered on the blockchain
    const existingRecord = await identityContract.methods.userRecords(sender).call();
    console.log("Existing Record:", existingRecord); // Log for debugging

    if (existingRecord && existingRecord !== "") {
      return res.status(400).json({
        message: "User already registered on blockchain.",
        userRecord: existingRecord,
        blockchainAddress: sender,
      });
    }

    // Register the user on the blockchain
    console.log("Registering user on blockchain...");
    await identityContract.methods.register(emailHash).send({ from: sender, gas: 3000000 });

    // Save user data in MongoDB
    const newUser = new User({
      name,
      emailHash,
      idNumber: idHash,
      publicKey: sender,
    });

    await newUser.save();
    console.log("User successfully saved in MongoDB:", sender);

    res.status(201).json({ message: "User registered successfully!", blockchainAddress: sender });
  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
});

// Add Issuer Route
app.post("/api/add-issuer", async (req, res) => {
  try {
    const { issuerAddress } = req.body;
    console.log("Adding Issuer:", issuerAddress);

    if (!issuerAddress) {
      return res.status(400).json({ message: "Issuer address is required!" });
    }

    const accounts = await web3.eth.getAccounts();
    const adminAddress = accounts[0];

    await identityContract.methods.addIssuer(issuerAddress).send({ from: adminAddress, gas: 3000000 });
    console.log("Issuer successfully added:", issuerAddress);

    res.status(201).json({ message: "Issuer added successfully!" });
  } catch (error) {
    console.error("Error adding issuer:", error);
    res.status(500).json({ message: "Failed to add issuer.", error: error.message });
  }
});

// Add Verifier Route
app.post("/api/add-verifier", async (req, res) => {
  try {
    const { verifierAddress } = req.body;
    console.log("Adding Verifier:", verifierAddress);

    if (!verifierAddress) {
      return res.status(400).json({ message: "Verifier address is required!" });
    }

    const accounts = await web3.eth.getAccounts();
    const adminAddress = accounts[0];

    await identityContract.methods.addVerifier(verifierAddress).send({ from: adminAddress, gas: 3000000 });
    console.log("Verifier successfully added:", verifierAddress);

    res.status(201).json({ message: "Verifier added successfully!" });
  } catch (error) {
    console.error("Error adding verifier:", error);
    res.status(500).json({ message: "Failed to add verifier.", error: error.message });
  }
});

// Debug Route to Fetch Blockchain Records
app.get("/api/debug/userRecords/:address", async (req, res) => {
  try {
    const userAddress = req.params.address;
    console.log("Fetching blockchain record for:", userAddress);

    const userRecord = await identityContract.methods.userRecords(userAddress).call();
    res.status(200).json({ message: "User record fetched successfully", userRecord });
  } catch (error) {
    console.error("Error fetching user record:", error);
    res.status(500).json({ message: "Failed to fetch user record.", error: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));