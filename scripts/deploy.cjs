const { ethers } = require("hardhat");

async function main() {
  const VotingContract = await ethers.getContractFactory("VotingContract");
  const voting = await VotingContract.deploy();

  // await voting.deployed();
  console.log(`VotingContract deployed to: ${voting.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
