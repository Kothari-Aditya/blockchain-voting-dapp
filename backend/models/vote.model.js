import mongoose from "mongoose";

const voteSchema = new mongoose.Schema({
  voter: {
    type: String,
    required: true,
    unique: true, // Ensures one vote per user
  },
  partyId: {
    type: Number,
    required: true,
  },
  signature: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now, // Automatically store voting time
  },
});

export const Vote = mongoose.model("Vote", voteSchema);
