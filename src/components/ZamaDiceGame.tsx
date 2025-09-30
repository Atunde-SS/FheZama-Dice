import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useIsMobile } from "@/hooks/use-mobile";
import { GameBoard } from "./game/GameBoard";
import { WalletPanel } from "./game/WalletPanel";
import { GameActions } from "./game/GameActions";
import { GameLog } from "./game/GameLog";
import { TileDetails } from "./game/TileDetails";
import { HelpDialog } from "./game/HelpDialog";
import { DecryptionPanel } from "./game/DecryptionPanel";
import { DiceAnimation } from "./game/DiceAnimation";
import { AchievementPanel } from "./game/AchievementPanel";
import { SurvivalMode } from "./game/SurvivalMode";
import { useGameProgress } from "@/hooks/useGameProgress";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// Import fhEVM hooks
import { useFhevm } from "../../fhevm-react";
import { useInMemoryStorage } from "@/hooks/useInMemoryStorage";
import { useMetaMaskEthersSigner } from "@/hooks/metamask/useMetaMaskEthersSigner";
import { useZamaDice } from "@/hooks/useZamaDice";

// Game State Types - Removed redundant connection state
interface GameState {
  gameStarted: boolean;
  playerHasNFT: boolean;
  currentPosition: string;
  encryptedBalance: string;
  ethBalance: string;
  nftSupply: number;
  maxNftSupply: number;
  isLoading: boolean;
  lastAction: number;
}

interface TileData {
  name: string;
  type: string;
  value: string;
}

interface LogEntry {
  message: string;
  type: "neutral" | "profit" | "loss";
  timestamp: Date;
}

export const ZamaDiceGame = () => {
  const { toast } = useToast();
  const sounds = useSoundEffects();
  const gameProgress = useGameProgress();
  const isMobile = useIsMobile();

  // fhEVM Integration
  const { storage: fhevmDecryptionSignatureStorage } = useInMemoryStorage();
  const {
    provider,
    chainId,
    accounts,
    isConnected,
    connect,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
    initialMockChains,
  } = useMetaMaskEthersSigner();

  const {
    instance: fhevmInstance,
    status: fhevmStatus,
    error: fhevmError,
  } = useFhevm({
    provider,
    chainId,
    initialMockChains,
    enabled: true,
  });

  const zamaDice = useZamaDice({
    instance: fhevmInstance,
    fhevmDecryptionSignatureStorage,
    eip1193Provider: provider,
    chainId,
    ethersSigner,
    ethersReadonlyProvider,
    sameChain,
    sameSigner,
  });

  const [gameState, setGameState] = useState<GameState>({
    gameStarted: false,
    playerHasNFT: false,
    currentPosition: "0x0000000000000000000000000000000000000000000000000000000000000000",
    encryptedBalance: "0x0000000000000000000000000000000000000000000000000000000000000000",
    ethBalance: "0.0000",
    nftSupply: 0,
    maxNftSupply: 10000,
    isLoading: false,
    lastAction: 0,
  });

  // In-game balance tracking (starts at 500 ZAMA when game begins)
  const [inGameBalance, setInGameBalance] = useState<number>(0);

  // Transaction state tracking to prevent connection loss
  const [activeTransactions, setActiveTransactions] = useState<Set<string>>(new Set());

  const [tileData, setTileData] = useState<TileData[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [gameLog, setGameLog] = useState<LogEntry[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);

  // Add log entry
  const addLogEntry = useCallback((message: string, type: "neutral" | "profit" | "loss" = "neutral") => {
    setGameLog(prev => [...prev, { message, type, timestamp: new Date() }]);
  }, []);

  // Connect wallet - Updated to use fhEVM integration with connection stabilization
  const connectWallet = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      addLogEntry("Connecting wallet...", "neutral");
      
      await connect();
      
      // Add a small delay to ensure connection is stable
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Check if provider is ready
      const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
      if (!accounts || accounts.length === 0) {
        throw new Error("No accounts available after connection");
      }
      
      addLogEntry("Wallet connected, initializing game connection...", "neutral");
      
      // Add another small delay for chain data to sync
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      addLogEntry("Wallet connected successfully!", "profit");
      sounds.playGameStart();
      toast({
        title: "Wallet Connected! 🎮",
        description: "Ready to play Zama Dice with fhEVM encryption",
      });
    } catch (error) {
      console.error("Error connecting wallet:", error);
      addLogEntry(`Error connecting wallet: ${error}`, "loss");
      toast({
        title: "Connection Failed",
        description: error.message || "Please install MetaMask or check your connection",
        variant: "destructive",
      });
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Reset in-game balance when disconnecting
  useEffect(() => {
    if (!isConnected) {
      setInGameBalance(0);
      setGameState({
        gameStarted: false,
        playerHasNFT: false,
        currentPosition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        encryptedBalance: "0x0000000000000000000000000000000000000000000000000000000000000000",
        ethBalance: "0.0000",
        nftSupply: 0,
        maxNftSupply: 10000,
        isLoading: false,
        lastAction: 0,
      });
    }
  }, [isConnected]);

  // Stable connection management - only update when truly connected or disconnected
  useEffect(() => {
    // Only trigger state updates when connection actually changes
    if (isConnected && ethersSigner && zamaDice.isDeployed) {
      console.log("[ZamaDice] Wallet connected and contract deployed, initializing...");
      updateGameState();
      loadTileData();
    } else if (!isConnected) {
      console.log("[ZamaDice] Wallet disconnected, resetting state...");
      // Reset only essential state when disconnected
      setGameState(prev => ({
        ...prev,
        gameStarted: false,
        playerHasNFT: false,
        currentPosition: "0x0000000000000000000000000000000000000000000000000000000000000000",
        encryptedBalance: "0x0000000000000000000000000000000000000000000000000000000000000000",
        ethBalance: "0.0000",
        nftSupply: 0,
        isLoading: false,
        lastAction: 0,
      }));
      setTileData([]);
    }
  }, [isConnected, zamaDice.isDeployed]); // Remove ethersSigner from dependencies to prevent re-initialization

  // Transaction-safe update helper
  const withTransaction = useCallback(async (txId: string, operation: () => Promise<void>) => {
    try {
      setActiveTransactions(prev => new Set([...prev, txId]));
      console.log(`[ZamaDice] Starting transaction: ${txId}`);
      await operation();
      console.log(`[ZamaDice] Transaction completed: ${txId}`);
    } catch (error) {
      console.error(`[ZamaDice] Transaction failed: ${txId}`, error);
      throw error;
    } finally {
      setActiveTransactions(prev => {
        const next = new Set(prev);
        next.delete(txId);
        return next;
      });
    }
  }, []);

  // Update game state from contract - protected from transaction interference
  const updateGameState = useCallback(async () => {
    if (!isConnected || !zamaDice.isDeployed || activeTransactions.size > 0) {
      console.log(`[ZamaDice] Skipping state update - connected: ${isConnected}, deployed: ${zamaDice.isDeployed}, active transactions: ${activeTransactions.size}`);
      return;
    }

    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        zamaDice.getPlayerStatus(),
        zamaDice.getEthBalance(),
        zamaDice.getNFTInfo()
      ]);

      // Handle results individually
      const [statusResult, ethResult, nftResult] = results;

      if (statusResult.status === 'fulfilled' && statusResult.value) {
        const playerStatus = statusResult.value;
        setGameState(prev => ({
          ...prev,
          gameStarted: playerStatus.hasStarted,
          playerHasNFT: playerStatus.hasMintedNFT,
          lastAction: playerStatus.lastAction,
        }));
      } else {
        console.warn("Failed to get player status:", (statusResult as PromiseRejectedResult).reason);
      }

      if (ethResult.status === 'fulfilled') {
        setGameState(prev => ({
          ...prev,
          ethBalance: ethResult.value,
        }));
      } else {
        console.warn("Failed to get ETH balance:", (ethResult as PromiseRejectedResult).reason);
      }

      if (nftResult.status === 'fulfilled') {
        const nftInfo = nftResult.value;
        setGameState(prev => ({
          ...prev,
          nftSupply: nftInfo.currentSupply,
          maxNftSupply: nftInfo.maxSupply,
        }));
      } else {
        console.warn("Failed to get NFT info:", (nftResult as PromiseRejectedResult).reason);
      }

      // Update encrypted balance and position from fhEVM hook
      if (zamaDice.balanceHandle) {
        setGameState(prev => ({
          ...prev,
          encryptedBalance: zamaDice.balanceHandle!,
        }));
      }

      if (zamaDice.positionHandle) {
        setGameState(prev => ({
          ...prev,
          currentPosition: zamaDice.positionHandle!,
        }));
      }

    } catch (error) {
      console.error("Error updating game state:", error);
      console.warn("Network issues detected - some game data may be outdated");
    }
  }, [isConnected, zamaDice.isDeployed, activeTransactions.size, zamaDice.balanceHandle, zamaDice.positionHandle]);

  // Load tile data - protected from transaction interference
  const loadTileData = useCallback(async () => {
    if (!isConnected || !zamaDice.isDeployed || activeTransactions.size > 0) {
      console.log(`[ZamaDice] Skipping tile data load - connected: ${isConnected}, deployed: ${zamaDice.isDeployed}, active transactions: ${activeTransactions.size}`);
      return;
    }

    try {
      // Load all tiles in parallel with Promise.allSettled for better error handling
      const tilePromises = Array.from({ length: 16 }, (_, i) => zamaDice.getTile(i));
      const results = await Promise.allSettled(tilePromises);
      
      const tiles: TileData[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          tiles.push(result.value);
        } else {
          console.warn(`Failed to load tile ${index}:`, (result as PromiseRejectedResult).reason);
          // Use fallback data for failed tiles
          tiles.push({ 
            name: `Tile ${index}`, 
            type: "0", 
            value: "0" 
          });
        }
      });
      
      setTileData(tiles);
      addLogEntry(`Loaded ${results.filter(r => r.status === 'fulfilled').length}/16 tiles`, "neutral");
    } catch (error) {
      console.error("Error loading tile data:", error);
      // Initialize with fallback data
      const fallbackTiles = Array.from({ length: 16 }, (_, i) => ({
        name: `Tile ${i}`,
        type: "0",
        value: "0"
      }));
      setTileData(fallbackTiles);
      addLogEntry("Using fallback tile data due to network issues", "loss");
    }
  }, [isConnected, zamaDice.isDeployed, activeTransactions.size, zamaDice, addLogEntry]);

  // Game Actions - Transaction-safe implementations with connection checks
  const startGame = async () => {
    // Check for stable connection first
    const accounts = await window.ethereum?.request({ method: 'eth_accounts' });
    if (!accounts || accounts.length === 0) {
      toast({
        title: "Connection Error",
        description: "Please wait for wallet connection to stabilize",
        variant: "destructive",
      });
      return;
    }

    await withTransaction("startGame", async () => {
      try {
        setGameState(prev => ({ ...prev, isLoading: true }));
        addLogEntry("Initializing game...", "neutral");
        
        // Add a small delay to ensure blockchain state is synced
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        await zamaDice.startGame();
        
        // Initialize in-game balance to encrypted state
        setInGameBalance(500);
        
        sounds.playGameStart();
        addLogEntry("Game started! You received encrypted ZAMA tokens", "profit");
        
        toast({
          title: "Game Started! 🚀",
          description: "Your encrypted ZAMA tokens are ready. Use the decryption panel to view your balance.",
        });
      } catch (error: any) {
        console.error("Error starting game:", error);
        addLogEntry(`Error starting game: ${error.message}`, "loss");
        toast({
          title: "Transaction Failed",
          description: error.message || "Failed to start game",
          variant: "destructive",
        });
        throw error; // Re-throw to trigger the catch block
      } finally {
        setGameState(prev => ({ ...prev, isLoading: false }));
      }
    });
  };

  const rollDice = async () => {
    if (!gameProgress.useEnergy()) {
      return;
    }
    
    await withTransaction("rollDice", async () => {
      setGameState(prev => ({ ...prev, isLoading: true }));
      setIsRollingDice(true);
      
      // Simulate dice roll locally (1-6)
      const diceRoll = Math.floor(Math.random() * 6) + 1;
      setLastDiceRoll(diceRoll);
      
      await zamaDice.rollDice();
      sounds.playDiceRoll();
      gameProgress.trackRoll();
      
      // Update in-game balance based on tile type (simplified logic)
      // In a real game, you'd get this from the smart contract
      const tileTypes = ["safe", "profit", "loss", "bonus"];
      const randomTileType = tileTypes[Math.floor(Math.random() * tileTypes.length)];
      
      let balanceChange = 0;
      let changeMessage = "";
      
      switch (randomTileType) {
        case "profit":
          balanceChange = Math.floor(Math.random() * 50) + 10; // 10-60
          changeMessage = `+${balanceChange} ZAMA`;
          setInGameBalance(prev => prev + balanceChange);
          addLogEntry(`🎲 Rolled ${diceRoll}! Landed on Profit tile: ${changeMessage}`, "profit");
          break;
        case "loss":
          balanceChange = Math.floor(Math.random() * 30) + 5; // 5-35
          changeMessage = `-${balanceChange} ZAMA`;
          setInGameBalance(prev => Math.max(0, prev - balanceChange));
          addLogEntry(`🎲 Rolled ${diceRoll}! Landed on Loss tile: ${changeMessage}`, "loss");
          break;
        case "bonus":
          balanceChange = Math.floor(Math.random() * 100) + 50; // 50-150
          changeMessage = `+${balanceChange} ZAMA`;
          setInGameBalance(prev => prev + balanceChange);
          addLogEntry(`🎲 Rolled ${diceRoll}! 🎉 BONUS tile: ${changeMessage}`, "profit");
          break;
        default:
          addLogEntry(`🎲 Rolled ${diceRoll}! Landed on Safe tile`, "neutral");
      }
      
      toast({
        title: `Dice Rolled: ${diceRoll}! 🎲`,
        description: changeMessage || "Safe tile - no change",
      });
      setGameState(prev => ({ ...prev, isLoading: false }));
    }).catch((error: any) => {
      console.error("Error rolling dice:", error);
      addLogEntry(`Error rolling dice: ${error.message}`, "loss");
      toast({
        title: "Roll Failed",
        description: error.message || "Failed to roll dice",
        variant: "destructive",
      });
      setIsRollingDice(false);
      setGameState(prev => ({ ...prev, isLoading: false }));
    });
  };

  const handleDiceRollComplete = () => {
    setIsRollingDice(false);
    // Simulate getting encrypted dice roll result
    const simulatedRoll = Math.floor(Math.random() * 6) + 1;
    setLastDiceRoll(simulatedRoll);
  };

  const claimReward = async () => {
    await withTransaction("claimReward", async () => {
      setGameState(prev => ({ ...prev, isLoading: true }));
      await zamaDice.claimReward();
      
      // Simulate outcome for progress tracking
      const outcome = Math.random() > 0.4 ? 'win' : 'loss';
      const amount = Math.floor(Math.random() * 100) + 10;
      
      if (outcome === 'win') {
        gameProgress.trackWin(amount);
        addLogEntry(`🎯 Reward claimed successfully!`, "profit");
      } else {
        gameProgress.trackLoss(amount);
        addLogEntry(`⚠️ Tile penalty applied`, "loss");
      }
      
      toast({
        title: "Reward Claimed! 🎯",
        description: "Encrypted tile effects applied to your balance",
      });
      setGameState(prev => ({ ...prev, isLoading: false }));
    }).catch((error: any) => {
      console.error("Error claiming reward:", error);
      addLogEntry(`Error claiming reward: ${error.message}`, "loss");
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
      setGameState(prev => ({ ...prev, isLoading: false }));
    });
  };

  const mintNFT = async () => {
    await withTransaction("mintNFT", async () => {
      setGameState(prev => ({ ...prev, isLoading: true }));
      await zamaDice.mintNFT();
      gameProgress.trackNFTMint();
      addLogEntry("NFT minted successfully!", "profit");
      
      toast({
        title: "NFT Minted! 🎨",
        description: "Limited edition Zama Dice NFT created",
      });
      setGameState(prev => ({ ...prev, isLoading: false }));
    }).catch((error: any) => {
      console.error("Error minting NFT:", error);
      addLogEntry(`Error minting NFT: ${error.message}`, "loss");
      toast({
        title: "Minting Failed", 
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      });
      setGameState(prev => ({ ...prev, isLoading: false }));
    });
  };

  // Decryption methods - Updated to use fhEVM
  const handleDecryptBalance = useCallback(async () => {
    try {
      zamaDice.decryptBalance();
      sounds.playClick();
      addLogEntry("Decrypting balance using fhEVM...", "neutral");
      toast({
        title: "Decrypting Balance 🔓",
        description: "Using fhEVM to reveal your encrypted balance...",
      });
    } catch (error: any) {
      console.error("Decryption error:", error);
      addLogEntry(`Error decrypting balance: ${error.message}`, "loss");
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt balance",
        variant: "destructive",
      });
    }
  }, [zamaDice, sounds, toast, addLogEntry]);

  const handleDecryptPosition = useCallback(async () => {
    try {
      zamaDice.decryptPosition();
      sounds.playClick();
      addLogEntry("Decrypting position using fhEVM...", "neutral");
      toast({
        title: "Decrypting Position 🔓",
        description: "Using fhEVM to reveal your encrypted position...",
      });
    } catch (error: any) {
      console.error("Decryption error:", error);
      addLogEntry(`Error decrypting position: ${error.message}`, "loss");
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt position",
        variant: "destructive",
      });
    }
  }, [zamaDice, sounds, toast, addLogEntry]);

  const handleGrantPermissions = useCallback(async () => {
    try {
      await zamaDice.grantPermissions();
      sounds.playClick();
      addLogEntry("Permissions granted successfully", "neutral");
      toast({
        title: "Permissions Granted! ✅",
        description: "You can now decrypt your encrypted data",
      });
    } catch (error: any) {
      console.error("Grant permissions error:", error);
      addLogEntry(`Error granting permissions: ${error.message}`, "loss");
      toast({
        title: "Permission Failed",
        description: error.message || "Failed to grant permissions",
        variant: "destructive",
      });
    }
  }, [zamaDice, sounds, toast, addLogEntry]);

  // Auto refresh - paused during transactions
  useEffect(() => {
    if (!autoRefresh || !isConnected || activeTransactions.size > 0) return;

    const interval = setInterval(() => {
      if (activeTransactions.size === 0) {
        console.log("[ZamaDice] Auto-refreshing game state...");
        updateGameState();
      } else {
        console.log("[ZamaDice] Skipping auto-refresh due to active transactions");
      }
    }, 20000); // 20s interval to reduce RPC load

    return () => clearInterval(interval);
  }, [autoRefresh, isConnected, activeTransactions.size, updateGameState]);

  // Initial load
  useEffect(() => {
    addLogEntry("🔒 Welcome to Zama Dice - Encrypted Blockchain Gaming!", "neutral");
    addLogEntry("Connect your wallet to start playing", "neutral");
  }, [addLogEntry]);

  // Load tile data when connected - removed as it's now handled in main connection effect
  // This prevents duplicate tile loading and state conflicts

  // Mobile vs Desktop Layout
  if (isMobile) {
    return (
      <div className="min-h-screen bg-gradient-board">
        <Tabs defaultValue="board" className="h-full">
          {/* Mobile Header */}
          <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-sm border-b border-border">
            <div className="p-4">
              <div className="text-center mb-3">
                <h1 className="text-xl font-bold text-primary mb-1">
                  🔒 ZAMA DICE
                </h1>
                <div className="flex items-center justify-center gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-xs">
                    Lvl {gameProgress.stats.level}
                  </Badge>
                  <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                    {isConnected ? "🔗" : "❌"}
                  </Badge>
                  {activeTransactions.size > 0 && (
                    <Badge variant="secondary" className="text-xs animate-pulse">
                      🔄 {activeTransactions.size}
                    </Badge>
                  )}
                </div>
              </div>
              
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="board">Board</TabsTrigger>
                <TabsTrigger value="actions">Actions</TabsTrigger>
                <TabsTrigger value="stats">Stats</TabsTrigger>
              </TabsList>
            </div>
          </div>

          {/* Board Tab */}
          <TabsContent value="board" className="m-0 p-2">
            <div className="relative">
              <GameBoard 
                tileData={tileData}
                onTileClick={setSelectedTile}
                selectedTile={selectedTile}
                currentPosition={gameState.currentPosition}
              />
              <div className="absolute top-2 right-2">
                <HelpDialog />
              </div>
            </div>
            {selectedTile !== null && tileData[selectedTile] && (
              <div className="mt-2">
                <TileDetails 
                  tile={tileData[selectedTile]}
                  tileIndex={selectedTile}
                  onClose={() => setSelectedTile(null)}
                />
              </div>
            )}
          </TabsContent>

          {/* Actions Tab */}
          <TabsContent value="actions" className="m-0 p-2 space-y-3">
            <WalletPanel 
              connected={isConnected}
              ethBalance={gameState.ethBalance}
              encryptedBalance={gameState.encryptedBalance}
              inGameBalance={inGameBalance}
              gameStarted={gameState.gameStarted}
              onConnect={connectWallet}
              isLoading={gameState.isLoading || activeTransactions.size > 0}
              autoRefresh={autoRefresh}
              onAutoRefreshChange={setAutoRefresh}
            />

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Player Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Status:</span>
                  <Badge variant={gameState.gameStarted ? "default" : "secondary"}>
                    {gameState.gameStarted ? "Active" : "Not Started"}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span>Position:</span>
                  <span className="font-mono text-xs">
                    {gameState.currentPosition === "0x0000000000000000000000000000000000000000000000000000000000000000" 
                      ? "Not Started" 
                      : "🔒 Encrypted"
                    }
                  </span>
                </div>
              </CardContent>
            </Card>

            <GameActions
              connected={isConnected}
              gameStarted={gameState.gameStarted}
              playerHasNFT={gameState.playerHasNFT}
              isLoading={gameState.isLoading}
              onStartGame={startGame}
              onRollDice={rollDice}
              onClaimReward={claimReward}
              onMintNFT={mintNFT}
              diceAnimation={
                <DiceAnimation
                  isRolling={isRollingDice}
                  finalValue={lastDiceRoll || undefined}
                  onRollComplete={handleDiceRollComplete}
                />
              }
            />

            {isConnected && (
              <DecryptionPanel
                encryptedBalance={zamaDice.balanceHandle || "0x0000000000000000000000000000000000000000000000000000000000000000"}
                encryptedPosition={zamaDice.positionHandle || "0x0000000000000000000000000000000000000000000000000000000000000000"}
                decryptedBalance={zamaDice.clearBalance?.toString()}
                decryptedPosition={zamaDice.clearPosition?.toString()}
                onDecryptBalance={handleDecryptBalance}
                onDecryptPosition={handleDecryptPosition}
                onGrantPermissions={handleGrantPermissions}
                isLoading={zamaDice.isDecrypting}
              />
            )}

            <GameLog entries={gameLog} />
          </TabsContent>

          {/* Stats Tab */}
          <TabsContent value="stats" className="m-0 p-2 space-y-3">
            <AchievementPanel 
              achievements={gameProgress.achievements}
              stats={gameProgress.stats}
            />

            <SurvivalMode
              isActive={gameProgress.gameMode === 'survival'}
              npc={gameProgress.getActiveNPC()}
              stats={gameProgress.stats}
              onToggleMode={() => gameProgress.setGameMode(
                gameProgress.gameMode === 'survival' ? 'normal' : 'survival'
              )}
              onReset={gameProgress.resetGame}
            />
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="min-h-screen bg-gradient-board flex">
      <div className="flex-1 relative">
        <GameBoard 
          tileData={tileData}
          onTileClick={setSelectedTile}
          selectedTile={selectedTile}
          currentPosition={gameState.currentPosition}
        />
        
        <div className="absolute top-4 right-4">
          <HelpDialog />
        </div>
      </div>

      <div className="w-96 bg-card/95 backdrop-blur-sm border-l border-border overflow-y-auto">
        <div className="p-4 space-y-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-2 text-shadow">
              🔒 ZAMA DICE
            </h1>
            <p className="text-sm text-muted-foreground">
              Encrypted blockchain gaming with FHE technology
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                Level {gameProgress.stats.level}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {gameProgress.gameMode === 'survival' ? 'Survival Mode' : 'Normal Mode'}
              </Badge>
              <Badge variant={isConnected ? "default" : "destructive"} className="text-xs">
                {isConnected ? "🔗 Connected" : "❌ Disconnected"}
              </Badge>
              {activeTransactions.size > 0 && (
                <Badge variant="secondary" className="text-xs animate-pulse">
                  🔄 {activeTransactions.size} TX
                </Badge>
              )}
            </div>
          </div>

          <Separator />

          <WalletPanel 
            connected={isConnected}
            ethBalance={gameState.ethBalance}
            encryptedBalance={gameState.encryptedBalance}
            inGameBalance={inGameBalance}
            gameStarted={gameState.gameStarted}
            onConnect={connectWallet}
            isLoading={gameState.isLoading || activeTransactions.size > 0}
            autoRefresh={autoRefresh}
            onAutoRefreshChange={setAutoRefresh}
          />

          <Separator />

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Player Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Status:</span>
                <Badge variant={gameState.gameStarted ? "default" : "secondary"}>
                  {gameState.gameStarted ? "Active" : "Not Started"}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span>Position:</span>
                <span className="font-mono text-xs">
                  {gameState.currentPosition === "0x0000000000000000000000000000000000000000000000000000000000000000" 
                    ? "Not Started" 
                    : "🔒 Encrypted"
                  }
                </span>
              </div>
              <div className="flex justify-between">
                <span>Has NFT:</span>
                <Badge variant={gameState.playerHasNFT ? "default" : "outline"}>
                  {gameState.playerHasNFT ? "Yes" : "No"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <GameActions
            connected={isConnected}
            gameStarted={gameState.gameStarted}
            playerHasNFT={gameState.playerHasNFT}
            isLoading={gameState.isLoading}
            onStartGame={startGame}
            onRollDice={rollDice}
            onClaimReward={claimReward}
            onMintNFT={mintNFT}
            diceAnimation={
              <DiceAnimation
                isRolling={isRollingDice}
                finalValue={lastDiceRoll || undefined}
                onRollComplete={handleDiceRollComplete}
              />
            }
          />

          {isConnected && (
            <>
              <Separator />
              <DecryptionPanel
                encryptedBalance={zamaDice.balanceHandle || "0x0000000000000000000000000000000000000000000000000000000000000000"}
                encryptedPosition={zamaDice.positionHandle || "0x0000000000000000000000000000000000000000000000000000000000000000"}
                decryptedBalance={zamaDice.clearBalance?.toString()}
                decryptedPosition={zamaDice.clearPosition?.toString()}
                onDecryptBalance={handleDecryptBalance}
                onDecryptPosition={handleDecryptPosition}
                onGrantPermissions={handleGrantPermissions}
                isLoading={zamaDice.isDecrypting}
              />
            </>
          )}

          {selectedTile !== null && tileData[selectedTile] && (
            <TileDetails 
              tile={tileData[selectedTile]}
              tileIndex={selectedTile}
              onClose={() => setSelectedTile(null)}
            />
          )}

          <AchievementPanel 
            achievements={gameProgress.achievements}
            stats={gameProgress.stats}
          />

          <Separator />

          <SurvivalMode
            isActive={gameProgress.gameMode === 'survival'}
            npc={gameProgress.getActiveNPC()}
            stats={gameProgress.stats}
            onToggleMode={() => gameProgress.setGameMode(
              gameProgress.gameMode === 'survival' ? 'normal' : 'survival'
            )}
            onReset={gameProgress.resetGame}
          />

          <Separator />

          <GameLog entries={gameLog} />
        </div>
      </div>
    </div>
  );
};