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
  onDecryptBalance: (encrypted: string) => Promise<string>;
  onDecryptPosition: (encrypted: string) => Promise<number>;
  onGrantPermissions: () => Promise<void>;
  isLoading: boolean;
}

export const DecryptionPanel = ({
  encryptedBalance,
  encryptedPosition,
  onDecryptBalance,
  onDecryptPosition,
  onGrantPermissions,
  isLoading,
}: DecryptionPanelProps) => {
  const { toast } = useToast();
  const [decryptedBalance, setDecryptedBalance] = useState<string | null>(null);
  const [decryptedPosition, setDecryptedPosition] = useState<number | null>(null);
  const [showDecrypted, setShowDecrypted] = useState(true);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [decryptingBalance, setDecryptingBalance] = useState(false);
  const [decryptingPosition, setDecryptingPosition] = useState(false);

  const handleGrantPermissions = async () => {
    try {
      await onGrantPermissions();
      setPermissionsGranted(true);
      toast({
        title: "Permissions Granted! 🔓",
        description: "You can now decrypt your encrypted values",
      });
    } catch (error: any) {
      toast({
        title: "Permission Failed",
        description: error.message || "Failed to grant decryption permissions",
        variant: "destructive",
      });
    }
  };

  const handleDecryptBalance = async () => {
    if (!encryptedBalance || encryptedBalance === "0x0000000000000000000000000000000000000000000000000000000000000000") {
      toast({
        title: "No Balance to Decrypt",
        description: "Start the game to receive encrypted tokens",
        variant: "destructive",
      });
      return;
    }

    try {
      setDecryptingBalance(true);
      const decrypted = await onDecryptBalance(encryptedBalance);
      setDecryptedBalance(decrypted);
      toast({
        title: "Balance Decrypted! 💰",
        description: `Your ZAMA token balance: ${decrypted}`,
      });
    } catch (error: any) {
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt balance",
        variant: "destructive",
      });
    } finally {
      setDecryptingBalance(false);
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
      setDecryptingPosition(true);
      const decrypted = await onDecryptPosition(encryptedPosition);
      setDecryptedPosition(decrypted);
      toast({
        title: "Position Revealed! 🎯",
        description: `You are on tile ${decrypted}`,
      });
    } catch (error: any) {
      toast({
        title: "Decryption Failed",
        description: error.message || "Failed to decrypt position",
        variant: "destructive",
      });
    } finally {
      setDecryptingPosition(false);
    }
  };

  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Unlock className="w-4 h-4 text-primary" />
          FHE Decryption Center
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Reveal your encrypted game data using your private keys
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Grant Permissions */}
        {!permissionsGranted && (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-2">
              <Key className="w-4 h-4 text-amber-600" />
              <span className="text-sm font-medium">Setup Required</span>
            </div>
            <p className="text-xs text-muted-foreground mb-3">
              Grant decryption permissions to reveal your encrypted values
            </p>
            <Button
              onClick={handleGrantPermissions}
              disabled={isLoading}
              size="sm"
              className="w-full"
            >
              {isLoading ? (
                <Loader2 className="w-3 h-3 mr-2 animate-spin" />
              ) : (
                <Shield className="w-3 h-3 mr-2" />
              )}
              Grant Permissions
            </Button>
          </div>
        )}

        {permissionsGranted && (
          <>
            {/* Balance Decryption */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">ZAMA Token Balance</span>
                <Badge variant="secondary" className="text-xs">
                  {decryptedBalance ? "Decrypted" : "Encrypted"}
                </Badge>
              </div>
              
              {decryptedBalance && showDecrypted ? (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-green-700 dark:text-green-400">
                      {decryptedBalance} ZAMA
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDecrypted(false)}
                    >
                      <EyeOff className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <span className="text-muted-foreground text-sm">🔒 Encrypted Balance</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDecryptBalance}
                      disabled={decryptingBalance}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      {decryptingBalance ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Unlock className="w-3 h-3 mr-1" />
                      )}
                      Decrypt
                    </Button>
                    {decryptedBalance && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDecrypted(true)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            <Separator />

            {/* Position Decryption */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Board Position</span>
                <Badge variant="secondary" className="text-xs">
                  {decryptedPosition !== null ? "Decrypted" : "Encrypted"}
                </Badge>
              </div>
              
              {decryptedPosition !== null && showDecrypted ? (
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-blue-700 dark:text-blue-400">
                      Tile #{decryptedPosition}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowDecrypted(false)}
                    >
                      <EyeOff className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="bg-muted/50 rounded p-2 text-center">
                    <span className="text-muted-foreground text-sm">🔒 Encrypted Position</span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDecryptPosition}
                      disabled={decryptingPosition}
                      size="sm"
                      variant="outline"
                      className="flex-1"
                    >
                      {decryptingPosition ? (
                        <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                      ) : (
                        <Unlock className="w-3 h-3 mr-1" />
                      )}
                      Decrypt
                    </Button>
                    {decryptedPosition !== null && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowDecrypted(true)}
                      >
                        <Eye className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground bg-primary/5 rounded p-2 border border-primary/20">
          <div className="font-medium mb-1">🔒 Privacy Protected:</div>
          <p>
            Only you can decrypt these values with your private keys. 
            The blockchain never sees your plaintext data.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};