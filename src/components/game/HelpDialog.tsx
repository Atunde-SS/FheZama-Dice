import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HelpCircle, Gamepad2, Wallet, Dices, Target, Coins, Shield, ExternalLink } from "lucide-react";

export const HelpDialog = () => {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="bg-card/80 backdrop-blur-sm border-primary/20"
        >
          <HelpCircle className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Gamepad2 className="w-5 h-5" />
            How to Play Zama Dice
          </DialogTitle>
          <DialogDescription>
            Welcome to the fully encrypted blockchain dice game powered by Zama FHE!
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 text-sm">
          
          {/* Getting Started */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Wallet className="w-4 h-4 text-primary" />
              Getting Started
            </h3>
            <div className="space-y-2">
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">1</Badge>
                <div>
                  <span className="font-medium text-primary">Connect Wallet:</span>
                  <p className="text-muted-foreground">
                    Use your web3-compatible wallet on Sepolia testnet. Make sure you have some test ETH for gas fees.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="outline" className="mt-0.5">2</Badge>
                <div>
                  <span className="font-medium text-primary">Start Game:</span>
                  <p className="text-muted-foreground">
                    Click "Start Game" to receive encrypted 500 ZAMA tokens and begin your journey.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Gameplay */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Dices className="w-4 h-4 text-primary" />
              Gameplay Mechanics
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Dices className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <span className="font-medium">Roll Dice:</span>
                  <p className="text-muted-foreground">
                    Move an encrypted distance (1-6) around the 16-tile circular board. Your exact position is hidden from everyone.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <Target className="w-4 h-4 mt-1 text-muted-foreground" />
                <div>
                  <span className="font-medium">Process Landing:</span>
                  <p className="text-muted-foreground">
                    Apply encrypted tile effects to your balance. The computation happens privately on-chain.
                  </p>
                </div>
              </div>

              {/* Tile Types */}
              <div className="bg-muted/30 rounded-lg p-3 space-y-2">
                <div className="font-medium mb-2">Tile Types:</div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-tile-profit rounded border"></div>
                    <span className="font-medium text-tile-profit">Profit Tiles (💰):</span>
                    <span className="text-muted-foreground">Earn encrypted ZAMA tokens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-tile-loss rounded border"></div>
                    <span className="font-medium text-tile-loss">Loss Tiles (⚠️):</span>
                    <span className="text-muted-foreground">Lose encrypted ZAMA tokens</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-tile-neutral rounded border"></div>
                    <span className="font-medium text-tile-neutral">Neutral Tiles (🔒):</span>
                    <span className="text-muted-foreground">Safe spaces, no effect</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* NFT Reward */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Coins className="w-4 h-4 text-primary" />
              NFT Rewards
            </h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                Collect encrypted <span className="font-bold text-primary">1,000 ZAMA tokens</span> to mint a limited edition NFT.
              </p>
              <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
                <div className="font-medium text-primary mb-1">🏆 Limited Edition</div>
                <p className="text-sm text-muted-foreground">
                  Only 10,000 NFTs will ever exist! Each NFT represents your achievement in the encrypted gaming world.
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* FHE Features */}
          <div>
            <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-primary" />
              Encryption Features
            </h3>
            <div className="space-y-2">
              <p className="text-muted-foreground">
                This game uses <span className="font-bold text-primary">Fully Homomorphic Encryption (FHE)</span> to protect your privacy:
              </p>
              <ul className="space-y-1 text-muted-foreground ml-4">
                <li>• Your exact position on the board is encrypted</li>
                <li>• Your token balance is encrypted and private</li>
                <li>• Dice rolls are computed privately</li>
                <li>• All game state changes are encrypted</li>
                <li>• Only you can see your decrypted values</li>
              </ul>
            </div>
          </div>

          <Separator />

          {/* Tips */}
          <div>
            <h3 className="font-semibold text-base mb-3">💡 Pro Tips</h3>
            <ul className="space-y-1 text-muted-foreground">
              <li>• All values shown as hex strings are encrypted data</li>
              <li>• Click on any tile to see its public details</li>
              <li>• Check the Game Log for transaction history</li>
              <li>• Enable Auto-Refresh for real-time updates</li>
              <li>• Keep some ETH for transaction gas fees</li>
            </ul>
          </div>

          {/* Footer */}
          <div className="bg-card/50 rounded-lg p-4 text-center space-y-2">
            <div className="flex items-center justify-center gap-2 text-primary">
              <Shield className="w-4 h-4" />
              <span className="font-medium">All gameplay is encrypted and verifiable on Sepolia testnet!</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open("https://docs.zama.ai/fhevm", "_blank")}
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Learn More About FHE
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};