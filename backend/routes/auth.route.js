import express from "express";
import {
    login,
    logout,
    sendOtp,
    verifyOtp,
    checkAuth,
    vote,
    validate,
    getProofs,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { contractAddress, contractABI } from "../contract.config.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);
router.get("/proofs", getProofs);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/vote", vote);
router.post("/validate-vote", validate);
router.get("/contract", (req, res) => {
    res.json({ contractAddress, contractABI });
});

export default router;