import { TypingLesson } from '../types';

export const LESSONS: TypingLesson[] = [
  // BEGINNER
  {
    id: 'b1',
    tier: 'beginner',
    title: 'Home Row Basics',
    description: 'Learn finger resting placement on A, S, D, F and J, K, L, ; keys with quick repetitive drills.',
    content: 'asdf jkl; asdf jkl; a; sldk fjgh a; sldk fjgh asdf jkl; fads jall lask salk',
    targetWpm: 15,
    starsRewarded: 0
  },
  {
    id: 'b2',
    tier: 'beginner',
    title: 'Beginner Word Assembly',
    description: 'Form simple English words strictly using home row keys and thumb space bar.',
    content: 'dad sad lad ask fall salad glass flask alas alfalfa dallas falk slask sassafras',
    targetWpm: 20,
    starsRewarded: 0
  },
  {
    id: 'b3',
    tier: 'beginner',
    title: 'Easy Home Row Sentences',
    description: 'Put your home row muscle memory to the test with fluid full sentences.',
    content: 'a sad lad asked dad for a salad; dad falls as fast as a flash; a glass flask falls; jess asked dad',
    targetWpm: 25,
    starsRewarded: 0
  },

  // INTERMEDIATE
  {
    id: 'i1',
    tier: 'intermediate',
    title: 'Upper Row Extension',
    description: 'Stretch index, middle, and ring fingers upwards to master Q W E R T and Y U I O P.',
    content: 'quiet your tired outer power; writing high quality letters quickly will refine your layout mastery',
    targetWpm: 35,
    starsRewarded: 0
  },
  {
    id: 'i2',
    tier: 'intermediate',
    title: 'Lower Row Integration',
    description: 'Extend downwards to conquer Z X C V B and N M , . / keys smoothly.',
    content: 'breeze can vex small mice; lazy brown foxes jump over excited zebras on vivid sandy paths',
    targetWpm: 40,
    starsRewarded: 0
  },
  {
    id: 'i3',
    tier: 'intermediate',
    title: 'Numbers & Symbols Drill',
    description: 'Incorporate numerals and basic punctuations typical of administrative or rapid billing layout environments.',
    content: 'Call the office at (800) 555-1234 or email support@typemaster.io with transaction index #789!',
    targetWpm: 45,
    starsRewarded: 0
  },

  // ADVANCED
  {
    id: 'a1',
    tier: 'advanced',
    title: 'Intense Paragraph Endurance',
    description: 'An extended general prose workout ensuring peak speed and rhythm control under focus.',
    content: 'A futuristic digital universe demands impeccable precision and speed; as neon indicators flash across your virtual terminal, complete muscle memory delivers fluid text streams with flawless timing.',
    targetWpm: 55,
    starsRewarded: 0
  },
  {
    id: 'a2',
    tier: 'advanced',
    title: 'Syntactic Coding Sandbox',
    description: 'A dedicated practice zone simulating coding syntaxes (JS/TS, brackets, curly cues, math operators).',
    content: 'const updateRank = (score: number): string => { if(score >= 90) return "Grandmaster"; else return "Cadet"; }; export default updateRank;',
    targetWpm: 50,
    starsRewarded: 0
  },
  {
    id: 'a3',
    tier: 'advanced',
    title: 'Fast Pace Nitro Drills',
    description: 'Extremely tricky letter sequencing, capitalization shifts, and special characters optimized to stretch limits.',
    content: 'Wait! Did they say "Zzz-99" or "X-101"? The ultra-cyber interface launched instantly on port :3000!',
    targetWpm: 60,
    starsRewarded: 0
  }
];
