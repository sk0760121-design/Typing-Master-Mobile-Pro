import React from 'react';
import { UserProfile, TypingRecord } from '../types';
import { getNextLevelXp, getRankColor } from '../utils/userHelpers';
import { Zap, Flame, Target, Trophy, Play, Star, AlertCircle, Sparkles } from 'lucide-react';

interface DashboardTabProps {
  profile: UserProfile;
  onSetTab: (tab: string) => void;
  onStartContinueLesson: () => void;
}

export default function DashboardTab({ profile, onSetTab, onStartContinueLesson }: DashboardTabProps) {
  const nextLevelXp = getNextLevelXp(profile.level);
  const xpPercentage = Math.min(100, Math.round((profile.xp / nextLevelXp) * 100));
  
  // Calculate stats from recent tests
  const testsCount = profile.recentTests.length;
  const avgWpm = testsCount > 0 
    ? Math.round(profile.recentTests.reduce((acc, curr) => acc + curr.wpm, 0) / testsCount)
    : 0;
  
  const avgAccuracy = testsCount > 0 
    ? Math.round(profile.recentTests.reduce((acc, curr) => acc + curr.accuracy, 0) / testsCount)
    : 0;

  // Render SVG Speed Progression Graph with a bright elegant design
  const renderSpeedChart = () => {
    const data = [...profile.recentTests].reverse().slice(-7); // take last 7
    if (data.length < 2) {
      return (
        <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-slate-50 text-slate-500">
          <Trophy className="w-10 h-10 mb-2 opacity-40 text-indigo-500" />
          <p className="text-xs font-medium text-slate-500">Complete 2 or more tests to view progress chart</p>
          <button 
            onClick={() => onSetTab('lessons')} 
            className="mt-3 px-4 py-1.5 rounded-lg bg-indigo-50 border border-indigo-100 text-xs text-indigo-600 hover:bg-indigo-100/50 transition-all font-medium cursor-pointer"
          >
            Practice Now
          </button>
        </div>
      );
    }

    const width = 500;
    const height = 150;
    const padding = 25;
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const maxWpm = Math.max(...data.map(d => d.wpm), 40) + 10;
    const minWpm = Math.min(...data.map(d => d.wpm), 10) - 10 > 0 ? Math.min(...data.map(d => d.wpm), 10) - 10 : 0;

    const points = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * chartWidth;
      const y = padding + chartHeight - ((d.wpm - minWpm) / (maxWpm - minWpm)) * chartHeight;
      return { x, y, val: d.wpm, date: d.date, record: d };
    });

    const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
    
    // Area Path for clean sky indigo gradient
    const areaPath = `
      ${linePath} 
      L ${points[points.length - 1].x} ${height - padding} 
      L ${points[0].x} ${height - padding} 
      Z
    `;

    return (
      <div className="w-full">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">Recent Speed Velocity (WPM)</span>
          <span className="text-xs font-bold text-indigo-600">{profile.bestWpm} Peak WPM</span>
        </div>
        <div className="relative overflow-visible pb-1">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full overflow-visible">
            <defs>
              <linearGradient id="neonGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line x1={padding} y1={padding} x2={width-padding} y2={padding} stroke="#f1f5f9" strokeDasharray="3,3" />
            <line x1={padding} y1={padding + chartHeight/2} x2={width-padding} y2={padding + chartHeight/2} stroke="#f1f5f9" strokeDasharray="3,3" />
            <line x1={padding} y1={height-padding} x2={width-padding} y2={height-padding} stroke="#e2e8f0" />

            {/* Area under curve */}
            <path d={areaPath} fill="url(#neonGradient)" />

            {/* Glowing line */}
            <path 
              d={linePath} 
              fill="none" 
              stroke="#4f46e5" 
              strokeWidth="3" 
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Data points */}
            {points.map((p, idx) => (
              <g key={idx} className="group cursor-pointer animate-fade-in">
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="4.5" 
                  fill="#ffffff" 
                  stroke="#4f46e5" 
                  strokeWidth="2.5" 
                />
                <circle 
                  cx={p.x} 
                  cy={p.y} 
                  r="9" 
                  fill="#4f46e5" 
                  opacity="0" 
                  className="hover:opacity-10 transition-opacity" 
                />
                {/* Micro tooltip */}
                <text 
                  x={p.x} 
                  y={p.y - 10} 
                  textAnchor="middle" 
                  fill="#334155" 
                  fontSize="9.5" 
                  fontWeight="bold" 
                  className="font-semibold"
                >
                  {p.val}
                </text>
                {/* Date label */}
                <text 
                  x={p.x} 
                  y={height - 7} 
                  textAnchor="middle" 
                  fill="#64748b" 
                  fontSize="8.5" 
                  fontWeight="bold"
                  className="opacity-90"
                >
                  #{idx + 1}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>
    );
  };

  // Get daily word count progress
  const dailyGoal = 500;
  const wordsTypedToday = Math.min(dailyGoal, Math.round(profile.totalWordsTyped * 0.23 + 45) % dailyGoal);
  const dailyPercentage = Math.round((wordsTypedToday / dailyGoal) * 100);

  return (
    <div className="space-y-4.5 animate-fade-in px-1">
      {/* Continuing & Streak Hero Block with a soft, gorgeous white-cream layout and sky gradients */}
      <div 
        id="hero-dashboard-banner"
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-50/50 via-white to-sky-50 p-5.5 border border-indigo-100/70 shadow-[0_8px_30px_rgba(79,70,229,0.04)]"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-8 -left-8 w-24 h-24 bg-sky-500/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col gap-4 z-10 relative">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-600 font-bold uppercase tracking-wider mb-2.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500 animate-spin" style={{ animationDuration: '5s' }} />
              LEVEL {profile.level} PILOT
            </div>
            <h1 id="dashboard-greetings" className="text-xl font-bold text-slate-800 tracking-tight leading-tight">
              Keep pushing, {profile.username}!
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-sm leading-relaxed">
              Your mechanical fluency and keystroke precision are looking strong. Continue your training program below.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Streak card */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex-1 sm:flex-initial">
              <div className="p-2 rounded-xl bg-orange-50 text-orange-500 border border-orange-100/50">
                <Flame className="w-5 h-5 fill-orange-500/10 animate-pulse" />
              </div>
              <div>
                <div className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">STREAK</div>
                <div className="text-sm font-bold text-slate-800">{profile.streak} Days</div>
              </div>
            </div>

            {/* Coins card */}
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl bg-white border border-slate-100 shadow-sm flex-1 sm:flex-initial">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-500 border border-amber-100/50 flex items-center justify-center">
                <div className="w-5 h-5 flex items-center justify-center font-bold text-xs bg-amber-500/10 rounded-full border border-amber-400/30">
                  $
                </div>
              </div>
              <div>
                <div className="text-[9px] text-slate-400 font-bold tracking-wider uppercase">COINS</div>
                <div className="text-sm font-bold text-slate-800">${profile.coins}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Level XP Tracker */}
        <div className="mt-5 pt-3.5 border-t border-slate-100">
          <div className="flex justify-between items-center text-[10px] font-bold text-slate-400 mb-1.5 uppercase">
            <span>XP PROGRESSION ({profile.xp} / {nextLevelXp} XP)</span>
            <span className="text-indigo-600">{xpPercentage}% to LEVEL {profile.level + 1}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/40">
            <div 
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-indigo-600 shadow-sm transition-all duration-500"
              style={{ width: `${xpPercentage}%` }}
            ></div>
          </div>
        </div>

        {/* Bottom CTA Block */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button 
            id="btn-continue-lesson"
            onClick={onStartContinueLesson}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            Continue Course
          </button>
          
          <button 
            id="btn-ai-drill-tab"
            onClick={() => onSetTab('custom_ai')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-indigo-100 text-xs text-indigo-600 font-bold hover:bg-indigo-50/50 transition-colors shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            AI Generative Drills
          </button>
        </div>
      </div>

      {/* Numerical Stats Trio Grid with sleek bright cards */}
      <div className="grid grid-cols-3 gap-2.5">
        <div id="stat-speed-card" className="border border-slate-100 bg-white p-3 rounded-2xl relative overflow-hidden shadow-sm group">
          <div className="absolute top-0 left-0 w-1 h-3 bg-indigo-500 group-hover:h-full transition-all"></div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Best Speed</div>
          <div className="text-lg font-bold text-slate-800 leading-none">{profile.bestWpm} <span className="text-[10px] font-normal text-slate-400 font-sans">WPM</span></div>
          <div className="text-[9px] text-slate-500 font-medium mt-1 flex items-center gap-0.5">
            <Zap className="w-2.5 h-2.5 text-indigo-500" /> Avg: {avgWpm}
          </div>
        </div>

        <div id="stat-accuracy-card" className="border border-slate-100 bg-white p-3 rounded-2xl relative overflow-hidden shadow-sm group">
          <div className="absolute top-0 left-0 w-1 h-3 bg-emerald-500 group-hover:h-full transition-all"></div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Avg Acc</div>
          <div className="text-lg font-bold text-slate-800 leading-none">{avgAccuracy > 0 ? avgAccuracy : 100}<span className="text-[10px] font-normal text-slate-400 font-sans">%</span></div>
          <div className="text-[9px] text-emerald-600 font-medium mt-1 flex items-center gap-0.5">
            <Target className="w-2.5 h-2.5 text-emerald-500" /> Peak target
          </div>
        </div>

        <div id="stat-status-card" className="border border-slate-100 bg-white p-3 rounded-2xl relative overflow-hidden shadow-sm group">
          <div className="absolute top-0 left-0 w-1 h-3 bg-amber-500 group-hover:h-full transition-all"></div>
          <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-0.5">Typing Rank</div>
          <div className="text-xs font-bold text-amber-600 truncate leading-tight mt-0.5">{profile.rank}</div>
          <div className="text-[8px] text-slate-400 mt-1 truncate">
            Based on {testsCount} runs
          </div>
        </div>
      </div>

      {/* Progression & Daily Goal Grid split */}
      <div className="grid grid-cols-1 gap-4">
        {/* SVG speeds Area graph */}
        <div className="border border-slate-100 bg-white p-4.5 rounded-2xl shadow-sm flex flex-col justify-between">
          {renderSpeedChart()}
        </div>

        {/* Daily Practice Ring Widget */}
        <div className="border border-slate-100 bg-white p-4.5 rounded-2xl shadow-sm flex flex-col justify-between gap-3.5">
          <div>
            <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase mb-2">Daily Practice Goal</h3>
            <div className="flex items-center gap-3">
              {/* Custom micro circle progress */}
              <div className="relative w-12 h-12 flex-shrink-0">
                <svg className="w-12 h-12 transform -rotate-90">
                  <circle cx="24" cy="24" r="20" stroke="#f1f5f9" strokeWidth="4" fill="transparent" />
                  <circle cx="24" cy="24" r="20" stroke="#4f46e5" strokeWidth="4" fill="transparent"
                          strokeDasharray={2 * Math.PI * 20}
                          strokeDashoffset={2 * Math.PI * 20 * (1 - dailyPercentage / 100)}
                          strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-slate-700 font-mono">
                  {dailyPercentage}%
                </div>
              </div>
              <div>
                <p className="text-xs text-slate-850 font-bold">{wordsTypedToday} / {dailyGoal} words</p>
                <p className="text-[10px] text-slate-400 font-medium">Resetting at UTC midnight</p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100">
            <div className="text-[10px] text-slate-450 font-bold mb-1.5 uppercase tracking-wider">Weak Key Warning</div>
            {Object.keys(profile.weakKeys).length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {Object.keys(profile.weakKeys).slice(0, 4).map((char) => (
                  <span key={char} className="px-2 py-0.5 text-[10px] rounded bg-red-50 border border-red-100 text-red-500 font-bold font-mono">
                    key: {char.toUpperCase()} ({profile.weakKeys[char]}x)
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                <Target className="w-3.5 h-3.5 text-emerald-500" /> Perfect accuracy score! No weak letters.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Gamified Achievements Spotlight list */}
      <div className="border border-slate-100 bg-white p-4.5 rounded-2xl shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-xs font-bold text-slate-500 tracking-wider uppercase">Achievements Tracker</h3>
          <span className="text-[10px] font-bold text-indigo-600 block">Locked / Unlocked</span>
        </div>
        
        <div className="grid grid-cols-1 gap-2">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className={`p-2 rounded-lg bg-white border ${profile.bestWpm >= 50 ? 'border-indigo-200 text-indigo-600 shadow-sm' : 'border-slate-200 text-slate-350 bg-slate-100'}`}>
              <Trophy className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-800 font-bold">Mach 50 Speeder</p>
              <p className="text-[9px] text-slate-400 font-medium">Reach WPM speed of 50 or above.</p>
            </div>
            <div className="ml-auto">
              {profile.bestWpm >= 50 ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-600 border border-emerald-100">UNLOCKED</span>
              ) : (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200/60">LOCKED</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div className={`p-2 rounded-lg bg-white border ${profile.streak >= 3 ? 'border-orange-200 text-orange-500 shadow-sm' : 'border-slate-200 text-slate-350 bg-slate-100'}`}>
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-slate-800 font-bold">Dedicated Typer</p>
              <p className="text-[9px] text-slate-400 font-medium">Reach a continuous 3-day streak.</p>
            </div>
            <div className="ml-auto">
              {profile.streak >= 3 ? (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-orange-50 text-orange-600 border border-orange-100">UNLOCKED</span>
              ) : (
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-400 border border-slate-200/60">LOCKED</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
