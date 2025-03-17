require("@nomicfoundation/hardhat-toolbox");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.28",
  networks: {
    ganache: {
      url: "http://127.0.0.1:7545", // Ganache RPC URL
      accounts: ["0xbbdc30d314b5f255d762a3c35dfbbea6bd58f92a4f03da26a661babbb9285798"], // Replace with your Ganache account private key
    },
  },
};
