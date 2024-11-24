import React, { useState } from "react";
import getContractInstance from "../contract";

const VerifierDashboard = () => {
  const [userAddress, setUserAddress] = useState("");
  const [dataHash, setDataHash] = useState("");
  const [isValid, setIsValid] = useState(null);

  const handleVerifyCredential = async () => {
    try {
      console.log("Starting credential verification...");
      console.log("User Address:", userAddress);
      console.log("Data Hash:", dataHash);

      // Input validation
      if (!userAddress || !dataHash) {
        alert("Both User Address and Data Hash are required!");
        return;
      }

      const { contractInstance, userAddress: verifierAddress } = await getContractInstance();

      // Log verifier address
      console.log("Verifier Address:", verifierAddress);

      // Ensure the caller is a registered verifier
      const isVerifier = await contractInstance.methods.verifiers(verifierAddress).call();
      console.log("Is verifier:", isVerifier);

      if (!isVerifier) {
        alert("The current account is not a registered verifier.");
        return;
      }

      // Check if credential exists for the user
      const credential = await contractInstance.methods.credentials(userAddress, dataHash).call();
      console.log("Credential Data:", credential);

      if (!credential.valid) {
        alert("The credential does not exist or is invalid.");
        return;
      }

      // Verify the credential
      const isValid = await contractInstance.methods
        .verifyCredential(userAddress, dataHash)
        .call({ from: verifierAddress, gas: 3000000 });

      console.log("Verification Result:", isValid);
      setIsValid(isValid);
    } catch (error) {
      console.error("Error verifying credential:", error);
      alert("Error verifying credential: " + (error.message || error));
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Verifier Dashboard</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Verify Credential</h3>
        <input
          type="text"
          placeholder="User Address"
          value={userAddress}
          onChange={(e) => setUserAddress(e.target.value)}
          style={{ marginRight: "10px", padding: "5px", width: "300px" }}
        />
        <input
          type="text"
          placeholder="Data Hash"
          value={dataHash}
          onChange={(e) => setDataHash(e.target.value)}
          style={{ marginRight: "10px", padding: "5px", width: "300px" }}
        />
        <button
          onClick={handleVerifyCredential}
          style={{
            backgroundColor: "#007BFF",
            color: "#FFF",
            border: "none",
            padding: "10px 20px",
            cursor: "pointer",
          }}
        >
          Verify Credential
        </button>
      </div>

      {isValid !== null && (
        <div>
          <p style={{ fontWeight: "bold" }}>
            Credential is {isValid ? "valid ✅" : "invalid ❌"}
          </p>
        </div>
      )}
    </div>
  );
};

export default VerifierDashboard;
