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
      const { contractInstance } = await getContractInstance();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      await contractInstance.methods.addIssuer(newIssuer).send({ from: accounts[0] });
      alert("Issuer added successfully!");
    } catch (error) {
      alert("Error adding issuer: " + error.message);
    }
  };

  const handleAddVerifier = async () => {
    try {
      const { contractInstance } = await getContractInstance();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      await contractInstance.methods.addVerifier(newVerifier).send({ from: accounts[0] });
      alert("Verifier added successfully!");
    } catch (error) {
      alert("Error adding verifier: " + error.message);
    }
  };

  const handleTransferAdmin = async () => {
    try {
      const { contractInstance } = await getContractInstance();
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });

      await contractInstance.methods.transferAdmin(newAdmin).send({ from: accounts[0] });
      alert("Admin rights transferred successfully!");
    } catch (error) {
      alert("Error transferring admin rights: " + error.message);
    }
  };

  const handleRegisterUser = async () => {
    try {
      const { web3, contractInstance } = await getContractInstance();
      const accounts = await web3.eth.getAccounts();

      // Hash the user's email using web3.utils
      const userEmailHash = web3.utils.sha3(userEmail);

      // Register user on the blockchain
      await contractInstance.methods.register(userEmailHash).send({ from: accounts[0] });

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
        alert(`Backend registration failed: ${errorData.message}`);
      }
    } catch (error) {
      alert("Error registering user: " + error.message);
    }
  };

  const goToIssuerDashboard = () => {
    navigate("/issuer"); // Navigate to Issuer Dashboard
  };

  return (
    <div>
      <h2>Admin Dashboard</h2>

      <div>
        <h3>Add Issuer</h3>
        <input
          type="text"
          placeholder="Issuer Address"
          value={newIssuer}
          onChange={(e) => setNewIssuer(e.target.value)}
        />
        <button onClick={handleAddIssuer}>Add Issuer</button>
      </div>

      <div>
        <h3>Add Verifier</h3>
        <input
          type="text"
          placeholder="Verifier Address"
          value={newVerifier}
          onChange={(e) => setNewVerifier(e.target.value)}
        />
        <button onClick={handleAddVerifier}>Add Verifier</button>
      </div>

      <div>
        <h3>Transfer Admin Rights</h3>
        <input
          type="text"
          placeholder="New Admin Address"
          value={newAdmin}
          onChange={(e) => setNewAdmin(e.target.value)}
        />
        <button onClick={handleTransferAdmin}>Transfer Admin</button>
      </div>

      <div>
        <h3>Register New User</h3>
        <input
          type="text"
          placeholder="User Name"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
        />
        <input
          type="email"
          placeholder="User Email"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
        />
        <input
          type="text"
          placeholder="User ID Number"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
        />
        <button onClick={handleRegisterUser}>Register User</button>
      </div>

      <div>
        <button onClick={goToIssuerDashboard} style={{ marginTop: "20px" }}>
          Go to Issuer Dashboard
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
