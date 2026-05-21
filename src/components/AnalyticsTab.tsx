import React from 'react';
import { UserProfile } from '../types';
import { Award, Target, Activity, Flame, ShieldAlert, Sparkles, CheckCircle } from 'lucide-react';

interface AnalyticsTabProps {
  profile: UserProfile;
}

export default function AnalyticsTab({ profile }: AnalyticsTabProps) {
  const weakKeys = profile.weakKeys || {};
  const sortedWeakKeys = Object.entries(weakKeys).sort((a,b) => b[1] - a[1]);

  const testsCount = profile.recentTests.length;
  const avgWpm = testsCount > 0 
    ? Math.round(profile.recentTests.reduce((acc, curr) => acc + curr.wpm, 0) / testsCount)
    : 0;

  // Render SVG Error rate chart
  const renderWeakKeysChart = () => {
    if (sortedWeakKeys.length === 0) {
      return (
        <div className="h-44 flex flex-col items-center justify-center border border-dashed border-slate-200 rounded-2xl bg-white text-slate-400 text-center shadow-inner">
          <CheckCircle className="w-10 h-10 mb-2 text-emerald-500 opacity-80" />
          <p className="text-xs font-semibold">No keyboard faults registered! Keep up the brilliant pace.</p>
        </div>
      );
    }

    const maxErrors = Math.max(...sortedWeakKeys.map(([_, count]) => count), 1);
    const height = 140;
    const barWidth = 32;
    const gap = 16;
    const totalWidth = sortedWeakKeys.length * (barWidth + gap);

    return (
      <div className="w-full space-y-3.5">
        <div className="flex justify-between items-center px-1">
          <span className="text-[9px] font-bold font-mono text-slate-400 tracking-wider">MISTAKES PER KEY (WEIGHTED)</span>
          <span className="text-[10px] font-extrabold text-red-500 font-mono">Total {profile.totalErrors} errors</span>
        </div>

        <div className="overflow-x-auto py-2 scrollbar-none">
          <svg viewBox={`0 0 ${totalWidth} ${height}`} className="mx-auto overflow-visible" style={{ maxWidth: '100%', height: '140px' }}>
            <g>
              {sortedWeakKeys.map(([char, count], index) => {
                const x = index * (barWidth + gap);
                const rectHeight = (count / maxErrors) * (height - 35);
                const y = height - rectHeight - 20;

                return (
                  <g key={char} className="group cursor-pointer">
                    {/* Glowing background bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={rectHeight}
                      rx="6"
                      fill="#ef4444"
                      fillOpacity="0.06"
                      className="group-hover:fill-opacity-15 transition-all"
                    />
                    {/* Main Bar */}
                    <rect
                      x={x}
                      y={y}
                      width={barWidth}
                      height={rectHeight}
                      rx="6"
                      fill="url(#redGlowGradient)"
                      stroke="#f87171"
                      strokeWidth="2"
                    />
                    {/* Error count label above bar */}
                    <text
                      x={x + barWidth / 2}
                      y={y - 6}
                      textAnchor="middle"
                      fill="#ef4444"
                      fontSize="9.5"
                      fontWeight="bold"
                      className="font-mono font-bold"
                    >
                      {count}x
                    </text>
                    {/* Key char code below bar */}
                    <text
                      x={x + barWidth / 2}
                      y={height - 4}
                      textAnchor="middle"
                      fill="#475569"
                      fontSize="11.5"
                      fontWeight="bold"
                      className="font-mono uppercase"
                    >
                      {char}
                    </text>
                  </g>
                );
              })}
            </g>
            <defs>
              <linearGradient id="redGlowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#ef4444" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  };

  // Generate customized recommendations based on weak keys
  const getSmartRecommendations = () => {
    if (sortedWeakKeys.length === 0) {
      return [
        "Your keystroke accuracy is practically perfect. Continue on to advanced drills or numbers/symbol training to expand your range."
      ];
    }

    const advices: string[] = [];
    const topWeak = sortedWeakKeys[0][0];

    advices.push(`Your highest mismatch error is key [${topWeak.toUpperCase()}]. Focus specifically on maintaining visual rest postures so that your fingers don't drift while extending.`);
    
    if (sortedWeakKeys.length > 2) {
      advices.push("Avoid micro-stuttering during drills. Keep flat, fluid, rhythmic intervals instead of speeding up and crashing when difficult letter clusters arrive.");
    }
    
    if (avgWpm > 45) {
      advices.push("Upgrade key drills: Transition to intermediate and advanced paragraph endurance modes, or build AI drills containing symbols/numbers.");
    } else {
      advices.push("Slow Down to Speed Up: Try executing lessons at 80% speed, emphasizing 100% correctness first. Muscle memory solidifies faster this way.");
    }

    return advices;
  };

  return (
    <div className="space-y-4 animate-fade-in px-1">
      {/* Analytics Main panel card */}
      <div className="p-4.5 rounded-2xl border border-slate-150 bg-white shadow-sm space-y-4">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Activity className="w-4.5 h-4.5 text-indigo-600" /> Key-by-Key Accuracy Analysis
        </h3>

        {/* Custom SVG Bar Graph */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
          {renderWeakKeysChart()}
        </div>
      </div>

      {/* Grid: Rhythm consistency & stats */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Performance indexing */}
        <div className="p-4.5 border border-slate-150 bg-white rounded-2xl shadow-sm space-y-3">
          <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider">Mechanical Fluency</span>
          <h4 className="text-xs font-bold text-slate-800 leading-tight">Keystroke Smoothness Index</h4>
          
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-500 font-medium font-sans">Consistency rating:</span>
              <span className="text-indigo-600 font-extrabold font-mono">82% [Optimal]</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-indigo-500 rounded-full" style={{ width: '82%' }}></div>
            </div>

            <div className="flex justify-between items-center text-xs pt-1">
              <span className="text-slate-500 font-medium font-sans">Home-Row Rest discipline:</span>
              <span className="text-emerald-600 font-extrabold font-mono">94%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94%' }}></div>
            </div>
          </div>
        </div>

        {/* Quick Summary Totals */}
        <div className="p-4.5 border border-slate-150 bg-white rounded-2xl shadow-sm space-y-3 justify-between flex flex-col">
          <div>
            <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-wider">Fluency records</span>
            <h4 className="text-xs font-bold text-slate-800 mt-0.5">Lifetime Diagnostics</h4>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center mt-2">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
              <span className="block text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider">Total Hits</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{profile.totalCharactersTyped}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
              <span className="block text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider">Total Errors</span>
              <span className="text-xs font-bold text-red-500 font-mono">{profile.totalErrors}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
              <span className="block text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider">Words Formed</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{profile.totalWordsTyped}</span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors">
              <span className="block text-[8px] font-bold font-mono text-slate-400 uppercase tracking-wider">Total Secs</span>
              <span className="text-xs font-bold text-slate-800 font-mono">{profile.totalPracticeTimeSecs}s</span>
            </div>
          </div>
        </div>

      </div>

      {/* Smart practice recommendations block */}
      <div className="p-4.5 border border-slate-150 bg-white rounded-2xl shadow-sm space-y-2">
        <h4 className="text-[9px] font-bold font-mono tracking-wider text-slate-400 uppercase flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
          AI PILOT TRAINING RECOMMENDATIONS
        </h4>
        <div className="space-y-2 pt-1">
          {getSmartRecommendations().map((rec, i) => (
            <div key={i} className="text-xs text-slate-650 leading-relaxed flex items-start gap-2.5 p-3 rounded-xl bg-indigo-50/45 border border-indigo-100/60 font-sans">
              <span className="text-indigo-650 font-extrabold font-mono">0{i+1}.</span>
              <span className="font-medium text-slate-600">{rec}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
