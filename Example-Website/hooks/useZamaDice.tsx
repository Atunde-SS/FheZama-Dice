import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { ZamaDiceABI } from '../abi/ZamaDiceABI';
import { ZamaDiceAddresses } from '../abi/ZamaDiceAddresses';
import { useMetaMaskProvider } from './metamask/useMetaMaskProvider';
import { useFhevmInstance } from '@fhevm/react';

export interface GameState {
  connected: boolean;
  gameStarted: boolean;
  playerHasNFT: boolean;
  currentPosition: string;
  encryptedBalance: string;
  ethBalance: string;
  nftSupply: number;
  maxNftSupply: number;
  isLoading: boolean;
  lastAction: number;
  decryptedBalance?: number;
  decryptedPosition?: number;
}

export interface TileData {
  name: string;
  type: string;
  value: string;
}

export interface LogEntry {
  message: string;
  type: "neutral" | "profit" | "loss";
  timestamp: Date;
}

export function useZamaDice() {
  const { provider } = useMetaMaskProvider();
  const { instance: fhevmInstance, createInstance } = useFhevmInstance();
  
  const [gameState, setGameState] = useState<GameState>({
    connected: false,
    gameStarted: false,
    playerHasNFT: false,
    currentPosition: "0x0000000000000000000000000000000000000000000000000000000000000000",
    encryptedBalance: "0x0000000000000000000000000000000000000000000000000000000000000000",
    ethBalance: "0.0000",
    nftSupply: 0,
    maxNftSupply: 10000,
    isLoading: false,
    lastAction: 0
  });
  
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentTile, setCurrentTile] = useState<TileData | null>(null);
  const [showDiceAnimation, setShowDiceAnimation] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  
  // Initialize contract
  const getContract = useCallback(() => {
    if (!provider) return null;
    
    const signer = provider.getSigner();
    return new ethers.Contract(
      ZamaDiceAddresses.sepolia,
      ZamaDiceABI.abi,
      signer
    );
  }, [provider]);
  
  // Initialize FHEVM
  const initializeFHEVM = useCallback(async () => {
    if (!fhevmInstance) {
      try {
        await createInstance();
      } catch (error) {
        console.error("Failed to initialize FHEVM:", error);
        addLog("Failed to initialize encryption. Please try again.", "loss");
      }
    }
  }, [fhevmInstance, createInstance]);
  
  // Add log entry
  const addLog = useCallback((message: string, type: "neutral" | "profit" | "loss" = "neutral") => {
    setLogs(prevLogs => [
      { message, type, timestamp: new Date() },
      ...prevLogs.slice(0, 19) // Keep only the last 20 logs
    ]);
  }, []);
  
  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!provider) {
      addLog("Please install MetaMask or another Web3 wallet", "loss");
      return;
    }
    
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      // Initialize FHEVM
      await initializeFHEVM();
      
      // Get accounts
      const accounts = await provider.listAccounts();
      if (accounts.length === 0) {
        await provider.send("eth_requestAccounts", []);
      }
      
      // Get ETH balance
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const balance = await provider.getBalance(address);
      const ethBalance = parseFloat(ethers.utils.formatEther(balance)).toFixed(4);
      
      setGameState(prev => ({ 
        ...prev, 
        connected: true,
        ethBalance,
        isLoading: false
      }));
      
      addLog("Wallet connected successfully", "profit");
      
      // Load game data
      await refreshGameData();
      
    } catch (error) {
      console.error("Error connecting wallet:", error);
      addLog(`Failed to connect wallet: ${error.message}`, "loss");
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [provider, initializeFHEVM]);
  
  // Refresh game data
  const refreshGameData = useCallback(async () => {
    const contract = getContract();
    if (!contract || !provider) return;
    
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      
      // Get player status
      const status = await contract.getPlayerStatus(address);
      
      // Get NFT info
      const nftInfo = await contract.getNFTInfo();
      
      // Get player position
      const position = await contract.getPlayerPosition(address);
      
      // Get player balance
      const balance = await contract.balanceOf(address);
      
      // Get ETH balance
      const ethBalance = await provider.getBalance(address);
      
      setGameState(prev => ({
        ...prev,
        gameStarted: status.hasStarted,
        playerHasNFT: status.hasMintedNFT,
        currentPosition: position,
        encryptedBalance: balance,
        ethBalance: parseFloat(ethers.utils.formatEther(ethBalance)).toFixed(4),
        nftSupply: nftInfo.currentSupply.toNumber(),
        maxNftSupply: nftInfo.maxSupply.toNumber(),
        lastAction: status.lastAction,
        isLoading: false
      }));
      
      // Get current tile info
      if (status.hasStarted) {
        await getTileInfo();
      }
      
    } catch (error) {
      console.error("Error refreshing game data:", error);
      addLog(`Failed to refresh game data: ${error.message}`, "loss");
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [provider, getContract]);
  
  // Get tile info
  const getTileInfo = useCallback(async () => {
    if (!gameState.gameStarted || !fhevmInstance) return;
    
    try {
      // First decrypt the position
      const decryptedPosition = await decryptPosition();
      if (decryptedPosition === null) return;
      
      const contract = getContract();
      if (!contract) return;
      
      const tileData = await contract.getTile(decryptedPosition);
      setCurrentTile({
        name: tileData.tileName,
        type: tileData.tileType.toString(),
        value: tileData.value.toString()
      });
      
    } catch (error) {
      console.error("Error getting tile info:", error);
      addLog(`Failed to get tile info: ${error.message}`, "loss");
    }
  }, [gameState.gameStarted, fhevmInstance, getContract]);
  
  // Start game
  const startGame = useCallback(async () => {
    const contract = getContract();
    if (!contract) return;
    
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      addLog("Starting game...", "neutral");
      
      const tx = await contract.startGame();
      await tx.wait();
      
      addLog("Game started successfully!", "profit");
      await refreshGameData();
      
    } catch (error) {
      console.error("Error starting game:", error);
      addLog(`Failed to start game: ${error.message}`, "loss");
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [getContract, refreshGameData]);
  
  // Roll dice
  const rollDice = useCallback(async () => {
    const contract = getContract();
    if (!contract) return;
    
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      addLog("Rolling dice...", "neutral");
      
      // Show dice animation
      setShowDiceAnimation(true);
      
      const tx = await contract.rollDice();
      await tx.wait();
      
      // Wait for animation
      setTimeout(async () => {
        await refreshGameData();
        setShowDiceAnimation(false);
        addLog("Dice rolled successfully!", "profit");
      }, 2000);
      
    } catch (error) {
      console.error("Error rolling dice:", error);
      addLog(`Failed to roll dice: ${error.message}`, "loss");
      setGameState(prev => ({ ...prev, isLoading: false }));
      setShowDiceAnimation(false);
    }
  }, [getContract, refreshGameData]);
  
  // Claim reward
  const claimReward = useCallback(async () => {
    const contract = getContract();
    if (!contract) return;
    
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      addLog("Claiming reward...", "neutral");
      
      const tx = await contract.claimReward();
      await tx.wait();
      
      addLog("Reward claimed successfully!", "profit");
      await refreshGameData();
      
    } catch (error) {
      console.error("Error claiming reward:", error);
      addLog(`Failed to claim reward: ${error.message}`, "loss");
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [getContract, refreshGameData]);
  
  // Mint NFT
  const mintNFT = useCallback(async () => {
    const contract = getContract();
    if (!contract) return;
    
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      addLog("Minting NFT...", "neutral");
      
      const tx = await contract.mintNFT();
      await tx.wait();
      
      addLog("NFT minted successfully!", "profit");
      await refreshGameData();
      
    } catch (error) {
      console.error("Error minting NFT:", error);
      addLog(`Failed to mint NFT: ${error.message}`, "loss");
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [getContract, refreshGameData]);
  
  // Grant permissions
  const grantPermissions = useCallback(async () => {
    if (!fhevmInstance) {
      await initializeFHEVM();
    }
    
    const contract = getContract();
    if (!contract) return;
    
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      addLog("Granting permissions...", "neutral");
      
      await fhevmInstance.generateToken(ZamaDiceAddresses.sepolia);
      
      addLog("Permissions granted successfully!", "profit");
      setGameState(prev => ({ ...prev, isLoading: false }));
      
    } catch (error) {
      console.error("Error granting permissions:", error);
      addLog(`Failed to grant permissions: ${error.message}`, "loss");
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  }, [fhevmInstance, getContract, initializeFHEVM]);
  
  // Decrypt balance
  const decryptBalance = useCallback(async () => {
    if (!fhevmInstance || !gameState.encryptedBalance) return null;
    
    try {
      const decrypted = await fhevmInstance.decrypt(
        ZamaDiceAddresses.sepolia,
        gameState.encryptedBalance
      );
      
      const balance = parseInt(decrypted);
      setGameState(prev => ({ ...prev, decryptedBalance: balance }));
      return balance;
      
    } catch (error) {
      console.error("Error decrypting balance:", error);
      addLog(`Failed to decrypt balance: ${error.message}`, "loss");
      return null;
    }
  }, [fhevmInstance, gameState.encryptedBalance]);
  
  // Decrypt position
  const decryptPosition = useCallback(async () => {
    if (!fhevmInstance || !gameState.currentPosition) return null;
    
    try {
      const decrypted = await fhevmInstance.decrypt(
        ZamaDiceAddresses.sepolia,
        gameState.currentPosition
      );
      
      const position = parseInt(decrypted);
      setGameState(prev => ({ ...prev, decryptedPosition: position }));
      return position;
      
    } catch (error) {
      console.error("Error decrypting position:", error);
      addLog(`Failed to decrypt position: ${error.message}`, "loss");
      return null;
    }
  }, [fhevmInstance, gameState.currentPosition]);
  
  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setGameState({
      connected: false,
      gameStarted: false,
      playerHasNFT: false,
      currentPosition: "0x0000000000000000000000000000000000000000000000000000000000000000",
      encryptedBalance: "0x0000000000000000000000000000000000000000000000000000000000000000",
      ethBalance: "0.0000",
      nftSupply: 0,
      maxNftSupply: 10000,
      isLoading: false,
      lastAction: 0
    });
    setCurrentTile(null);
    addLog("Wallet disconnected", "neutral");
  }, []);
  
  return {
    gameState,
    logs,
    currentTile,
    showDiceAnimation,
    diceResult,
    connectWallet,
    disconnectWallet,
    refreshGameData,
    startGame,
    rollDice,
    claimReward,
    mintNFT,
    grantPermissions,
    decryptBalance,
    decryptPosition,
    addLog
  };
}