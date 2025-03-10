import express from "express";
import {
    login,
    logout,
    sendOtp,
    verifyOtp,
    checkAuth,
} from "../controllers/auth.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

router.get("/check-auth", verifyToken, checkAuth);

router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/login", login);
router.post("/logout", logout);

export default router;