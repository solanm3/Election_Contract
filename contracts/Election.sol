pragma solidity ^0.5.0;

/*
  *  web3.eth.getAccounts().then(function(acc) { account = acc; }) - this gets all the accounts
  *  Allows you to call account[0] for first accounts
  *  app.vote(1, {from: account[0]}) - will cast vote to candidate 1 from account 0
*/

contract Election {
    // Model candidate

    /*
    * Can't access this vars using id, name, voteCount
    * Must us position in function
    * ex candidate[1] will return id
    * candidate[0].toNumber will return int
    */
    struct Candidate {
      uint id;
      string name;
      uint voteCount;
    }
    // Store users who have voted
    mapping(address => bool) public voters;

    // Store candidate
    // Fetch Candidate
    /*
    * Keeps list of candidates
    */
    mapping(uint => Candidate) public candidates;
    // Store candidate count
    // Fetches all possible candidates from mapping
    uint public candidatesCount;

    //voted event
    event votedEvent (
      uint indexed _candidateID
    );

    // Constructor
    constructor() public {
      addCandidate("Candidate 1");
      addCandidate("Candidate 2");
    }

    // private means no one but the contract can addCandidate
    function addCandidate (string memory _name) private {
        candidatesCount ++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
    }

    // Sol allows metadata to also be passed to function
    function vote (uint _candidateID) public{
      // Check if acc voted before
      require(!voters[msg.sender]); // require this acc hasnt voted yet, else stopped

      // Check valid candidate
      require(_candidateID > 0 && _candidateID <= candidatesCount);

      //Record that voter has voted (only allowed once)
      voters[msg.sender] = true;  // Ref voters mapping and setting val to T

      //Update candidate vote count
      candidates[_candidateID].voteCount ++; //Ref candidates mapping and inc count
      emit votedEvent(_candidateID);
    }
}
