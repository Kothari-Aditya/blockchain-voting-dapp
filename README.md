# Blockchain-Based Voting DApp

## 📌 Overview
This is a **Blockchain-Based Voting Application** built using **Solidity, React, Node.js, and MongoDB**. The project enables secure and transparent voting with Ethereum smart contracts and **real-time event tracking**.

## 🏗 Features
- **Decentralized Voting**: Votes are recorded on the Ethereum blockchain.
- **Real-time Vote Tracking**: Uses smart contract events to display votes live.
- **Masked Voter Addresses**: Ensures privacy by only displaying parts of the address.
- **MetaMask Integration**: Seamless wallet connection for user authentication.
- **Optimized Gas Usage**: Enhanced efficiency for lower transaction costs.
- **WhatsApp OTP Authentication**: Secure voter verification using WhatsApp through a Selenium script.
- **Merkle Tree Implementation**: Stores Merkle Root instead of individual votes for improved scalability and privacy.
- **Analytics Dashboard**: Interactive graphs showing voting statistics and trends.

## 🛠 Tech Stack
- **Frontend**: React.js, Ethers.js
- **Backend**: Node.js, MongoDB, Truffle (for Solidity smart contracts)
- **Blockchain**: Ethereum (Ganache for local testing)
- **Authentication**: WhatsApp (for OTP)
- **Analytics**: Recharts.js
- **Automation for OTP**: Selenium, Python

---

## 🚀 Installation & Setup

### 1️⃣ Clone the Repository
```sh
git clone https://github.com/Kothari-Aditya/blockchain-voting-dapp.git
cd blockchain-voting-dapp
```

### 2️⃣ Install Dependencies
```sh
npm install

cd frontend 
npm install
```

### 3️⃣ Start Ganache (Local Blockchain)
Make sure you have **Ganache** installed and running.
```sh
ganache-cli --port 7545
```

### 4️⃣ Deploy Smart Contracts
```sh
truffle compile
truffle migrate --network development
```
This will deploy the contract to **Ganache** and output the contract address.


### 6️⃣ Start the Backend
```sh
npm run dev
```

### 7️⃣ Start the Frontend
```sh
cd frontend
npm run dev
```
The app will be available at **http://localhost:3000**.

---

## 🗳 Usage Guide

### For Voters
1. **Connect Wallet**: Use MetaMask to authenticate yourself.
2. **Verify Identity**: Complete WhatsApp OTP verification.
3. **Cast Vote**: Select your candidate and submit your vote.
4. **View Results**: Check the Event Page to see all recorded votes.
5. **View Analytics**: Explore the Graph Page for voting statistics and trends.

---

## 📊 Analytics Dashboard
The new **Graph Page** provides comprehensive voting statistics.
---

## 🔥 Security & Privacy Features
- **Blockchain Immutability**: Each vote is **recorded on-chain** to prevent tampering.
- **Transaction Tracking**: **Processed transactions are monitored** to prevent double voting.
- **Merkle Tree Implementation**: Only the Merkle Root is stored on-chain, preserving voter privacy and improving gas efficiency.
- **WhatsApp OTP Verification**: Two-factor authentication adds an extra layer of security.
- **Address Masking**: Only partial addresses are displayed publicly.

---

## 🎯 Contributors
| Name              | Roll Number | Batch |
--------------------|-------------|-------|
| Aditya Kothari    | 16010122329 | C-1   |
| Suhrud Korgaokar  | 16010122334 | C-1   |
| Shubham Malgaokar | 16010122331 | C-1   |
