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
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier onlyIssuer() {
        require(issuers[msg.sender], "Only an issuer can perform this action");
        _;
    }

    modifier onlyVerifier() {
        require(verifiers[msg.sender], "Only a verifier can perform this action");
        _;
    }

    // Admin functions
    function addIssuer(address issuer) public onlyAdmin {
        issuers[issuer] = true;
    }

    function addVerifier(address verifier) public onlyAdmin {
        verifiers[verifier] = true;
    }

    function removeIssuer(address issuer) public onlyAdmin {
        issuers[issuer] = false;
    }

    function removeVerifier(address verifier) public onlyAdmin {
        verifiers[verifier] = false;
    }

    // User registration
    function register(string memory hashedData) public {
        require(bytes(userRecords[msg.sender]).length == 0, "User already registered");
        userRecords[msg.sender] = hashedData;
        emit UserRegistered(msg.sender, hashedData);
    }

    // Issuer functions
    function issueCredential(address user, string memory dataHash) public onlyIssuer {
        require(bytes(userRecords[user]).length != 0, "User not registered");
        Credential storage credential = credentials[user][dataHash];
        require(!credential.valid, "Credential already exists");
        credential.dataHash = dataHash;
        credential.issuer = msg.sender;
        credential.valid = true;
        emit CredentialIssued(user, dataHash, msg.sender);
    }

    // Revoke credential
    function revokeCredential(address user, string memory dataHash) public onlyIssuer {
        Credential storage credential = credentials[user][dataHash];
        require(credential.valid, "Credential does not exist or already revoked");
        require(credential.issuer == msg.sender, "Only the issuer can revoke this credential");
        credential.valid = false;
        emit CredentialRevoked(user, dataHash, msg.sender);
    }

    // Verifier function to verify credential
    function verifyCredential(address user, string memory dataHash) public view onlyVerifier returns (bool) {
        Credential storage credential = credentials[user][dataHash];
        return credential.valid;
    }

    // Admin function to transfer admin role
    function transferAdmin(address newAdmin) public onlyAdmin {
        admin = newAdmin;
    }
}
