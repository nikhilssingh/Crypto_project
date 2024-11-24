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

// Routes
app.get("/", (req, res) => {
  res.send("Blockchain backend server is running!");
});

// Registration Route
app.post("/api/register/blockchain", async (req, res) => {
  try {
    const { name, email, idNumber } = req.body;

    if (!name || !email || !idNumber) {
      return res.status(400).json({ message: "All fields are required!" });
    }

    const emailHash = crypto.createHash("sha256").update(email).digest("hex");
    const idHash = crypto.createHash("sha256").update(idNumber).digest("hex");
    const accounts = await web3.eth.getAccounts();
    const sender = accounts[0];

    const isRegistered = await identityContract.methods.userRecords(sender).call();

    if (isRegistered) {
      return res.status(400).json({ message: "User already registered on blockchain." });
    }

    await identityContract.methods.register(emailHash).send({ from: sender, gas: 3000000 });

    const user = new mongoose.model("User", {
      name,
      emailHash,
      idNumber: idHash,
      publicKey: sender,
    });

    await user.save();

    res.status(201).json({ message: "User registered successfully!", blockchainAddress: sender });
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).json({ message: "Registration failed.", error: error.message });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
