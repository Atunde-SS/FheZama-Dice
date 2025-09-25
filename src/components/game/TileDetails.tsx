import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

interface TileData {
  name: string;
  type: string;
  value: string;
}

interface TileDetailsProps {
  tile: TileData;
  tileIndex: number;
  onClose: () => void;
}

const getTileTypeInfo = (type: string) => {
  switch (type) {
    case "1":
      return {
        label: "PROFIT",
        color: "bg-tile-profit text-white",
        icon: "💰",
        description: "Earn encrypted ZAMA tokens when landing here",
      };
    case "2":
      return {
        label: "LOSS",
        color: "bg-tile-loss text-white",
        icon: "⚠️",
        description: "Lose encrypted ZAMA tokens when landing here",
      };
    default:
      return {
        label: "NEUTRAL",
        color: "bg-tile-neutral text-black",
        icon: "🔒",
        description: "Safe space - no token change when landing here",
      };
  }
};

const formatValue = (value: string, type: string): string => {
  const numValue = BigInt(value);
  const formattedValue = (Number(numValue) / 1e18).toFixed(0); // Convert from wei to tokens
  
  if (type === "2") {
    return `-${formattedValue}`;
  }
  return formattedValue;
};

export const TileDetails = ({ tile, tileIndex, onClose }: TileDetailsProps) => {
  const typeInfo = getTileTypeInfo(tile.type);

  return (
    <Card className="border-primary/20 bg-gradient-tile">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <span className="text-lg">{typeInfo.icon}</span>
            Tile Details
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* Tile Info */}
        <div className="text-center">
          <div className="text-2xl mb-2">{typeInfo.icon}</div>
          <h3 className="font-bold text-lg mb-1">{tile.name}</h3>
          <Badge className={`${typeInfo.color} mb-2`}>
            {typeInfo.label}
          </Badge>
          <div className="text-xs text-muted-foreground">
            Position #{tileIndex}
          </div>
        </div>

        {/* Value */}
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-sm text-muted-foreground mb-1">Effect Value</div>
          <div className="text-2xl font-bold">
            {formatValue(tile.value, tile.type)} ZAMA
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {tile.type !== "0" ? "Applied when landing on this tile" : "No effect"}
          </div>
        </div>

        {/* Description */}
        <div className="text-xs text-muted-foreground bg-muted/20 rounded p-2">
          {typeInfo.description}
        </div>

        {/* Technical Details */}
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="flex justify-between">
            <span>Type ID:</span>
            <span className="font-mono">{tile.type}</span>
          </div>
          <div className="flex justify-between">
            <span>Raw Value:</span>
            <span className="font-mono break-all">{tile.value}</span>
          </div>
        </div>

        {/* Additional Info */}
        <div className="text-xs text-muted-foreground bg-primary/10 rounded p-2 border border-primary/20">
          <div className="font-medium mb-1">🔒 FHE Protection:</div>
          <p>
            When you land on this tile, the effect is processed using fully homomorphic encryption.
            Your balance changes are computed privately on-chain.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};