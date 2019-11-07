App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasPicked: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
      // TODO: refactor conditional
      if (typeof web3 !== 'undefined') {
        // If a web3 instance is already provided by Meta Mask.
        App.web3Provider = web3.currentProvider;
        ethereum.enable();
        web3 = new Web3(web3.currentProvider);
      } else {
        // Specify default instance if no web3 instance provided
        App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
        ethereum.enable();
        web3 = new Web3(App.web3Provider);
      }
      return App.initContract();
    },

    initContract: function() {
      $.getJSON("Wager.json", function(Wager) {
        // Instantiate a new truffle contract from the artifact
        App.contracts.Wager = TruffleContract(Wager);
        // Connect provider to interact with contract
        App.contracts.Wager.setProvider(App.web3Provider);

        App.listenForEvents();

        return App.render();
      });
    },

    // Listen for events emitted from the contract
    listenForEvents: function() {
      App.contracts.Wager.deployed().then(function(instance) {
        // Restart Chrome if you are unable to receive this event
        // This is a known issue with Metamask
        // https://github.com/MetaMask/metamask-extension/issues/2393
        instance.pickEvent({}, {
          fromBlock: 0,
          toBlock: 'latest'
        }).watch(function(error, event) {
          console.log("event triggered", event)
          // Reload when a new pick is recorded
          App.render();
        });
      });
    },

    render: function() {
      var WagerInstance;
      var loader = $("#loader");
      var content = $("#content");

      loader.show();
      content.hide();

      // Load account data
      web3.eth.getCoinbase(function(err, account) {
        if (err === null) {
          App.account = account;
          $("#accountAddress").html("Your Account: " + account);
        }
      });

      // Load contract data
      App.contracts.Wager.deployed().then(function(instance) {
        WagerInstance = instance;
        return WagerInstance.teamsCount();
      }).then(function(teamsCount) {
        var teamsResults = $("#teamsResults");
        teamsResults.empty();

        var teamsSelect = $('#teamsSelect');
        teamsSelect.empty();

        for (var i = 1; i <= teamsCount; i++) {
          WagerInstance.teams(i).then(function(team) {
            var id = team[0];
            var name = team[1];
            var pickCount = team[2];

            // Render team Result
            var teamTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + pickCount + "</td></tr>"
            teamsResults.append(teamTemplate);

            // Render team ballot option
            var teamOption = "<option value='" + id + "' >" + name + "</ option>"
            teamsSelect.append(teamOption);
          });
        }
        return WagerInstance.players(App.account);
      }).then(function(hasPicked) {
        // Do not allow a user to pick (*** changed to show)
        if(hasPicked) {
          $('form').show();
        }
        loader.hide();
        content.show();
      }).catch(function(error) {
        console.warn(error);
      });
    },

    castpick: function() {
      var teamId = $('#teamsSelect').val();
      App.contracts.Wager.deployed().then(function(instance) {
        return instance.pick(teamId, { from: App.account });
      }).then(function(result) {
        // Wait for picks to update
        $("#content").hide();
        $("#loader").show();
      }).catch(function(err) {
        console.error(err);
      });
    }
  };

  $(function() {
    $(window).load(function() {
      App.init();
    });
  });
