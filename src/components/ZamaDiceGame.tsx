import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { GameBoard } from "./game/GameBoard";
import { WalletPanel } from "./game/WalletPanel";
import { GameActions } from "./game/GameActions";
import { GameLog } from "./game/GameLog";
import { TileDetails } from "./game/TileDetails";
import { HelpDialog } from "./game/HelpDialog";
import { DecryptionPanel } from "./game/DecryptionPanel";
import { DiceAnimation } from "./game/DiceAnimation";
import { Web3Service } from "../services/Web3Service";

// Game State Types
interface GameState {
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
    lastAction: 0,
  });

  const [tileData, setTileData] = useState<TileData[]>([]);
  const [selectedTile, setSelectedTile] = useState<number | null>(null);
  const [gameLog, setGameLog] = useState<LogEntry[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [web3Service] = useState(() => new Web3Service());
  const [isRollingDice, setIsRollingDice] = useState(false);
  const [lastDiceRoll, setLastDiceRoll] = useState<number | null>(null);

  // Add log entry
  const addLogEntry = useCallback((message: string, type: "neutral" | "profit" | "loss" = "neutral") => {
    setGameLog(prev => [...prev, { message, type, timestamp: new Date() }]);
  }, []);

  // Connect wallet
  const connectWallet = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      await web3Service.connectWallet();
      
      if (web3Service.isConnected()) {
        setGameState(prev => ({ ...prev, connected: true }));
        await updateGameState();
        setupEventListeners();
        addLogEntry("Wallet connected successfully", "neutral");
        
        toast({
          title: "Wallet Connected! 🎮",
          description: "Ready to play Zama Dice on Sepolia testnet",
        });
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      addLogEntry(`Error connecting wallet: ${error}`, "loss");
      toast({
        title: "Connection Failed",
        description: "Please install MetaMask or check your connection",
        variant: "destructive",
      });
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Setup contract event listeners
  const setupEventListeners = useCallback(() => {
    if (!web3Service.isConnected()) return;

    web3Service.onGameStarted((player: string) => {
      if (web3Service.isCurrentPlayer(player)) {
        addLogEntry("Game started! Received encrypted ZAMA tokens", "profit");
        setGameState(prev => ({ ...prev, gameStarted: true }));
        updateGameState();
      }
    });

    web3Service.onDiceRolled((player: string, roll: string) => {
      if (web3Service.isCurrentPlayer(player)) {
        addLogEntry(`🎲 Rolled encrypted dice: ${roll}`, "neutral");
        updateGameState();
      }
    });

    web3Service.onNFTMinted((player: string, tokenId: number) => {
      if (web3Service.isCurrentPlayer(player)) {
        addLogEntry(`🎉 Minted NFT #${tokenId}!`, "profit");
        setGameState(prev => ({ ...prev, playerHasNFT: true }));
        updateGameState();
      }
    });

    web3Service.onRewardClaimed((player: string, amount: string) => {
      if (web3Service.isCurrentPlayer(player)) {
        addLogEntry(`💰 Reward claimed: ${amount} (encrypted)`, "profit");
        updateGameState();
      }
    });

  }, [web3Service, addLogEntry]);

  // Update game state from contract
  const updateGameState = async () => {
    if (!web3Service.isConnected()) return;

    try {
      // Use Promise.allSettled to handle partial failures gracefully
      const results = await Promise.allSettled([
        web3Service.getPlayerStatus(),
        web3Service.getPlayerBalance(), 
        web3Service.getEthBalance(),
        web3Service.getNFTInfo(),
        web3Service.getPlayerPosition()
      ]);

      // Handle results individually
      const [statusResult, balanceResult, ethResult, nftResult, positionResult] = results;

      if (statusResult.status === 'fulfilled') {
        const playerStatus = statusResult.value;
        setGameState(prev => ({
          ...prev,
          gameStarted: playerStatus.hasStarted,
          playerHasNFT: playerStatus.hasMintedNFT,
          lastAction: playerStatus.lastAction,
        }));
      } else {
        console.warn("Failed to get player status:", statusResult.reason);
      }

      if (balanceResult.status === 'fulfilled') {
        setGameState(prev => ({
          ...prev,
          encryptedBalance: balanceResult.value,
        }));
      } else {
        console.warn("Failed to get player balance:", balanceResult.reason);
      }

      if (ethResult.status === 'fulfilled') {
        setGameState(prev => ({
          ...prev,
          ethBalance: ethResult.value,
        }));
      } else {
        console.warn("Failed to get ETH balance:", ethResult.reason);
      }

      if (nftResult.status === 'fulfilled') {
        const nftInfo = nftResult.value;
        setGameState(prev => ({
          ...prev,
          nftSupply: nftInfo.currentSupply,
          maxNftSupply: nftInfo.maxSupply,
        }));
      } else {
        console.warn("Failed to get NFT info:", nftResult.reason);
      }

      if (positionResult.status === 'fulfilled') {
        setGameState(prev => ({
          ...prev,
          currentPosition: positionResult.value,
        }));
      } else {
        console.warn("Failed to get player position:", positionResult.reason);
      }

    } catch (error) {
      console.error("Error updating game state:", error);
      // Reduced error logging to prevent spam
      console.warn("Network issues detected - some game data may be outdated");
    }
  };

  // Load tile data
  const loadTileData = async () => {
    if (!web3Service.isConnected()) return;

    try {
      // Load all tiles in parallel with Promise.allSettled for better error handling
      const tilePromises = Array.from({ length: 16 }, (_, i) => web3Service.getTile(i));
      const results = await Promise.allSettled(tilePromises);
      
      const tiles: TileData[] = [];
      results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          tiles.push(result.value);
        } else {
          console.warn(`Failed to load tile ${index}:`, result.reason);
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
  };

  // Game Actions
  const startGame = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      await web3Service.startGame();
      addLogEntry("Starting game...", "neutral");
      
      toast({
        title: "Game Starting! 🚀",
        description: "Transaction submitted to blockchain",
      });
    } catch (error: any) {
      console.error("Error starting game:", error);
      addLogEntry(`Error starting game: ${error.message}`, "loss");
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to start game",
        variant: "destructive",
      });
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const rollDice = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      setIsRollingDice(true);
      
      await web3Service.rollDice();
      addLogEntry("🎲 Rolling encrypted dice...", "neutral");
      
      toast({
        title: "Rolling Dice! 🎲",
        description: "Encrypted dice roll in progress...",
      });
    } catch (error: any) {
      console.error("Error rolling dice:", error);
      addLogEntry(`Error rolling dice: ${error.message}`, "loss");
      toast({
        title: "Roll Failed",
        description: error.message || "Failed to roll dice",
        variant: "destructive",
      });
      setIsRollingDice(false);
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleDiceRollComplete = () => {
    setIsRollingDice(false);
    // Simulate getting encrypted dice roll result
    const simulatedRoll = Math.floor(Math.random() * 6) + 1;
    setLastDiceRoll(simulatedRoll);
  };

  const claimReward = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      await web3Service.claimReward();
      addLogEntry("Claiming landing reward...", "neutral");
      
      toast({
        title: "Processing Landing! 🎯",
        description: "Applying encrypted tile effects...",
      });
    } catch (error: any) {
      console.error("Error claiming reward:", error);
      addLogEntry(`Error processing landing: ${error.message}`, "loss");
      toast({
        title: "Processing Failed",
        description: error.message || "Failed to process landing",
        variant: "destructive",
      });
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const mintNFT = async () => {
    try {
      setGameState(prev => ({ ...prev, isLoading: true }));
      await web3Service.mintNFT();
      addLogEntry("Minting NFT...", "neutral");
      
      toast({
        title: "Minting NFT! 🎨",
        description: "Creating your limited edition NFT...",
      });
    } catch (error: any) {
      console.error("Error minting NFT:", error);
      addLogEntry(`Error minting NFT: ${error.message}`, "loss");
      toast({
        title: "Minting Failed", 
        description: error.message || "Failed to mint NFT",
        variant: "destructive",
      });
    } finally {
      setGameState(prev => ({ ...prev, isLoading: false }));
    }
  };

  // Decryption methods
  const handleDecryptBalance = async (encryptedBalance: string): Promise<string> => {
    return await web3Service.decryptBalance(encryptedBalance);
  };

  const handleDecryptPosition = async (encryptedPosition: string): Promise<number> => {
    return await web3Service.decryptPosition(encryptedPosition);
  };

  const handleGrantPermissions = async (): Promise<void> => {
    await web3Service.grantPermissions();
  };

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh || !gameState.connected) return;

    const interval = setInterval(() => {
      updateGameState();
    }, 15000); // Reduced from 5s to 15s to reduce RPC load

    return () => clearInterval(interval);
  }, [autoRefresh, gameState.connected]);

  // Initial load
  useEffect(() => {
    addLogEntry("🔒 Welcome to Zama Dice - Encrypted Blockchain Gaming!", "neutral");
    addLogEntry("Connect your wallet to start playing", "neutral");
  }, [addLogEntry]);

  // Load tile data when connected
  useEffect(() => {
    if (gameState.connected) {
      loadTileData();
    }
  }, [gameState.connected]);

  return (
    <div className="min-h-screen bg-gradient-board flex">
      <div className="flex-1 relative">
        <GameBoard 
          tileData={tileData}
          onTileClick={setSelectedTile}
          selectedTile={selectedTile}
          currentPosition={gameState.currentPosition}
        />
        
        {/* Help Button */}
        <div className="absolute top-4 right-4">
          <HelpDialog />
        </div>
      </div>

      <div className="w-80 bg-card/95 backdrop-blur-sm border-l border-border overflow-y-auto">
        <div className="p-6 space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-2xl font-bold text-primary mb-2 text-shadow">
              🔒 ZAMA DICE
            </h1>
            <p className="text-sm text-muted-foreground">
              Encrypted blockchain gaming with FHE technology
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                NFTs: {gameState.nftSupply}/{gameState.maxNftSupply}
              </Badge>
              <Badge variant="outline" className="text-xs">
                Sepolia Testnet
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Wallet Panel */}
          <WalletPanel 
            connected={gameState.connected}
            ethBalance={gameState.ethBalance}
            encryptedBalance={gameState.encryptedBalance}
            onConnect={connectWallet}
            isLoading={gameState.isLoading}
            autoRefresh={autoRefresh}
            onAutoRefreshChange={setAutoRefresh}
          />

          <Separator />

          {/* Player Info */}
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
                    : `Encrypted (${gameState.currentPosition.slice(0, 10)}...)`
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

          {/* Game Actions */}
          <GameActions
            connected={gameState.connected}
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

          {/* Decryption Panel */}
          {gameState.connected && (
            <>
              <Separator />
              <DecryptionPanel
                encryptedBalance={gameState.encryptedBalance}
                encryptedPosition={gameState.currentPosition}
                onDecryptBalance={handleDecryptBalance}
                onDecryptPosition={handleDecryptPosition}
                onGrantPermissions={handleGrantPermissions}
                isLoading={gameState.isLoading}
              />
            </>
          )}

          {/* Tile Details */}
          {selectedTile !== null && tileData[selectedTile] && (
            <TileDetails 
              tile={tileData[selectedTile]}
              tileIndex={selectedTile}
              onClose={() => setSelectedTile(null)}
            />
          )}

          {/* Game Log */}
          <GameLog entries={gameLog} />
        </div>
      </div>
    </div>
  );
};