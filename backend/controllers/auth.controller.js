import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { generateOTP, maskPhoneNumber, sendOtpViaSms } from "../utils/sendOtp.js";
import { Vote } from "../models/vote.model.js";
import { checkAndSubmitVotes } from "../utils/submitVotes.js";

/**
 * Send OTP to user's phone number
 * @route POST /api/auth/send-otp
 */
export const sendOtp = async (req, res) => {
    const { rollNumber } = req.body;

    try {
        if (!rollNumber) {
            return res.status(400).json({ success: false, message: "Roll number is required" });
        }

        // Validate roll number format (11 digits)
        if (!/^\d{11}$/.test(rollNumber)) {
            return res.status(400).json({ success: false, message: "Roll number must be exactly 11 digits" });
        }

        // Find user with this roll number
        const user = await User.findOne({ rollNumber });
        if (!user) {
            return res.status(404).json({ success: false, message: "Roll number not found in database" });
        }

        // Generate OTP
        const otp = generateOTP();

        // Store OTP in database with expiry (5 minutes)
        const otpRecord = new OTP({
            rollNumber,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        });
        await otpRecord.save();

        // Send OTP via SMS
        await sendOtpViaSms(user.phoneNumber, otp);

        // Return masked phone number for UI
        const maskedPhone = maskPhoneNumber(user.phoneNumber);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully",
            phone: maskedPhone
        });
    } catch (error) {
        console.error("Error in sendOtp:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Verify OTP and register metamask key
 * @route POST /api/auth/verify-otp
 */
export const verifyOtp = async (req, res) => {
    const { rollNumber, otp, metamaskKey } = req.body;

    try {
        if (!rollNumber || !otp) {
            return res.status(400).json({ success: false, message: "Roll number and OTP are required" });
        }

        // Find the latest valid OTP for this roll number
        const otpRecord = await OTP.findOne({
            rollNumber,
            otp,
            expiresAt: { $gt: new Date() }
        }).sort({ createdAt: -1 });

        if (!otpRecord) {
            return res.status(400).json({ success: false, message: "Invalid or expired OTP" });
        }

        // Find user and update with metamask key (null for now)
        const user = await User.findOneAndUpdate(
            { rollNumber },
            {
                metamaskKey: metamaskKey, // Will be updated later with actual MetaMask key
                lastLogin: new Date()
            },
            { new: true }
        );

        console.log(user);

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Delete used OTP
        await OTP.deleteOne({ _id: otpRecord._id });

        // Generate token for auth
        const token = generateTokenAndSetCookie(res, user._id);

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            token,
            user: {
                _id: user._id,
                rollNumber: user.rollNumber,
                metamaskKey: user.metamaskKey,
            }
        });
    } catch (error) {
        console.error("Error in verifyOtp:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Login with roll number (checks if metamask key exists)
 * @route POST /api/auth/login
 */
export const login = async (req, res) => {
    const { rollNumber } = req.body;

    try {
        console.log('\n===== LOGIN ATTEMPT =====');
        console.log('Roll Number:', rollNumber);

        if (!rollNumber) {
            console.log('Error: Roll number is required');
            return res.status(400).json({ success: false, message: "Roll number is required" });
        }

        // Find user with roll number
        const user = await User.findOne({ rollNumber });

        if (!user) {
            console.log('Error: User not found');
            return res.status(404).json({ success: false, message: "Roll number not found" });
        }

        // Log user info for debugging
        console.log('User found:', {
            _id: user._id.toString(),
            rollNumber: user.rollNumber,
            metamaskKey: user.metamaskKey,
            metamaskKeyType: typeof user.metamaskKey
        });

        // Check if user has metamask key
        if (!user.metamaskKey) {
            console.log('Error: No metamask key - user not registered');
            return res.status(400).json({
                success: false,
                message: "User not registered. Please complete registration first"
            });
        }

        console.log('Metamask key check passed');

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Generate token for auth
        const token = generateTokenAndSetCookie(res, user._id);

        console.log('Login successful!');
        console.log('========================\n');

        res.status(200).json({
            success: true,
            message: "Login successful",
            token,
            user: {
                _id: user._id,
                rollNumber: user.rollNumber,
                metamaskKey: user.metamaskKey,
            }
        });
    } catch (error) {
        console.error("Error in login:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

/**
 * Logout user
 * @route POST /api/auth/logout
 */
export const logout = async (req, res) => {
    res.clearCookie("token");
    
    res.status(200).json({ success: true, message: "Logged out successfully" });
};

/**
 * Check if user is authenticated
 * @route GET /api/auth/check-auth
 */
export const checkAuth = async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                rollNumber: user.rollNumber,
                metamaskKey: user.metamaskKey,
            }
        });
    } catch (error) {
        console.error("Error in checkAuth:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};

export const vote = async (req, res) => {
    const { voter, partyId, signature } = req.body;

    try {
        if (!voter || !partyId || !signature) {
            return res.status(400).json({ success: false, message: "Voter Key, party ID, and signature are required" });
        }

        // Find the user by roll number
        const user = await User.findOne({ metamaskKey: voter });

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check if the user has a registered MetaMask key
        if (!user.metamaskKey) {
            return res.status(400).json({ success: false, message: "User has not completed MetaMask registration" });
        }

        // Check if the user has already voted
        const existingVote = await Vote.findOne({ voter });

        if (existingVote) {
            return res.status(400).json({ success: false, message: "User has already voted" });
        }

        // Store the vote in the database
        const newVote = new Vote({
            voter,
            partyId,
            signature
        });

        await newVote.save();

        // Check if we have enough votes to submit
        await checkAndSubmitVotes();

        res.status(201).json({ success: true, message: "Vote recorded successfully" });
    } catch (error) {
        console.error("Error in vote:", error);
        res.status(500).json({ success: false, message: "Server error" });
    }
};