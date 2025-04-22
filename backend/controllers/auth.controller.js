import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.js";
import { User } from "../models/user.model.js";
import { OTP } from "../models/otp.model.js";
import { MerkleProof } from "../models/merkleproof.model.js";
import { generateOTP, maskPhoneNumber, sendOtpViaSms } from "../utils/sendOtp.js";
import { Vote } from "../models/vote.model.js";
import { checkAndSubmitVotes } from "../utils/submitVotes.js";
import { contractABI, contractAddress } from "../contract.config.js";
import Web3 from "web3";
import { MerkleTree } from "merkletreejs";
import { keccak256, solidityPacked } from "ethers";
import axios from "axios";

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
    console.log('Request Body:', req.body);  // Add this log to inspect the incoming request

    const { voter, partyId, signature } = req.body;

    try {
        if (!voter || typeof partyId !== 'number' || !signature) {
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

export const validate = async (req, res) => {
    try {
        const { voter, partyId } = req.body;

        if (!voter || typeof partyId !== "number") {
            return res.status(400).json({ error: "Missing fields." });
        }

        const web3 = new Web3("http://127.0.0.1:7545");
        const contract = new web3.eth.Contract(contractABI, contractAddress);

        // Encode the same message that was signed
        const message = web3.eth.abi.encodeParameters(["address", "uint256"], [voter, partyId]);
        const messageBuffer = Buffer.from(message.slice(2), "hex");

        const messageHash = keccak256(messageBuffer);

        // Get stored Merkle proof
        const normalizedVoter = web3.utils.toChecksumAddress(voter); // Normalize if it's an Ethereum address
        console.log("Voter address: ", normalizedVoter)
        const storedProof = await MerkleProof.findOne({ voter: normalizedVoter });
        if (!storedProof) {
            return res.json({ isValid: false, error: "Proof not found." });
        }

        const { proof, batchIndex, ipfsHash } = storedProof;
        console.log("Proof from DB:", proof);
        console.log("Batch Number from DB:", batchIndex);
        console.log("IPFS Hash from DB:", ipfsHash);

        // Fetch the Merkle Root data from IPFS
        const ipfsUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        const ipfsData = await axios.get(ipfsUrl);
        const merkleData = ipfsData.data; // This contains the merkleRoot and validVotes
        console.log("Merkle Data from IPFS:", merkleData);

        // Get Merkle root from chain (correct function)
        const rootFromChain = await contract.methods.getMerkleRoot(batchIndex).call();
        console.log("Root from chain:", rootFromChain);

        // Build Merkle tree leaves using votes from IPFS
        const validVotes = merkleData.validVotes;

        // Check if the voter's data is included in the validVotes from IPFS
        const voteExists = validVotes.some(
            vote =>
                web3.utils.toChecksumAddress(vote.voter) === normalizedVoter &&
                Number(vote.partyID) === partyId
        );

        // If not in the IPFS list, return false
        if (!voteExists) {
            return res.json({ isValid: false, error: "Vote not found in IPFS batch." });
        }

        // Create leaf hashes based on valid votes
        const validVoteHashes = validVotes.map(vote =>
            keccak256(solidityPacked(["address", "uint256"], [vote.voter, vote.partyID]))
        );
        // Print the leaves for debugging
        console.log("Merkle Tree Leaves: ", validVoteHashes);

        // Create MerkleTree instance
        const tree = new MerkleTree(validVoteHashes, keccak256, { sortPairs: true });
        const root = tree.getHexRoot();
        console.log("Merkle Root from tree:", root);

        const isValid = root === rootFromChain;
        console.log("Merkle Tree verification result:", isValid);

        return res.json({ isValid, batchIndex, proof });
    } catch (err) {
        console.error("Validation error:", err);
        res.status(500).json({ error: "Internal server error." });
    }
};

export const getProofs = async (req, res) => {
    try {
        const proofs = await MerkleProof.find({}, "ipfsHash -_id"); // Only return IPFS hashes
        const uniqueHashes = Array.from(new Set(proofs.map(p => p.ipfsHash)));
        res.json(uniqueHashes.map(hash => ({ ipfsHash: hash })));
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch proofs." });
    }
};
