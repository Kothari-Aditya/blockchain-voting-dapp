import { motion } from "framer-motion";
import { useAuthStore } from "../store/authStore";
import { useState } from "react";
import { formatDate } from "../utils/date";
import { useNavigate } from "react-router-dom";
import Web3 from "web3";

const parties = [
  { id: 1, name: "Bharatiya Janata Party", img: "/images/BJP-Logo.png" },
  { id: 2, name: "Indian National Congress", img: "/images/INC-Logo.png" },
  { id: 3, name: "Aam Aadmi Party", img: "/images/AAP-Logo.png" },
  { id: 4, name: "Bahujan Samaj Party", img: "/images/BSP-Logo.png" },
  { id: 5, name: "Communist Party of India", img: "/images/CPI-Logo.png" },
  { id: 6, name: "National People's Party", img: "/images/NPP-Logo.png" },
];

const ValidationPage = () => {
  const { user, logout } = useAuthStore();
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleValidate = async () => {
    if (!selectedPartyId) {
      alert("Please select a party to validate!");
      return;
    }
    if (!window.ethereum) {
      alert("Metamask is not installed!");
      return;
    }
  
    try {
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts();
      const voterAddress = accounts[0];
  
      // Send to backend for validation
      const response = await fetch("http://localhost:5000/api/auth/validate-vote", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voter: voterAddress,
          partyId: selectedPartyId,
        }),
      });

      const data = await response.json();
  
      if (data.isValid) {
        alert(`✅ Vote verified in batch #${data.batchIndex}`);
      } else {
        alert("❌ Vote is not valid or not found in the Merkle tree.");
      }
  
      console.log("Validation result:", data);
    } catch (error) {
      console.error("Error validating vote:", error);
      alert("Something went wrong during validation.");
    }
  };
  

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-md w-full mx-auto mt-10 p-8 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
    >
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
        Vote Validation
      </h2>

      <div className="space-y-6">
        <motion.div
          className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-xl font-semibold text-green-400 mb-3">
            Profile Information
          </h3>
          <p className="text-gray-300">Name: {user.rollNumber}</p>
          <p className="text-gray-300">Metamask Key: {user.metamaskKey}</p>
        </motion.div>
        <motion.div
          className="p-4 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="text-xl font-semibold text-green-400 mb-3">
            Choose the Party you Voted for{" "}
          </h3>
          <div className="space-y-3">
            {parties.map((party) => (
              <label
                key={party.id}
                className="flex items-center gap-4 cursor-pointer"
              >
                <input
                  type="radio"
                  name="party"
                  value={party.id}
                  checked={selectedPartyId === party.id}
                  onChange={(e) => setSelectedPartyId(Number(e.target.value))}
                  className="hidden"
                />
                <div
                  className={`w-12 h-12 border-2 rounded-full ${
                    selectedPartyId === party.id
                      ? "border-green-500"
                      : "border-gray-600"
                  }`}
                >
                  <img
                    src={party.img}
                    alt={party.name}
                    className="w-full h-full rounded-full"
                  />
                </div>
                <span className="text-gray-300">{party.name}</span>
              </label>
            ))}
          </div>
          <button
            onClick={handleValidate}
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Validate Vote
          </button>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/")}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
				font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
				 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Home
        </motion.button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate("/events")}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
				font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
				 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Event List
        </motion.button>
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-4"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white 
				font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700
				 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
        >
          Logout
        </motion.button>
      </motion.div>
    </motion.div>
  );
};
export default ValidationPage;
