import { useCallback, useRef } from 'react';

interface SoundEffects {
  playDiceRoll: () => void;
  playWin: () => void;
  playLoss: () => void;
  playClick: () => void;
  playCoinCollect: () => void;
  playLevelUp: () => void;
  playAchievement: () => void;
  playError: () => void;
  playNFTMint: () => void;
  playGameStart: () => void;
}

export const useSoundEffects = (): SoundEffects => {
  const audioContextRef = useRef<AudioContext | null>(null);

  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  const playTone = useCallback((frequency: number, duration: number, volume: number = 0.1, type: OscillatorType = 'sine') => {
    try {
      const audioContext = initAudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;
      
      gainNode.gain.setValueAtTime(0, audioContext.currentTime);
      gainNode.gain.linearRampToValueAtTime(volume, audioContext.currentTime + 0.01);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }, [initAudioContext]);

  const playSequence = useCallback((notes: Array<{freq: number, duration: number, delay: number}>, volume: number = 0.1) => {
    notes.forEach(({ freq, duration, delay }) => {
      setTimeout(() => playTone(freq, duration, volume), delay);
    });
  }, [playTone]);

  const playDiceRoll = useCallback(() => {
    // Dice rolling sound - rapid clicks getting slower
    const rolls = [
      { freq: 800, duration: 0.05, delay: 0 },
      { freq: 900, duration: 0.05, delay: 50 },
      { freq: 700, duration: 0.05, delay: 100 },
      { freq: 850, duration: 0.05, delay: 180 },
      { freq: 750, duration: 0.05, delay: 280 },
      { freq: 800, duration: 0.1, delay: 400 },
    ];
    playSequence(rolls, 0.15);
  }, [playSequence]);

  const playWin = useCallback(() => {
    // Victory fanfare - ascending notes
    const notes = [
      { freq: 523, duration: 0.2, delay: 0 },    // C5
      { freq: 659, duration: 0.2, delay: 100 },  // E5
      { freq: 784, duration: 0.2, delay: 200 },  // G5
      { freq: 1047, duration: 0.4, delay: 300 }, // C6
    ];
    playSequence(notes, 0.2);
  }, [playSequence]);

  const playLoss = useCallback(() => {
    // Descending sad notes
    const notes = [
      { freq: 400, duration: 0.3, delay: 0 },
      { freq: 350, duration: 0.3, delay: 150 },
      { freq: 300, duration: 0.5, delay: 300 },
    ];
    playSequence(notes, 0.15);
  }, [playSequence]);

  const playClick = useCallback(() => {
    playTone(1000, 0.1, 0.05, 'square');
  }, [playTone]);

  const playCoinCollect = useCallback(() => {
    // Coin sound - quick ascending chirp
    const notes = [
      { freq: 988, duration: 0.1, delay: 0 },
      { freq: 1319, duration: 0.1, delay: 50 },
    ];
    playSequence(notes, 0.1);
  }, [playSequence]);

  const playLevelUp = useCallback(() => {
    // Level up fanfare
    const notes = [
      { freq: 523, duration: 0.15, delay: 0 },
      { freq: 659, duration: 0.15, delay: 80 },
      { freq: 784, duration: 0.15, delay: 160 },
      { freq: 1047, duration: 0.15, delay: 240 },
      { freq: 1319, duration: 0.3, delay: 320 },
    ];
    playSequence(notes, 0.2);
  }, [playSequence]);

  const playAchievement = useCallback(() => {
    // Achievement unlock sound
    const notes = [
      { freq: 1047, duration: 0.2, delay: 0 },
      { freq: 1319, duration: 0.2, delay: 100 },
      { freq: 1568, duration: 0.3, delay: 200 },
    ];
    playSequence(notes, 0.18);
  }, [playSequence]);

  const playError = useCallback(() => {
    playTone(200, 0.3, 0.1, 'sawtooth');
  }, [playTone]);

  const playNFTMint = useCallback(() => {
    // Special NFT mint sound - magical chime
    const notes = [
      { freq: 1047, duration: 0.2, delay: 0 },
      { freq: 1319, duration: 0.2, delay: 100 },
      { freq: 1568, duration: 0.2, delay: 200 },
      { freq: 2093, duration: 0.4, delay: 300 },
    ];
    playSequence(notes, 0.15);
  }, [playSequence]);

  const playGameStart = useCallback(() => {
    // Game start fanfare
    const notes = [
      { freq: 523, duration: 0.2, delay: 0 },
      { freq: 659, duration: 0.2, delay: 150 },
      { freq: 784, duration: 0.3, delay: 300 },
    ];
    playSequence(notes, 0.18);
  }, [playSequence]);

  return {
    playDiceRoll,
    playWin,
    playLoss,
    playClick,
    playCoinCollect,
    playLevelUp,
    playAchievement,
    playError,
    playNFTMint,
    playGameStart,
  };
};