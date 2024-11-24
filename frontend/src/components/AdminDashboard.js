import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // For navigation
import getContractInstance from "../contract";
import { API_URL } from "../config";

const AdminDashboard = () => {
  const [newIssuer, setNewIssuer] = useState("");
  const [newVerifier, setNewVerifier] = useState("");
  const [newAdmin, setNewAdmin] = useState("");
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userId, setUserId] = useState("");

  const navigate = useNavigate(); // Navigation hook

  const handleAddIssuer = async () => {
    try {
      console.log("Adding Issuer:", newIssuer);
      const { contractInstance } = await getContractInstance();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      await contractInstance.methods.addIssuer(newIssuer).send({ from: accounts[0] });
      alert("Issuer added successfully!");
    } catch (error) {
      console.error("Error adding issuer:", error);
      alert("Error adding issuer: " + (error.message || error));
    }
  };

  const handleAddVerifier = async () => {
    try {
      console.log("Adding Verifier:", newVerifier);
      const { contractInstance } = await getContractInstance();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      await contractInstance.methods.addVerifier(newVerifier).send({ from: accounts[0] });
      alert("Verifier added successfully!");
    } catch (error) {
      console.error("Error adding verifier:", error);
      alert("Error adding verifier: " + (error.message || error));
    }
  };

  const handleTransferAdmin = async () => {
    try {
      console.log("Transferring Admin Rights to:", newAdmin);
      const { contractInstance } = await getContractInstance();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      await contractInstance.methods.transferAdmin(newAdmin).send({ from: accounts[0] });
      alert("Admin rights transferred successfully!");
    } catch (error) {
      console.error("Error transferring admin rights:", error);
      alert("Error transferring admin rights: " + (error.message || error));
    }
  };

  const handleRegisterUser = async () => {
    try {
      console.log("Registering User:", { userName, userEmail, userId });
      const { web3, contractInstance } = await getContractInstance();
      const accounts = await web3.eth.getAccounts();

      // Hash the user's email using web3.utils
      const userEmailHash = web3.utils.sha3(userEmail);

      console.log("Registering on blockchain with email hash:", userEmailHash);

      // Register user on the blockchain
      await contractInstance.methods.register(userEmailHash).send({ from: accounts[0] });
      console.log("User successfully registered on blockchain");

      // Save user details in the backend
      const response = await fetch(`${API_URL}/api/register/blockchain`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: userName, email: userEmail, idNumber: userId }),
      });

      if (response.ok) {
        alert("User registered successfully in blockchain and backend!");
      } else {
        const errorData = await response.json();
        console.error("Backend registration error:", errorData);
        alert(`Backend registration failed: ${errorData.message}`);
      }
    } catch (error) {
      console.error("Error registering user:", error);
      alert("Error registering user: " + (error.message || error));
    }
  };

  const goToIssuerDashboard = () => {
    console.log("Navigating to Issuer Dashboard");
    navigate("/issuer"); // Navigate to Issuer Dashboard
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Add Issuer</h3>
        <input
          type="text"
          placeholder="Issuer Address"
          value={newIssuer}
          onChange={(e) => setNewIssuer(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleAddIssuer}>Add Issuer</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Add Verifier</h3>
        <input
          type="text"
          placeholder="Verifier Address"
          value={newVerifier}
          onChange={(e) => setNewVerifier(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleAddVerifier}>Add Verifier</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Transfer Admin Rights</h3>
        <input
          type="text"
          placeholder="New Admin Address"
          value={newAdmin}
          onChange={(e) => setNewAdmin(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleTransferAdmin}>Transfer Admin</button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Register New User</h3>
        <input
          type="text"
          placeholder="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="email"
          placeholder="User Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <input
          type="text"
          placeholder="User ID Number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          style={{ marginRight: "10px" }}
        />
        <button onClick={handleRegisterUser}>Register User</button>
      </div>

      <div>
        <button
          onClick={goToIssuerDashboard}
          style={{
            marginTop: "20px",
            backgroundColor: "#007BFF",
            color: "#FFF",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Go to Issuer Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
