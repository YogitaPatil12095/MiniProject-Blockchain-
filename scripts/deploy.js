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

  // Auto-fund test accounts if running on local hardhat network
  if (Number(network.chainId) === 31337) {
    console.log("\n💰 Funding test accounts with 50 ETH each...");
    const testAccounts = [
      { name: "Doctor", address: "0xF36A1a191f2343FfDAd7095A539c668748FD1eCa" },
      { name: "Patient", address: "0x3394253c50947182cf98de072484609BF6683Dd5" },
    ];
    for (const acc of testAccounts) {
      try {
        const tx = await deployer.sendTransaction({
          to: acc.address,
          value: hre.ethers.parseEther("50.0"),
        });
        await tx.wait();
        console.log(`   ✅ Funded ${acc.name} (${acc.address}) with 50 ETH`);
      } catch (err) {
        console.warn(`   ⚠️ Could not fund ${acc.address}:`, err.message);
      }
    }

    // Pre-register doctor & patient for seamless testing
    try {
      console.log("\n🏥 Pre-registering test Doctor and Patient on blockchain...");
      // Register Doctor
      const docTx = await phr.registerDoctor(
        "0xF36A1a191f2343FfDAd7095A539c668748FD1eCa",
        "DOC-1001",
        "Dr. Rajesh Verma",
        "Cardiology",
        "MBBS, MD (Cardio)",
        "+91 9876543210",
        "Apollo Hospital, Mumbai",
        ""
      );
      await docTx.wait();
      console.log("   ✅ Registered Doctor: 0xF36A1a191f2343FfDAd7095A539c668748FD1eCa");

      // Register Patient
      const bday = Math.floor(new Date("1995-08-20").getTime() / 1000);
      const patTx = await phr.registerPatient(
        "0x3394253c50947182cf98de072484609BF6683Dd5",
        "998877665544",
        "Aarav Sharma",
        "Male",
        "42 Marine Drive, Mumbai",
        "+91 9123456780",
        bday,
        "B+",
        176,
        72,
        ""
      );
      await patTx.wait();
      console.log("   ✅ Registered Patient: 0x3394253c50947182cf98de072484609BF6683Dd5");
    } catch (seedErr) {
      console.warn("   ⚠️ Seed registration warning:", seedErr.message);
    }
  }

  console.log("----------------------------------------------------");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });
