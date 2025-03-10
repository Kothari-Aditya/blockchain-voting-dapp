import mongoose from "mongoose";

const otpSchema = new mongoose.Schema(
    {
        rollNumber: {
            type: String,
            required: true,
        },
        otp: {
            type: String,
            required: true,
        },
        expiresAt: {
            type: Date,
            required: true,
            index: { expires: 0 } // This will automatically remove documents when current time > expiresAt
        }
    },
    { timestamps: true }
);

export const OTP = mongoose.model("OTP", otpSchema);