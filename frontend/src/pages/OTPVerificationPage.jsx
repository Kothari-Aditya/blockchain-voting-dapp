import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Key, Loader, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import toast from "react-hot-toast";

const OTPVerificationPage = () => {
	const [otp, setOtp] = useState(["", "", "", "", "", ""]);
	const inputRefs = useRef([]);
	const [error, setError] = useState("");
	const [resendDisabled, setResendDisabled] = useState(true);
	const [countdown, setCountdown] = useState(30); // 30 second countdown for resend
	const { verifyOtp, sendOtp, isLoading } = useAuthStore();
	const navigate = useNavigate();
	const location = useLocation();
	
	// Get rollNumber and phone from location state
	const rollNumber = location.state?.rollNumber;
	const phone = location.state?.phone;
	
	// Redirect to signup if no rollNumber is provided
	useEffect(() => {
		if (!rollNumber) {
			navigate('/signup');
			toast.error("Please enter your roll number first");
		}
	}, [rollNumber, navigate]);
	
	// Handle countdown for resend button
	useEffect(() => {
		if (countdown > 0 && resendDisabled) {
			const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
			return () => clearTimeout(timer);
		} else if (countdown === 0 && resendDisabled) {
			setResendDisabled(false);
		}
	}, [countdown, resendDisabled]);

	const handleChange = (index, value) => {
		const newOtp = [...otp];
		newOtp[index] = value.replace(/\\D/g, ""); // Only allow numbers
		setOtp(newOtp);

		// Move focus to the next input field
		if (value && index < 5) {
			inputRefs.current[index + 1].focus();
		}
	};

	const handleKeyDown = (index, e) => {
		if (e.key === "Backspace" && !otp[index] && index > 0) {
			inputRefs.current[index - 1].focus();
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		const verificationCode = otp.join("");
		if (verificationCode.length !== 6) {
			setError("OTP must be exactly 6 digits.");
			return;
		}
		setError("");
		try {
			await verifyOtp(rollNumber, verificationCode);
			navigate("/");
			toast.success("Registration successful");
		} catch (err) {
			setError("Invalid OTP. Please try again.");
		}
	};
	
	const handleBack = () => {
		navigate('/signup');
	};

	if (!rollNumber) {
		return null; // Don't render anything while redirecting
	}

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className="max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden"
		>
			<div className="p-8">
				<div className="flex items-center mb-6">
					<button 
						onClick={handleBack}
						className="text-gray-400 hover:text-white mr-4"
					>
						<ArrowLeft size={20} />
					</button>
					<h2 className="text-3xl font-bold text-center flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text">
						OTP Verification
					</h2>
				</div>
				
				<p className="text-center text-gray-300 mb-6">
					Enter the 6-digit OTP sent to {phone || "your registered phone number"}
				</p>

				<form onSubmit={handleSubmit} className="space-y-6">
					<div className="flex justify-between">
						{otp.map((digit, index) => (
							<input
								key={index}
								ref={(el) => (inputRefs.current[index] = el)}
								type="text"
								maxLength="1"
								value={digit}
								onChange={(e) => handleChange(index, e.target.value)}
								onKeyDown={(e) => handleKeyDown(index, e)}
								className="w-12 h-12 text-center text-2xl font-bold bg-gray-700 text-white border-2 border-gray-600 rounded-lg focus:border-green-500 focus:outline-none"
							/>
						))}
					</div>
					{error && <p className="text-red-500 font-semibold mt-2">{error}</p>}
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						type="submit"
						disabled={isLoading || otp.some((digit) => !digit)}
						className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold py-3 px-4 rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 disabled:opacity-50"
					>
						{isLoading ? (
							<Loader className="w-6 h-6 animate-spin mx-auto" />
						) : (
							"Verify OTP"
						)}
					</motion.button>
					
					<div className="mt-4 text-center">
						<button
							type="button"
							onClick={async () => {
								if (!resendDisabled) {
									try {
										await sendOtp(rollNumber);
										setResendDisabled(true);
										setCountdown(30);
										toast.success("OTP resent successfully");
										// Clear OTP fields
										setOtp(["", "", "", "", "", ""]);
										// Focus on first field
										inputRefs.current[0].focus();
									} catch (err) {
										toast.error("Failed to resend OTP");
									}
								}
							}}
							disabled={resendDisabled || isLoading}
							className="text-green-400 hover:text-green-300 text-sm"
						>
							{resendDisabled ? `Resend OTP in ${countdown}s` : "Resend OTP"}
						</button>
					</div>
				</form>
			</div>
		</motion.div>
	);
};

export default OTPVerificationPage;