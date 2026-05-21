import React, { useState } from 'react';
import { UserProfile } from '../types';
import { User, Award, Calendar, History, Sparkles, BookOpen, Trash2 } from 'lucide-react';

interface ProfileTabProps {
  profile: UserProfile;
  onChangeAvatar: (avatar: string) => void;
  onClearHistory: () => void;
}

const AVATARS = ["🤖", "👽", "🚀", "💻", "🧠", "🎯", "⚡", "🥋", "🦖", "🦊", "🐱", "🦁"];

export default function ProfileTab({ profile, onChangeAvatar, onClearHistory }: ProfileTabProps) {
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);

  const formattedTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    if (mins === 0) return `${secs} seconds`;
    return `${mins}m ${remainingSecs}s`;
  };

  return (
    <div className="space-y-4 animate-fade-in px-1">
      
      {/* 1. Main Pilot Identity Board */}
      <div className="p-5.5 border border-indigo-100 bg-white rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
          {/* Avatar circle */}
          <div className="relative">
            <div 
              className="w-18 h-18 rounded-full bg-slate-55 border-2 border-indigo-600 flex items-center justify-center text-3xl shadow-md cursor-pointer hover:scale-105 transition-transform"
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              title="Click to change avatar"
            >
              {profile.avatarUrl}
            </div>
            <button 
              onClick={() => setAvatarMenuOpen(!avatarMenuOpen)}
              className="absolute -bottom-1 -right-1 bg-indigo-600 text-white rounded-full px-2 py-0.5 text-[8px] uppercase font-bold hover:scale-110 transition-transform cursor-pointer border-2 border-white shadow-sm"
            >
              Edit
            </button>
          </div>

          <div className="space-y-1">
            <h1 className="text-base font-bold text-slate-800 tracking-tight">{profile.username}</h1>
            <p className="text-xs text-slate-500 font-mono flex items-center justify-center sm:justify-start gap-1">
              <Award className="w-4 h-4 text-amber-500 fill-amber-500/10" /> RANK: <strong className="text-indigo-600 font-extrabold">{profile.rank}</strong>
            </p>
            <p className="text-[10px] text-slate-400 font-bold font-mono uppercase tracking-wider">
              PRACTICE TIME: {formattedTime(profile.totalPracticeTimeSecs)}
            </p>
          </div>
        </div>

        {/* Change avatar grid */}
        {avatarMenuOpen && (
          <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80 animate-scale-up">
            <p className="text-[9px] font-bold font-mono text-slate-400 mb-2 uppercase tracking-wider">Select Avatar Profile Icon</p>
            <div className="grid grid-cols-6 gap-2">
              {AVATARS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => {
                    onChangeAvatar(emoji);
                    setAvatarMenuOpen(false);
                  }}
                  className={`cursor-pointer text-xl p-1.5 rounded-xl transition-all ${
                    profile.avatarUrl === emoji 
                      ? 'bg-indigo-50 border border-indigo-300' 
                      : 'bg-white border border-slate-100 hover:border-slate-300'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 2. Numerical Lifetime stats rows */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
          <span className="block text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-0.5">Best Speed</span>
          <span className="text-sm font-bold text-indigo-650 font-mono">{profile.bestWpm} WPM</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
          <span className="block text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-0.5">Words Typed</span>
          <span className="text-sm font-bold text-slate-800 font-mono">{profile.totalWordsTyped}</span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
          <span className="block text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-0.5">Accuracy</span>
          <span className="text-sm font-bold text-emerald-600 font-mono">
            {profile.recentTests.length > 0 
              ? Math.round(profile.recentTests.reduce((acc, curr) => acc + curr.accuracy, 0) / profile.recentTests.length)
              : 100}%
          </span>
        </div>
        <div className="p-3.5 rounded-xl bg-white border border-slate-100 shadow-sm text-center">
          <span className="block text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider mb-0.5">Total Runs</span>
          <span className="text-sm font-bold text-slate-700 font-mono">{profile.recentTests.length} runs</span>
        </div>
      </div>

      {/* 3. History logs table */}
      <div className="p-4.5 rounded-2xl border border-slate-150 bg-white shadow-sm space-y-3.5">
        <div className="flex justify-between items-center pb-2.5 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <History className="w-4.5 h-4.5 text-indigo-650" /> Historical Logs History
          </h3>
          {profile.recentTests.length > 0 && (
            <button 
              onClick={onClearHistory}
              className="text-[10px] text-red-500 hover:text-red-600 font-bold font-mono cursor-pointer flex items-center gap-0.5"
            >
              <Trash2 className="w-3 h-3" /> Clear History
            </button>
          )}
        </div>

        <div className="max-h-72 overflow-y-auto space-y-2 pr-1 select-none scrollbar-none">
          {profile.recentTests.map((t, idx) => (
            <div 
              key={t.id || idx}
              className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs gap-3 font-mono"
            >
              <div className="truncate space-y-0.5 flex-1 min-w-0">
                <div className="flex items-center gap-1.5 text-[8px] uppercase font-extrabold text-slate-400">
                  <span className={t.mode === 'custom_ai' ? 'text-indigo-655' : 'text-slate-400'}>{t.mode}</span>
                  <span>•</span>
                  <span>{t.date}</span>
                </div>
                <div className="text-slate-800 font-bold truncate leading-tight">{t.category}</div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0 text-right">
                <div>
                  <span className="block text-[8px] font-bold text-slate-400">SPEED</span>
                  <span className="text-indigo-600 font-extrabold">{t.wpm} WPM</span>
                </div>
                <div>
                  <span className="block text-[8px] font-bold text-slate-400">ACCURACY</span>
                  <span className="text-emerald-600 font-extrabold">{t.accuracy}%</span>
                </div>
              </div>
            </div>
          ))}

          {profile.recentTests.length === 0 && (
            <div className="py-8 text-center text-slate-400 text-xs font-semibold">
              No tests recorded yet. Start practicing!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
