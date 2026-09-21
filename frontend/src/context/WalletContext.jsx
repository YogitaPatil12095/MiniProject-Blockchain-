import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { ethers } from "ethers";
import contractArtifact from "../contract.json";
import { NETWORKS } from "../lib/constants";

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [account, setAccount] = useState(null);
  const [chainId, setChainId] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState(null);

  const targetChainId = Number(import.meta.env.VITE_CHAIN_ID || 31337);

  // Helper to initialize contract instance
  const setupSignerAndContract = useCallback(async (browserProvider, userAccount) => {
    if (!browserProvider || !userAccount) {
      setAccount(null);
      setSigner(null);
      setContract(null);
      return;
    }

    try {
      const currentSigner = await browserProvider.getSigner();
      const network = await browserProvider.getNetwork();

      setAccount(userAccount);
      setChainId(Number(network.chainId));
      setSigner(currentSigner);

      if (contractArtifact.address) {
        const phrContract = new ethers.Contract(
          contractArtifact.address,
          contractArtifact.abi,
          currentSigner
        );
        setContract(phrContract);
      }
    } catch (err) {
      console.error("Failed to setup signer or contract:", err);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask extension not detected. Please install or enable MetaMask.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(browserProvider);

      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        await setupSignerAndContract(browserProvider, accounts[0]);
      }
    } catch (err) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) {
        setError("Connection request was rejected in MetaMask.");
      } else if (err.code === -32002) {
        setError("MetaMask popup is already waiting! Click the MetaMask icon in your browser toolbar to approve.");
      } else {
        setError(err.message || "Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [setupSignerAndContract]);

  const disconnectWallet = useCallback(() => {
    setAccount(null);
    setSigner(null);
    setContract(null);
    setError(null);
  }, []);

  const switchNetwork = useCallback(async (desiredChainId = targetChainId) => {
    if (!window.ethereum) return;
    const hexChainId = `0x${desiredChainId.toString(16)}`;

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: hexChainId }],
      });
    } catch (switchError) {
      if (switchError.code === 4902 && NETWORKS[desiredChainId]) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [NETWORKS[desiredChainId]],
          });
        } catch (addError) {
          console.error("Failed to add network:", addError);
        }
      } else {
        console.error("Failed to switch network:", switchError);
      }
    }
  }, [targetChainId]);

  // Persistent reference for setupSignerAndContract
  const setupRef = useRef(setupSignerAndContract);
  setupRef.current = setupSignerAndContract;

  // Single mount effect for listeners and auto-connect
  useEffect(() => {
    if (typeof window.ethereum === "undefined") return;

    const browserProvider = new ethers.BrowserProvider(window.ethereum);
    setProvider(browserProvider);

    // 1. Auto-connect if already authorized
    window.ethereum
      .request({ method: "eth_accounts" })
      .then((accounts) => {
        if (accounts && accounts.length > 0) {
          setupRef.current(browserProvider, accounts[0]);
        }
      })
      .catch((err) => console.warn("Auto-connect check:", err));

    // 2. Stable event handlers
    const handleAccounts = (accounts) => {
      if (!accounts || accounts.length === 0) {
        setAccount(null);
        setSigner(null);
        setContract(null);
      } else {
        setupRef.current(browserProvider, accounts[0]);
      }
    };

    const handleChain = (hexChainId) => {
      setChainId(Number(hexChainId));
      window.ethereum
        .request({ method: "eth_accounts" })
        .then((accounts) => {
          if (accounts && accounts.length > 0) {
            setupRef.current(browserProvider, accounts[0]);
          }
        });
    };

    window.ethereum.on("accountsChanged", handleAccounts);
    window.ethereum.on("chainChanged", handleChain);

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccounts);
        window.ethereum.removeListener("chainChanged", handleChain);
      }
    };
  }, []);

  const isWrongNetwork = chainId !== null && chainId !== targetChainId;

  const value = {
    account,
    chainId,
    targetChainId,
    isWrongNetwork,
    provider,
    signer,
    contract,
    contractAddress: contractArtifact.address,
    isConnecting,
    error,
    connectWallet,
    disconnectWallet,
    switchNetwork,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }
  return context;
}
