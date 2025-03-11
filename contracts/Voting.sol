// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingContract {
    struct Vote {
        address voter;
        uint256 partyID;
        bytes signature;
    }

    mapping(address => bool) public hasVoted;
    event VoteSubmitted(address indexed voter, uint256 partyID);
    address public owner;

    constructor() {
        owner = msg.sender;
    }

    function submitVotes(Vote[] memory votes) public {
        require(votes.length == 5, "Exactly 5 votes required");

        for (uint256 i = 0; i < votes.length; i++) {
            require(!hasVoted[votes[i].voter], "Already voted");
            
            // Verify signature
            bytes32 message = keccak256(abi.encodePacked(votes[i].voter, votes[i].partyID));
            bytes32 ethSignedMessageHash = prefixed(message);
            address signer = recoverSigner(ethSignedMessageHash, votes[i].signature);
            
            require(signer == votes[i].voter, "Invalid signature");

            hasVoted[votes[i].voter] = true;

            // Emit vote event
            emit VoteSubmitted(votes[i].voter, votes[i].partyID);
        }
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked("\x19Ethereum Signed Message:\n32", hash));
    }

    function recoverSigner(bytes32 message, bytes memory sig) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);
        return ecrecover(message, v, r, s);
    }

    function splitSignature(bytes memory sig) internal pure returns (uint8, bytes32, bytes32) {
        require(sig.length == 65, "Invalid signature length");
        bytes32 r;
        bytes32 s;
        uint8 v;
        assembly {
            r := mload(add(sig, 32))
            s := mload(add(sig, 64))
            v := byte(0, mload(add(sig, 96)))
        }
        return (v, r, s);
    }
}
