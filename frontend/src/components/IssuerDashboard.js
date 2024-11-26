import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";
import getContractInstance from "../contract";

const IssuerDashboard = () => {
  const [userAddress, setUserAddress] = useState("");
  const [credentialDetails, setCredentialDetails] = useState("");
  const [dataHash, setDataHash] = useState("");
  const [revokeUserAddress, setRevokeUserAddress] = useState("");
  const [revokeDataHash, setRevokeDataHash] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const web3 = new Web3(window.ethereum);

  const handleIssueCredential = async () => {
    try {
      if (!userAddress || !credentialDetails) {
        alert("Please provide both User Address and Credential Details!");
        return;
      }
      setIsLoading(true);

      const { contractInstance } = await getContractInstance();
      const accounts = await web3.eth.requestAccounts();
      const issuerAddress = accounts[0];

      if (!web3.utils.isAddress(userAddress)) {
        throw new Error("Invalid Ethereum address.");
      }

      const dataToHash = `${userAddress}|${credentialDetails}|${issuerAddress}`;
      const generatedHash = web3.utils.sha3(dataToHash);
      setDataHash(generatedHash);

      await contractInstance.methods
        .issueCredential(userAddress, generatedHash)
        .send({ from: issuerAddress, gas: 3000000 });

      alert("Credential issued successfully!");
      setUserAddress("");
      setCredentialDetails("");
    } catch (error) {
      console.error("Error issuing credential:", error);
      alert("Error issuing credential: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeCredential = async () => {
    try {
      if (!revokeUserAddress || !revokeDataHash) {
        alert("Please provide both User Address and Data Hash for revocation!");
        return;
      }
      setIsLoading(true);

      const { contractInstance } = await getContractInstance();
      const accounts = await web3.eth.requestAccounts();
      const issuerAddress = accounts[0];

      if (!web3.utils.isAddress(revokeUserAddress)) {
        throw new Error("Invalid Ethereum address.");
      }

      await contractInstance.methods
        .revokeCredential(revokeUserAddress, revokeDataHash)
        .send({ from: issuerAddress, gas: 3000000 });

      alert("Credential revoked successfully!");
      setRevokeUserAddress("");
      setRevokeDataHash("");
    } catch (error) {
      console.error("Error revoking credential:", error);
      alert("Error revoking credential: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const goToNextPage = () => {
    navigate("/verifier"); // Replace with the actual route
  };

  return (
    <div>
      <h2>Issuer Dashboard</h2>
      <div>
        <h3>Issue Credential</h3>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Credential Details"
          value={credentialDetails}
          onChange={(e) => setCredentialDetails(e.target.value)}
        />
        <button onClick={handleIssueCredential} disabled={isLoading}>
          {isLoading ? "Processing..." : "Issue Credential"}
        </button>
        {dataHash && (
          <div>
            <h4>Generated Data Hash:</h4>
            <textarea readOnly value={dataHash}></textarea>
          </div>
        )}
      </div>

      <div>
        <h3>Revoke Credential</h3>
        <input
          type="text"
          placeholder="User Address"
          value={revokeUserAddress}
          onChange={(e) => setRevokeUserAddress(e.target.value)}
        />
        <input
          type="text"
          placeholder="Data Hash"
          value={revokeDataHash}
          onChange={(e) => setRevokeDataHash(e.target.value)}
        />
        <button onClick={handleRevokeCredential} disabled={isLoading}>
          {isLoading ? "Processing..." : "Revoke Credential"}
        </button>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button onClick={goToNextPage}>Go to Verifier Dashboard</button>
      </div>
    </div>
  );
};

export default IssuerDashboard;
