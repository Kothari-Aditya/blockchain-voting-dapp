import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [contract, setContract] = useState(null);
  const [voteCounts, setVoteCounts] = useState({});
  const [searchQuery, setSearchQuery] = useState(""); // 🔍 Search state
  const [userAddress, setUserAddress] = useState("");
  const navigate = useNavigate();

  // Load processed transactions from local storage
  const loadProcessedTxs = () => {
    const storedTxs = localStorage.getItem("processedTxs");
    return storedTxs ? new Set(JSON.parse(storedTxs)) : new Set();
  };

  const loadVoteCounts = () => {
    const storedCounts = localStorage.getItem("voteCounts");
    return storedCounts ? JSON.parse(storedCounts) : {};
  };

  const [processedTxs, setProcessedTxs] = useState(loadProcessedTxs());

  useEffect(() => {
    const getAccount = async () => {
      if (window.ethereum) {
        const accounts = await window.ethereum.request({
          method: "eth_accounts",
        });
        if (accounts.length > 0) {
          setUserAddress(accounts[0].toLowerCase()); // Store in lowercase for case-insensitive comparison
        }
      }
    };
    getAccount();
  }, []);

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/contract");
        const data = await response.json();

        if (!data.contractAddress || !data.contractABI) {
          throw new Error("Contract data not found");
        }

        const provider = new ethers.JsonRpcProvider("http://127.0.0.1:7545");
        const contractInstance = new ethers.Contract(
          data.contractAddress,
          data.contractABI,
          provider
        );

        setContract(contractInstance);
      } catch (error) {
        console.error("Error fetching contract:", error);
      }
    };

    fetchContract();
  }, []);

  useEffect(() => {
    if (!contract) return;

    const fetchPastEvents = async () => {
      try {
        const filter = contract.filters.VoteSubmitted();
        const logs = await contract.runner.provider.getLogs({
          fromBlock: 0,
          toBlock: "latest",
          address: contract.target,
          topics: filter.topics,
        });

        const parsedLogs = logs
          .map((log) => {
            try {
              const decodedLog = contract.interface.parseLog(log);
              // ✅ Only include VoteSubmitted events
              if (decodedLog.name === "VoteSubmitted") {
                return {
                  voter: decodedLog.args[0],
                  partyID: decodedLog.args[1].toString(),
                  txHash: log.transactionHash,
                };
              }
              return null; // Ignore non-matching events
            } catch (error) {
              console.error("Error decoding log:", error);
              return null;
            }
          })
          .filter((event) => event !== null);

        updateVoteCounts(parsedLogs);
        setEvents(parsedLogs);
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    fetchPastEvents();
    setVoteCounts(loadVoteCounts());

    const handleVoteSubmitted = (voter, partyID, event) => {
      const newEvent = {
        voter,
        partyID: partyID.toString(),
        txHash: event.transactionHash,
      };

      setProcessedTxs((prevTxs) => {
        if (!prevTxs.has(newEvent.txHash)) {
          const updatedTxs = new Set([...prevTxs, newEvent.txHash]);
          localStorage.setItem("processedTxs", JSON.stringify([...updatedTxs]));
          updateVoteCounts([newEvent]);
          setEvents((prevEvents) => [newEvent, ...prevEvents]);
          return updatedTxs;
        }
        return prevTxs;
      });
    };

    contract.on("VoteSubmitted", handleVoteSubmitted);

    return () => {
      contract.off("VoteSubmitted", handleVoteSubmitted);
    };
  }, [contract]);

  const updateVoteCounts = (newEvents) => {
    setProcessedTxs((prevTxs) => {
      const updatedTxs = new Set([...prevTxs]);

      setVoteCounts((prevCounts) => {
        const updatedCounts = { ...prevCounts };

        newEvents.forEach(({ partyID, txHash, voter }) => {
          const uniqueVoteKey = `${txHash}-${voter}`;

          if (!updatedTxs.has(uniqueVoteKey)) {
            updatedCounts[partyID] = (updatedCounts[partyID] || 0) + 1;
            updatedTxs.add(uniqueVoteKey);
          }
        });

        localStorage.setItem("voteCounts", JSON.stringify(updatedCounts));
        return updatedCounts;
      });

      localStorage.setItem("processedTxs", JSON.stringify([...updatedTxs]));
      return updatedTxs;
    });
  };

  const maskVoter = (voter) => {
    return `${voter.slice(0, 6)}...${voter.slice(-4)}`;
  };

  const filteredEvents = events.filter(
    (event) =>
      maskVoter(event.voter)
        .toUpperCase()
        .includes(searchQuery.toUpperCase()) ||
      event.partyID.toUpperCase().includes(searchQuery.toUpperCase())
  );

  const partyNames = {
    1: "Bharatiya Janata Party",
    2: "Indian National Congress",
    3: "Aam Aadmi Party",
    4: "Bahujan Samaj Party",
    5: "Communist Party of India",
    6: "National People's Party",
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl w-full mx-auto mt-10 p-10 bg-gray-900 bg-opacity-80 backdrop-filter backdrop-blur-lg rounded-xl shadow-2xl border border-gray-800"
    >
      <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-green-400 to-emerald-600 text-transparent bg-clip-text">
        Event List
      </h2>

      <button
        className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-600 transition"
        onClick={() => navigate("/")}
      >
        ⬅ Back to Home
      </button>

      {/* 🔍 Search Bar */}
      <input
        type="text"
        placeholder="Search by voter"
        className="mt-4 w-full p-2 bg-gray-800 text-white border border-gray-600 rounded-md focus:ring-2 focus:ring-green-500 outline-none"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
      />

      <div className="mt-6 space-y-4">
        <motion.div
          className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ul className="space-y-3">
            {filteredEvents.length > 0 ? (
              filteredEvents.map((event, index) => (
                <li
                  key={index}
                  className={`p-4 rounded-md text-white ${
                    event.voter === userAddress ? "bg-green-700" : "bg-gray-800"
                  }`}
                >
                  <strong>Voter:</strong> {maskVoter(event.voter)} <br />
                  <strong>Party:</strong> {partyNames[event.partyID]} <br />
                  <strong>Transaction:</strong> {event.txHash.slice(0, 10)}...
                </li>
              ))
            ) : (
              <p className="text-gray-400">No matching results found.</p>
            )}
          </ul>
        </motion.div>
      </div>

      {/* Vote Count Summary */}
      <div className="mt-8 p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700">
        <h3 className="text-2xl font-semibold text-green-400 mb-4">
          Vote Counts
        </h3>
        <ul className="text-white">
          {Object.entries(voteCounts).map(([partyID, count]) => (
            <li key={partyID}>
              <strong>{partyNames[partyID]}:</strong> {count} votes
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default EventsPage;
