import mongoose from "mongoose";

const MerkleProofSchema = new mongoose.Schema({
  voter: {
    type: String,
    required: true,
    unique: true, // One entry per voter
  },
  proof: {
    type: [String], // Array of hex strings representing the Merkle proof
    required: true,
  },
  batchIndex: {
    type: Number, // Corresponds to the index of the Merkle root stored on-chain
    required: true,
  },
  ipfsHash: {
    type: String,
    required: true,
  },
}, { timestamps: true });

export const MerkleProof = mongoose.model("MerkleProof", MerkleProofSchema);
