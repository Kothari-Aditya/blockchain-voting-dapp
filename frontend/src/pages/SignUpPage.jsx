import { useState } from "react";
import { motion } from "framer-motion";
import { IdCard, Loader } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";
import Web3 from "web3";

const SignUpPage = () => {
	const [rollNumber, setRollNumber] = useState("");
	const [error, setError] = useState("");
	const { sendOtp, isLoading } = useAuthStore();
	const navigate = useNavigate();

	const handleRollNumberSubmit = async (e) => {
		e.preventDefault();
		if (rollNumber.length === 0) {
			setError("Roll number field is empty");
			return;
		}
		
		if (rollNumber.length > 0 && rollNumber.length < 11) {
			setError("Roll number must be exactly 11 digits.");
			return;
		}
		
		setError("");
		try {
			// Check if MetaMask is installed
			if (!window.ethereum) {
				setError("MetaMask is not installed!");
				return;
			}
	
			const web3 = new Web3(window.ethereum);
	
			// Request user's Ethereum address
			const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
			const metamask = accounts[0];  // First account in MetaMask
	
			console.log("User's MetaMask Address:", metamask);

			const response = await sendOtp(rollNumber);
			// Navigate to OTP verification page with roll number and masked phone
			navigate('/verify-otp', { 
				state: { 
					rollNumber: rollNumber,
					phone: response.phone, // Masked phone from API response
					metamaskKey: metamask
				}
			});
		} catch (err) {
			setError("Failed to send OTP. Try again.");
		}
	};

	const handleChange = (e) => {
		const value = e.target.value.replace(/\\D/g, ""); // Remove non-numeric characters
		if (value.length <= 11) {
			setRollNumber(value);
		}
	};

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.5 }}
			className='max-w-md w-full bg-gray-800 bg-opacity-50 backdrop-filter backdrop-blur-xl rounded-2xl shadow-xl overflow-hidden'
		>
			<div className='p-8'>
				<h2 className='text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-500 text-transparent bg-clip-text'>
					Sign Up
				</h2>

				<form onSubmit={handleRollNumberSubmit}>
					<Input
						icon={IdCard}
						type='text'
						placeholder='Enter Roll Number'
						value={rollNumber}
						onChange={handleChange}
						maxLength='11'
					/>
					{error && <p className='text-red-500 font-semibold mb-2'>{error}</p>}
					<motion.button
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className='w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900 transition duration-200'
						type='submit'
						disabled={isLoading}
					>
						{isLoading ? <Loader className='w-6 h-6 animate-spin mx-auto' /> : "Send OTP"}
					</motion.button>
				</form>
			</div>
			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
				<p className='text-sm text-gray-400'>
					Already have an account?{" "}
					<Link to='/login' className='text-green-400 hover:underline'>
						Login
					</Link>
				</p>
			</div>
		</motion.div>
	);
};
export default SignUpPage;