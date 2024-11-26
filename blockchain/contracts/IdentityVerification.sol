// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract IdentityVerification {
    // Struct for user credentials
    struct Credential {
        string dataHash;
        address issuer;
        bool valid;
    }

    // Mappings
    mapping(address => string) public userRecords; // User data mapping
    mapping(address => mapping(string => Credential)) public credentials; // User credentials mapping
    mapping(address => bool) private registeredUsers;

    // Role-based access control
    address public admin;
    mapping(address => bool) public issuers;
    mapping(address => bool) public verifiers;

    // Events
    event UserRegistered(address indexed user, string hashedData);
    event CredentialIssued(address indexed user, string dataHash, address issuer);
    event CredentialRevoked(address indexed user, string dataHash, address issuer);

    // Constructor to set the admin
    constructor() {
        admin = msg.sender;
    }

    // Modifiers for access control
    modifier onlyAdmin() {
        require(msg.sender == admin, "Access Denied: Only admin can perform this action.");
        _;
    }

    modifier onlyIssuer() {
        require(issuers[msg.sender], "Access Denied: Only an issuer can perform this action.");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Access Denied: Only a verifier can perform this action.");
        _;
    }

    // Admin functions
    function addIssuer(address issuer) public onlyAdmin {
        require(!issuers[issuer], "Issuer already exists.");
        issuers[issuer] = true;
    }

    function addVerifier(address verifier) public onlyAdmin {
        require(!verifiers[verifier], "Verifier already exists.");
        verifiers[verifier] = true;
    }

    function removeIssuer(address issuer) public onlyAdmin {
        issuers[issuer] = false;
    }

    function removeVerifier(address verifier) public onlyAdmin {
        verifiers[verifier] = false;
    }

    // Admin function to transfer admin role
    function transferAdmin(address newAdmin) public onlyAdmin {
        require(newAdmin != address(0), "New admin address cannot be zero.");
        admin = newAdmin;
    }

    // User registration
    function register(string memory hashedData) public {
    require(!registeredUsers[msg.sender], "User already registered");
    registeredUsers[msg.sender] = true;
    userRecords[msg.sender] = hashedData;
    emit UserRegistered(msg.sender, hashedData);
}


    // Retrieve registration status
    function isUserRegistered(address user) public view returns (bool) {
        return registeredUsers[user];
    }

    // Issuer functions
    function issueCredential(address user, string memory dataHash) public onlyIssuer {
        require(bytes(userRecords[user]).length != 0, "Issue Error: User not registered.");
        Credential storage credential = credentials[user][dataHash];
        require(!credential.valid, "Issue Error: Credential already exists.");
        credential.dataHash = dataHash;
        credential.issuer = msg.sender;
        credential.valid = true;
        emit CredentialIssued(user, dataHash, msg.sender);
    }

    // Revoke credential
    function revokeCredential(address user, string memory dataHash) public {
        Credential storage credential = credentials[user][dataHash];
        require(credential.valid, "Revoke Error: Credential does not exist or already revoked.");
        require(
            credential.issuer == msg.sender || msg.sender == admin,
            "Revoke Error: Only the issuer or admin can revoke this credential."
        );
        credential.valid = false;
        emit CredentialRevoked(user, dataHash, msg.sender);
    }

    // Verifier function to verify credential
    function verifyCredential(address user, string memory dataHash) public view onlyVerifier returns (bool) {
        Credential storage credential = credentials[user][dataHash];
        require(bytes(userRecords[user]).length != 0, "Verification Error: User not registered.");
        return credential.valid;
    }

    // Retrieve user credentials
    function getCredential(address user, string memory dataHash) public view returns (Credential memory) {
        return credentials[user][dataHash];
    }
}
