import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; // Import navigation
import getContractInstance from "../contract";

const IssuerDashboard = () => {
  const [userAddress, setUserAddress] = useState("");
  const [dataHash, setDataHash] = useState("");

  const navigate = useNavigate(); // For navigating to VerifierDashboard

  const handleIssueCredential = async () => {
    try {
      const { contractInstance, userAddress: issuerAddress } = await getContractInstance();
      await contractInstance.methods.issueCredential(userAddress, dataHash).send({ from: issuerAddress });
      alert("Credential issued successfully!");
    } catch (error) {
      alert("Error issuing credential: " + error.message);
    }
  };

  const handleRevokeCredential = async () => {
    try {
      const { contractInstance, userAddress: issuerAddress } = await getContractInstance();
      await contractInstance.methods.revokeCredential(userAddress, dataHash).send({ from: issuerAddress });
      alert("Credential revoked successfully!");
    } catch (error) {
      alert("Error revoking credential: " + error.message);
    }
  };

  const goToVerifierDashboard = () => {
    navigate("/verifier"); // Navigate to VerifierDashboard
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
          placeholder="Data Hash"
          value={dataHash}
          onChange={(e) => setDataHash(e.target.value)}
        />
        <button onClick={handleIssueCredential}>Issue Credential</button>
      </div>
      <div>
        <h3>Revoke Credential</h3>
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
        <button onClick={handleRevokeCredential}>Revoke Credential</button>
      </div>
      <div>
        <button onClick={goToVerifierDashboard} style={{ marginTop: "20px" }}>
          Go to Verifier Dashboard
        </button>
      </div>
    </div>
  );
};

export default IssuerDashboard;
