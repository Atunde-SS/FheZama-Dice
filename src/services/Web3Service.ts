import Web3 from 'web3';

// Sepolia testnet configuration with multiple RPC endpoints
const SEPOLIA_CONFIG = {
  chainId: "0xaa36a7",
  chainName: "Sepolia",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: [
    "https://ethereum-sepolia.publicnode.com",
    "https://rpc2.sepolia.org",
    "https://rpc.sepolia.org",
    "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161"
  ],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
};

const CONTRACT_ADDRESS = "0xAA89C8E13A0Bb610F5320D022679eAF85495C1C4";

// Smart Contract ABI
const CONTRACT_ABI = [
  {
    inputs: [],
    stateMutability: "nonpayable",
    type: "constructor",
  },
  {
    inputs: [],
    name: "AlreadyStarted",
    type: "error",
  },
  {
    inputs: [],
    name: "GameNotStarted",
    type: "error",
  },
  {
    inputs: [],
    name: "MaxNFTSupplyReached",
    type: "error",
  },
  {
    inputs: [],
    name: "NFTAlreadyMinted",
    type: "error",
  },
  {
    inputs: [],
    name: "TooSoon",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "euint8",
        name: "roll",
        type: "bytes32",
      },
    ],
    name: "DiceRolled",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "GameStarted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "tokenId",
        type: "uint256",
      },
    ],
    name: "NFTMinted",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        indexed: false,
        internalType: "euint64",
        name: "amount",
        type: "bytes32",
      },
    ],
    name: "RewardClaimed",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        internalType: "euint64",
        name: "value",
        type: "bytes32",
      },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "claimReward",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "decimals",
    outputs: [
      {
        internalType: "uint8",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getNFTInfo",
    outputs: [
      {
        internalType: "uint256",
        name: "currentSupply",
        type: "uint256",
      },
      {
        internalType: "uint256",
        name: "maxSupply",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "getPlayerBalance",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "getPlayerPosition",
    outputs: [
      {
        internalType: "euint8",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "getPlayerStatus",
    outputs: [
      {
        internalType: "bool",
        name: "hasStarted",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "hasMintedNFT",
        type: "bool",
      },
      {
        internalType: "uint32",
        name: "lastAction",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint8",
        name: "position",
        type: "uint8",
      },
    ],
    name: "getTile",
    outputs: [
      {
        internalType: "string",
        name: "tileName",
        type: "string",
      },
      {
        internalType: "enum Gzama.TileType",
        name: "tileType",
        type: "uint8",
      },
      {
        internalType: "uint256",
        name: "value",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "grantPermissions",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "mintNFT",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "nftOwnerOf",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "nftSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    name: "players",
    outputs: [
      {
        internalType: "euint8",
        name: "position",
        type: "bytes32",
      },
      {
        internalType: "bool",
        name: "hasStarted",
        type: "bool",
      },
      {
        internalType: "bool",
        name: "hasMintedNFT",
        type: "bool",
      },
      {
        internalType: "uint32",
        name: "lastAction",
        type: "uint32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "protocolId",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "rollDice",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "startGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "euint64",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

interface PlayerStatus {
  hasStarted: boolean;
  hasMintedNFT: boolean;
  lastAction: number;
}

interface NFTInfo {
  currentSupply: number;
  maxSupply: number;
}

interface TileData {
  name: string;
  type: string;
  value: string;
}

export class Web3Service {
  private web3: Web3 | null = null;
  private contract: any = null;
  private accounts: string[] = [];
  private eventListeners: any[] = [];
  private currentRpcIndex = 0;
  private rpcUrls = SEPOLIA_CONFIG.rpcUrls;
  private requestTimeout = 10000; // 10 seconds
  private retryCount = 0;
  private maxRetries = 2;
  private circuitBreakerFailures = 0;
  private circuitBreakerThreshold = 5;
  private circuitBreakerResetTime = 60000; // 1 minute
  private lastCircuitBreakerReset = 0;

  async connectWallet(): Promise<void> {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask or another Web3 wallet");
    }

    try {
      // Request account access
      this.accounts = await window.ethereum.request({ 
        method: "eth_requestAccounts" 
      });

      // Check network
      const chainId = await window.ethereum.request({ 
        method: "eth_chainId" 
      });

      if (chainId !== SEPOLIA_CONFIG.chainId) {
        await this.switchToSepolia();
      }

      // Initialize Web3 with timeout and multiple RPC endpoints
      await this.initializeWeb3WithFallback();

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        this.accounts = accounts;
        if (accounts.length === 0) {
          this.disconnect();
        }
      });

      // Listen for chain changes
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });

    } catch (error) {
      console.error("Error connecting wallet:", error);
      throw error;
    }
  }

  private async initializeWeb3WithFallback(): Promise<void> {
    // Try MetaMask provider first
    try {
      this.web3 = new Web3(window.ethereum);
      // Test connection
      await this.withTimeout(this.web3.eth.getChainId(), 5000);
      this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      return;
    } catch (error) {
      console.warn("MetaMask provider failed, trying fallback RPC:", error);
    }

    // Try fallback RPC endpoints
    for (let i = 0; i < this.rpcUrls.length; i++) {
      try {
        this.currentRpcIndex = i;
        this.web3 = new Web3(this.rpcUrls[i]);
        
        // Test connection
        await this.withTimeout(this.web3.eth.getChainId(), 5000);
        
        this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
        console.log(`Connected to RPC: ${this.rpcUrls[i]}`);
        return;
      } catch (error) {
        console.warn(`RPC ${this.rpcUrls[i]} failed:`, error);
        if (i === this.rpcUrls.length - 1) {
          throw new Error("All RPC endpoints failed");
        }
      }
    }
  }

  private async withTimeout<T>(promise: Promise<T>, timeout: number): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) => 
        setTimeout(() => reject(new Error('Request timeout')), timeout)
      )
    ]);
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    // Circuit breaker check
    if (this.circuitBreakerFailures >= this.circuitBreakerThreshold) {
      const now = Date.now();
      if (now - this.lastCircuitBreakerReset < this.circuitBreakerResetTime) {
        throw new Error("Circuit breaker open - too many failures");
      } else {
        // Reset circuit breaker
        this.circuitBreakerFailures = 0;
        this.lastCircuitBreakerReset = now;
      }
    }

    for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
      try {
        const result = await this.withTimeout(operation(), this.requestTimeout);
        // Reset failure count on success
        if (this.circuitBreakerFailures > 0) {
          this.circuitBreakerFailures = Math.max(0, this.circuitBreakerFailures - 1);
        }
        return result;
      } catch (error) {
        this.circuitBreakerFailures++;
        
        if (attempt === this.maxRetries) {
          throw error;
        }
        
        // Try next RPC endpoint
        await this.switchToNextRPC();
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
    throw new Error("Max retries exceeded");
  }

  private async switchToNextRPC(): Promise<void> {
    if (!this.web3 || this.rpcUrls.length <= 1) return;
    
    this.currentRpcIndex = (this.currentRpcIndex + 1) % this.rpcUrls.length;
    try {
      this.web3 = new Web3(this.rpcUrls[this.currentRpcIndex]);
      this.contract = new this.web3.eth.Contract(CONTRACT_ABI, CONTRACT_ADDRESS);
      console.log(`Switched to RPC: ${this.rpcUrls[this.currentRpcIndex]}`);
    } catch (error) {
      console.warn(`Failed to switch to RPC ${this.rpcUrls[this.currentRpcIndex]}:`, error);
    }
  }

  private async switchToSepolia(): Promise<void> {
    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: SEPOLIA_CONFIG.chainId }],
      });
    } catch (switchError: any) {
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_CONFIG],
          });
        } catch (addError) {
          throw new Error("Failed to add Sepolia network");
        }
      } else {
        throw new Error("Failed to switch to Sepolia network");
      }
    }
  }

  disconnect(): void {
    this.web3 = null;
    this.contract = null;
    this.accounts = [];
    // Clean up event listeners
    this.eventListeners.forEach(listener => {
      if (listener && typeof listener.unsubscribe === 'function') {
        listener.unsubscribe();
      }
    });
    this.eventListeners = [];
  }

  isConnected(): boolean {
    return this.web3 !== null && this.contract !== null && this.accounts.length > 0;
  }

  getCurrentAccount(): string {
    return this.accounts[0] || "";
  }

  isCurrentPlayer(address: string): boolean {
    return address.toLowerCase() === this.getCurrentAccount().toLowerCase();
  }

  async getEthBalance(): Promise<string> {
    if (!this.web3 || !this.accounts[0]) return "0.0000";

    try {
      const balance = await this.withRetry(() => 
        this.web3!.eth.getBalance(this.accounts[0])
      );
      return parseFloat(this.web3.utils.fromWei(balance, "ether")).toFixed(4);
    } catch (error) {
      console.error("Error getting ETH balance:", error);
      return "0.0000";
    }
  }

  async getPlayerBalance(): Promise<string> {
    if (!this.contract || !this.accounts[0]) return "0x0000000000000000000000000000000000000000000000000000000000000000";

    try {
      const balance = await this.withRetry(() => 
        this.contract.methods.balanceOf(this.accounts[0]).call()
      ) as string;
      return balance;
    } catch (error) {
      console.error("Error getting player balance:", error);
      return "0x0000000000000000000000000000000000000000000000000000000000000000";
    }
  }

  async getPlayerPosition(): Promise<string> {
    if (!this.contract || !this.accounts[0]) return "0x0000000000000000000000000000000000000000000000000000000000000000";

    try {
      const position = await this.withRetry(() => 
        this.contract.methods.getPlayerPosition(this.accounts[0]).call()
      ) as string;
      return position;
    } catch (error) {
      console.error("Error getting player position:", error);
      return "0x0000000000000000000000000000000000000000000000000000000000000000";
    }
  }

  async getPlayerStatus(): Promise<PlayerStatus> {
    if (!this.contract || !this.accounts[0]) {
      return { hasStarted: false, hasMintedNFT: false, lastAction: 0 };
    }

    try {
      const status = await this.withRetry(() => 
        this.contract.methods.getPlayerStatus(this.accounts[0]).call()
      ) as any;
      return {
        hasStarted: status.hasStarted,
        hasMintedNFT: status.hasMintedNFT,
        lastAction: parseInt(status.lastAction),
      };
    } catch (error) {
      console.error("Error getting player status:", error);
      return { hasStarted: false, hasMintedNFT: false, lastAction: 0 };
    }
  }

  async getNFTInfo(): Promise<NFTInfo> {
    if (!this.contract) return { currentSupply: 0, maxSupply: 10000 };

    try {
      const info = await this.withRetry(() => 
        this.contract.methods.getNFTInfo().call()
      ) as any;
      return {
        currentSupply: parseInt(info.currentSupply),
        maxSupply: parseInt(info.maxSupply),
      };
    } catch (error) {
      console.error("Error getting NFT info:", error);
      return { currentSupply: 0, maxSupply: 10000 };
    }
  }

  async getTile(index: number): Promise<TileData> {
    if (!this.contract) return { name: "Unknown", type: "0", value: "0" };

    try {
      const tile = await this.withRetry(() => 
        this.contract.methods.getTile(index).call()
      ) as any;
      return {
        name: tile.tileName,
        type: tile.tileType.toString(),
        value: tile.value.toString(),
      };
    } catch (error) {
      console.error("Error getting tile:", error);
      return { name: "Unknown", type: "0", value: "0" };
    }
  }

  // Game Actions
  async startGame(): Promise<void> {
    if (!this.contract || !this.accounts[0]) throw new Error("Wallet not connected");

    try {
      await this.contract.methods.startGame().send({ from: this.accounts[0] });
    } catch (error: any) {
      throw new Error(error.message || "Failed to start game");
    }
  }

  async rollDice(): Promise<void> {
    if (!this.contract || !this.accounts[0]) throw new Error("Wallet not connected");

    try {
      await this.contract.methods.rollDice().send({ from: this.accounts[0] });
    } catch (error: any) {
      throw new Error(error.message || "Failed to roll dice");
    }
  }

  async claimReward(): Promise<void> {
    if (!this.contract || !this.accounts[0]) throw new Error("Wallet not connected");

    try {
      await this.contract.methods.claimReward().send({ from: this.accounts[0] });
    } catch (error: any) {
      throw new Error(error.message || "Failed to claim reward");
    }
  }

  async mintNFT(): Promise<void> {
    if (!this.contract || !this.accounts[0]) throw new Error("Wallet not connected");

    try {
      await this.contract.methods.mintNFT().send({ from: this.accounts[0] });
    } catch (error: any) {
      throw new Error(error.message || "Failed to mint NFT");
    }
  }

  async grantPermissions(): Promise<void> {
    if (!this.contract || !this.accounts[0]) throw new Error("Wallet not connected");

    try {
      await this.contract.methods.grantPermissions().send({ from: this.accounts[0] });
    } catch (error: any) {
      throw new Error(error.message || "Failed to grant permissions");
    }
  }

  // Note: These decryption methods would need to integrate with Zama's fhEVM SDK
  // For now, we'll simulate the decryption process since we don't have the full SDK integration
  async decryptBalance(encryptedBalance: string): Promise<string> {
    if (!this.contract || !this.accounts[0]) throw new Error("Wallet not connected");
    
    try {
      // In a real implementation, this would use Zama's fhEVM SDK to decrypt
      // For simulation purposes, we'll return a placeholder that shows the process
      console.log("Decrypting balance:", encryptedBalance);
      
      // Simulated decryption - in reality this would call the appropriate Zama decryption functions
      // The actual implementation would require the fhEVM SDK and proper key management
      const simulatedBalance = Math.floor(Math.random() * 1000) + 100; // Random balance for demo
      return simulatedBalance.toString();
    } catch (error: any) {
      throw new Error(error.message || "Failed to decrypt balance");
    }
  }

  async decryptPosition(encryptedPosition: string): Promise<number> {
    if (!this.contract || !this.accounts[0]) throw new Error("Wallet not connected");
    
    try {
      // In a real implementation, this would use Zama's fhEVM SDK to decrypt
      console.log("Decrypting position:", encryptedPosition);
      
      // Simulated decryption - returns a position between 0-15
      const simulatedPosition = Math.floor(Math.random() * 16);
      return simulatedPosition;
    } catch (error: any) {
      throw new Error(error.message || "Failed to decrypt position");
    }
  }

  async decryptDiceRoll(encryptedRoll: string): Promise<number> {
    if (!this.contract || !this.accounts[0]) throw new Error("Wallet not connected");
    
    try {
      // In a real implementation, this would use Zama's fhEVM SDK to decrypt
      console.log("Decrypting dice roll:", encryptedRoll);
      
      // Simulated decryption - returns a dice roll between 1-6
      const simulatedRoll = Math.floor(Math.random() * 6) + 1;
      return simulatedRoll;
    } catch (error: any) {
      throw new Error(error.message || "Failed to decrypt dice roll");
    }
  }

  // Event Listeners
  onGameStarted(callback: (player: string) => void): void {
    if (!this.contract) {
      console.warn("Contract not initialized, cannot setup event listener");
      return;
    }

    try {
      const listener = this.contract.events.GameStarted({})
        .on("data", (event: any) => {
          callback(event.returnValues.player);
        })
        .on("error", (error: any) => {
          console.error("GameStarted event error:", error);
        });
        
      this.eventListeners.push(listener);
    } catch (error) {
      console.error("Failed to setup GameStarted event listener:", error);
    }
  }

  onDiceRolled(callback: (player: string, roll: string) => void): void {
    if (!this.contract) {
      console.warn("Contract not initialized, cannot setup event listener");
      return;
    }

    try {
      const listener = this.contract.events.DiceRolled({})
        .on("data", (event: any) => {
          callback(event.returnValues.player, event.returnValues.roll);
        })
        .on("error", (error: any) => {
          console.error("DiceRolled event error:", error);
        });
        
      this.eventListeners.push(listener);
    } catch (error) {
      console.error("Failed to setup DiceRolled event listener:", error);
    }
  }

  onNFTMinted(callback: (player: string, tokenId: number) => void): void {
    if (!this.contract) {
      console.warn("Contract not initialized, cannot setup event listener");
      return;
    }

    try {
      const listener = this.contract.events.NFTMinted({})
        .on("data", (event: any) => {
          callback(event.returnValues.player, parseInt(event.returnValues.tokenId));
        })
        .on("error", (error: any) => {
          console.error("NFTMinted event error:", error);
        });
        
      this.eventListeners.push(listener);
    } catch (error) {
      console.error("Failed to setup NFTMinted event listener:", error);
    }
  }

  onRewardClaimed(callback: (player: string, amount: string) => void): void {
    if (!this.contract) {
      console.warn("Contract not initialized, cannot setup event listener");
      return;
    }

    try {
      const listener = this.contract.events.RewardClaimed({})
        .on("data", (event: any) => {
          callback(event.returnValues.player, event.returnValues.amount);
        })
        .on("error", (error: any) => {
          console.error("RewardClaimed event error:", error);
        });
        
      this.eventListeners.push(listener);
    } catch (error) {
      console.error("Failed to setup RewardClaimed event listener:", error);
    }
  }

  onTransfer(callback: (from: string, to: string, value: string) => void): void {
    if (!this.contract) {
      console.warn("Contract not initialized, cannot setup event listener");
      return;
    }

    try {
      const listener = this.contract.events.Transfer({})
        .on("data", (event: any) => {
          callback(event.returnValues.from, event.returnValues.to, event.returnValues.value);
        })
        .on("error", (error: any) => {
          console.error("Transfer event error:", error);
        });
        
      this.eventListeners.push(listener);
    } catch (error) {
      console.error("Failed to setup Transfer event listener:", error);
    }
  }
}

// Global window ethereum types
declare global {
  interface Window {
    ethereum?: any;
  }
}
