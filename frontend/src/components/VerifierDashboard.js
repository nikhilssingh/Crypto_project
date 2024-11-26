import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import getContractInstance from "../contract";

const VerifierDashboard = () => {
  const [userAddress, setUserAddress] = useState("");
  const [dataHash, setDataHash] = useState("");
  const [verificationResult, setVerificationResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const web3 = new Web3(window.ethereum);

  const handleVerifyCredential = async () => {
    try {
      if (!userAddress || !dataHash) {
        alert("Please provide both User Address and Data Hash for verification!");
        return;
      }
      setIsLoading(true);

      const { contractInstance } = await getContractInstance();

      if (!web3.utils.isAddress(userAddress)) {
        throw new Error("Invalid Ethereum address.");
      }

      const isValid = await contractInstance.methods
        .verifyCredential(userAddress, dataHash)
        .call();

      setVerificationResult(isValid ? "Valid Credential" : "Invalid Credential");
    } catch (error) {
      console.error("Error verifying credential:", error);
      alert("Error verifying credential: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextPage = () => {
    navigate("/admin"); // Replace with the actual route
  };

  return (
    <div>
      <h2>Verifier Dashboard</h2>
      <div>
        <h3>Verify Credential</h3>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Data Hash"
          value={dataHash}
          onChange={(e) => setDataHash(e.target.value)}
        />
        <button onClick={handleVerifyCredential} disabled={isLoading}>
          {isLoading ? "Processing..." : "Verify Credential"}
        </button>
        {verificationResult && (
          <div>
            <h4>Verification Result:</h4>
            <textarea readOnly value={verificationResult}></textarea>
          </div>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={goToNextPage}>Go back to Admin Dashboard</button>
      </div>
    </div>
  );
};

export default VerifierDashboard;
