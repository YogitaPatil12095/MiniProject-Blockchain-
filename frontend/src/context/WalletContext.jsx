import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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

  // Target Chain ID from env (defaults to Hardhat 31337)
  const targetChainId = Number(import.meta.env.VITE_CHAIN_ID || 31337);

  const initContractWithSigner = useCallback(async (currentSigner) => {
    if (!currentSigner || !contractArtifact.address) {
      setContract(null);
      return;
    }
    try {
      const phrContract = new ethers.Contract(
        contractArtifact.address,
        contractArtifact.abi,
        currentSigner
      );
      setContract(phrContract);
    } catch (err) {
      console.error("Failed to initialize contract:", err);
      setContract(null);
    }
  }, []);

  const connectWallet = useCallback(async () => {
    if (typeof window.ethereum === "undefined") {
      setError("MetaMask is not installed. Please install MetaMask to use this dApp.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Direct request to trigger MetaMask popup immediately
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });

      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts found. Please unlock MetaMask.");
      }

      const browserProvider = new ethers.BrowserProvider(window.ethereum);
      const network = await browserProvider.getNetwork();
      const currentSigner = await browserProvider.getSigner();

      setProvider(browserProvider);
      setAccount(accounts[0]);
      setChainId(Number(network.chainId));
      setSigner(currentSigner);

      await initContractWithSigner(currentSigner);
    } catch (err) {
      console.error("Error connecting wallet:", err);
      if (err.code === 4001) {
        setError("Connection request was rejected in MetaMask.");
      } else if (err.code === -32002) {
        setError("MetaMask is waiting for approval! Please click the MetaMask extension icon in your browser toolbar to approve the connection.");
      } else {
        setError(err.message || "Failed to connect wallet.");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [initContractWithSigner]);

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
      // 4902: Unrecognized chain, attempt to add it
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

  // EIP-1193 Event Listeners
  useEffect(() => {
    if (typeof window.ethereum === "undefined") return;

    const handleAccountsChanged = async (accounts) => {
      if (accounts.length === 0) {
        disconnectWallet();
      } else if (accounts[0] !== account) {
        setAccount(accounts[0]);
        if (provider) {
          const currentSigner = await provider.getSigner();
          setSigner(currentSigner);
          await initContractWithSigner(currentSigner);
        }
      }
    };

    const handleChainChanged = (hexChainId) => {
      setChainId(Number(hexChainId));
      // Re-initialize provider & signer on network change
      if (window.ethereum && account) {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        browserProvider.getSigner().then((newSigner) => {
          setProvider(browserProvider);
          setSigner(newSigner);
          initContractWithSigner(newSigner);
        });
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);

    // Auto-connect if already authorized
    const checkConnected = async () => {
      try {
        const browserProvider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await browserProvider.send("eth_accounts", []);
        if (accounts.length > 0) {
          const network = await browserProvider.getNetwork();
          const currentSigner = await browserProvider.getSigner();
          setProvider(browserProvider);
          setAccount(accounts[0]);
          setChainId(Number(network.chainId));
          setSigner(currentSigner);
          await initContractWithSigner(currentSigner);
        }
      } catch (err) {
        console.warn("Auto-connect check failed:", err);
      }
    };
    checkConnected();

    return () => {
      if (window.ethereum.removeListener) {
        window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
        window.ethereum.removeListener("chainChanged", handleChainChanged);
      }
    };
  }, [account, provider, disconnectWallet, initContractWithSigner]);

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
