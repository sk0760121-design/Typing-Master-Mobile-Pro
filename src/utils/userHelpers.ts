import { UserProfile, TypingRecord } from '../types';

export const INITIAL_PROFILE: UserProfile = {
  username: "Guest Pilot",
  level: 1,
  xp: 0,
  coins: 50,
  streak: 1,
  lastPracticeDate: new Date().toISOString().split('T')[0],
  rank: "Bronze Cadet",
  totalWordsTyped: 0,
  totalCharactersTyped: 0,
  totalErrors: 0,
  bestWpm: 0,
  totalPracticeTimeSecs: 0,
  avatarUrl: "🤖",
  weakKeys: {},
  correctKeysCount: {},
  recentTests: []
};

export function getRankByWpm(wpm: number): string {
  if (wpm < 20) return "Bronze Initiate";
  if (wpm < 40) return "Silver Keyrunner";
  if (wpm < 60) return "Gold Cyber-Racer";
  if (wpm < 80) return "Diamond Tactician";
  if (wpm < 100) return "Neon Keyboard Ninja";
  return "Quantum Grandmaster";
}

export function getRankColor(rank: string): string {
  if (rank.includes("Bronze")) return "from-amber-600 to-orange-400";
  if (rank.includes("Silver")) return "from-slate-400 to-slate-200";
  if (rank.includes("Gold")) return "from-yellow-500 to-amber-300";
  if (rank.includes("Diamond")) return "from-cyan-400 to-blue-400";
  if (rank.includes("Neon")) return "from-fuchsia-500 to-pink-500 animate-pulse";
  return "from-emerald-400 to-teal-400 font-bold border border-cyan-400 shadow-lg shadow-cyan-500/20";
}

export function getNextLevelXp(level: number): number {
  return Math.round(150 * Math.pow(level, 1.3));
}

export function processStatsUpdate(
  currentProfile: UserProfile, 
  wpm: number, 
  accuracy: number, 
  charsTyped: number, 
  errors: number, 
  durationSecs: number,
  mode: TypingRecord['mode'],
  category: string,
  mistakesMap: Record<string, number>,
  correctMap: Record<string, number>
): { updatedProfile: UserProfile; xpEarned: number; coinsEarned: number; levelUp: boolean } {
  
  const xpEarned = Math.round(charsTyped * 0.15 + wpm * 0.5 + (accuracy >= 90 ? 15 : 0) + (durationSecs / 10));
  const coinsEarned = Math.round((wpm * 0.2) + (accuracy >= 95 ? 10 : 0) + 5);

  let updatedXp = currentProfile.xp + xpEarned;
  let currentLevel = currentProfile.level;
  let levelUp = false;

  while (updatedXp >= getNextLevelXp(currentLevel)) {
    updatedXp -= getNextLevelXp(currentLevel);
    currentLevel += 1;
    levelUp = true;
  }

  // Update weak keys map
  const updatedWeakKeys = { ...currentProfile.weakKeys };
  Object.keys(mistakesMap).forEach(key => {
    const lowercaseChar = key.toLowerCase();
    if (lowercaseChar && lowercaseChar.length === 1) {
      updatedWeakKeys[lowercaseChar] = (updatedWeakKeys[lowercaseChar] || 0) + mistakesMap[key];
    }
  });

  // Update correct keys map
  const updatedCorrectKeys = { ...currentProfile.correctKeysCount };
  Object.keys(correctMap).forEach(key => {
    const lowercaseChar = key.toLowerCase();
    if (lowercaseChar && lowercaseChar.length === 1) {
      updatedCorrectKeys[lowercaseChar] = (updatedCorrectKeys[lowercaseChar] || 0) + correctMap[key];
    }
  });

  // Analyze top weak keys (letters with mistake ratio)
  const sortedWeakKeys: Record<string, number> = {};
  Object.keys(updatedWeakKeys)
    .sort((a,b) => updatedWeakKeys[b] - updatedWeakKeys[a])
    .slice(0, 10)
    .forEach(k => {
      sortedWeakKeys[k] = updatedWeakKeys[k];
    });

  // Handle streak system
  const todayStr = new Date().toISOString().split('T')[0];
  let currentStreak = currentProfile.streak;
  if (currentProfile.lastPracticeDate !== todayStr) {
    if (currentProfile.lastPracticeDate) {
      const lastDateObj = new Date(currentProfile.lastPracticeDate);
      const todayDateObj = new Date(todayStr);
      const diffTime = Math.abs(todayDateObj.getTime() - lastDateObj.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays === 1) {
        currentStreak += 1;
      } else if (diffDays > 1) {
        currentStreak = 1;
      }
    } else {
      currentStreak = 1;
    }
  }

  const newRecord: TypingRecord = {
    id: 'rec_' + Math.random().toString(36).substr(2, 9),
    date: new Date().toLocaleDateString(),
    wpm,
    accuracy,
    errors,
    durationSecs,
    mode,
    category,
    completed: accuracy >= 60 && wpm > 0
  };

  const recentTests = [newRecord, ...currentProfile.recentTests].slice(0, 20);
  const bestWpm = Math.max(currentProfile.bestWpm, wpm);
  const totalPracticeTimeSecs = currentProfile.totalPracticeTimeSecs + durationSecs;
  const totalWordsTyped = currentProfile.totalWordsTyped + Math.round(charsTyped / 5);
  const totalCharactersTyped = currentProfile.totalCharactersTyped + charsTyped;
  const totalErrors = currentProfile.totalErrors + errors;
  const rank = getRankByWpm(bestWpm);

  const updatedProfile: UserProfile = {
    ...currentProfile,
    level: currentLevel,
    xp: updatedXp,
    coins: currentProfile.coins + coinsEarned,
    streak: currentStreak,
    lastPracticeDate: todayStr,
    rank,
    totalWordsTyped,
    totalCharactersTyped,
    totalErrors,
    bestWpm,
    totalPracticeTimeSecs,
    weakKeys: sortedWeakKeys,
    correctKeysCount: updatedCorrectKeys,
    recentTests
  };

  // Persist to localStorage
  localStorage.setItem('typemaster_profile', JSON.stringify(updatedProfile));

  return {
    updatedProfile,
    xpEarned,
    coinsEarned,
    levelUp
  };
}

export function loadProfileLocal(): UserProfile {
  const saved = localStorage.getItem('typemaster_profile');
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      // Ensure complex structures exist
      if (!parsed.weakKeys) parsed.weakKeys = {};
      if (!parsed.correctKeysCount) parsed.correctKeysCount = {};
      if (!parsed.recentTests) parsed.recentTests = [];
      return parsed;
    } catch (e) {
      return INITIAL_PROFILE;
    }
  }
  return INITIAL_PROFILE;
}
