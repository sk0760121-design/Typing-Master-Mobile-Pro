import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../types';
import { synth } from '../utils/audio';
import { Zap, Heart, Play, RotateCcw, AlertOctagon, Trophy, ShoppingCart, Sparkles, Rocket } from 'lucide-react';

interface ArenaGamesTabProps {
  profile: UserProfile;
  onUpdateCoinsAndXp: (xpEarned: number, coinsEarned: number) => void;
}

interface FallingWord {
  id: string;
  word: string;
  x: number; // percentage width
  y: number; // percentage height
  speed: number;
}

const GENERAL_WORDS = [
  "neon", "cyber", "laser", "pulse", "grid", "synth", "warp", "orbit", "shield", "proton", "cosmos",
  "tactical", "matrix", "velocity", "quantum", "phantom", "sentinel", "firewall", "hacker", "protocol",
  "mainframe", "satellite", "rocket", "nebula", "cluster", "gravity", "engine", "kinetic", "catalyst"
];

export default function ArenaGamesTab({ profile, onUpdateCoinsAndXp }: ArenaGamesTabProps) {
  const [activeGame, setActiveGame] = useState<'selection' | 'space_shooter' | 'falling_words' | 'game_over'>('selection');
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'game_over'>('idle');
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [currentLevel, setCurrentLevel] = useState(1);
  const [inputVal, setInputVal] = useState('');
  const [words, setWords] = useState<FallingWord[]>([]);
  const [shotLaserIndex, setShotLaserIndex] = useState<{ x: number; y: number } | null>(null);

  const gameLoopRef = useRef<any>(null);
  const wordSpawnerRef = useRef<any>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Stats updates after game finishes
  const handleGameFinish = () => {
    setActiveGame('game_over');
    setGameState('game_over');
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (wordSpawnerRef.current) clearInterval(wordSpawnerRef.current);

    // High gamification coin formulas
    const xpGained = Math.round(score * 1.5 + currentLevel * 10);
    const coinsGained = Math.round(score * 0.25 + 5);

    onUpdateCoinsAndXp(xpGained, coinsGained);
    synth.playSuccessChime();
  };

  const startGame = (type: 'space_shooter' | 'falling_words') => {
    setActiveGame(type);
    setGameState('playing');
    setScore(0);
    setLives(3);
    setCurrentLevel(1);
    setInputVal('');
    setWords([]);

    // Spawn initial words
    const initialWords: FallingWord[] = [];
    for (let i = 0; i < 3; i++) {
       initialWords.push(spawnWordObj(i * 150));
    }
    setWords(initialWords);

    // Launch Game Loops
    launchEngine(type);

    setTimeout(() => {
      inputRef.current?.focus();
    }, 150);
  };

  const spawnWordObj = (initialY: number = -20): FallingWord => {
    const rIdx = Math.floor(Math.random() * GENERAL_WORDS.length);
    const wordSelected = GENERAL_WORDS[rIdx];
    return {
      id: Math.random().toString(36).substr(2, 9),
      word: wordSelected,
      x: 10 + Math.random() * 70, // Keep boundaries within center screen
      y: initialY,
      speed: 0.8 + Math.random() * 0.6 + (currentLevel * 0.15)
    };
  };

  const launchEngine = (type: string) => {
    if (gameLoopRef.current) clearInterval(gameLoopRef.current);
    if (wordSpawnerRef.current) clearInterval(wordSpawnerRef.current);

    // Speed / Physics Frame Refresher
    gameLoopRef.current = setInterval(() => {
      setWords((prevWords) => {
        let hitBottom = false;
        
        const updated = prevWords.map((w) => {
          const dy = type === 'space_shooter' ? w.speed * 1.5 : w.speed * 1.2;
          const nextY = w.y + dy;
          if (nextY >= 350) {
            hitBottom = true;
          }
          return { ...w, y: nextY };
        });

        if (hitBottom) {
          synth.playKeyPress(false); // Play buzzer sound when impact
          setLives((l) => {
            const nextL = l - 1;
            if (nextL <= 0) {
              setTimeout(() => {
                handleGameFinish();
              }, 50);
            }
            return nextL;
          });
          // Remove words that went out of screen
          return updated.filter((w) => w.y < 350);
        }

        return updated;
      });
    }, 45);

    // Word Spawner
    wordSpawnerRef.current = setInterval(() => {
      setWords((prev) => {
        if (prev.length < 5) {
          return [...prev, spawnWordObj()];
        }
        return prev;
      });
    }, 2800);
  };

  // Keyboard word trigger typing checker
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.trim().toLowerCase();
    setInputVal(e.target.value);

    // Find if typed phrase matches any falling word perfectly
    const match = words.find((w) => w.word === val);
    if (match) {
      synth.playKeyPress(true); // Laser audio sound
      setShotLaserIndex({ x: match.x, y: match.y });
      setScore((s) => {
        const nextScore = s + 10;
        // Level up difficulty multiplier
        if (nextScore > 0 && nextScore % 80 === 0) {
          setCurrentLevel((lvl) => lvl + 1);
        }
        return nextScore;
      });

      // Clear input values
      setInputVal('');
      // Wipe targeted element
      setWords((prev) => prev.filter((w) => w.id !== match.id));

      // Reset laser flash
      setTimeout(() => {
        setShotLaserIndex(null);
      }, 350);
    }
  };

  useEffect(() => {
    return () => {
      if (gameLoopRef.current) clearInterval(gameLoopRef.current);
      if (wordSpawnerRef.current) clearInterval(wordSpawnerRef.current);
    };
  }, []);

  return (
    <div className="space-y-4 animate-fade-in px-1">
      {/* 1. SELECTION SCREEN */}
      {activeGame === 'selection' && (
        <div className="space-y-4">
          <div className="p-4.5 border border-indigo-100 bg-indigo-50/45 rounded-2xl relative overflow-hidden shadow-sm">
            <h3 className="text-xs font-bold text-slate-850 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-4.5 h-4.5 text-indigo-600 animate-pulse" />
              TypeMaster Game Arena
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              Transform static training drills into interactive space struggles or swift falling letter matching grids. Earn premium coins and bonus XP to rank up on global standings!
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Space Typing Shooter */}
            <div className="p-5 border border-slate-100 bg-white rounded-2xl text-left flex flex-col justify-between space-y-4 hover:border-indigo-100 transition-all group relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-650 w-fit shadow-sm">
                  <Rocket className="w-5 h-5 animate-pulse" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                  Cosmic Sentinel Speed Shooter
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Protect your starbase from incoming asteroids! Spaceships bearing vocabulary tags descend. Fast type tags to fire laser cannons and save the defense firewall!
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[9px] font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider">Speed Premium: +15 XP</span>
                <button 
                  onClick={() => startGame('space_shooter')}
                  className="px-4.5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:scale-103 shadow-md shadow-indigo-600/10 cursor-pointer flex items-center gap-1 hover:bg-indigo-700 transition"
                >
                  Play Game <Play className="w-3 h-3 fill-current ml-0.5" />
                </button>
              </div>
            </div>

            {/* Falling Words */}
            <div className="p-5 border border-slate-100 bg-white rounded-2xl text-left flex flex-col justify-between space-y-4 hover:border-amber-100 transition-all group relative overflow-hidden shadow-sm">
              <div className="absolute top-0 right-0 w-16 h-16 bg-amber-500/5 rounded-full blur-2xl pointer-events-none"></div>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 w-fit shadow-sm">
                  <Zap className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-amber-600 transition-colors">
                  Aura Falling Word Abyss
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed font-sans">
                  Traditional falling typing text challenge. As modern phrase tiles scroll down rapidly, clear them with correct spelling rules before they touch screen borders.
                </p>
              </div>

              <div className="flex items-center justify-between pt-2">
                <span className="text-[9px] font-bold font-mono text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded uppercase tracking-wider font-extrabold">Arcade Boost: +10 XP</span>
                <button 
                  onClick={() => startGame('falling_words')}
                  className="px-4.5 py-2.5 rounded-xl bg-amber-500 text-white text-xs font-bold hover:scale-103 shadow-md shadow-amber-500/10 cursor-pointer flex items-center gap-1 hover:bg-amber-600 transition"
                >
                  Play Game <Play className="w-3 h-3 fill-current ml-0.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. GAMEPLAY LAYOUT WINDOW */}
      {(activeGame === 'space_shooter' || activeGame === 'falling_words') && (
        <div className="border border-slate-150 bg-white rounded-2xl p-4.5 space-y-4 overflow-hidden relative shadow-sm">
          
          {/* Header Stats */}
          <div className="flex justify-between items-center bg-slate-50 p-3 rounded-xl border border-slate-100 shadow-inner">
            <div className="text-[10px] font-bold font-mono text-slate-500 uppercase">
              SCORE: <span className="text-indigo-650 font-extrabold">{score}</span>
            </div>
            
            <div className="text-[10px] font-bold font-mono text-slate-500 uppercase">
              LVEL: <span className="text-indigo-655 font-extrabold">{currentLevel}</span>
            </div>

            <div className="flex gap-1">
              {[1, 2, 3].map((heart) => (
                <Heart 
                  key={heart} 
                  className={`w-4.5 h-4.5 ${heart <= lives ? 'text-rose-500 fill-rose-500 animate-pulse' : 'text-slate-200'}`} 
                />
              ))}
            </div>
          </div>

          {/* Active Canvas Game Window with a beautiful futuristic cyber retro style */}
          <div 
            className="h-90 relative rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shadow-inner cursor-crosshair"
            onClick={() => inputRef.current?.focus()}
          >
            {/* Ambient grid stars matrix */}
            <div className="absolute inset-0 bg-[radial-gradient(#334155_1.2px,transparent_1.2px)] [background-size:18px_18px] opacity-35 pointer-events-none"></div>

            {/* Plasma beam visual line on successful spelling checks */}
            {shotLaserIndex && (
              <svg className="absolute inset-0 w-full h-full pointer-events-none z-20">
                <line 
                  x1="50%" 
                  y1="95%" 
                  x2={`${shotLaserIndex.x}%`} 
                  y2={`${shotLaserIndex.y + 10}px`} 
                  stroke="#38bdf8" 
                  strokeWidth="4" 
                  strokeLinecap="round"
                  className="animate-pulse"
                />
                <circle 
                  cx={`${shotLaserIndex.x}%`} 
                  cy={`${shotLaserIndex.y + 10}px`} 
                  r="18" 
                  fill="#0284c7" 
                  opacity="0.4" 
                  className="animate-pulse"
                />
              </svg>
            )}

            {/* Falling Vocabulary Elements */}
            {words.map((w) => (
              <div
                key={w.id}
                className="absolute transition-all duration-75 flex flex-col items-center z-10"
                style={{ 
                  left: `${w.x}%`, 
                  top: `${w.y}px`,
                  transform: 'translateX(-50%)' 
                }}
              >
                {activeGame === 'space_shooter' ? (
                  // Spaceship elements
                  <div className="relative flex flex-col items-center">
                    <Rocket className="w-7 h-7 text-sky-400 rotate-180 drop-shadow-[0_0_8px_rgba(56,189,248,0.6)] animate-bounce" />
                    <span className="mt-1 px-2 py-0.5 rounded-full bg-slate-950/90 border border-sky-400/50 text-white font-mono text-[9px] font-bold tracking-wider uppercase">
                      {w.word}
                    </span>
                  </div>
                ) : (
                  // Falling key block tags
                  <span className="px-2.5 py-1.5 rounded-lg bg-slate-950 border-2 border-amber-500/70 text-amber-400 font-mono text-[10px] uppercase tracking-widest font-extrabold shadow-md">
                    {w.word}
                  </span>
                )}
              </div>
            ))}

            {/* Bottom launcher structure */}
            <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex flex-col items-center z-20">
              <div className="w-8 h-8 bg-slate-950 border border-sky-500/50 rounded-t-full flex items-center justify-center shadow-md">
                <Rocket className="w-4 h-4 text-sky-400" />
              </div>
              <div className="w-12 h-2 rounded bg-slate-800 border border-slate-700 shadow-sm"></div>
            </div>

            {/* Loading placeholder */}
            {words.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-xs font-mono font-bold text-slate-500">
                AWAITING METEOR DRIFTS...
              </div>
            )}
          </div>

          {/* Action Keyboard Input block */}
          <div className="space-y-3">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                placeholder="Type falling words quickly..."
                value={inputVal}
                onChange={handleInputChange}
                className="w-full text-center py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-850 text-base font-mono tracking-widest focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 uppercase font-bold"
                disabled={gameState !== 'playing'}
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
                autoCapitalize="off"
              />
              <div className="absolute right-3.5 top-1/2 transform -translate-y-1/2 bg-indigo-50 text-indigo-650 text-[8px] font-bold font-mono px-2 py-0.5 rounded border border-indigo-100 uppercase tracking-wide">
                Auto-Focus
              </div>
            </div>

            <div className="flex gap-2 justify-between">
              <button 
                onClick={() => {
                  if (gameLoopRef.current) clearInterval(gameLoopRef.current);
                  if (wordSpawnerRef.current) clearInterval(wordSpawnerRef.current);
                  setActiveGame('selection');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-bold"
              >
                Quit Game
              </button>
              
              <button 
                onClick={() => startGame(activeGame as any)}
                className="px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:text-slate-800 transition-colors cursor-pointer flex items-center gap-1.5 font-bold"
                title="Restart level"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Restart Level
              </button>
            </div>
          </div>

        </div>
      )}

      {/* 3. GAME OVER OVERLAY SUMMARY SCREEN */}
      {activeGame === 'game_over' && (
        <div className="border border-slate-150 bg-white p-6 rounded-2xl text-center space-y-5.5 animate-scale-up max-w-sm mx-auto shadow-md">
          <div className="w-14 h-14 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center mx-auto border border-rose-100 shadow-sm">
            <AlertOctagon className="w-7 h-7" />
          </div>

          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-850 tracking-tight">Mainframe Overrun!</h3>
            <p className="text-xs text-slate-400 font-medium font-sans">Asteroids breached your local coordinate defense system.</p>
          </div>

          {/* Micro score board result */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-2">
            <div className="flex justify-between text-xs text-slate-500 font-bold font-mono">
              <span>SCORE ATTAINED</span>
              <span className="text-slate-850 font-bold">{score} pts</span>
            </div>
            <div className="flex justify-between text-xs text-slate-505 font-bold font-mono">
              <span>XP BONUS EARNED</span>
              <span className="text-indigo-600 font-bold">+{Math.round(score * 1.5 + currentLevel * 10)} XP</span>
            </div>
            <div className="flex justify-between text-xs text-slate-505 font-bold font-mono">
              <span>COINS RETRIEVED</span>
              <span className="text-amber-500 font-bold">+${Math.round(score * 0.25 + 5)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button 
              onClick={() => setActiveGame('selection')}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 hover:text-slate-800 font-bold transition-colors cursor-pointer"
            >
              Quit Arena
            </button>
            <button 
              onClick={() => startGame('space_shooter')}
              className="flex-1 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold hover:scale-102 shadow-md shadow-indigo-600/10 transition-all cursor-pointer flex items-center justify-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5 fill-current" /> Play Again
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
