import express from "express";
import {
    login,
    logout,
    sendOtp,
    verifyOtp,
    checkAuth,
    vote,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";
import { contractAddress, contractABI } from "../contract.config.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/vote", vote);
router.get("/contract", (req, res) => {
    res.json({ contractAddress, contractABI });
});

export default router;