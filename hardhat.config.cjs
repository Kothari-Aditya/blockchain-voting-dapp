require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC URL
      accounts: ["0xa483c119781967918b902d7786d7eb7c215eaa8d897c3ed45631fc85fd296ac3"], // Replace with your Ganache account private key
    },
  },
};
