// Test to simulate client side interactions
// Mocha and chi are used as testing suits
// Can be written in sol but fairly new

// Run using truffle test

var Wager = artifacts.require("./Wager.sol");

var Wager = artifacts.require("./Wager.sol");

contract("Wager", function(accounts) {
  var WagerInstance;

  it("initializes with two teams", function() {
    return Wager.deployed().then(function(instance) {
      return instance.teamsCount();
    }).then(function(count) {
      assert.equal(count, 2);
    });
  });

  it("it initializes the teams with the correct values", function() {
    return Wager.deployed().then(function(instance) {
      WagerInstance = instance;
      return WagerInstance.teams(1);
    }).then(function(team) {
      assert.equal(team[0], 1, "contains the correct id");
      assert.equal(team[1], "Seahawks", "contains the correct name");
      assert.equal(team[2], 0, "contains the correct picks count");
      return WagerInstance.teams(2);
    }).then(function(team) {
      assert.equal(team[0], 2, "contains the correct id");
      assert.equal(team[1], "Patriots", "contains the correct name");
      assert.equal(team[2], 0, "contains the correct picks count");
    });
  });

  it("allows a player to cast a pick", function() {
    return Wager.deployed().then(function(instance) {
      WagerInstance = instance;
      teamId = 1;
      return WagerInstance.pick(teamId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, "an event was triggered");
      assert.equal(receipt.logs[0].event, "pickEvent", "the event type is correct");
      //assert.equal(receipt.logs[0].args._teamId.toNumber(), teamId, "the team id is correct");
      return WagerInstance.players(accounts[0]);
    }).then(function(pick) {
      assert(pick, "the player has made a pick");
      return WagerInstance.teams(teamId);
    }).then(function(team) {
      var pickCount = team[2];
      assert.equal(pickCount, 1, "increments the team's pick count");
    })
  });

  it("throws an exception for invalid teams", function() {
    return Wager.deployed().then(function(instance) {
      WagerInstance = instance;
      return WagerInstance.pick(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, "error message must contain revert");
      return WagerInstance.teams(1);
    }).then(function(team1) {
      var pickCount = team1[2];
      assert.equal(pickCount, 1, "team 1 did not receive any picks");
      return WagerInstance.teams(2);
    }).then(function(team2) {
      var pickCount = team2[2];
      assert.equal(pickCount, 0, "team 2 did not receive any picks");
    });
  });
});
