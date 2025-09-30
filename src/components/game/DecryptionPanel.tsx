import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Unlock, Eye, EyeOff, Loader2, Shield, Key } from "lucide-react";

interface DecryptionPanelProps {
  encryptedBalance: string;
  encryptedPosition: string;
  decryptedBalance?: string;
  decryptedPosition?: string;
  onDecryptBalance: () => Promise<void>;
  onDecryptPosition: () => Promise<void>;
  onGrantPermissions: () => Promise<void>;
  isLoading: boolean;
}

export const DecryptionPanel = ({
  encryptedBalance,
  encryptedPosition,
  decryptedBalance,
  decryptedPosition,
  onDecryptBalance,
  onDecryptPosition,
  onGrantPermissions,
  isLoading,
}: DecryptionPanelProps) => {
  const { toast } = useToast();
  const [showBalance, setShowBalance] = useState(false);
  const [showPosition, setShowPosition] = useState(false);

  const handleGrantPermissions = async () => {
    try {
      await onGrantPermissions();
    } catch (error: any) {
      console.error("Grant permissions error:", error);
    }
  };

  const handleDecryptBalance = async () => {
    if (!encryptedBalance || encryptedBalance === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      toast({
        title: "No Balance to Decrypt",
        description: "Start playing to get an encrypted balance",
        variant: "destructive",
      });
      return;
    }

    try {
      await onDecryptBalance();
    } catch (error: any) {
      console.error("Decrypt balance error:", error);
    }
  };

  const handleDecryptPosition = async () => {
    if (!encryptedPosition || encryptedPosition === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      toast({
        title: "No Position to Decrypt",
        description: "Roll the dice to get an encrypted position",
        variant: "destructive",
      });
      return;
    }

    try {
      await onDecryptPosition();
    } catch (error: any) {
      console.error("Decrypt position error:", error);
    }
  };

  const isBalanceDecrypted = !!decryptedBalance;
  const isPositionDecrypted = !!decryptedPosition;

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Unlock className="w-4 h-4 text-primary" />
          FHE Decryption Center
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Decrypt your encrypted game data using Fully Homomorphic Encryption
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grant Permissions Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium">Decryption Permissions</span>
          </div>
          <Button
            onClick={handleGrantPermissions}
            disabled={isLoading}
            size="sm"
            className="w-full bg-green-600 hover:bg-green-700"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Key className="w-4 h-4 mr-2" />
            )}
            Grant Decryption Permissions
          </Button>
          <p className="text-xs text-muted-foreground">
            Grant permissions to decrypt your encrypted data
          </p>
        </div>

        <Separator />

        {/* Balance Decryption */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Balance</Badge>
              <span className="text-xs text-muted-foreground">
                {isBalanceDecrypted ? "Decrypted" : "Encrypted"}
              </span>
            </div>
            {isBalanceDecrypted && (
              <Button
                onClick={() => setShowBalance(!showBalance)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {showBalance ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-mono p-2 bg-muted rounded border">
              <div className="text-muted-foreground mb-1">Encrypted:</div>
              <div className="break-all">
                {encryptedBalance || "No encrypted balance"}
              </div>
            </div>
            
            {isBalanceDecrypted && (
              <div className="text-xs font-mono p-2 bg-green-50 dark:bg-green-900/20 rounded border border-green-500/30">
                <div className="text-green-700 dark:text-green-300 mb-1">Decrypted (On-Chain):</div>
                <div className="text-green-800 dark:text-green-200 font-semibold">
                  {showBalance ? (() => {
                    if (!decryptedBalance) return "No balance available";
                    
                    try {
                      const balanceBigInt = BigInt(decryptedBalance);
                      // Convert to a more readable format (assuming 18 decimals)
                      const balance = Number(balanceBigInt) / 10**18;
                      return `${balance.toFixed(2)} ZAMA`;
                    } catch {
                      return `${decryptedBalance}`;
                    }
                  })() : "••••••••"}
                </div>
                <div className="text-xs text-green-600 dark:text-green-400 mt-1">
                  This is the encrypted on-chain balance
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleDecryptBalance}
            disabled={isLoading || isBalanceDecrypted}
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Unlock className="w-4 h-4 mr-2" />
            )}
            {isBalanceDecrypted ? "Balance Decrypted ✓" : "Decrypt Balance"}
          </Button>
        </div>

        <Separator />

        {/* Position Decryption */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">Position</Badge>
              <span className="text-xs text-muted-foreground">
                {isPositionDecrypted ? "Decrypted" : "Encrypted"}
              </span>
            </div>
            {isPositionDecrypted && (
              <Button
                onClick={() => setShowPosition(!showPosition)}
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
              >
                {showPosition ? (
                  <EyeOff className="w-3 h-3" />
                ) : (
                  <Eye className="w-3 h-3" />
                )}
              </Button>
            )}
          </div>
          
          <div className="space-y-2">
            <div className="text-xs font-mono p-2 bg-muted rounded border">
              <div className="text-muted-foreground mb-1">Encrypted:</div>
              <div className="break-all">
                {encryptedPosition || "No encrypted position"}
              </div>
            </div>
            
            {isPositionDecrypted && (
              <div className="text-xs font-mono p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-500/30">
                <div className="text-blue-700 dark:text-blue-300 mb-1">Decrypted:</div>
                <div className="text-blue-800 dark:text-blue-200 font-semibold">
                  {showPosition ? `Tile ${decryptedPosition}` : "••••••••"}
                </div>
              </div>
            )}
          </div>

          <Button
            onClick={handleDecryptPosition}
            disabled={isLoading || isPositionDecrypted}
            size="sm"
            className="w-full"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Unlock className="w-4 h-4 mr-2" />
            )}
            {isPositionDecrypted ? "Position Decrypted ✓" : "Decrypt Position"}
          </Button>
        </div>

        <div className="pt-2 text-xs text-muted-foreground text-center border-t">
          🔒 All decryption happens client-side using fhEVM
        </div>
      </CardContent>
    </Card>
  );
};