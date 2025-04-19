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

const DashboardPage = () => {
  const { user, logout } = useAuthStore();
  const [selectedPartyId, setSelectedPartyId] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
  };

  const handleVote = async () => {
    
    if (!selectedPartyId) {      
      alert("Please select a party to vote!");
      return;
    }
    if (!window.ethereum) {
      alert("Metamask is not installed!");
      return;
    }

    try {      
      const web3 = new Web3(window.ethereum);
      const accounts = await web3.eth.requestAccounts(); // Get user account
      const voterAddress = accounts[0];      

      // Correctly hash the message
      const messageHash = web3.utils.soliditySha3(
        { t: "address", v: voterAddress },
        { t: "uint256", v: selectedPartyId }
      );            
      // Sign the prefixed message
      const signature = await web3.eth.personal.sign(
        messageHash,
        voterAddress,
        ""
      );      

      console.log("Vote signed:", {
        voter: voterAddress,
        partyID: selectedPartyId,
        signature,
      });

      // Send vote to the backend
      const response = await fetch("http://localhost:5000/api/auth/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          voter: voterAddress,
          partyId: selectedPartyId,
          signature,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert(`Vote recorded successfully: ${data.message}`);
      } else {
        // Check if there's a message or other relevant property in the response
        const errorMessage = data.message || 'An unknown error occurred';
        alert(`Vote failed: ${errorMessage}`);
      }
    }catch (error) {
      console.error("Error signing vote:", error);
      alert("Failed to sign vote. Check console for details.");
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
        Dashboard
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
            Vote for Your Party
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
            onClick={handleVote}
            className="w-full mt-4 py-3 px-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-lg shadow-lg hover:from-green-600 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-gray-900"
          >
            Submit Vote
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
export default DashboardPage;
