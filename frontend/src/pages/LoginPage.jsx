import { useState } from "react";
import { motion } from "framer-motion";
import { IdCard, Loader } from "lucide-react";
import { Link } from "react-router-dom";
import Input from "../components/Input";
import { useAuthStore } from "../store/authStore";

const LoginPage = () => {
	const [rollNumber, setRollNumber] = useState("");
	const [error, setError] = useState("");
	const { login, isLoading } = useAuthStore();

	const handleLogin = async (e) => {
		e.preventDefault();
		if (rollNumber.length == 0) {
			setError("Roll number field is empty");
			return;
		}
		setError("");
		if (rollNumber.length > 0 && rollNumber.length < 11) {
			setError("Roll number must be exactly 11 digits.");
			return;
		}
		setError("");
		await login(rollNumber);
	};

	const handleChange = (e) => {
		const value = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
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
					Login to Vote
				</h2>

				<form onSubmit={handleLogin}>
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
						{isLoading ? <Loader className='w-6 h-6 animate-spin  mx-auto' /> : "Login"}
					</motion.button>
				</form>
			</div>
			<div className='px-8 py-4 bg-gray-900 bg-opacity-50 flex justify-center'>
				<p className='text-sm text-gray-400'>
					New user?{" "}
					<Link to='/signup' className='text-green-400 hover:underline'>
						Register here
					</Link>
				</p>
			</div>
		</motion.div>
	);
};
export default LoginPage;