# Blockchain-Based Voting DApp

## 📌 Overview
This is a **Blockchain-Based Voting Application** built using **Solidity, React, Node.js, and MongoDB**. The project enables secure and transparent voting with Ethereum smart contracts and **real-time event tracking**.

## 🏗 Features
- **Decentralized Voting**: Votes are recorded on the Ethereum blockchain.
- **Real-time Vote Tracking**: Uses smart contract events to display votes live.
- **Masked Voter Addresses**: Ensures privacy by only displaying parts of the address.

## 🛠 Tech Stack
- **Frontend**: React.js, Ethers.js
- **Backend**: Node.js, MongoDB, Truffle (for Solidity smart contracts)
- **Blockchain**: Ethereum (Ganache for local testing)

---

## 🚀 Installation & Setup
### 1️⃣ Clone the Repository
```sh
git clone https://github.com/your-repo/blockchain-voting-dapp.git
cd blockchain-voting-dapp
```

### 2️⃣ Install Dependencies
```sh
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

### 5️⃣ Start the Backend
```sh
npm run server
```

### 6️⃣ Start the Frontend
```sh
npm start
```
The app will be available at **http://localhost:3000**.

---

## 🗳 Usage Guide
1. **Go to Event Page**: Displays recorded votes.
2. **Vote Submission**: Calls the smart contract function.
3. **Real-time Updates**: New votes appear automatically.

---

## 🔥 Security & Preventing Double Votes
- Each vote is **recorded on-chain** to prevent tampering.
- **Processed transactions are tracked** to avoid counting votes twice.

---

## 📌 To-Do
- [ ] Implement wallet connection with **MetaMask**
- [ ] Add **admin panel** for managing elections
- [ ] Enhance **gas efficiency**
- [ ] Implement SMS OTP using **Firebase Auth**
- [ ] Store **Merkle Root** instead of individual votes

---

## 🎯 Contributors
- **Aditya Kothari** - 16010122329
- **Shubham Malgaonkar** - 16010122331
- **Suhrud Korgaokar** - 16010122334
