import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6 } from "lucide-react";

interface DiceAnimationProps {
  isRolling: boolean;
  finalValue?: number;
  onRollComplete?: () => void;
  className?: string;
}

const diceIcons = [Dice1, Dice2, Dice3, Dice4, Dice5, Dice6];

export const DiceAnimation = ({ 
  isRolling, 
  finalValue, 
  onRollComplete,
  className = ""
}: DiceAnimationProps) => {
  const [currentValue, setCurrentValue] = useState(1);
  const [animationPhase, setAnimationPhase] = useState<'idle' | 'rolling' | 'slowing' | 'stopped'>('idle');

  useEffect(() => {
    if (!isRolling && animationPhase !== 'idle') {
      // Stop rolling and show final value
      setAnimationPhase('slowing');
      
      const slowingTimer = setTimeout(() => {
        setAnimationPhase('stopped');
        if (finalValue) {
          setCurrentValue(finalValue);
        }
        onRollComplete?.();
      }, 500);

      return () => clearTimeout(slowingTimer);
    }
  }, [isRolling, finalValue, animationPhase, onRollComplete]);

  useEffect(() => {
    if (isRolling && animationPhase === 'idle') {
      setAnimationPhase('rolling');
    }
  }, [isRolling, animationPhase]);

  useEffect(() => {
    if (animationPhase === 'rolling') {
      const interval = setInterval(() => {
        setCurrentValue(prev => (prev % 6) + 1);
      }, 100);

      return () => clearInterval(interval);
    } else if (animationPhase === 'slowing') {
      const interval = setInterval(() => {
        setCurrentValue(prev => (prev % 6) + 1);
      }, 200);

      return () => clearInterval(interval);
    }
  }, [animationPhase]);

  const DiceIcon = diceIcons[currentValue - 1];

  const getAnimationClasses = () => {
    switch (animationPhase) {
      case 'rolling':
        return 'animate-spin';
      case 'slowing':
        return 'animate-bounce';
      case 'stopped':
        return 'animate-pulse';
      default:
        return '';
    }
  };

  const getSizeClasses = () => {
    switch (animationPhase) {
      case 'rolling':
        return 'w-12 h-12';
      case 'slowing':
        return 'w-14 h-14';
      case 'stopped':
        return 'w-16 h-16';
      default:
        return 'w-10 h-10';
    }
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className={`
        transition-all duration-300 ease-out
        ${getSizeClasses()}
        ${getAnimationClasses()}
        ${animationPhase === 'stopped' ? 'text-primary' : 'text-muted-foreground'}
      `}>
        <DiceIcon className="w-full h-full drop-shadow-lg" />
      </div>
      
      {animationPhase === 'stopped' && finalValue && (
        <div className="ml-3 text-center animate-fade-in">
          <div className="text-sm font-medium text-muted-foreground">Rolled:</div>
          <div className="text-2xl font-bold text-primary">{finalValue}</div>
        </div>
      )}
    </div>
  );
};

interface DiceRollButtonProps {
  onRoll: () => void;
  isRolling: boolean;
  disabled?: boolean;
  className?: string;
}

export const DiceRollButton = ({ 
  onRoll, 
  isRolling, 
  disabled = false,
  className = ""
}: DiceRollButtonProps) => {
  return (
    <Button
      onClick={onRoll}
      disabled={disabled || isRolling}
      className={`
        relative overflow-hidden
        ${isRolling ? 'animate-pulse' : 'hover:scale-105'}
        transition-transform duration-200
        ${className}
      `}
    >
      <DiceAnimation 
        isRolling={isRolling}
        className="mr-2" 
      />
      {isRolling ? "Rolling..." : "🎲 Roll Dice"}
      
      {isRolling && (
        <div className="absolute inset-0 bg-primary/20 animate-pulse" />
      )}
    </Button>
  );
};