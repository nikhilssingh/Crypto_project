import React, { useState } from "react";
import getContractInstance from "../contract";

const VerifierDashboard = () => {
  const [userAddress, setUserAddress] = useState("");
  const [dataHash, setDataHash] = useState("");
  const [isValid, setIsValid] = useState(null);

  const handleVerifyCredential = async () => {
    try {
      const { contractInstance } = await getContractInstance();
      const isValid = await contractInstance.methods.verifyCredential(userAddress, dataHash).call();
      setIsValid(isValid);
    } catch (error) {
      alert("Error verifying credential: " + error.message);
    }
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
        <button onClick={handleVerifyCredential}>Verify Credential</button>
        {isValid !== null && (
          <p>Credential is {isValid ? "valid" : "invalid"}</p>
        )}
      </div>
    </div>
  );
};

export default VerifierDashboard;
