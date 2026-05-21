export type LessonTier = 'beginner' | 'intermediate' | 'advanced';

export interface UserProfile {
  username: string;
  level: number;
  xp: number;
  coins: number;
  streak: number;
  lastPracticeDate: string | null;
  rank: string;
  totalWordsTyped: number;
  totalCharactersTyped: number;
  totalErrors: number;
  bestWpm: number;
  totalPracticeTimeSecs: number;
  avatarUrl: string;
  weakKeys: Record<string, number>;
  correctKeysCount: Record<string, number>;
  recentTests: TypingRecord[];
}

export interface TypingLesson {
  id: string;
  tier: LessonTier;
  title: string;
  description: string;
  content: string;
  targetWpm: number;
  starsRewarded: number; // 0 to 3
}

export interface TypingRecord {
  id: string;
  date: string;
  wpm: number;
  accuracy: number;
  errors: number;
  durationSecs: number;
  mode: 'lesson' | 'test' | 'practice' | 'game' | 'custom_ai';
  category: string;
  completed: boolean;
}

export interface LeaderboardEntry {
  rank: number;
  username: string;
  bestWpm: number;
  xp: number;
  level: number;
  score: number;
  avatarUrl: string;
  isCurrentUser?: boolean;
}

export interface GameScore {
  gameId: 'falling_words' | 'space_shooter' | 'zombie_defense';
  highScore: number;
  coinsEarned: number;
}
