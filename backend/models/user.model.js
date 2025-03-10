import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
    {
        rollNumber: {
            type: String,
            required: true,
            unique: true,
            match: /^\d{11}$/ // Ensure it's exactly 11 digits
        },
        phoneNumber: {
            type: String,
            required: true,
        },
        metamaskKey: {
            type: String,
            default: null, // Nullable for now
        },
        lastLogin: {
            type: Date,
            default: Date.now,
        }
    },
    { timestamps: true }
);

export const User = mongoose.model("User", userSchema);