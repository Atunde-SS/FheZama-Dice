import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Wallet, Loader2, Zap, Shield } from "lucide-react";

interface WalletPanelProps {
  connected: boolean;
  ethBalance: string;
  encryptedBalance: string;
  onConnect: () => void;
  isLoading: boolean;
  autoRefresh: boolean;
  onAutoRefreshChange: (enabled: boolean) => void;
}

export const WalletPanel = ({
  connected,
  ethBalance,
  encryptedBalance,
  onConnect,
  isLoading,
  autoRefresh,
  onAutoRefreshChange,
}: WalletPanelProps) => {
  return (
    <Card className="bg-gradient-tile border-primary/20">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Wallet className="w-4 h-4" />
          Wallet Connection
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!connected ? (
          <Button
            onClick={onConnect}
            disabled={isLoading}
            className="w-full bg-primary hover:bg-primary/90"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Wallet className="w-4 h-4 mr-2" />
            )}
            {isLoading ? "Connecting..." : "Connect Wallet"}
          </Button>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Badge variant="default" className="bg-green-600">
                <Shield className="w-3 h-3 mr-1" />
                Connected
              </Badge>
              <Badge variant="outline" className="text-xs">
                Sepolia
              </Badge>
            </div>

            {/* ETH Balance */}
            <div className="bg-muted/30 rounded-lg p-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">ETH Balance:</span>
                <span className="font-mono text-sm">{ethBalance}</span>
              </div>
            </div>

            {/* ZAMA Token Balance */}
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Zap className="w-3 h-3" />
                  ZAMA Tokens:
                </span>
                <Badge variant="secondary" className="text-xs">
                  🔒 FHE
                </Badge>
              </div>
              <div className="font-mono text-xs bg-muted/50 rounded p-2 break-all">
                {encryptedBalance}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Encrypted balance - only you can decrypt this value
              </div>
            </div>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center justify-between">
              <Label htmlFor="auto-refresh" className="text-sm">
                Auto-Refresh
              </Label>
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={onAutoRefreshChange}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};