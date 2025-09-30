import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Trophy, Star, Zap, Heart } from "lucide-react";
import { Achievement, GameStats } from "@/hooks/useGameProgress";

interface AchievementPanelProps {
  achievements: Achievement[];
  stats: GameStats;
}

export const AchievementPanel = ({ achievements, stats }: AchievementPanelProps) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;
  
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Trophy className="w-4 h-4 text-primary" />
          Player Progress
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Player Stats */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="bg-card/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Star className="w-3 h-3 text-yellow-500" />
              <span className="font-medium">Level {stats.level}</span>
            </div>
            <Progress value={(stats.xp / stats.xpToNext) * 100} className="h-1" />
            <div className="text-muted-foreground mt-1">
              {stats.xp}/{stats.xpToNext} XP
            </div>
          </div>
          
          <div className="bg-card/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Zap className="w-3 h-3 text-blue-500" />
              <span className="font-medium">Energy</span>
            </div>
            <Progress value={(stats.energy / stats.maxEnergy) * 100} className="h-1" />
            <div className="text-muted-foreground mt-1">
              {stats.energy}/{stats.maxEnergy}
            </div>
          </div>
          
          <div className="bg-card/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Heart className="w-3 h-3 text-red-500" />
              <span className="font-medium">Lives</span>
            </div>
            <div className="text-muted-foreground">
              {stats.lives}/{stats.maxLives}
            </div>
          </div>
          
          <div className="bg-card/50 rounded p-2">
            <div className="flex items-center gap-1 mb-1">
              <Trophy className="w-3 h-3 text-primary" />
              <span className="font-medium">Achievements</span>
            </div>
            <div className="text-muted-foreground">
              {unlockedCount}/{totalCount}
            </div>
          </div>
        </div>

        {/* Game Stats */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center bg-muted/30 rounded p-2">
            <div className="font-bold text-primary">{stats.totalRolls}</div>
            <div className="text-muted-foreground">Rolls</div>
          </div>
          <div className="text-center bg-muted/30 rounded p-2">
            <div className="font-bold text-green-600">{stats.wins}</div>
            <div className="text-muted-foreground">Wins</div>
          </div>
          <div className="text-center bg-muted/30 rounded p-2">
            <div className="font-bold text-red-600">{stats.maxStreak}</div>
            <div className="text-muted-foreground">Best Streak</div>
          </div>
        </div>

        {/* Achievements List */}
        <div>
          <h4 className="text-xs font-medium mb-2 flex items-center gap-1">
            <Trophy className="w-3 h-3" />
            Achievements ({unlockedCount}/{totalCount})
          </h4>
          <ScrollArea className="h-32">
            <div className="space-y-2">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`p-2 rounded border text-xs ${
                    achievement.unlocked
                      ? 'bg-green-500/10 border-green-500/30'
                      : 'bg-muted/30 border-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{achievement.icon}</span>
                      <span className="font-medium text-xs">{achievement.name}</span>
                    </div>
                    {achievement.unlocked && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{achievement.xpReward} XP
                      </Badge>
                    )}
                  </div>
                  <div className="text-muted-foreground text-xs mb-1">
                    {achievement.description}
                  </div>
                  {!achievement.unlocked && achievement.maxProgress > 1 && (
                    <div className="flex items-center gap-2">
                      <Progress 
                        value={(achievement.progress / achievement.maxProgress) * 100} 
                        className="h-1 flex-1"
                      />
                      <span className="text-xs text-muted-foreground">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  );
};