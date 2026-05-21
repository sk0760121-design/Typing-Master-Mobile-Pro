import React, { useState, useEffect, useRef } from 'react';
import { TypingLesson, TypingRecord } from '../types';
import { synth } from '../utils/audio';
import { Play, RotateCcw, AlertTriangle, Zap, CheckCircle, ArrowLeft, Volume2, VolumeX, Keyboard } from 'lucide-react';

interface TypingEngineProps {
  initialText: string;
  title: string;
  mode: TypingRecord['mode'];
  timeLimitSecs?: number; // 0 or undefined means unlimited/endurance mode based on passage completion
  onBack: () => void;
  onFinished: (
    wpm: number,
    accuracy: number,
    charactersTyped: number,
    errors: number,
    elapsedSecs: number,
    mistakesMap: Record<string, number>,
    correctMap: Record<string, number>
  ) => void;
}

// Finger position mapping helper
const keyToFingerMap: Record<string, string> = {
  'q': 'Left Pinky', 'a': 'Left Pinky', 'z': 'Left Pinky', '1': 'Left Pinky',
  'w': 'Left Ring', 's': 'Left Ring', 'x': 'Left Ring', '2': 'Left Ring',
  'e': 'Left Middle', 'd': 'Left Middle', 'c': 'Left Middle', '3': 'Left Middle',
  'r': 'Left Index', 'f': 'Left Index', 'v': 'Left Index', 't': 'Left Index', 'g': 'Left Index', 'b': 'Left Index', '4': 'Left Index', '5': 'Left Index',
  ' ': 'Either Thumb',
  'y': 'Right Index', 'u': 'Right Index', 'h': 'Right Index', 'j': 'Right Index', 'n': 'Right Index', 'm': 'Right Index', '6': 'Right Index', '7': 'Right Index',
  'i': 'Right Middle', 'k': 'Right Middle', ',': 'Right Middle', '8': 'Right Middle',
  'o': 'Right Ring', 'l': 'Right Ring', '.': 'Right Ring', '9': 'Right Ring',
  'p': 'Right Pinky', ';': 'Right Pinky', '/': 'Right Pinky', '0': 'Right Pinky', '-': 'Right Pinky', '=': 'Right Pinky', '[': 'Right Pinky', ']': 'Right Pinky', '\'': 'Right Pinky'
};

const keyboardRows = [
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='],
  ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']'],
  ['a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\''],
  ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
];

export default function TypingEngine({ initialText, title, mode, timeLimitSecs, onBack, onFinished }: TypingEngineProps) {
  const targetText = initialText.trim();
  const targetChars = targetText.split('');

  const [typedHistory, setTypedHistory] = useState<boolean[]>([]); // true = correct, false = incorrect at each index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [elapsedSecs, setElapsedSecs] = useState(0);
  const [timeLeft, setTimeLeft] = useState(timeLimitSecs || 0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);

  // Statistics counters
  const [totalKeypresses, setTotalKeypresses] = useState(0);
  const [totalErrors, setTotalErrors] = useState(0);

  // Maps to record characters
  const mistakesMapRef = useRef<Record<string, number>>({});
  const correctMapRef = useRef<Record<string, number>>({});

  const inputAreaRef = useRef<HTMLTextAreaElement>(null);
  const clockIntervalRef = useRef<any>(null);

  // Reset core metrics
  useEffect(() => {
    setTypedHistory([]);
    setCurrentIndex(0);
    setStartTime(null);
    setElapsedSecs(0);
    setTimeLeft(timeLimitSecs || 0);
    setIsCompleted(false);
    setTotalKeypresses(0);
    setTotalErrors(0);
    mistakesMapRef.current = {};
    correctMapRef.current = {};

    if (clockIntervalRef.current) {
      clearInterval(clockIntervalRef.current);
    }

    // Auto focus typing area
    setTimeout(() => {
      inputAreaRef.current?.focus();
    }, 150);

    return () => {
      if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    };
  }, [initialText, timeLimitSecs]);

  // Compute live calculations
  const calculateLiveWpm = () => {
    if (elapsedSecs === 0) return 0;
    // (Correct Characters / 5) / Minutes Elapsed
    const correctCount = typedHistory.filter(Boolean).length;
    return Math.round((correctCount / 5) / (elapsedSecs / 60));
  };

  const calculateLiveAccuracy = () => {
    if (totalKeypresses === 0) return 100;
    const correctCount = typedHistory.filter(Boolean).length;
    return Math.round((correctCount / totalKeypresses) * 100);
  };

  // Live Timer Interval
  const startTimer = (initialStart: number) => {
    clockIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const diffSecs = Math.max(1, Math.round((now - initialStart) / 1000));
      setElapsedSecs(diffSecs);

      if (timeLimitSecs) {
        const remaining = Math.max(0, timeLimitSecs - diffSecs);
        setTimeLeft(remaining);

        if (remaining <= 0) {
          triggerComplete(diffSecs);
        }
      }
    }, 1000);
  };

  const triggerComplete = (finalElapsed: number) => {
    if (clockIntervalRef.current) clearInterval(clockIntervalRef.current);
    setIsCompleted(true);
    
    // Play celebratory bell
    synth.playSuccessChime();

    const liveWpm = Math.round((typedHistory.filter(Boolean).length / 5) / (Math.max(1, finalElapsed) / 60));
    const liveAcc = totalKeypresses > 0 ? Math.round((typedHistory.filter(Boolean).length / totalKeypresses) * 100) : 100;

    onFinished(
      liveWpm,
      liveAcc,
      totalKeypresses,
      totalErrors,
      Math.max(1, finalElapsed),
      mistakesMapRef.current,
      correctMapRef.current
    );
  };

  const handleKeyPress = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    if (isCompleted) return;

    const val = e.target.value;
    // We only process character mutations
    if (val.length < typedHistory.length) {
      // Handles backspace
      const newLen = val.length;
      setTypedHistory(prev => prev.slice(0, newLen));
      setCurrentIndex(newLen);
      return;
    }

    // Determine what character was typed
    const lastChar = val[val.length - 1];
    const targetChar = targetChars[currentIndex];

    if (!targetChar) return;

    // Start clock on very first key press
    let currentStart = startTime;
    if (startTime === null) {
      currentStart = Date.now();
      setStartTime(currentStart);
      startTimer(currentStart);
    }

    const isCorrect = lastChar === targetChar;
    setTotalKeypresses(prev => prev + 1);

    // Update charts & maps
    if (isCorrect) {
      // Register success
      correctMapRef.current[targetChar] = (correctMapRef.current[targetChar] || 0) + 1;
      setTypedHistory(prev => [...prev, true]);
      synth.playKeyPress(true);
    } else {
      // Register fail
      setTotalErrors(prev => prev + 1);
      mistakesMapRef.current[targetChar] = (mistakesMapRef.current[targetChar] || 0) + 1;
      setTypedHistory(prev => [...prev, false]);
      synth.playKeyPress(false);
    }

    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);

    // Check if paragraph is complete
    if (nextIdx >= targetChars.length) {
      const elapsed = startTime ? Math.round((Date.now() - startTime) / 1000) : 1;
      triggerComplete(elapsed);
    }
  };

  // Get current letter and recommended finger highlights
  const currentLetter = targetChars[currentIndex]?.toLowerCase() || '';
  const recommendedFinger = keyToFingerMap[currentLetter] || 'Unknown';

  const handleKeyboardToggle = () => {
    setSoundEnabled(!soundEnabled);
    synth.toggle(!soundEnabled);
  };

  const progressPercent = Math.round((currentIndex / targetChars.length) * 100);
  const timePercent = timeLimitSecs ? Math.max(0, Math.min(100, (timeLeft / timeLimitSecs) * 100)) : 100;

  // Circular timer constants
  const radius = 28;
  const circumference = 2 * Math.PI * radius; // approx 175.93
  const strokeDashoffset = timeLimitSecs ? circumference * (1 - timeLeft / timeLimitSecs) : 0;

  return (
    <div id="typing-arena-container" className="space-y-4 animate-fade-in px-1 select-none">
      {/* Top back navigation and stats speed-runner */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <button 
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          Exit Drill
        </button>

        <div className="flex items-center gap-2.5">
          <button 
            onClick={handleKeyboardToggle}
            className={`p-1.5 rounded-xl border transition-all cursor-pointer ${soundEnabled ? 'border-indigo-100 text-indigo-600 bg-indigo-50/50 hover:bg-indigo-50 shadow-sm' : 'border-slate-200 text-slate-400 hover:text-slate-650 bg-slate-50'}`}
            title="Toggle Typing Sound"
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          
          <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase">
            {timeLimitSecs ? `Timer Test` : 'Endurance'}
          </span>
        </div>
      </div>

      {/* Glassmorphism Active Dashboard */}
      <div className="p-4 border border-slate-150/40 bg-white/80 rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          
          {/* Animated Circular Clock Container */}
          {timeLimitSecs ? (
            <div className="relative flex items-center justify-center w-20 h-20 shrink-0 mx-auto sm:mx-0">
              {/* Outer glow ring */}
              <div className={`absolute inset-1.5 rounded-full blur-[3px] transition-all duration-500 opacity-60 ${timeLeft <= 5 ? 'bg-rose-500/10' : 'bg-indigo-500/10'}`}></div>
              
              <svg className="w-20 h-20 transform -rotate-90">
                {/* Background path */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke="#f1f5f9"
                  strokeWidth="4"
                  fill="transparent"
                />
                {/* Foreground animated path */}
                <circle
                  cx="40"
                  cy="40"
                  r={radius}
                  stroke={timeLeft <= 5 ? "#ef4444" : "#4f46e5"}
                  strokeWidth="4.5"
                  fill="transparent"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-linear"
                  style={{
                    filter: timeLeft <= 5 
                      ? "drop-shadow(0 0 6px rgba(239, 68, 68, 0.4))" 
                      : "drop-shadow(0 0 6px rgba(79, 70, 229, 0.25))"
                  }}
                />
              </svg>
              {/* Center Live numeric layout */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className={`text-[13px] font-mono font-extrabold tracking-tighter leading-none transition-all ${timeLeft <= 5 ? 'text-red-500 animate-pulse text-sm scale-110 font-black' : 'text-slate-800'}`}>
                  {timeLeft < 60 ? `${timeLeft}s` : `${Math.floor(timeLeft / 60)}:${timeLeft % 60 < 10 ? '0' : ''}${timeLeft % 60}`}
                </span>
                <span className="text-[7px] font-sans font-bold text-slate-400 tracking-wider uppercase mt-0.5">
                  Remaining
                </span>
              </div>
            </div>
          ) : (
            <div className="relative flex items-center justify-center w-20 h-20 shrink-0 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-full mx-auto sm:mx-0">
              <span className="text-xl">♾️</span>
              <span className="absolute bottom-1.5 text-[6.5px] font-bold font-mono text-indigo-650 uppercase tracking-widest">INF</span>
            </div>
          )}

          {/* Grid of the 4 key stats required */}
          <div className="flex-1 grid grid-cols-4 gap-2.5 w-full">
            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 text-center transition-all hover:bg-slate-105 shadow-sm">
              <span className="block text-[8px] font-bold font-mono text-slate-400 tracking-wider">SPEED</span>
              <span className="text-sm font-extrabold text-indigo-650 font-mono block mt-0.5">
                {calculateLiveWpm()} <span className="text-[8px] font-bold font-sans text-slate-400 uppercase">WPM</span>
              </span>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 text-center transition-all hover:bg-slate-105 shadow-sm">
              <span className="block text-[8px] font-bold font-mono text-slate-400 tracking-wider">ACCURACY</span>
              <span className="text-sm font-extrabold text-slate-800 font-mono block mt-0.5">
                {calculateLiveAccuracy()}%
              </span>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 text-center transition-all hover:bg-slate-105 shadow-sm">
              <span className="block text-[8px] font-bold font-mono text-slate-450 tracking-wider font-extrabold text-red-500">MISTAKES</span>
              <span className="text-sm font-extrabold text-red-500 font-mono block mt-0.5">
                {totalErrors}
              </span>
            </div>

            <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-2 text-center transition-all hover:bg-slate-105 shadow-sm">
              <span className="block text-[8px] font-bold font-mono text-slate-400 tracking-wider">PROGRESS</span>
              <span className="text-sm font-extrabold text-slate-600 font-mono block mt-0.5">
                {progressPercent}%
              </span>
            </div>
          </div>
        </div>

        {/* Linear progress bar for remaining time */}
        {timeLimitSecs && (
          <div className="space-y-1 pt-1.5 border-t border-slate-100/50">
            <div className="flex justify-between items-center text-[8px] text-slate-400 uppercase font-mono font-bold tracking-wide">
              <span>Remaining limit bar</span>
              <span>{Math.round(timePercent)}% Clock timer</span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden shadow-inner border border-slate-200/40">
              <div 
                className={`h-full rounded-full transition-all duration-1000 ease-linear ${timeLeft <= 5 ? 'bg-rose-500' : 'bg-gradient-to-r from-indigo-500 to-cyan-400'}`}
                style={{ width: `${timePercent}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Main glass paragraph visual screen */}
      <div 
        id="typing-text-stage"
        onClick={() => inputAreaRef.current?.focus()}
        className="relative min-h-36 border border-indigo-100 bg-white p-4.5 rounded-2xl shadow-[0_8px_30px_rgba(79,70,229,0.03)] cursor-text overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Dynamic scroll simulator */}
        <div className="text-sm md:text-base font-mono leading-relaxed tracking-wider select-none text-slate-350 whitespace-pre-wrap transition-all block">
          {targetChars.map((char, index) => {
            let className = "transition-all duration-75 inline";
            const isCaret = index === currentIndex;

            if (index < currentIndex) {
              className += typedHistory[index] 
                ? " text-emerald-600 font-bold" 
                : " text-red-500 font-extrabold bg-red-50 rounded px-0.5";
            } else if (isCaret) {
              className += " text-indigo-650 font-bold bg-indigo-50 border-b-2 border-indigo-600 animate-pulse px-0.5 rounded-sm";
            } else {
              className += " text-slate-450 opacity-80";
            }

            return (
              <span key={index} className={className}>
                {char}
              </span>
            );
          })}
        </div>

        {/* Hidden textarea acting as native key board listener */}
        <textarea
          ref={inputAreaRef}
          value={targetText.substr(0, currentIndex)}
          onChange={handleKeyPress}
          className="absolute inset-0 opacity-0 cursor-default select-none resize-none overflow-hidden"
          autoFocus
          spellCheck="false"
          autoComplete="off"
          autoCapitalize="off"
          disabled={isCompleted}
        />
        
        {/* Helper guide lines */}
        {currentIndex === 0 && (
          <div className="absolute inset-x-0 bottom-3 flex justify-center text-[9px] text-indigo-500 font-bold font-mono tracking-widest animate-pulse pointer-events-none uppercase">
            👉 Tap here or tap keys to engage the counter
          </div>
        )}
      </div>

      {/* Futuristic finger and virtual keyboard guide */}
      <div className="border border-slate-150 bg-white rounded-2xl p-4 shadow-sm space-y-3.5">
        <div className="flex justify-between items-center text-xs">
          <span className="font-bold text-slate-500 font-sans flex items-center gap-1">
            <Keyboard className="w-4.5 h-4.5 text-indigo-600" /> VIRTUAL TRAINING BOARD
          </span>
          <span className="font-extrabold text-indigo-650 font-mono uppercase bg-indigo-55 border border-indigo-100 px-2 py-0.5 rounded text-[10px]">
            FINGER: {recommendedFinger}
          </span>
        </div>

        {/* Keyboard GUI Grid */}
        <div className="space-y-1.5 md:block hidden">
          {keyboardRows.map((row, rowIdx) => (
            <div key={rowIdx} className="flex justify-center gap-1.5">
              {row.map((item) => {
                const isTargetLetter = currentLetter === item;
                return (
                  <kbd
                    key={item}
                    className={`h-7 px-2 flex items-center justify-center rounded text-[10px] font-mono uppercase transition-all duration-100 ${
                      isTargetLetter 
                        ? 'bg-indigo-600 text-white font-extrabold border border-indigo-500 scale-103 shadow-md shadow-indigo-600/15' 
                        : 'bg-slate-50 text-slate-400 border border-slate-150'
                    }`}
                    style={{ minWidth: item === ' ' ? '140px' : '26px' }}
                  >
                    {item}
                  </kbd>
                );
              })}
            </div>
          ))}
          {/* Space bar Row standalone if hidden above */}
          <div className="flex justify-center mt-1">
            <kbd className={`h-7 w-44 rounded flex items-center justify-center text-[10px] uppercase font-mono font-bold transition-all ${currentLetter === ' ' ? 'bg-indigo-600 text-white border border-indigo-500 shadow-md shadow-indigo-600/15' : 'bg-slate-50 border border-slate-150 text-slate-400'}`}>
              [SPACE BAR]
            </kbd>
          </div>
        </div>

        {/* Hand Guide Indicators */}
        <div className="flex items-center justify-between text-[9px] font-bold font-mono text-slate-400 py-1.5 border-t border-slate-100 uppercase tracking-wider">
          <span>L. Wrist: Balanced</span>
          <span>Sight: Screen</span>
          <span>R. Wrist: Balanced</span>
        </div>
      </div>
    </div>
  );
}
