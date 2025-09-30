import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { NPCOpponent, GameStats } from "@/hooks/useGameProgress";
import { Skull, Shield, Zap, Target, Bot } from "lucide-react";

interface SurvivalModeProps {
  isActive: boolean;
  npc: NPCOpponent;
  stats: GameStats;
  onToggleMode: () => void;
  onReset: () => void;
}

export const SurvivalMode = ({ 
  isActive, 
  npc, 
  stats, 
  onToggleMode, 
  onReset 
}: SurvivalModeProps) => {
  const [npcAction, setNpcAction] = useState<string>('');
  const [npcMood, setNpcMood] = useState<'happy' | 'worried' | 'excited' | 'disappointed'>('happy');

  // NPC reactions based on game events
  const npcReactions = {
    happy: ["Let's see what you got!", "This should be fun!", "May the best player win!"],
    excited: ["Wow, nice roll!", "You're on fire!", "Impressive moves!"],
    worried: ["Uh oh, this doesn't look good...", "Getting nervous here!", "Hope my luck holds up!"],
    disappointed: ["Better luck next time!", "That stings a bit!", "Not my lucky day!"]
  };

  const getNPCAction = () => {
    const actions = [
      `${npc.name} is rolling the dice...`,
      `${npc.name} lands on a ${Math.random() > 0.5 ? 'profit' : 'neutral'} tile!`,
      `${npc.name} is strategizing the next move...`,
      `${npc.name} is checking the board layout...`,
      `${npc.name} seems ${npcMood} about the game!`,
    ];
    return actions[Math.floor(Math.random() * actions.length)];
  };

  const getNPCMessage = () => {
    return npcReactions[npcMood][Math.floor(Math.random() * npcReactions[npcMood].length)];
  };

  // Simulate NPC actions periodically
  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setNpcAction(getNPCAction());
      
      // Change NPC mood based on game state
      const random = Math.random();
      if (stats.survivalStreak > 3) {
        setNpcMood(random > 0.7 ? 'worried' : 'excited');
      } else if (stats.survivalStreak === 0) {
        setNpcMood(random > 0.5 ? 'happy' : 'disappointed');
      } else {
        setNpcMood('happy');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, stats.survivalStreak]);

  return (
    <Card className="bg-gradient-to-br from-red-500/10 via-orange-500/5 to-transparent border-red-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Skull className="w-4 h-4 text-red-500" />
          Survival Mode
          {isActive && <Badge variant="destructive" className="text-xs">ACTIVE</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isActive ? (
          <div className="text-center space-y-3">
            <div className="text-2xl">⚡</div>
            <p className="text-sm text-muted-foreground">
              Test your skills against NPCs! Survive as long as possible without losing all your lives.
            </p>
            <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3">
              <h4 className="text-sm font-medium mb-2">Survival Rules:</h4>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>• Start with {stats.maxLives} lives</li>
                <li>• Lose a life when landing on loss tiles</li>
                <li>• Compete against smart NPCs</li>
                <li>• Earn extra XP for survival streaks</li>
                <li>• Unlock new NPCs as you level up</li>
              </ul>
            </div>
            <Button onClick={onToggleMode} size="sm" className="w-full">
              <Shield className="w-3 h-3 mr-2" />
              Start Survival Mode
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Survival Stats */}
            <div className="bg-card/50 rounded p-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Shield className="w-3 h-3 text-green-500" />
                    <span>Survival Streak</span>
                  </div>
                  <div className="font-bold text-green-600">{stats.survivalStreak}</div>
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    <Target className="w-3 h-3 text-blue-500" />
                    <span>Lives Left</span>
                  </div>
                  <div className="flex gap-1">
                    {Array.from({ length: stats.maxLives }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < stats.lives ? 'bg-red-500' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* NPC Opponent */}
            <div className="bg-card/50 rounded p-3">
              <div className="flex items-center gap-2 mb-2">
                <Bot className="w-4 h-4 text-primary" />
                <span className="font-medium text-sm">Your Opponent</span>
              </div>
              
              <div className="flex items-center gap-3 mb-3">
                <div className="text-2xl">{npc.avatar}</div>
                <div>
                  <div className="font-medium text-sm">{npc.name}</div>
                  <div className="text-xs text-muted-foreground">Level {npc.level}</div>
                  <div className="flex items-center gap-1 mt-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-muted-foreground">Online</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs">
                  <span className="text-muted-foreground">Win Rate: </span>
                  <span className="font-medium">{Math.round(npc.winRate * 100)}%</span>
                </div>
                <Progress value={npc.winRate * 100} className="h-1" />
                <div className="text-xs text-muted-foreground">
                  {npc.personality}
                </div>
              </div>
            </div>

            <Separator />

            {/* NPC Activity Feed */}
            <div className="bg-card/50 rounded p-3">
              <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Live Activity
              </h4>
              <div className="space-y-2">
                <div className="text-xs bg-muted/50 rounded p-2">
                  {npcAction || `${npc.name} joined the game!`}
                </div>
                <div className="text-xs text-muted-foreground italic">
                  "{getNPCMessage()}"
                </div>
              </div>
            </div>

            {/* Exit Survival Mode */}
            <div className="flex gap-2">
              <Button onClick={onToggleMode} variant="outline" size="sm" className="flex-1">
                Exit Survival
              </Button>
              <Button onClick={onReset} variant="destructive" size="sm" className="flex-1">
                Reset Progress
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};