import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [contract, setContract] = useState(null);
  const [voteCounts, setVoteCounts] = useState({});
  const navigate = useNavigate();

  // Load processed transactions from local storage
  const loadProcessedTxs = () => {
    const storedTxs = localStorage.getItem("processedTxs");
    return storedTxs ? new Set(JSON.parse(storedTxs)) : new Set();
  };

  const [processedTxs, setProcessedTxs] = useState(loadProcessedTxs());

  useEffect(() => {
    const fetchContract = async () => {
      try {
        console.log("Fetching contract details...");
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

        console.log("Contract loaded:", contractInstance);
        setContract(contractInstance);
      } catch (error) {
        console.error("Error fetching contract:", error);
      }
    };

    fetchContract();
  }, []);

  useEffect(() => {
    if (!contract || events.length > 0) return; // Prevent duplicate fetching

    const fetchPastEvents = async () => {
      try {
        console.log("Fetching past vote events...");
        const filter = contract.filters.VoteSubmitted();
        const logs = await contract.runner.provider.getLogs({
          fromBlock: 0,
          toBlock: "latest",
          address: contract.target,
          topics: filter.topics,
        });
        console.log("Fetched logs:", logs);

        const parsedLogs = logs
          .map((log) => {
            try {
              const decodedLog = contract.interface.parseLog(log);
              return {
                voter: decodedLog.args[0],
                partyID: decodedLog.args[1].toString(),
                txHash: log.transactionHash,
              };
            } catch (error) {
              console.error("Error decoding log:", error);
              return null;
            }
          })
          .filter((event) => event !== null);

        console.log("Parsed events:", parsedLogs);
        updateVoteCounts(parsedLogs);
        setEvents(parsedLogs);
      } catch (error) {
        console.error("Error fetching past events:", error);
      }
    };

    const handleVoteSubmitted = (voter, partyID, event) => {
      console.log("New vote event detected:", {
        voter,
        partyID,
        txHash: event.transactionHash,
      });

      const newEvent = {
        voter,
        partyID: partyID.toString(),
        txHash: event.transactionHash,
      };

      setProcessedTxs((prevTxs) => {
        if (!prevTxs.has(newEvent.txHash)) {
          const updatedTxs = new Set([...prevTxs, newEvent.txHash]);
          localStorage.setItem("processedTxs", JSON.stringify([...updatedTxs]));
          updateVoteCounts([newEvent]); // Ensure vote counts update only for new transactions
          setEvents((prevEvents) => [newEvent, ...prevEvents]);
          return updatedTxs;
        }
        return prevTxs;
      });
    };

    fetchPastEvents();
    contract.on("VoteSubmitted", handleVoteSubmitted);

    return () => {
      contract.off("VoteSubmitted", handleVoteSubmitted);
    };
  }, [contract, events.length]);

  const updateVoteCounts = (newEvents) => {
    setProcessedTxs((prevTxs) => {
      const updatedTxs = new Set([...prevTxs]);
      console.log("UpdatedTxs:", updatedTxs);

      setVoteCounts((prevCounts) => {
        const updatedCounts = { ...prevCounts };
        console.log("UpdatedCounts:", updatedCounts);

        newEvents.forEach(({ partyID, txHash }) => {
          console.log("lemme see:", partyID, txHash);
          if (!updatedTxs.has(txHash)) {
            updatedCounts[partyID] = (updatedCounts[partyID] || 0) + 1;
            updatedTxs.add(txHash);
          }
        });

        console.log("Updated vote counts:", updatedCounts);
        return updatedCounts;
      });

      localStorage.setItem("processedTxs", JSON.stringify([...updatedTxs]));
      return updatedTxs;
    });
  };

  const maskVoter = (voter) => {
    return `${voter.slice(0, 6)}...${voter.slice(-4)}`;
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

      <div className="mt-6 space-y-4">
        <motion.div
          className="p-6 bg-gray-800 bg-opacity-50 rounded-lg border border-gray-700"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <ul className="space-y-3">
            {events.map((event, index) => (
              <li key={index} className="text-white">
                <strong>Voter:</strong> {maskVoter(event.voter)} <br />
                <strong>Party ID:</strong> {event.partyID} <br />
                <strong>Transaction:</strong> {event.txHash.slice(0, 10)}...
              </li>
            ))}
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
              <strong>Party {partyID}:</strong> {count} votes
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  );
};

export default EventsPage;
