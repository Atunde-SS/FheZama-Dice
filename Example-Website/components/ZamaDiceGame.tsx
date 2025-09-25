import { useState } from "react";
import { useZamaDice } from "../hooks/useZamaDice";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function ZamaDiceGame() {
  const {
    gameState,
    logs,
    currentTile,
    connectWallet,
    disconnectWallet,
    refreshGameData,
    startGame,
    rollDice,
    claimReward,
    mintNFT,
    grantPermissions,
    decryptBalance,
    decryptPosition
  } = useZamaDice();

  const [activeTab, setActiveTab] = useState("game");
  const [isDecrypting, setIsDecrypting] = useState(false);

  // Handle decryption
  const handleDecryptBalance = async () => {
    setIsDecrypting(true);
    await decryptBalance();
    setIsDecrypting(false);
  };

  const handleDecryptPosition = async () => {
    setIsDecrypting(true);
    await decryptPosition();
    setIsDecrypting(false);
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-6">
        <CardHeader className="bg-primary/5">
          <div className="flex justify-between items-center">
            <CardTitle className="text-2xl">🎲 Zama Dice Game</CardTitle>
            {gameState.connected ? (
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="px-3 py-1">
                  ETH: {gameState.ethBalance}
                </Badge>
                <Button variant="outline" size="sm" onClick={disconnectWallet}>
                  Disconnect
                </Button>
              </div>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {!gameState.connected ? (
            <div className="text-center py-8">
              <h2 className="text-xl font-semibold mb-4">Welcome to Zama Dice Game!</h2>
              <p className="mb-6 text-muted-foreground">
                Play the world's first fully encrypted blockchain game using FHE technology.
                Roll dice, collect tokens, and mint NFTs on Sepolia testnet.
              </p>
              <Button onClick={connectWallet} disabled={gameState.isLoading}>
                {gameState.isLoading ? "Connecting..." : "Connect Wallet"}
              </Button>
            </div>
          ) : (
            <div>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="game">Game Board</TabsTrigger>
                  <TabsTrigger value="wallet">Wallet</TabsTrigger>
                  <TabsTrigger value="logs">Game Logs</TabsTrigger>
                </TabsList>
                
                <TabsContent value="game" className="py-4">
                  {!gameState.gameStarted ? (
                    <div className="text-center py-8">
                      <h3 className="text-lg font-medium mb-4">Start Your Adventure</h3>
                      <p className="mb-6 text-muted-foreground">
                        Begin your journey on the encrypted game board by starting a new game.
                      </p>
                      <div className="flex flex-col gap-4 items-center">
                        <Button onClick={grantPermissions} disabled={gameState.isLoading}>
                          Grant FHE Permissions
                        </Button>
                        <Button onClick={startGame} disabled={gameState.isLoading}>
                          {gameState.isLoading ? "Starting..." : "Start Game"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2">
                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                          <h3 className="font-medium mb-2">Game Board</h3>
                          <div className="grid grid-cols-5 gap-2 mb-4">
                            {Array.from({ length: 20 }).map((_, i) => (
                              <div 
                                key={i} 
                                className={`aspect-square rounded-md flex items-center justify-center text-sm font-medium border ${
                                  gameState.decryptedPosition === i 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted"
                                }`}
                              >
                                {i}
                              </div>
                            ))}
                          </div>
                          
                          <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center">
                              <span>Current Position:</span>
                              <Badge variant="outline">
                                {gameState.decryptedPosition !== undefined 
                                  ? gameState.decryptedPosition 
                                  : "Encrypted"}
                              </Badge>
                            </div>
                            
                            {currentTile && (
                              <div className="mt-2 p-3 bg-card rounded-md border">
                                <h4 className="font-medium">{currentTile.name}</h4>
                                <div className="text-sm text-muted-foreground mt-1">
                                  Type: {currentTile.type === "0" ? "Empty" : 
                                         currentTile.type === "1" ? "Reward" : 
                                         currentTile.type === "2" ? "Penalty" : "Special"}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  Value: {currentTile.value}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          <Button onClick={rollDice} disabled={gameState.isLoading}>
                            {gameState.isLoading ? "Rolling..." : "Roll Dice"}
                          </Button>
                          <Button onClick={claimReward} disabled={gameState.isLoading} variant="outline">
                            Claim Reward
                          </Button>
                          <Button 
                            onClick={mintNFT} 
                            disabled={gameState.isLoading || gameState.playerHasNFT} 
                            variant="outline"
                          >
                            Mint NFT
                          </Button>
                          <Button onClick={refreshGameData} variant="ghost" size="sm">
                            Refresh
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <div className="bg-muted/30 rounded-lg p-4 mb-4">
                          <h3 className="font-medium mb-2">Decryption Panel</h3>
                          <div className="space-y-3">
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Balance:</span>
                                <span>{gameState.decryptedBalance !== undefined ? `${gameState.decryptedBalance} ZAMA` : "Encrypted"}</span>
                              </div>
                              <Button 
                                onClick={handleDecryptBalance} 
                                disabled={isDecrypting} 
                                size="sm" 
                                className="w-full"
                              >
                                {isDecrypting ? "Decrypting..." : "Decrypt Balance"}
                              </Button>
                            </div>
                            
                            <div>
                              <div className="flex justify-between text-sm mb-1">
                                <span>Position:</span>
                                <span>{gameState.decryptedPosition !== undefined ? gameState.decryptedPosition : "Encrypted"}</span>
                              </div>
                              <Button 
                                onClick={handleDecryptPosition} 
                                disabled={isDecrypting} 
                                size="sm" 
                                className="w-full"
                              >
                                {isDecrypting ? "Decrypting..." : "Decrypt Position"}
                              </Button>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-muted/30 rounded-lg p-4">
                          <h3 className="font-medium mb-2">NFT Status</h3>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span>Your NFT:</span>
                              <Badge variant={gameState.playerHasNFT ? "success" : "outline"}>
                                {gameState.playerHasNFT ? "Minted" : "Not Minted"}
                              </Badge>
                            </div>
                            <div className="flex justify-between">
                              <span>Total Supply:</span>
                              <span>{gameState.nftSupply} / {gameState.maxNftSupply}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="wallet" className="py-4">
                  <div className="bg-muted/30 rounded-lg p-4">
                    <h3 className="font-medium mb-4">Wallet Information</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span>ETH Balance:</span>
                        <span>{gameState.ethBalance} ETH</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between">
                        <span>ZAMA Balance:</span>
                        <span>{gameState.decryptedBalance !== undefined ? `${gameState.decryptedBalance} ZAMA` : "Encrypted"}</span>
                      </div>
                      {gameState.decryptedBalance === undefined && (
                        <Button onClick={handleDecryptBalance} size="sm">
                          Decrypt Balance
                        </Button>
                      )}
                      <Separator />
                      <div className="flex justify-between">
                        <span>NFT Status:</span>
                        <Badge variant={gameState.playerHasNFT ? "success" : "outline"}>
                          {gameState.playerHasNFT ? "Minted" : "Not Minted"}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="logs" className="py-4">
                  <div className="bg-muted/30 rounded-lg p-4 max-h-[400px] overflow-y-auto">
                    <h3 className="font-medium mb-4">Game Logs</h3>
                    {logs.length === 0 ? (
                      <p className="text-muted-foreground text-center py-4">No game logs yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {logs.map((log, index) => (
                          <div key={index} className="text-sm border-l-2 pl-3 py-1 border-muted-foreground">
                            <span className={
                              log.type === "profit" ? "text-green-500" : 
                              log.type === "loss" ? "text-red-500" : ""
                            }>
                              {log.message}
                            </span>
                            <div className="text-xs text-muted-foreground">
                              {log.timestamp.toLocaleTimeString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </CardContent>
      </Card>
      
      <Alert variant="default" className="bg-muted/30">
        <AlertDescription>
          <div className="text-sm">
            <p className="font-medium">About Zama Dice Game</p>
            <p className="mt-1">
              This is the world's first fully encrypted blockchain game using Fully Homomorphic Encryption (FHE) technology.
              Your game state, including your position and balance, is encrypted on-chain and only you can decrypt it.
            </p>
            <p className="mt-1">
              Built with Zama's FHEVM technology on Sepolia testnet.
            </p>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}