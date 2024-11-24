const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const Web3 = require("web3");

const app = express();
const PORT = process.env.PORT || 5001;
const web3 = new Web3("http://127.0.0.1:7545");

const contractABI = [
  /* Paste ABI here */ [
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "publicKey",
          type: "address",
        },
        {
          indexed: false,
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          indexed: false,
          internalType: "string",
          name: "idNumber",
          type: "string",
        },
      ],
      name: "UserRegistered",
      type: "event",
    },
    {
      anonymous: false,
      inputs: [
        {
          indexed: true,
          internalType: "address",
          name: "publicKey",
          type: "address",
        },
      ],
      name: "UserVerified",
      type: "event",
    },
    {
      inputs: [
        {
          internalType: "string",
          name: "name",
          type: "string",
        },
        {
          internalType: "string",
          name: "emailHash",
          type: "string",
        },
        {
          internalType: "string",
          name: "idNumber",
          type: "string",
        },
      ],
      name: "registerUser",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "publicKey",
          type: "address",
        },
      ],
      name: "verifyUser",
      outputs: [],
      stateMutability: "nonpayable",
      type: "function",
    },
    {
      inputs: [
        {
          internalType: "address",
          name: "publicKey",
          type: "address",
        },
      ],
      name: "checkStatus",
      outputs: [
        {
          internalType: "string",
          name: "",
          type: "string",
        },
        {
          internalType: "string",
          name: "",
          type: "string",
        },
        {
          internalType: "bool",
          name: "",
          type: "bool",
        },
      ],
      stateMutability: "view",
      type: "function",
      constant: true,
    },
  ],
];
const contractAddress = "0x210C4B07f0d1699afCD9ad94952c32ca03465507"; // Replace with your deployed contract address

const identityContract = new web3.eth.Contract(contractABI, contractAddress);
// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
  .connect("mongodb://localhost:27017/digitalIdentity", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// User Schema
const userSchema = new mongoose.Schema({
  name: String,
  emailHash: String,
  idNumber: String,
  verified: { type: Boolean, default: false },
  publicKey: String,
  privateKey: String,
});

const User = mongoose.model("User", userSchema);

// Helper Functions
function generateKeyPair() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync("rsa", {
    modulusLength: 2048,
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
  });
  return { publicKey, privateKey };
}

function hashData(data) {
  return crypto.createHash("sha256").update(data).digest("hex");
}

// API endpoint for user registration
app.post("/api/register", async (req, res) => {
  const { name, email, idNumber, password } = req.body;

  // Check if user already exists
  const emailHash = hashData(email);
  const existingUser = await User.findOne({ emailHash });
  if (existingUser) {
    return res.status(400).json({ message: "User already exists." });
  }

  // Generate public/private key pair
  const { publicKey, privateKey } = generateKeyPair();

  // Create a new user
  const newUser = new User({
    name,
    emailHash,
    idNumber,
    publicKey,
    privateKey,
  });
  await newUser.save();

  res.json({
    message: "User registered successfully!",
    keys: { publicKey, privateKey },
  });
});

// API endpoint for identity verification
app.post("/api/verify", async (req, res) => {
  const { idNumber, signature } = req.body;

  // Find user by ID
  const user = await User.findOne({ idNumber });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  // Verify signature using user's public key
  const verifier = crypto.createVerify("SHA256");
  verifier.update(`${user.name}:${user.idNumber}`);
  const isVerified = verifier.verify(user.publicKey, signature, "hex");

  if (isVerified) {
    user.verified = true;
    await user.save();
    return res.json({ message: "Identity verified successfully!" });
  } else {
    return res
      .status(401)
      .json({ message: "Verification failed. Invalid signature." });
  }
});

// API endpoint for checking verification status
app.get("/api/status/:publicKey", async (req, res) => {
  const { publicKey } = req.params;

  // Find user by public key
  const user = await User.findOne({ publicKey });
  if (!user) {
    return res.status(404).json({ message: "User not found." });
  }

  res.json({
    name: user.name,
    idNumber: user.idNumber,
    verified: user.verified,
    publicKey: user.publicKey,
  });
});
// Register User
app.post("/api/register", async (req, res) => {
  const { name, email, idNumber, publicKey } = req.body;
  const emailHash = web3.utils.sha3(email); // Hash email using Web3.js

  try {
    await identityContract.methods
      .registerUser(name, emailHash, idNumber)
      .send({ from: publicKey });
    res.send("User registered on the blockchain!");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to register user");
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
