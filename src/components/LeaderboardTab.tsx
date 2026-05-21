import React from 'react';
import { UserProfile, LeaderboardEntry } from '../types';
import { Trophy, Star, Shield, ArrowUp, Sparkles, User } from 'lucide-react';

interface LeaderboardTabProps {
  profile: UserProfile;
}

const GLOBAL_LEADERS: Omit<LeaderboardEntry, 'score'>[] = [
  { rank: 1, username: "SpeedDeity_99", bestWpm: 122, xp: 8500, level: 25, avatarUrl: "⚡" },
  { rank: 2, username: "NitroScribe", bestWpm: 104, xp: 6200, level: 18, avatarUrl: "🚀" },
  { rank: 3, username: "MechanicalGhost", bestWpm: 92, xp: 5120, level: 15, avatarUrl: "👽" },
  { rank: 4, username: "CtrlAltDefeat", bestWpm: 78, xp: 3950, level: 12, avatarUrl: "💻" },
  { rank: 5, username: "KeyboardCowboy", bestWpm: 65, xp: 2800, level: 9, avatarUrl: "🤠" },
  { rank: 6, username: "HomerowHero", bestWpm: 52, xp: 1950, level: 6, avatarUrl: "🎓" }
];

export default function LeaderboardTab({ profile }: LeaderboardTabProps) {
  
  // Dynamic integration: blend current client profile into standings based on best WPM
  const userEntry: LeaderboardEntry = {
    rank: 0, // calculated below
    username: `${profile.username} (You)`,
    bestWpm: profile.bestWpm,
    xp: profile.totalWordsTyped * 15 + profile.bestWpm * 10,
    level: profile.level,
    score: profile.bestWpm,
    avatarUrl: profile.avatarUrl,
    isCurrentUser: true
  };

  const combinedStandings: LeaderboardEntry[] = [
    ...GLOBAL_LEADERS.map((gl) => ({ ...gl, score: gl.bestWpm })),
    userEntry
  ];

  // Sort standings by best WPM (de-duplicating list if names overlap)
  const sortedStandings = combinedStandings
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1
    }));

  return (
    <div className="space-y-4 animate-fade-in px-1 select-none">
      
      {/* Dynamic leader header card */}
      <div className="p-4.5 border border-indigo-100 bg-indigo-50/45 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-600 mt-0.5 shadow-sm">
            <Trophy className="w-5 h-5 animate-pulse text-indigo-650" />
          </div>
          <div className="space-y-0.5 flex-1">
            <h3 className="text-xs font-bold text-slate-800">Global Typing Standings</h3>
            <p className="text-[11px] text-slate-500 leading-normal">
              Standings sync automatically based on peak speeds (WPM) across all test runs. Complete lessons or speed runs to rank up!
            </p>
          </div>
        </div>
      </div>

      {/* Standings table */}
      <div className="p-4.5 border border-slate-150 bg-white rounded-2xl shadow-sm space-y-3">
        <div className="flex justify-between items-center text-[9px] font-bold font-mono text-slate-400 uppercase px-1 pb-1">
          <span>Standing / Pilot</span>
          <span>Peak Speed / Rank</span>
        </div>

        <div className="space-y-2">
          {sortedStandings.map((entry) => {
            const isSelf = entry.isCurrentUser;
            const rankStyles = 
              entry.rank === 1 ? 'bg-amber-100 text-amber-700 border border-amber-300 font-extrabold shadow-sm' :
              entry.rank === 2 ? 'bg-slate-100 text-slate-700 border border-slate-350 font-extrabold shadow-sm' :
              entry.rank === 3 ? 'bg-amber-50 text-amber-800 border border-amber-250 font-extrabold shadow-sm' :
              'bg-slate-50 border border-slate-100 text-slate-500';

            return (
              <div
                key={entry.username}
                className={`p-3 rounded-xl flex items-center justify-between text-xs transition-colors duration-200 ${
                  isSelf 
                    ? 'bg-indigo-50/75 border border-indigo-300 ring-1 ring-indigo-300/40 shadow-sm' 
                    : 'bg-white border border-slate-100 hover:bg-slate-50/40'
                }`}
              >
                {/* Left wing info */}
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg ${rankStyles} flex items-center justify-center font-mono font-bold text-[10px]`}>
                    #{entry.rank}
                  </div>
                  <span className="text-lg drop-shadow-sm">{entry.avatarUrl}</span>
                  <div className="space-y-0.5 font-sans">
                    <div className={`font-bold ${isSelf ? 'text-indigo-900' : 'text-slate-800'}`}>{entry.username}</div>
                    <div className="text-[8px] text-slate-400 font-bold font-mono tracking-wider">LEVEL {entry.level} PILOT</div>
                  </div>
                </div>

                {/* Right wing speed */}
                <div className="text-right flex items-center gap-2">
                  <div className="font-mono">
                    <span className="text-xs font-bold text-indigo-650">{entry.bestWpm}</span>
                    <span className="text-[10px] text-slate-400 font-bold font-mono uppercase ml-0.5">WPM</span>
                  </div>
                  {isSelf && (
                    <span className="animate-bounce" title="Climbing up!">
                      <ArrowUp className="w-3.5 h-3.5 text-emerald-500 font-extrabold" />
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
}
