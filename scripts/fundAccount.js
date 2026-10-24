const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const recipients = [
    { name: "Doctor",  address: "0xF36A1a191f2343FfDAd7095A539c668748FD1eCa" },
    { name: "Patient", address: "0x3394253c50947182cf98de072484609BF6683Dd5" },
  ];

  for (const r of recipients) {
    const tx = await deployer.sendTransaction({
      to: r.address,
      value: ethers.parseEther("100.0"),
    });
    await tx.wait();
    const balance = await ethers.provider.getBalance(r.address);
    console.log(`✅ ${r.name} (${r.address}) → balance: ${ethers.formatEther(balance)} ETH`);
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
