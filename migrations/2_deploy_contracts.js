var Wager = artifacts.require("./Wager.sol");

module.exports = function(deployer) {
  deployer.deploy(Wager);
};
