import React, { useState, useEffect } from 'react';
import MobileFrame from './components/MobileFrame';
import DashboardTab from './components/DashboardTab';
import LessonsTab from './components/LessonsTab';
import ArenaGamesTab from './components/ArenaGamesTab';
import AnalyticsTab from './components/AnalyticsTab';
import CustomAiDrills from './components/CustomAiDrills';
import LeaderboardTab from './components/LeaderboardTab';
import SettingsTab, { ACCENT_THEMES } from './components/SettingsTab';
import ProfileTab from './components/ProfileTab';
import TypingEngine from './components/TypingEngine';

// Helpers & Data
import { LOCALIZATION } from './utils/lang';
import { UserProfile, TypingLesson, TypingRecord, GameScore } from './types';
import { loadProfileLocal, processStatsUpdate, INITIAL_PROFILE, getRankColor } from './utils/userHelpers';
import { TEST_PASSAGES, TestPassage } from './utils/testPassages';
import { LESSONS } from './utils/lessonsData';
import { synth } from './utils/audio';

// Icons
import { 
  Home, 
  BookOpen, 
  Clock, 
  Gamepad2, 
  Activity, 
  Trophy, 
  User, 
  Settings, 
  Sparkles,
  Flame,
  CheckCircle,
  AlertCircle,
  Sparkle,
  Zap,
  RotateCcw,
  Volume2,
  Smartphone
} from 'lucide-react';

export default function App() {
  // Navigation & States
  const [appFlowState, setAppFlowState] = useState<'splash' | 'login' | 'app'>('splash');
  const [signupUsername, setSignupUsername] = useState<string>('');
  const [signupAvatar, setSignupAvatar] = useState<string>('🚀');
  const [signupLevel, setSignupLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeSubState, setActiveSubState] = useState<'menu' | 'typing_run' | 'result_screen'>('menu');
  const [profile, setProfile] = useState<UserProfile>(INITIAL_PROFILE);

  // Comprehensive Settings Hooks loaded securely or with defaults
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem('typemaster_sound_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [soundVolume, setSoundVolume] = useState(() => {
    const saved = localStorage.getItem('typemaster_sound_volume');
    return saved !== null ? parseInt(saved, 10) : 50;
  });
  const [soundPreset, setSoundPreset] = useState<'cyber' | 'retro' | 'classic'>(() => {
    const saved = localStorage.getItem('typemaster_sound_preset');
    return (saved as any) || 'cyber';
  });
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('typemaster_dark_mode');
    return saved !== null ? saved === 'true' : true; // Dark mode default as requested
  });
  const [accentColor, setAccentColor] = useState<'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan'>(() => {
    const saved = localStorage.getItem('typemaster_accent_color');
    return (saved as any) || 'indigo';
  });
  const [fontSize, setFontSize] = useState<'sm' | 'md' | 'lg' | 'xl'>(() => {
    const saved = localStorage.getItem('typemaster_font_size');
    return (saved as any) || 'md';
  });
  const [language, setLanguage] = useState<'en' | 'es' | 'fr' | 'de' | 'ja'>(() => {
    const saved = localStorage.getItem('typemaster_language');
    return (saved as any) || 'en';
  });
  const [remindersEnabled, setRemindersEnabled] = useState(() => {
    const saved = localStorage.getItem('typemaster_reminders_enabled');
    return saved !== null ? saved === 'true' : true;
  });
  const [reminderTime, setReminderTime] = useState(() => {
    const saved = localStorage.getItem('typemaster_reminder_time');
    return saved !== null ? saved : "18:00";
  });

  const [bgmEnabled, setBgmEnabled] = useState(() => {
    const saved = localStorage.getItem('typemaster_bgm_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  // Watchers to serialize settings state changes safely
  useEffect(() => {
    localStorage.setItem('typemaster_sound_enabled', String(soundEnabled));
    synth.toggle(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    localStorage.setItem('typemaster_sound_volume', String(soundVolume));
    synth.setVolume(soundVolume);
  }, [soundVolume]);

  useEffect(() => {
    localStorage.setItem('typemaster_sound_preset', soundPreset);
    synth.setSoundType(soundPreset);
  }, [soundPreset]);

  useEffect(() => {
    localStorage.setItem('typemaster_dark_mode', String(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('typemaster_accent_color', accentColor);
  }, [accentColor]);

  useEffect(() => {
    localStorage.setItem('typemaster_font_size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    localStorage.setItem('typemaster_language', language);
  }, [language]);

  useEffect(() => {
    localStorage.setItem('typemaster_reminders_enabled', String(remindersEnabled));
  }, [remindersEnabled]);

  useEffect(() => {
    localStorage.setItem('typemaster_reminder_time', reminderTime);
  }, [reminderTime]);

  useEffect(() => {
    localStorage.setItem('typemaster_bgm_enabled', String(bgmEnabled));
    synth.setBgmPlaying(bgmEnabled);
  }, [bgmEnabled]);

  useEffect(() => {
    const handleGestureAndPlay = () => {
      if (bgmEnabled) {
        synth.setBgmPlaying(true);
      }
      window.removeEventListener('click', handleGestureAndPlay);
      window.removeEventListener('keydown', handleGestureAndPlay);
    };
    window.addEventListener('click', handleGestureAndPlay);
    window.addEventListener('keydown', handleGestureAndPlay);
    return () => {
      window.removeEventListener('click', handleGestureAndPlay);
      window.removeEventListener('keydown', handleGestureAndPlay);
    };
  }, [bgmEnabled]);

  // Dynamic Localization Dictionary and Accent Theme settings mappings
  const dict = LOCALIZATION[language] || LOCALIZATION['en'];
  const theme = ACCENT_THEMES[accentColor] || ACCENT_THEMES['indigo'];

  // Active Typing Session configuration
  const [activeSession, setActiveSession] = useState<{
    text: string;
    title: string;
    mode: TypingRecord['mode'];
    timeLimitSecs?: number;
  } | null>(null);

  // Result display content
  const [currentResults, setCurrentResults] = useState<{
    wpm: number;
    accuracy: number;
    mistakes: number;
    duration: number;
    xpGained: number;
    coinsGained: number;
    levelUp: boolean;
  } | null>(null);

  // Speed test configurations
  const [selectedPassageId, setSelectedPassageId] = useState<string>(TEST_PASSAGES[0].id);
  const [selectedTimerOption, setSelectedTimerOption] = useState<number>(30); // in seconds
  const [customDurationValue, setCustomDurationValue] = useState<number>(45);
  const [customDurationUnit, setCustomDurationUnit] = useState<'seconds' | 'minutes'>('seconds');

  // Initialize and load local storage profiles
  useEffect(() => {
    const loaded = loadProfileLocal();
    setProfile(loaded);

    // Automatic Splash screen countdown transition on initial load
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('typemaster_profile');
      if (saved) {
        setAppFlowState('app');
      } else {
        setAppFlowState('login');
      }
    }, 2200);
    return () => clearTimeout(timer);
  }, []);

  // Update profile handler
  const saveProfileState = (updated: UserProfile) => {
    setProfile(updated);
    localStorage.setItem('typemaster_profile', JSON.stringify(updated));
  };

  // Callback when typing run completes
  const handleTypingFinished = (
    wpm: number,
    accuracy: number,
    charactersTyped: number,
    errors: number,
    elapsedSecs: number,
    mistakesMap: Record<string, number>,
    correctMap: Record<string, number>
  ) => {
    if (!activeSession) return;

    const { updatedProfile, xpEarned, coinsEarned, levelUp } = processStatsUpdate(
      profile,
      wpm,
      accuracy,
      charactersTyped,
      errors,
      elapsedSecs,
      activeSession.mode,
      activeSession.title,
      mistakesMap,
      correctMap
    );

    // If level-up occurred, play cyber horn!
    if (levelUp) {
      synth.playLevelUp();
    }

    setProfile(updatedProfile);
    setCurrentResults({
      wpm,
      accuracy,
      mistakes: errors,
      duration: elapsedSecs,
      xpGained: xpEarned,
      coinsGained: coinsEarned,
      levelUp
    });

    setActiveSubState('result_screen');
  };

  // Launch practice or lesson directly inside TypingEngine
  const handleLaunchPractice = (text: string, title: string, mode: TypingRecord['mode'], timeLimit?: number) => {
    setActiveSession({
      text,
      title,
      mode,
      timeLimitSecs: timeLimit
    });
    setActiveSubState('typing_run');
  };

  // Continuation strategy: launcher for outstanding lesson
  const handleStartContinueLesson = () => {
    // Find first lesson that has not been perfected with 3 stars (or first uncompleted one)
    const incompleteLesson = LESSONS.find(l => {
      const records = profile.recentTests.filter(r => r.category === l.title && r.completed);
      return records.length === 0 || Math.max(...records.map(r => r.wpm)) < l.targetWpm;
    }) || LESSONS[0];

    handleLaunchPractice(incompleteLesson.content, incompleteLesson.title, 'lesson');
  };

  const handleUpdateCoinsAndXp = (xpEarned: number, coinsEarned: number) => {
    let nextXp = profile.xp + xpEarned;
    let nextLvl = profile.level;
    let nextCoins = profile.coins + coinsEarned;
    let leveledUp = false;

    // Check thresholds
    const nextLimit = Math.round(150 * Math.pow(nextLvl, 1.3));
    if (nextXp >= nextLimit) {
      nextXp -= nextLimit;
      nextLvl += 1;
      leveledUp = true;
      synth.playLevelUp();
    }

    const updated: UserProfile = {
      ...profile,
      xp: nextXp,
      level: nextLvl,
      coins: nextCoins
    };

    saveProfileState(updated);
  };

  // Helpers for settings tabs
  const handleAvatarChange = (avatar: string) => {
    const updated = { ...profile, avatarUrl: avatar };
    saveProfileState(updated);
    synth.playKeyPress(true);
  };

  const handleNameChange = (name: string) => {
    const updated = { ...profile, username: name };
    saveProfileState(updated);
    synth.playSuccessChime();
  };

  const handleClearHistory = () => {
    const updated = { ...profile, recentTests: [], weakKeys: {}, correctKeysCount: {} };
    saveProfileState(updated);
    synth.playKeyPress(false);
  };

  // Calculate grading string from accuracy
  const getGradeByAccuracy = (acc: number): string => {
    if (acc >= 98) return 'S';
    if (acc >= 95) return 'A+';
    if (acc >= 90) return 'A';
    if (acc >= 85) return 'B';
    return 'C';
  };

  // 1. Splash Screen Flow Mode
  if (appFlowState === 'splash') {
    return (
      <MobileFrame>
        <div id="splash-container" className="flex-1 flex flex-col items-center justify-between py-12 px-6 h-full min-h-[580px] bg-slate-950 text-white relative overflow-hidden select-none font-sans">
          
          {/* Neon digital backing grids */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-40"></div>
          <div className="absolute top-[20%] left-[10%] w-[350px] h-[350px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-[20%] right-[10%] w-[350px] h-[350px] bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Spacer */}
          <div></div>

          {/* Main Display Title and Animated Logo */}
          <div className="text-center space-y-6 z-10 flex flex-col items-center">
            {/* Animated neon keyboard logo icon */}
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-3xl bg-slate-990 border-2 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
              <svg className="w-12 h-12 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M6 8h.01" />
                <path d="M10 8h.01" />
                <path d="M14 8h.01" />
                <path d="M18 8h.01" />
                <path d="M6 12h.01" />
                <path d="M18 12h.01" />
                <path d="M7 16h10" />
                <path d="M10 12h4" />
              </svg>
              <div className="absolute bottom-1 right-2 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900 animate-ping"></div>
              <div className="absolute bottom-1 right-2 w-3 h-3 rounded-full bg-emerald-400 border-2 border-slate-900"></div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-extrabold tracking-tighter text-white uppercase text-center">
                TYPING MASTER
              </h1>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-400/20 text-[10px] text-indigo-300 font-bold uppercase tracking-widest font-mono">
                <Sparkles className="w-3 h-3 text-indigo-400 animate-spin" /> MOBILE PRO v3.8
              </div>
            </div>
          </div>

          {/* Loading status bar indicator */}
          <div className="w-full max-w-xs space-y-2.5 z-10">
            <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-400">
              <span className="uppercase tracking-widest animate-pulse">SYNCING MECHANICAL BUFFERS...</span>
              <span>100% SECURE</span>
            </div>
            
            <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden p-[2px] border border-slate-800">
              <div className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400" style={{ width: '100%', transition: 'width 2s' }}></div>
            </div>

            <div className="text-center pt-1 text-[10px] text-slate-500 font-sans font-medium">
              Finger coordinates loaded safely
            </div>
          </div>

        </div>
      </MobileFrame>
    );
  }

  // 2. Authentication Login/Signup Flow Mode
  if (appFlowState === 'login') {
    return (
      <MobileFrame>
        <div id="login-container" className="flex-1 flex flex-col justify-between py-6 px-5 h-full min-h-[580px] bg-slate-950 text-white relative overflow-hidden select-none font-sans">
          
          {/* Neon digital grids backing */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none opacity-20"></div>
          
          <div className="space-y-4 pt-4 z-10">
            <div className="text-center">
              <span className="text-[9px] font-black tracking-widest font-mono bg-indigo-500/10 text-indigo-300 px-3 py-1 rounded-full uppercase border border-indigo-500/20">
                🚀 FLUID ONBOARDING CORE
              </span>
              <h2 className="text-xl font-extrabold text-white mt-3.5 tracking-tight">Create Pilot Profile</h2>
              <p className="text-xs text-slate-400 mt-1">Configure your keystroke credentials to access tests</p>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              const finalUsername = signupUsername.trim() || 'Keystroke Pilot';
              
              // Determine statistics level
              const startingRank = signupLevel === 'advanced' ? 'Gold Cyber-Racer' : signupLevel === 'intermediate' ? 'Silver Keyrunner' : 'Bronze Initiate';
              const startingBest = signupLevel === 'advanced' ? 55 : signupLevel === 'intermediate' ? 35 : 15;
              
              const newProfile: UserProfile = {
                ...INITIAL_PROFILE,
                username: finalUsername,
                avatarUrl: signupAvatar,
                bestWpm: startingBest,
                rank: startingRank,
                streak: 1,
                lastPracticeDate: new Date().toISOString().split('T')[0],
              };

              saveProfileState(newProfile);
              synth.playSuccessChime();
              setAppFlowState('app');
            }} className="space-y-4">
              
              {/* Nickname field */}
              <div className="space-y-1.5">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Pilot Username
                </label>
                <input
                  type="text"
                  maxLength={16}
                  placeholder="Enter pilot tag (e.g. SwiftHacker)"
                  value={signupUsername}
                  onChange={(e) => {
                    setSignupUsername(e.target.value);
                    synth.playKeyPress(true);
                  }}
                  className="w-full bg-slate-900 border border-slate-800 text-white rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                />
              </div>

              {/* Avatar Selector emoji grids */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  Select Custom Avatar
                </label>
                <div className="grid grid-cols-5 gap-2 animate-scale-up">
                  {['🦊', '🦁', '🦉', '🚀', '🤖', '🎮', '💡', '💎', '🎨', '🥋'].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => {
                        setSignupAvatar(emoji);
                        synth.playKeyPress(true);
                      }}
                      className={`cursor-pointer py-2.5 rounded-xl text-lg flex items-center justify-center transition-all ${
                        signupAvatar === emoji 
                          ? 'bg-indigo-650 border border-indigo-500 shadow-md scale-105' 
                          : 'bg-slate-900 border border-slate-800 hover:bg-slate-850'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              {/* Starting Milestone Levels */}
              <div className="space-y-2">
                <label className="block text-[10px] text-slate-450 font-bold uppercase tracking-wider">
                  Starting Typing Milestone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'beginner', title: 'Beginner', desc: '10-25 WPM' },
                    { id: 'intermediate', title: 'Adept', desc: '30-50 WPM' },
                    { id: 'advanced', title: 'Pro Pilot', desc: '55+ WPM' }
                  ].map((lvl) => (
                    <button
                      key={lvl.id}
                      type="button"
                      onClick={() => {
                        setSignupLevel(lvl.id as any);
                        synth.playKeyPress(true);
                      }}
                      className={`cursor-pointer p-2.5 rounded-xl border text-left flex flex-col transition-all ${
                        signupLevel === lvl.id 
                          ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 font-bold' 
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <span className="text-xs font-bold">{lvl.title}</span>
                      <span className="text-[8px] text-slate-500 font-semibold">{lvl.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Enter app dispatch button */}
              <div className="pt-3">
                <button
                  type="submit"
                  className="cursor-pointer w-full py-3 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl text-xs font-bold tracking-wider uppercase transition-all shadow-lg shadow-indigo-650/15 flex items-center justify-center gap-1.5"
                >
                  Create &amp; Launch Dashboard &rarr;
                </button>
              </div>

            </form>
          </div>

          <div className="text-center text-[10px] text-slate-500 font-mono py-2">
            *All progress resides secure on local client database
          </div>
        </div>
      </MobileFrame>
    );
  }

  return (
    <MobileFrame>
      
      {/* IMMERSIVE SUBSTATE: ACTIVE TYPING DRILL RUN */}
      {activeSubState === 'typing_run' && activeSession && (
        <TypingEngine
          initialText={activeSession.text}
          title={activeSession.title}
          mode={activeSession.mode}
          timeLimitSecs={activeSession.timeLimitSecs}
          onBack={() => setActiveSubState('menu')}
          onFinished={handleTypingFinished}
        />
      )}

      {/* IMMERSIVE SUBSTATE: EXHAUSTIVE TARGET RESULT SCREEN */}
      {activeSubState === 'result_screen' && currentResults && (
        <div className="space-y-5 animate-scale-up py-3 max-w-md mx-auto">
          {/* Level Up Flash Banner Banner */}
          {currentResults.levelUp && (
            <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500 to-indigo-600 text-white font-bold text-center animate-bounce shadow-lg shadow-indigo-500/10 text-xs tracking-wider">
              <Sparkles className="w-5 h-5 mx-auto mb-1 animate-spin" />
              PILOT CLASSIFICATION UPGRADED! WELCOME TO LEVEL {profile.level}!
            </div>
          )}

          <div className="text-center space-y-1">
            <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-3 py-1 rounded-full uppercase font-bold tracking-wider">
              DRILL METRICS FINALIZED
            </span>
            <h2 className="text-xl font-bold text-slate-800 tracking-tight mt-3">Workout Evaluation Report</h2>
            <p className="text-xs text-slate-500">Fluency statistics registered on pilot dashboard.</p>
          </div>

          {/* S-Tier Visual Grade Circle */}
          <div className="relative w-24 h-24 mx-auto flex items-center justify-center rounded-full bg-slate-50 border-2 border-dashed border-indigo-200 shadow-inner">
            <div className="absolute inset-0 rounded-full bg-indigo-500/5 blur-md"></div>
            <div className="text-center">
              <span className="block text-[8px] font-mono text-slate-400 font-bold">GRADE</span>
              <span className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-cyan-500">
                {getGradeByAccuracy(currentResults.accuracy)}
              </span>
            </div>
          </div>

          {/* Grid Stats */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center font-mono">
              <span className="block text-[8px] text-slate-400 font-bold tracking-wider uppercase">SPEED FLUIDITY</span>
              <span className="text-lg font-bold text-indigo-600">{currentResults.wpm} WPM</span>
            </div>
            
            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center font-mono">
              <span className="block text-[8px] text-slate-400 font-bold tracking-wider uppercase">ACCURACY INDEX</span>
              <span className="text-lg font-bold text-emerald-600">{currentResults.accuracy}%</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center font-mono">
              <span className="block text-[8px] text-slate-400 font-bold tracking-wider uppercase">CHARS MISTYPED</span>
              <span className="text-lg font-bold text-red-500">{currentResults.mistakes} errors</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-white border border-slate-100 shadow-sm text-center font-mono">
              <span className="block text-[8px] text-slate-400 font-bold tracking-wider uppercase">TIME ELAPSED</span>
              <span className="text-lg font-bold text-slate-700">{currentResults.duration}s</span>
            </div>
          </div>

          {/* Award/Gamified XP Coins box */}
          <div className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm flex justify-around">
            <div className="text-center">
              <span className="block text-[8px] text-slate-400 font-mono font-bold uppercase">XP GAINED</span>
              <span className="text-sm font-bold text-indigo-600">+{currentResults.xpGained} XP</span>
            </div>
            <div className="border-r border-slate-100"></div>
            <div className="text-center">
              <span className="block text-[8px] text-slate-400 font-mono font-bold uppercase">COINS ALLOCATED</span>
              <span className="text-sm font-bold text-amber-500">+${currentResults.coinsGained}</span>
            </div>
          </div>

          {/* Suggestion prompt block */}
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-center text-xs text-slate-500 leading-normal">
            {currentResults.accuracy < 90 ? (
              <span className="text-red-500 font-medium flex items-center justify-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-red-500" /> Focus on resting postures, accuracy is below target.
              </span>
            ) : (
              <span className="text-emerald-600 font-medium flex items-center justify-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" /> Splendid execution! Muscle memory is aligning cleanly.
              </span>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setActiveSubState('menu')}
              className="flex-1 py-3 text-xs bg-white border border-slate-200 hover:bg-slate-50 hover:text-slate-800 transition-all rounded-xl text-slate-500 font-semibold cursor-pointer shadow-sm"
            >
              Back to Course
            </button>
            <button
              onClick={() => {
                if (activeSession) {
                  handleLaunchPractice(activeSession.text, activeSession.title, activeSession.mode, activeSession.timeLimitSecs);
                }
              }}
              className="flex-1 py-3 tracking-wide text-xs bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 text-white rounded-xl font-bold hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-1 shadow-md shadow-indigo-600/10"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Repeat workout
            </button>
          </div>
        </div>
      )}

      {/* CORE STANDARD NAVIGATION TAB VIEWPORTS */}
      {activeSubState === 'menu' && (
        <div className="flex-1 flex flex-col justify-between min-h-[580px]">
          
          {/* Top Pilot Profile Header */}
          <div id="pilot-profile-header-container" className={`flex justify-between items-center p-3.5 rounded-2xl border relative overflow-hidden mb-4 animate-fade-in transition-all ${
            darkMode ? 'bg-slate-900/90 border-slate-850/80 shadow-md' : 'bg-white border-slate-100 shadow-[0_4px_12px_rgba(0,0,0,0.02)]'
          }`}>
            <div className="flex items-center gap-2.5">
              <span className="text-2xl drop-shadow-sm">{profile.avatarUrl}</span>
              <div>
                <h2 className={`text-xs font-bold leading-none ${darkMode ? 'text-white' : 'text-slate-800'}`}>{profile.username}</h2>
                <div className="flex items-center gap-1 mt-1">
                  <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-bold uppercase ${
                    darkMode ? 'text-indigo-400 bg-indigo-950/60 border border-indigo-900/70' : 'text-indigo-600 bg-indigo-50 border border-indigo-100/80'
                  }`}>LVL {profile.level}</span>
                  <span className="text-[9px] text-slate-400 font-semibold">• {profile.rank}</span>
                </div>
              </div>
            </div>

            {/* Micro coins and streaks stats trigger */}
            <div className="flex gap-2 text-right items-center">
              <div className={`flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${
                darkMode ? 'text-orange-400 bg-orange-950/40 border-orange-900/60' : 'text-orange-500 bg-orange-50/70 border-orange-100'
              }`}>
                <Flame className="w-3.5 h-3.5 animate-pulse text-orange-500" /> {profile.streak}d
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-bold font-mono px-2 py-0.5 rounded-lg border ${
                darkMode ? 'text-amber-400 bg-amber-950/40 border-amber-900/60' : 'text-amber-500 bg-amber-50/70 border-amber-100'
              }`}>
                <span className="text-[10px]">$</span>{profile.coins}
              </div>
            </div>
          </div>

          {/* Active Tab View Rendering Router */}
          <div className="flex-1 overflow-y-auto max-h-[500px] scrollbar-none pb-4">
            {activeTab === 'dashboard' && (
              <DashboardTab 
                profile={profile} 
                onSetTab={setActiveTab}
                onStartContinueLesson={handleStartContinueLesson}
              />
            )}

            {activeTab === 'lessons' && (
              <LessonsTab 
                profile={profile} 
                onSelectLesson={(les) => handleLaunchPractice(les.content, les.title, 'lesson')}
              />
            )}

            {activeTab === 'testing' && (
              <div className="space-y-4 animate-fade-in px-1">
                <div className="p-4.5 border border-indigo-150 bg-indigo-50/40 rounded-2xl relative overflow-hidden shadow-sm">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <span className="text-[10px] font-mono font-bold text-indigo-650 tracking-wider block mb-1 uppercase">
                    🥇 Typing Master Speed Evaluation
                  </span>
                  <p className="text-xs text-slate-600 leading-relaxed font-sans">
                    Test your words-per-minute (WPM) speed and accuracy with standard or custom timed trials. Select a challenge length in the speed panel below!
                  </p>
                </div>

                {/* Main Configuration Card */}
                <div className="p-4 border border-slate-100 bg-white rounded-2xl space-y-4 select-none shadow-sm relative overflow-hidden">
                  
                  {/* SELECT PASSAGE */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-wider">
                      01. Select Test Subject Passage
                    </span>
                    <select
                      value={selectedPassageId}
                      onChange={(e) => setSelectedPassageId(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 cursor-pointer transition-colors"
                    >
                      {TEST_PASSAGES.map((tp) => (
                        <option key={tp.id} value={tp.id}>{tp.title}</option>
                      ))}
                    </select>
                  </div>

                  {/* CHIPS TIME SELECTION - Horizontal scroll */}
                  <div className="space-y-1.5">
                    <span className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-wider flex justify-between items-center">
                      <span>02. Select Trial Clock</span>
                      {selectedTimerOption === -1 ? (
                        <span className="text-indigo-600 text-[9px] font-bold">Custom Mode</span>
                      ) : (
                        <span className="text-slate-400 text-[9px] font-mono">Preset active</span>
                      )}
                    </span>

                    {/* Horizontal scrollable chips/buttons */}
                    <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-none snap-x">
                      {[
                        { value: 15, label: "15s", sub: "Speedrun" },
                        { value: 30, label: "30s", sub: "Rapid" },
                        { value: 60, label: "1m", sub: "Standard" },
                        { value: 180, label: "3m", sub: "Classic" },
                        { value: 300, label: "5m", sub: "Pro" },
                        { value: 600, label: "10m", sub: "Endurance" },
                        { value: -1, label: "Custom ⚙️", sub: "Variable" }
                      ].map((opt) => {
                        const isSelected = selectedTimerOption === opt.value;
                        return (
                          <button
                            key={opt.value}
                            onClick={() => {
                              setSelectedTimerOption(opt.value);
                              synth.playKeyPress(true);
                            }}
                            className={`cursor-pointer min-w-[72px] shrink-0 snap-start px-3 py-2.5 rounded-xl border text-center transition-all duration-200 flex flex-col justify-center items-center relative gap-0.5 ${
                              isSelected 
                                ? 'bg-indigo-600 border-indigo-700 text-white shadow-md shadow-indigo-600/10 scale-102' 
                                : 'bg-slate-50/50 border-slate-150 text-slate-655 hover:bg-slate-150 hover:border-slate-200'
                            }`}
                          >
                            <span className="text-xs font-bold leading-none font-mono">
                              {opt.label}
                            </span>
                            <span className={`text-[8px] leading-none ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                              {opt.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* CUSTOM TIMER PANEL */}
                  {selectedTimerOption === -1 && (
                    <div className="p-3.5 bg-slate-50 border border-slate-150 rounded-2xl space-y-3.5 animate-scale-up">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold font-mono text-slate-500 uppercase">
                          ⚙️ Configure Custom clock
                        </span>
                        <span className="text-[9px] font-mono text-slate-400 leading-none">
                          In limits: 10s — 60m
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {/* Numeric input */}
                        <div className="flex-1 relative">
                          <input
                            type="number"
                            min="1"
                            value={customDurationValue}
                            onChange={(e) => {
                              const val = parseInt(e.target.value) || 0;
                              setCustomDurationValue(val);
                            }}
                            className="w-full bg-white border border-slate-250 text-slate-800 text-xs font-bold font-mono rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                            placeholder="Enter value"
                          />
                        </div>

                        {/* Segmented Select Units toggle */}
                        <div className="flex bg-white border border-slate-200 rounded-xl p-0.5 select-none shrink-0">
                          {[
                            { id: 'seconds', label: 'Sec' },
                            { id: 'minutes', label: 'Min' }
                          ].map((unit) => (
                            <button
                              key={unit.id}
                              type="button"
                              onClick={() => {
                                setCustomDurationUnit(unit.id as any);
                                synth.playKeyPress(true);
                              }}
                              className={`cursor-pointer px-3.5 py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                                customDurationUnit === unit.id 
                                  ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
                                  : 'text-slate-455 hover:text-slate-700'
                              }`}
                            >
                              {unit.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Info & validations indicator */}
                      <div>
                        {(() => {
                          const totalSecs = customDurationUnit === 'minutes' ? customDurationValue * 60 : customDurationValue;
                          if (totalSecs < 10) {
                            return (
                              <div className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Minimum duration is 10 seconds! (Your input: {totalSecs}s)
                              </div>
                            );
                          }
                          if (totalSecs > 3600) {
                            return (
                              <div className="text-[10px] text-rose-500 font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5 shrink-0" /> Maximum duration is 60 minutes! (Your input: {Math.round(totalSecs / 60)}m)
                              </div>
                            );
                          }
                          return (
                            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1 uppercase font-mono">
                              <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping mr-0.5"></span>
                              ✓ SUCCESS: Calculated Total = {totalSecs} seconds ({Math.floor(totalSecs / 60)}m {totalSecs % 60}s)
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  )}

                  {/* Summary indicator status badge */}
                  {(() => {
                    const totalSecs = selectedTimerOption === -1 
                      ? (customDurationUnit === 'minutes' ? customDurationValue * 60 : customDurationValue)
                      : selectedTimerOption;
                    const isValid = !isNaN(totalSecs) && totalSecs >= 10 && totalSecs <= 3600;
                    
                    if (!isValid) return null;

                    return (
                      <div className="px-3 py-2 bg-indigo-50/50 border border-indigo-100/40 rounded-xl text-center text-[10.5px] font-medium text-indigo-750 flex items-center justify-center gap-1.5 font-mono select-none animate-fade-in">
                        <Clock className="w-3.5 h-3.5 text-indigo-600 shrink-0 animate-pulse" />
                        ACTIVE PREVIEW: <span className="text-slate-800 font-bold">{Math.floor(totalSecs / 60)}m {totalSecs % 60}s</span> total clock limit.
                      </div>
                    );
                  })()}

                </div>

                {/* Launcher Button Action block */}
                {(() => {
                  const totalSecs = selectedTimerOption === -1 
                    ? (customDurationUnit === 'minutes' ? customDurationValue * 60 : customDurationValue)
                    : selectedTimerOption;
                  const isValid = !isNaN(totalSecs) && totalSecs >= 10 && totalSecs <= 3600;

                  return (
                    <button
                      onClick={() => {
                        if (!isValid) {
                          synth.playKeyPress(false);
                          return;
                        }
                        const matched = TEST_PASSAGES.find((tp) => tp.id === selectedPassageId) || TEST_PASSAGES[0];
                        let contentToPass = matched.content;
                        
                        // Prevent running out of text if duration requires lots of typing
                        const wordCount = matched.content.split(' ').length;
                        const wordsNeeded = 110 * (totalSecs / 60); // 110 WPM target scale limit
                        if (wordsNeeded > wordCount) {
                          const multiplier = Math.ceil(wordsNeeded / wordCount) + 1;
                          contentToPass = Array(multiplier).fill(matched.content).join(" ");
                        }

                        synth.playSuccessChime();
                        handleLaunchPractice(contentToPass, matched.title, 'test', totalSecs);
                      }}
                      disabled={!isValid}
                      className={`w-full py-3.5 tracking-wide text-white transition-all font-bold text-xs rounded-2xl flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                        isValid 
                          ? 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-700 hover:to-indigo-600 shadow-indigo-600/10 active:scale-[0.99] scale-100'
                          : 'bg-slate-350 border-slate-400 cursor-not-allowed opacity-60 shadow-none'
                      }`}
                    >
                      <Sparkles className="w-4 h-4 fill-white text-white rotate-2 animate-pulse" />
                      Launch {isValid ? `${Math.floor(totalSecs / 60)}m ${totalSecs % 60}s` : "Pending"} SpeedRun Test
                    </button>
                  );
                })()}

              </div>
            )}

            {activeTab === 'custom_ai' && (
              <CustomAiDrills 
                profile={profile}
                onLaunchPractice={handleLaunchPractice}
              />
            )}

            {activeTab === 'games' && (
              <ArenaGamesTab 
                profile={profile}
                onUpdateCoinsAndXp={handleUpdateCoinsAndXp}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsTab 
                profile={profile}
              />
            )}

            {activeTab === 'leaderboard' && (
              <LeaderboardTab 
                profile={profile}
              />
            )}

            {activeTab === 'profile' && (
              <ProfileTab 
                profile={profile}
                onChangeAvatar={handleAvatarChange}
                onClearHistory={handleClearHistory}
              />
            )}

            {activeTab === 'settings' && (
              <SettingsTab 
                profile={profile}
                onChangeName={handleNameChange}
                soundEnabled={soundEnabled}
                onToggleSound={setSoundEnabled}
                soundVolume={soundVolume}
                onChangeVolume={setSoundVolume}
                soundPreset={soundPreset}
                onChangeSoundPreset={setSoundPreset}
                darkMode={darkMode}
                onToggleDarkMode={setDarkMode}
                accentColor={accentColor}
                onChangeAccentColor={setAccentColor}
                fontSize={fontSize}
                onChangeFontSize={setFontSize}
                language={language}
                onChangeLanguage={setLanguage}
                remindersEnabled={remindersEnabled}
                onToggleReminders={setRemindersEnabled}
                reminderTime={reminderTime}
                onChangeReminderTime={setReminderTime}
                bgmEnabled={bgmEnabled}
                onToggleBgm={setBgmEnabled}
              />
            )}
          </div>

          {/* Glowing Glass Bottom Virtual smartphone navigation bar */}
          <div className={`z-35 border-t pt-2.5 flex justify-between items-center px-1 ${
            darkMode ? 'border-slate-850 bg-slate-950' : 'border-slate-100 bg-white'
          }`}>
            {[
              { id: 'dashboard', icon: <Home className="w-4 h-4" />, label: dict.dashboard },
              { id: 'lessons', icon: <BookOpen className="w-4 h-4" />, label: dict.lessons },
              { id: 'testing', icon: <Clock className="w-4 h-4" />, label: dict.speed_test },
              { id: 'games', icon: <Gamepad2 className="w-4 h-4" />, label: dict.games },
              { id: 'settings', icon: <Settings className="w-4 h-4" />, label: dict.settings }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveTab(btn.id);
                  synth.playKeyPress(true);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all px-2 py-1.5 rounded-xl ${
                  activeTab === btn.id 
                    ? `${theme.text} ${theme.fill} font-bold` 
                    : darkMode 
                      ? 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/40' 
                      : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50/60'
                }`}
              >
                {btn.icon}
                <span className="text-[8px] tracking-wider uppercase font-medium">{btn.label}</span>
              </button>
            ))}

            {/* Quick access secondary side menu blocks inside sub-navigation viewports */}
            {[
              { id: 'analytics', icon: <Activity className="w-4 h-4" />, label: dict.logs },
              { id: 'leaderboard', icon: <Trophy className="w-4 h-4" />, label: dict.leaderboard }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => {
                  setActiveTab(btn.id);
                  synth.playKeyPress(true);
                }}
                className={`flex flex-col items-center gap-0.5 cursor-pointer transition-all px-2 py-1.5 rounded-xl ${
                  activeTab === btn.id 
                    ? `${theme.text} ${theme.fill} font-bold` 
                    : darkMode 
                      ? 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/40' 
                      : 'text-slate-405 hover:text-slate-600 hover:bg-slate-50/60'
                }`}
              >
                {btn.icon}
                <span className="text-[8px] tracking-wider uppercase font-medium">{btn.label}</span>
              </button>
            ))}
          </div>

        </div>
      )}

    </MobileFrame>
  );
}
