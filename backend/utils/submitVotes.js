import { ethers, keccak256, solidityPacked } from "ethers";
import { contractAddress, contractABI } from "../contract.config.js"; // Import contract details
import { Vote } from "../models/vote.model.js"; // MongoDB model
import { MerkleTree } from "merkletreejs"; // Merkle Tree library
import axios from "axios"; // For HTTP requests
import { MerkleProof } from "../models/merkleproof.model.js"; // MongoDB model for Merkle proofs
import dotenv from "dotenv"; // For environment variables
dotenv.config(); // Load environment variables from .env file

const N = 2; // Number of votes before submission

// Pinata API key and secret from your Pinata account
const PINATA_API_KEY = process.env.PINATA_API_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;
const PINATA_PIN_URL = "https://api.pinata.cloud/pinning/pinJSONToIPFS"; // Pinata API endpoint

// Create an ethers.js contract instance
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache RPC URL
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); // Replace with private key
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

export const checkAndSubmitVotes = async () => {
    try {
        const votes = await Vote.find(); // Get all stored votes

        // Filter out invalid votes
        const validVotes = votes.filter(v => v.voter && v.partyId && v.signature);

        if (validVotes.length >= N) {
            console.log("Threshold reached, submitting votes...");

            const voteData = validVotes.map(v => ({
                voter: ethers.getAddress(v.voter), // Ensures a valid Ethereum address
                partyID: v.partyId,
                signature: ethers.getBytes(v.signature)
            }));

            console.log("Vote Data:", voteData);

            // Send transaction to the smart contract
            const tx = await contract.submitVotes(voteData, { gasLimit: 500000 });
            const receipt = await tx.wait();

            const iface = new ethers.Interface(contractABI);
            const valid = [];
            const invalid = [];

            for (const log of receipt.logs) {
                try {
                    const parsed = iface.parseLog(log);
                    if (parsed.name === "VoteSubmitted") {
                        valid.push({
                            voter: parsed.args.voter,
                            partyID: parsed.args.partyID.toString(),
                        });
                    } else if (parsed.name === "VoteSkipped") {
                        invalid.push({
                            voter: parsed.args.voter,
                            reason: parsed.args.reason,
                        });
                    }
                } catch (err) {
                    console.log(err);
                }
            }

            console.log("Valid Votes:", valid); // Log valid votes
            console.log("Invalid Votes:", invalid); // Log invalid votes

            console.log("Votes submitted successfully!\n Receipt: ", receipt);

            console.log("Votes submitted successfully:", tx.hash);

            // **Important Check:**
            // Only create Merkle Tree if we have valid votes after the threshold
            if (valid.length > 0) {
                // Generate Merkle Tree from valid votes
                const validVoteHashes = valid.map(vote =>
                    keccak256(solidityPacked(["address", "uint256"], [vote.voter, vote.partyID]))
                );

                const merkleTree = new MerkleTree(validVoteHashes, keccak256, { sortPairs: true });
                const merkleRoot = "0x" + merkleTree.getRoot().toString("hex");

                // ✅ Store Merkle Root on-chain and get its index
                const storeTx = await contract.storeMerkleRoot(merkleRoot);
                const storeReceipt = await storeTx.wait();
                const ifaceStore = new ethers.Interface(contractABI);

                let batchIndex = -1;
                const storeLog = storeReceipt.logs.find(log => {
                    try {
                        return ifaceStore.parseLog(log).name === "MerkleRootStored";
                    } catch { return false; }
                });

                const parsed = ifaceStore.parseLog(storeLog);
                batchIndex = Number(parsed.args.index);

                if (batchIndex === -1) throw new Error("Merkle root index not found");

                console.log("Merkle Root stored on-chain at index:", batchIndex);

                // Pin Merkle Root to IPFS using Pinata
                const voteMap = new Map(validVotes.map(v => [v.voter.toLowerCase(), v.signature]));

                const fullValidVotes = valid.map(vote => ({
                    voter: vote.voter,
                    partyID: vote.partyID,
                    signature: voteMap.get(vote.voter.toLowerCase())
                }));

                const metadata = {
                    merkleRoot,
                    validVotes: fullValidVotes,
                };


                const pinataPayload = {
                    pinataMetadata: {
                        name: "Voting Merkle Root",
                        keyvalues: {
                            description: "Merkle Root for valid votes in the e-voting system",
                        },
                    },
                    pinataContent: metadata,
                };

                const response = await axios.post(PINATA_PIN_URL, pinataPayload, {
                    headers: {
                        pinata_api_key: PINATA_API_KEY,
                        pinata_secret_api_key: PINATA_API_SECRET,
                    },
                });

                const ipfsHash = response.data.IpfsHash;
                console.log("Merkle Tree data pinned to IPFS with hash:", ipfsHash);

                // Generate and store Merkle proofs in MongoDB
                for (const vote of valid) {
                    const leaf = keccak256(solidityPacked(["address", "uint256"], [vote.voter, vote.partyID]));
                    const proof = merkleTree.getHexProof(leaf);

                    await MerkleProof.create({
                        voter: vote.voter,
                        batchIndex,
                        proof,
                        ipfsHash,
                    });
                }

                // Log the IPFS URL
                const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
                console.log("IPFS URL for the Merkle Root:", ipfsUrl);
            } else {
                console.log("No valid votes available to create Merkle Tree.");
            }

            // Clear votes after submission
            await Vote.deleteMany({});
        }
    } catch (error) {
        console.error("Error in checkAndSubmitVotes:", error);
    }
};
