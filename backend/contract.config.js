import dotenv from "dotenv";
dotenv.config();

export const contractAddress = "0xc34Aa17351dcDA7c612fF0BbCEFbE9f575648CeF"; // Replace with your deployed contract address
export const contractABI = [
    {
        "inputs": [],
        "stateMutability": "nonpayable",
        "type": "constructor"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "address",
                "name": "voter",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "partyID",
                "type": "uint256"
            }
        ],
        "name": "VoteSubmitted",
        "type": "event"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "name": "hasVoted",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [],
        "name": "owner",
        "outputs": [
            {
                "internalType": "address",
                "name": "",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "components": [
                    {
                        "internalType": "address",
                        "name": "voter",
                        "type": "address"
                    },
                    {
                        "internalType": "uint256",
                        "name": "partyID",
                        "type": "uint256"
                    },
                    {
                        "internalType": "bytes",
                        "name": "signature",
                        "type": "bytes"
                    }
                ],
                "internalType": "struct VotingContract.Vote[]",
                "name": "votes",
                "type": "tuple[]"
            }
        ],
        "name": "submitVotes",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

export const RPC_URL = "http://127.0.0.1:7545"; // Ganache RPC URL
export const PRIVATE_KEY = process.env.PRIVATE_KEY; // Use an environment variable for security
