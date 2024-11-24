import React, { useState } from "react";
import Web3 from "web3"; // Import Web3
import { useNavigate } from "react-router-dom";
import getContractInstance from "../contract";

const IssuerDashboard = () => {
  const [issueUserAddress, setIssueUserAddress] = useState("");
  const [issueDataHash, setIssueDataHash] = useState("");
  const [revokeUserAddress, setRevokeUserAddress] = useState("");
  const [revokeDataHash, setRevokeDataHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const web3 = new Web3(window.ethereum); // Initialize Web3 instance

  const handleIssueCredential = async () => {
    try {
      if (!issueUserAddress || !issueDataHash) {
        alert("Please fill in both User Address and Data Hash!");
        return;
      }
      setIsLoading(true);

      const { contractInstance } = await getContractInstance();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      // Validate Ethereum address using web3.utils.isAddress
      if (!web3.utils.isAddress(issueUserAddress)) {
        throw new Error("Invalid Ethereum address");
      }

      await contractInstance.methods
        .issueCredential(issueUserAddress, issueDataHash)
        .send({ from: accounts[0] });

      alert("Credential issued successfully!");
      setIssueUserAddress("");
      setIssueDataHash("");
    } catch (error) {
      console.error("Error issuing credential:", error);
      alert("Error issuing credential: " + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  // Similar changes for handleRevokeCredential
  const handleRevokeCredential = async () => {
    try {
      if (!revokeUserAddress || !revokeDataHash) {
        alert("Please fill in both User Address and Data Hash!");
        return;
      }
      setIsLoading(true);

      const { contractInstance } = await getContractInstance();
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!web3.utils.isAddress(revokeUserAddress)) {
        throw new Error("Invalid Ethereum address");
      }

      await contractInstance.methods
        .revokeCredential(revokeUserAddress, revokeDataHash)
        .send({ from: accounts[0] });

      alert("Credential revoked successfully!");
      setRevokeUserAddress("");
      setRevokeDataHash("");
    } catch (error) {
      console.error("Error revoking credential:", error);
      alert("Error revoking credential: " + (error.message || error));
    } finally {
      setIsLoading(false);
    }
  };

  // Rest of your component code

  const goToVerifierDashboard = () => {
    navigate("/verifier");
  };

  return (
    <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <h2>Issuer Dashboard</h2>

      {/* Issue Credential Section */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>Issue Credential</h3>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="User Address"
            value={issueUserAddress}
            onChange={(e) => setIssueUserAddress(e.target.value)}
            style={{
              width: "400px",
              padding: "8px",
              marginBottom: "10px",
              display: "block",
            }}
          />
          <input
            type="text"
            placeholder="Data Hash"
            value={issueDataHash}
            onChange={(e) => setIssueDataHash(e.target.value)}
            style={{
              width: "400px",
              padding: "8px",
              marginBottom: "10px",
              display: "block",
            }}
          />
          <button
            onClick={handleIssueCredential}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Processing..." : "Issue Credential"}
          </button>
        </div>
      </div>

      {/* Revoke Credential Section */}
      <div
        style={{
          marginBottom: "30px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "5px",
        }}
      >
        <h3>Revoke Credential</h3>
        <div style={{ marginBottom: "10px" }}>
          <input
            type="text"
            placeholder="User Address"
            value={revokeUserAddress}
            onChange={(e) => setRevokeUserAddress(e.target.value)}
            style={{
              width: "400px",
              padding: "8px",
              marginBottom: "10px",
              display: "block",
            }}
          />
          <input
            type="text"
            placeholder="Data Hash"
            value={revokeDataHash}
            onChange={(e) => setRevokeDataHash(e.target.value)}
            style={{
              width: "400px",
              padding: "8px",
              marginBottom: "10px",
              display: "block",
            }}
          />
          <button
            onClick={handleRevokeCredential}
            disabled={isLoading}
            style={{
              padding: "8px 16px",
              backgroundColor: "#f44336",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Processing..." : "Revoke Credential"}
          </button>
        </div>
      </div>

      {/* Navigation Button */}
      <div>
        <button
          onClick={goToVerifierDashboard}
          style={{
            marginTop: "20px",
            backgroundColor: "#007BFF",
            color: "white",
            border: "none",
            padding: "10px 20px",
            borderRadius: "4px",
            cursor: "pointer",
          }}
        >
          Go to Verifier Dashboard
        </button>
      </div>
    </div>
  );
};

export default IssuerDashboard;
