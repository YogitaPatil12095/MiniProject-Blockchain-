const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("----------------------------------------------------");
  console.log("Deploying PHR Smart Contract...");

  const [deployer] = await hre.ethers.getSigners();
  const network = await hre.ethers.provider.getNetwork();

  console.log(`Deploying on Network: ${network.name} (Chain ID: ${network.chainId})`);
  console.log(`Deployer Address:    ${deployer.address}`);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer Balance:    ${hre.ethers.formatEther(balance)} ETH`);

  // Deploy PHR
  const PHRFactory = await hre.ethers.getContractFactory("PHR");
  const phr = await PHRFactory.deploy();
  await phr.waitForDeployment();

  const phrAddress = await phr.getAddress();
  console.log(`\n🎉 PHR Contract successfully deployed to: ${phrAddress}`);

  // Prepare contract artifact payload for frontend
  const phrArtifact = await hre.artifacts.readArtifact("PHR");
  const contractData = {
    address: phrAddress,
    abi: phrArtifact.abi,
    chainId: Number(network.chainId),
    networkName: network.name,
    deployedAt: new Date().toISOString(),
  };

  // Save to frontend/src/contract.json
  const frontendSrcDir = path.join(__dirname, "..", "frontend", "src");
  if (!fs.existsSync(frontendSrcDir)) {
    fs.mkdirSync(frontendSrcDir, { recursive: true });
  }

  const contractJsonPath = path.join(frontendSrcDir, "contract.json");
  fs.writeFileSync(contractJsonPath, JSON.stringify(contractData, null, 2));
  console.log(`📄 Generated frontend configuration at: ${contractJsonPath}`);
  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
