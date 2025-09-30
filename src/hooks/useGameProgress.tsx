import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useSoundEffects } from './useSoundEffects';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progress: number;
  maxProgress: number;
  xpReward: number;
  type: 'roll' | 'win' | 'loss' | 'survival' | 'special';
}

export interface GameStats {
  level: number;
  xp: number;
  xpToNext: number;
  totalRolls: number;
  wins: number;
  losses: number;
  survivalStreak: number;
  maxStreak: number;
  totalXP: number;
  energy: number;
  maxEnergy: number;
  lives: number;
  maxLives: number;
}

export interface NPCOpponent {
  id: string;
  name: string;
  avatar: string;
  personality: string;
  winRate: number;
  level: number;
  isActive: boolean;
}

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_roll',
    name: 'First Steps',
    description: 'Roll the dice for the first time',
    icon: '🎲',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpReward: 10,
    type: 'roll'
  },
  {
    id: 'roller_10',
    name: 'Getting Started',
    description: 'Roll the dice 10 times',
    icon: '🎯',
    unlocked: false,
    progress: 0,
    maxProgress: 10,
    xpReward: 25,
    type: 'roll'
  },
  {
    id: 'first_win',
    name: 'Lucky Strike',
    description: 'Land on your first profit tile',
    icon: '💰',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpReward: 15,
    type: 'win'
  },
  {
    id: 'survivor_5',
    name: 'Survivor',
    description: 'Survive 5 rounds without going bankrupt',
    icon: '🛡️',
    unlocked: false,
    progress: 0,
    maxProgress: 5,
    xpReward: 50,
    type: 'survival'
  },
  {
    id: 'streak_3',
    name: 'Hot Streak',
    description: 'Land on 3 profit tiles in a row',
    icon: '🔥',
    unlocked: false,
    progress: 0,
    maxProgress: 3,
    xpReward: 40,
    type: 'win'
  },
  {
    id: 'nft_collector',
    name: 'NFT Collector',
    description: 'Mint your first NFT',
    icon: '🎨',
    unlocked: false,
    progress: 0,
    maxProgress: 1,
    xpReward: 100,
    type: 'special'
  }
];

const NPC_OPPONENTS: NPCOpponent[] = [
  {
    id: 'rookie_bob',
    name: 'Rookie Bob',
    avatar: '🤖',
    personality: 'Cautious and new to the game',
    winRate: 0.3,
    level: 1,
    isActive: true
  },
  {
    id: 'lucky_lisa',
    name: 'Lucky Lisa',
    avatar: '🍀',
    personality: 'Always optimistic about the next roll',
    winRate: 0.5,
    level: 3,
    isActive: false
  },
  {
    id: 'crypto_charlie',
    name: 'Crypto Charlie',
    avatar: '₿',
    personality: 'Strategic and calculating',
    winRate: 0.7,
    level: 5,
    isActive: false
  }
];

export const useGameProgress = () => {
  const { toast } = useToast();
  const sounds = useSoundEffects();
  
  const [stats, setStats] = useState<GameStats>({
    level: 1,
    xp: 0,
    xpToNext: 100,
    totalRolls: 0,
    wins: 0,
    losses: 0,
    survivalStreak: 0,
    maxStreak: 0,
    totalXP: 0,
    energy: 10,
    maxEnergy: 10,
    lives: 3,
    maxLives: 3
  });

  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);
  const [npcs, setNpcs] = useState<NPCOpponent[]>(NPC_OPPONENTS);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [gameMode, setGameMode] = useState<'normal' | 'survival'>('normal');

  // Load from localStorage on mount
  useEffect(() => {
    const savedStats = localStorage.getItem('zama-dice-stats');
    const savedAchievements = localStorage.getItem('zama-dice-achievements');
    
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
    if (savedAchievements) {
      setAchievements(JSON.parse(savedAchievements));
    }
  }, []);

  // Save to localStorage whenever stats or achievements change
  useEffect(() => {
    localStorage.setItem('zama-dice-stats', JSON.stringify(stats));
  }, [stats]);

  useEffect(() => {
    localStorage.setItem('zama-dice-achievements', JSON.stringify(achievements));
  }, [achievements]);

  const calculateXPToNext = (level: number): number => {
    return Math.floor(100 * Math.pow(1.2, level - 1));
  };

  const addXP = useCallback((amount: number) => {
    setStats(prev => {
      const newXP = prev.xp + amount;
      const newTotalXP = prev.totalXP + amount;
      let newLevel = prev.level;
      let remainingXP = newXP;
      
      // Check for level up
      while (remainingXP >= prev.xpToNext) {
        remainingXP -= prev.xpToNext;
        newLevel++;
        sounds.playLevelUp();
        
        toast({
          title: `🎉 Level Up! Level ${newLevel}`,
          description: `You've reached level ${newLevel}! Energy restored.`,
        });
      }
      
      const newXPToNext = calculateXPToNext(newLevel);
      
      return {
        ...prev,
        level: newLevel,
        xp: remainingXP,
        xpToNext: newXPToNext,
        totalXP: newTotalXP,
        energy: newLevel > prev.level ? prev.maxEnergy : prev.energy, // Restore energy on level up
      };
    });
  }, [sounds, toast]);

  const useEnergy = useCallback((amount: number = 1): boolean => {
    if (stats.energy < amount) {
      toast({
        title: "Not Enough Energy! ⚡",
        description: "Wait for energy to regenerate or level up to restore it.",
        variant: "destructive",
      });
      return false;
    }
    
    setStats(prev => ({
      ...prev,
      energy: Math.max(0, prev.energy - amount)
    }));
    
    return true;
  }, [stats.energy, toast]);

  const useLive = useCallback((): boolean => {
    if (stats.lives <= 0) {
      toast({
        title: "Game Over! ☠️",
        description: "You've run out of lives in survival mode.",
        variant: "destructive",
      });
      return false;
    }
    
    setStats(prev => ({
      ...prev,
      lives: Math.max(0, prev.lives - 1)
    }));
    
    return true;
  }, [stats.lives, toast]);

  const restoreEnergy = useCallback(() => {
    setStats(prev => ({
      ...prev,
      energy: Math.min(prev.maxEnergy, prev.energy + 1)
    }));
  }, []);

  const trackRoll = useCallback(() => {
    setStats(prev => ({
      ...prev,
      totalRolls: prev.totalRolls + 1
    }));
    
    checkAchievement('first_roll');
    checkAchievement('roller_10');
    addXP(2); // Base XP for rolling
  }, [addXP]);

  const trackWin = useCallback((amount: number = 0) => {
    setStats(prev => ({
      ...prev,
      wins: prev.wins + 1,
      survivalStreak: prev.survivalStreak + 1,
      maxStreak: Math.max(prev.maxStreak, prev.survivalStreak + 1)
    }));
    
    setCurrentStreak(prev => prev + 1);
    
    sounds.playWin();
    sounds.playCoinCollect();
    
    checkAchievement('first_win');
    checkAchievement('streak_3');
    checkAchievement('survivor_5');
    
    addXP(10 + Math.floor(amount / 10)); // XP based on win amount
  }, [sounds, addXP]);

  const trackLoss = useCallback((amount: number = 0) => {
    setStats(prev => ({
      ...prev,
      losses: prev.losses + 1,
      survivalStreak: 0
    }));
    
    setCurrentStreak(0);
    sounds.playLoss();
    
    if (gameMode === 'survival') {
      useLive();
    }
    
    addXP(1); // Small XP for trying
  }, [sounds, gameMode, useLive, addXP]);

  const trackNFTMint = useCallback(() => {
    sounds.playNFTMint();
    checkAchievement('nft_collector');
    addXP(50);
  }, [sounds, addXP]);

  const checkAchievement = useCallback((achievementId: string) => {
    setAchievements(prev => {
      const updated = prev.map(achievement => {
        if (achievement.id === achievementId && !achievement.unlocked) {
          let newProgress = achievement.progress + 1;
          
          if (achievementId === 'roller_10') {
            newProgress = stats.totalRolls + 1;
          } else if (achievementId === 'streak_3') {
            newProgress = currentStreak + 1;
          } else if (achievementId === 'survivor_5') {
            newProgress = stats.survivalStreak + 1;
          }
          
          if (newProgress >= achievement.maxProgress) {
            sounds.playAchievement();
            addXP(achievement.xpReward);
            
            toast({
              title: `🏆 Achievement Unlocked!`,
              description: `${achievement.icon} ${achievement.name}: ${achievement.description}`,
            });
            
            return {
              ...achievement,
              progress: achievement.maxProgress,
              unlocked: true
            };
          }
          
          return {
            ...achievement,
            progress: newProgress
          };
        }
        return achievement;
      });
      
      return updated;
    });
  }, [stats.totalRolls, stats.survivalStreak, currentStreak, sounds, addXP, toast]);

  const getActiveNPC = useCallback((): NPCOpponent => {
    const activeNPCs = npcs.filter(npc => npc.level <= stats.level);
    return activeNPCs[Math.floor(Math.random() * activeNPCs.length)] || npcs[0];
  }, [npcs, stats.level]);

  const resetGame = useCallback(() => {
    setStats({
      level: 1,
      xp: 0,
      xpToNext: 100,
      totalRolls: 0,
      wins: 0,
      losses: 0,
      survivalStreak: 0,
      maxStreak: 0,
      totalXP: 0,
      energy: 10,
      maxEnergy: 10,
      lives: 3,
      maxLives: 3
    });
    setAchievements(INITIAL_ACHIEVEMENTS);
    setCurrentStreak(0);
    localStorage.removeItem('zama-dice-stats');
    localStorage.removeItem('zama-dice-achievements');
  }, []);

  // Energy regeneration
  useEffect(() => {
    const interval = setInterval(() => {
      restoreEnergy();
    }, 60000); // Restore 1 energy per minute
    
    return () => clearInterval(interval);
  }, [restoreEnergy]);

  return {
    stats,
    achievements,
    npcs,
    gameMode,
    currentStreak,
    setGameMode,
    trackRoll,
    trackWin,
    trackLoss,
    trackNFTMint,
    useEnergy,
    addXP,
    getActiveNPC,
    resetGame,
  };
};