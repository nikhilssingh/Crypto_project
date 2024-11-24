const IdentityVerification = artifacts.require("IdentityVerification");

module.exports = function (deployer) {
    deployer.deploy(IdentityVerification);
};
