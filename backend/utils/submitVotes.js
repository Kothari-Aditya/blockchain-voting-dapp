import { ethers } from "ethers";
import { contractAddress, contractABI } from "../contract.config.js"; // Import contract details
import { Vote } from "../models/vote.model.js"; // MongoDB model

const N = 5; // Number of votes before submission

// Create an ethers.js contract instance
const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545"); // Ganache RPC URL
const wallet = new ethers.Wallet("0xcdeb7cc84d42a691bac60eefbbd79c0571c01022ec6f2f05268d0988efd5e838", provider); // Replace with private key
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// console.log("Listening for VoteSubmitted events...");

// contract.on("VoteSubmitted", (voter, partyID, event) => {
//     console.log(`VoteSubmitted Event: Voter ${voter} voted for Party ${partyID}`);
//     console.log("🔗 Transaction Hash:", event.transactionHash);

// });

export const checkAndSubmitVotes = async () => {
    try {
        const votes = await Vote.find(); // Get all stored votes
        console.log("Fetched votes from DB:", votes);

        // Filter out invalid votes
        const validVotes = votes.filter(v => v.voter && v.partyId && v.signature);
        console.log("Valid votes only:", validVotes);

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

            console.log("Votes submitted successfully!\n Receipt: ", receipt);

            console.log("Votes submitted successfully:", tx.hash);

            // Clear votes after submission
            await Vote.deleteMany({});
        }
    } catch (error) {
        console.error("Error in checkAndSubmitVotes:", error);
    }
};
