// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract VotingContract {
    struct Vote {
        address voter;
        uint256 partyID;
        bytes signature;
    }

    mapping(address => bool) public hasVoted;
    address public owner;
    bytes32[] public merkleRoots; // Array to store Merkle roots

    event VoteSubmitted(address voter, uint256 partyID);
    event MerkleRootStored(uint256 indexed index, bytes32 merkleRoot);

    constructor() {
        owner = msg.sender;
    }

    function submitVotes(Vote[] memory votes) public {
        for (uint256 i = 0; i < votes.length; i++) {
            if (hasVoted[votes[i].voter]) {
                continue; // Skip to the next iteration
            }

            // Verify signature
            bytes32 message = keccak256(
                abi.encodePacked(votes[i].voter, votes[i].partyID)
            );
            bytes32 ethSignedMessageHash = prefixed(message);
            address signer = recoverSigner(
                ethSignedMessageHash,
                votes[i].signature
            );

            if (signer != votes[i].voter) {
                continue; // Skip to the next iteration
            }

            hasVoted[votes[i].voter] = true;

            // Emit vote event
            emit VoteSubmitted(signer, votes[i].partyID);
        }
    }

    function storeMerkleRoot(bytes32 root) external returns (uint256) {
        require(msg.sender == owner, "Only owner can store Merkle roots");
        merkleRoots.push(root);
        uint256 index = merkleRoots.length - 1;
        emit MerkleRootStored(index, root);
        return index;
    }

    function getMerkleRoot(uint256 index) external view returns (bytes32) {
        require(index < merkleRoots.length, "Index out of bounds");
        return merkleRoots[index];
    }

    function prefixed(bytes32 hash) internal pure returns (bytes32) {
        return
            keccak256(
                abi.encodePacked("\x19Ethereum Signed Message:\n32", hash)
            );
    }

    function recoverSigner(
        bytes32 message,
        bytes memory sig
    ) internal pure returns (address) {
        (uint8 v, bytes32 r, bytes32 s) = splitSignature(sig);
        return ecrecover(message, v, r, s);
    }

    function splitSignature(
        bytes memory sig
    ) internal pure returns (uint8, bytes32, bytes32) {
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
