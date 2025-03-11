import { ethers } from "ethers";
import { contractAddress, contractABI } from "../contract.config.js"; // Import contract details
import { Vote } from "../models/vote.model.js"; // MongoDB model

const N = 5; // Number of votes before submission

// Create an ethers.js contract instance
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache RPC URL
const wallet = new ethers.Wallet("0xa483c119781967918b902d7786d7eb7c215eaa8d897c3ed45631fc85fd296ac3", provider); // Replace with private key
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

export const checkAndSubmitVotes = async () => {
    try {
        const votes = await Vote.find(); // Get all stored votes

        if (votes.length >= N) {
            console.log("Threshold reached, submitting votes...");

            const voteData = votes.map(v => ({
                voter: v.voter,
                partyID: v.partyId,
                signature: v.signature
            }));

            console.log(voteData);
            
            // Send transaction to the smart contract
            const tx = await contract.submitVotes(voteData);
            await tx.wait();

            console.log("Votes submitted successfully:", tx.hash);

            // Clear votes after submission
            await Vote.deleteMany({});
        }
    } catch (error) {
        console.error("Error in checkAndSubmitVotes:", error);
    }
};
