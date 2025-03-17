import { ethers } from "ethers";
import { contractAddress, contractABI } from "../contract.config.js"; // Import contract details
import { Vote } from "../models/vote.model.js"; // MongoDB model

const N = 1; // Number of votes before submission

// Create an ethers.js contract instance
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache RPC URL
const wallet = new ethers.Wallet("0xbbdc30d314b5f255d762a3c35dfbbea6bd58f92a4f03da26a661babbb9285798", provider); // Replace with private key
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// console.log("Listening for VoteSubmitted events...");

// contract.on("VoteSubmitted", (voter, partyID, event) => {
//     console.log(`VoteSubmitted Event: Voter ${voter} voted for Party ${partyID}`);
//     console.log("🔗 Transaction Hash:", event.transactionHash);

// });

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

            console.log("Vote Data:", voteData);

            // Send transaction to the smart contract
            const tx = await contract.submitVotes(voteData, { gasLimit: 500000 });
            const receipt = await tx.wait();

            console.log("Votes submitted successfully!\n Receipt: ", receipt);

            console.log("Votes submitted successfully:", tx.hash);

            // Clear votes after submission
            await Vote.deleteMany({});
        }
    } catch (error) {
        console.error("Error in checkAndSubmitVotes:", error);
    }
};
