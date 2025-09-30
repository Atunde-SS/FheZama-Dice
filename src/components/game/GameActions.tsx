import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Play, Dices, Target, Coins, ExternalLink, Loader2, Dice6 } from "lucide-react";

interface GameActionsProps {
  connected: boolean;
  gameStarted: boolean;
  playerHasNFT: boolean;
  isLoading: boolean;
  onStartGame: () => void;
  onRollDice: () => void;
  onClaimReward: () => void;
  onMintNFT: () => void;
  diceAnimation?: React.ReactNode;
}

export const GameActions = ({
  connected,
  gameStarted,
  playerHasNFT,
  isLoading,
  onStartGame,
  onRollDice,
  onClaimReward,
  onMintNFT,
  diceAnimation,
}: GameActionsProps) => {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">Game Actions</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        
        {/* Start Game */}
        <Button
          onClick={onStartGame}
          disabled={!connected || gameStarted || isLoading}
          className="w-full justify-start"
          variant={gameStarted ? "secondary" : "default"}
          title={isLoading ? "Please wait for connection to complete..." : ""}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Play className="w-4 h-4 mr-2" />
          )}
          {gameStarted ? "Game Started ✓" : isLoading ? "Waiting for connection..." : "Start Game"}
        </Button>

        <Separator />

        {/* Roll Dice */}
        {gameStarted && (
          <>
            {diceAnimation && (
              <div className="flex justify-center py-4 bg-muted/30 rounded-lg border-2 border-dashed border-primary/30">
                {diceAnimation}
              </div>
            )}
            <Button
              onClick={onRollDice}
              disabled={!connected || !gameStarted || isLoading}
              className="w-full justify-start"
              variant="outline"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Dice6 className="w-4 h-4 mr-2" />
              )}
              Roll Dice
            </Button>
          </>
        )}

        {/* Claim Reward */}
        <Button
          onClick={onClaimReward}
          disabled={!connected || !gameStarted || isLoading}
          className="w-full justify-start"
          variant="outline"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Target className="w-4 h-4 mr-2" />
          )}
          Process Landing
        </Button>

        <Separator />

        {/* Mint NFT */}
        <Button
          onClick={onMintNFT}
          disabled={!connected || !gameStarted || playerHasNFT || isLoading}
          className="w-full justify-start"
          variant={playerHasNFT ? "secondary" : "default"}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Coins className="w-4 h-4 mr-2" />
          )}
          {playerHasNFT ? "NFT Minted ✓" : "Mint NFT"}
        </Button>

        <Separator />

        {/* External Links */}
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => window.open("https://docs.zama.ai/fhevm", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Zama Documentation
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => window.open("https://sepolia.etherscan.io", "_blank")}
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Sepolia Explorer
          </Button>
        </div>

        {/* Game Instructions */}
        <div className="text-xs text-muted-foreground bg-muted/30 rounded p-2 mt-4">
          <p className="font-medium mb-1">🎮 How to Play:</p>
          <ul className="space-y-1 text-xs">
            <li>• Start game to receive encrypted ZAMA tokens</li>
            <li>• Roll dice to move around the board</li>
            <li>• Process landing to apply tile effects</li>
            <li>• Collect and decrypt to check balance</li>
            <li>• Reach 1,000 ZAMA to mint NFT</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};