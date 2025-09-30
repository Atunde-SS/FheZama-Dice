import { useState } from "react";

interface TileData {
  name: string;
  type: string;
  value: string;
}

interface GameBoardProps {
  tileData: TileData[];
  onTileClick: (tileIndex: number) => void;
  selectedTile: number | null;
  currentPosition: string;
}

// Board configuration - 16 tiles in a circular pattern
const BOARD_SIZE = 16;
const tilePositions = [];

// Generate positions for all 16 tiles in a circular pattern
for (let i = 0; i < BOARD_SIZE; i++) {
  let left, top;
  if (i < 4) {
    // Bottom row (left to right)
    left = 85 - i * 20;
    top = 85;
  } else if (i < 8) {
    // Left side (bottom to top)
    left = 5;
    top = 85 - (i - 4) * 20;
  } else if (i < 12) {
    // Top row (right to left)
    left = 5 + (i - 8) * 20;
    top = 5;
  } else {
    // Right side (top to bottom)
    left = 85;
    top = 5 + (i - 12) * 20;
  }
  tilePositions.push({ left: `${left}%`, top: `${top}%` });
}

const getTileTypeClass = (type: string) => {
  switch (type) {
    case "1": return "border-tile-profit bg-tile-profit/20 hover:bg-tile-profit/30";
    case "2": return "border-tile-loss bg-tile-loss/20 hover:bg-tile-loss/30";
    default: return "border-tile-neutral bg-tile-neutral/20 hover:bg-tile-neutral/30";
  }
};

const getTileIcon = (type: string) => {
  switch (type) {
    case "1": return "💰"; // Profit
    case "2": return "⚠️"; // Loss  
    default: return "🔒"; // Neutral
  }
};

export const GameBoard = ({ tileData, onTileClick, selectedTile, currentPosition }: GameBoardProps) => {
  const [diceAnimation, setDiceAnimation] = useState(false);
  const [celebrationEffect, setCelebrationEffect] = useState<{ x: number; y: number; type: 'win' | 'loss' } | null>(null);

  const handleTileClick = (index: number) => {
    onTileClick(index);
    
    // Add visual feedback
    const tileType = tileData[index]?.type;
    if (tileType === "1") {
      // Simulate win celebration
      setCelebrationEffect({ x: Math.random() * 600, y: Math.random() * 600, type: 'win' });
      setTimeout(() => setCelebrationEffect(null), 2000);
    }
  };

  return (
    <div className="relative w-full h-full min-h-screen bg-gradient-board p-8">
      {/* Board Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
        </svg>
      </div>

      {/* Game Title */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center z-10">
        <h1 className="text-4xl font-bold text-primary mb-2 text-shadow">
          🔒 ZAMA DICE BOARD
        </h1>
        <p className="text-muted-foreground text-lg">
          Fully Homomorphic Encryption Gaming
        </p>
      </div>

      {/* Game Board */}
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="relative w-[600px] h-[600px] mx-auto">
          
          {/* Board Inner Area */}
          <div className="absolute inset-16 border-2 border-primary/30 rounded-lg bg-card/10 backdrop-blur-sm">
            <div className="w-full h-full flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4 animate-pulse">🎲</div>
                <div className="text-xl text-primary font-bold mb-2">ENCRYPTED DICE ZONE</div>
                <div className="text-sm text-muted-foreground max-w-md">
                  All positions and rolls are encrypted using Zama's FHE technology.
                  Your exact position is hidden from everyone!
                </div>
                <div className="mt-4 text-xs text-muted-foreground/70">
                  Current Position: {currentPosition === "0x0000000000000000000000000000000000000000000000000000000000000000" 
                    ? "Not Started" 
                    : "🔒 Encrypted"
                  }
                </div>
              </div>
            </div>
          </div>

          {/* Tiles */}
          {tileData.map((tile, index) => (
            <div
              key={index}
              className={`
                absolute w-20 h-20 border-2 rounded-lg cursor-pointer
                transition-all duration-300 hover:scale-110 hover:z-20
                flex flex-col items-center justify-center text-center p-1
                ${getTileTypeClass(tile.type)}
                ${selectedTile === index ? 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-110 z-20' : ''}
                tile-hover
              `}
              style={{
                left: tilePositions[index].left,
                top: tilePositions[index].top,
              }}
              onClick={() => handleTileClick(index)}
              title={`${tile.name} - Click for details`}
            >
              <div className="text-lg mb-1">{getTileIcon(tile.type)}</div>
              <div className="text-xs font-semibold text-foreground leading-tight">
                {tile.name.length > 8 ? tile.name.substring(0, 8) + "..." : tile.name}
              </div>
              <div className="text-xs text-muted-foreground">
                #{index}
              </div>
            </div>
          ))}

          {/* Player Token - Hidden due to encryption */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
            <div className="bg-card/80 backdrop-blur-sm rounded-lg p-3 border border-border">
              <div className="text-xs text-muted-foreground mb-1">Player Position</div>
              <div className="text-sm font-mono bg-muted/50 rounded px-2 py-1">
                🔒 Encrypted
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                FHE Protected
              </div>
            </div>
          </div>

          {/* Celebration Effects */}
          {celebrationEffect && (
            <div 
              className="absolute pointer-events-none z-50 animate-bounce"
              style={{
                left: celebrationEffect.x,
                top: celebrationEffect.y,
              }}
            >
              <div className={`text-4xl ${celebrationEffect.type === 'win' ? 'animate-pulse' : 'animate-ping'}`}>
                {celebrationEffect.type === 'win' ? '🎉' : '💥'}
              </div>
            </div>
          )}

          {/* Dice Roll Animation Overlay */}
          {diceAnimation && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm rounded-lg z-30">
              <div className="text-center">
                <div className="text-8xl animate-bounce mb-4">🎲</div>
                <div className="text-2xl font-bold text-primary">Rolling Encrypted Dice...</div>
                <div className="text-muted-foreground">Generating secure random number</div>
              </div>
            </div>
          )}

          {/* Corner Labels */}
          <div className="absolute -top-8 -left-8 text-xs text-muted-foreground">START</div>
          <div className="absolute -top-8 -right-8 text-xs text-muted-foreground">PROFIT</div>
          <div className="absolute -bottom-8 -right-8 text-xs text-muted-foreground">LOSS</div>
          <div className="absolute -bottom-8 -left-8 text-xs text-muted-foreground">NEUTRAL</div>
        </div>
      </div>

      {/* Board Legend */}
      <div className="absolute bottom-8 right-8 bg-card/80 backdrop-blur-sm rounded-lg p-4 border border-border">
        <h3 className="text-sm font-bold mb-2">Tile Legend</h3>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-tile-profit bg-tile-profit/20 rounded"></div>
            <span>💰 Profit Tiles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-tile-loss bg-tile-loss/20 rounded"></div>
            <span>⚠️ Loss Tiles</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 border border-tile-neutral bg-tile-neutral/20 rounded"></div>
            <span>🔒 Neutral Tiles</span>
          </div>
        </div>
      </div>
    </div>
  );
};