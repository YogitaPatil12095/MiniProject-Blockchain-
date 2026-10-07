const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();

  const recipients = [
    { name: "Yogita (Account 1)", address: "0xF36A1a191f2343FfDAd7095A539c668748FD1eCa" },
    { name: "Aayush",             address: "0xF4554382460C70ec570460391962D9A707E081f4" },
    { name: "Nick",               address: "0xAB28953390D67c862fFD1dF613F6CDfA8BB6D348" },
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
