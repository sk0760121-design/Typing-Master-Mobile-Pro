import React, { useState } from 'react';
import { LESSONS } from '../utils/lessonsData';
import { TypingLesson, UserProfile } from '../types';
import { Play, Star, BookOpen, Layers, Award, Percent, Info, ChevronRight } from 'lucide-react';

interface LessonsTabProps {
  profile: UserProfile;
  onSelectLesson: (lesson: TypingLesson) => void;
}

export default function LessonsTab({ profile, onSelectLesson }: LessonsTabProps) {
  const [activeTier, setActiveTier] = useState<'all' | 'beginner' | 'intermediate' | 'advanced'>('all');

  const filteredLessons = activeTier === 'all' 
    ? LESSONS 
    : LESSONS.filter(l => l.tier === activeTier);

  // Check if a lesson was completed and how many stars it earns based on accuracy/WPM log
  const getLessonStars = (lesson: TypingLesson): number => {
    // Find in profile history if this lesson was completed
    const matchingRecords = profile.recentTests.filter(
      r => r.category === lesson.title && r.completed
    );
    if (matchingRecords.length === 0) return 0;
    
    const maxWpm = Math.max(...matchingRecords.map(r => r.wpm));
    if (maxWpm >= lesson.targetWpm + 10) return 3;
    if (maxWpm >= lesson.targetWpm - 5) return 2;
    return 1;
  };

  const renderStars = (starsCount: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3].map((s) => (
          <Star 
            key={s} 
            className={`w-3.5 h-3.5 ${s <= starsCount ? 'text-yellow-400 fill-yellow-400' : 'text-slate-200'}`} 
          />
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-4.5 animate-fade-in px-1">
      {/* Hand finger positioning training panel */}
      <div className="rounded-2xl border border-indigo-100 bg-indigo-50/45 p-4 relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 mt-0.5 shadow-inner">
            <BookOpen className="w-4.5 h-4.5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xs font-bold text-slate-800">Classic Finger Positioning Guide</h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              Rest your fingers on the <span className="text-indigo-600 font-bold font-mono">ASDF</span> (left hand) and <span className="text-indigo-600 font-bold font-mono">JKL;</span> (right hand). Use your thumbs exclusively for the <span className="text-indigo-600 font-mono font-bold">Spacebar</span>. Keep wrists elevated and don't peek!
            </p>
          </div>
        </div>

        {/* Visual Hands Mimic */}
        <div className="mt-4 hidden md:flex items-center justify-around py-2.5 bg-white/90 rounded-xl border border-indigo-100">
          {/* Left hand */}
          <div className="flex gap-2 items-end text-center">
            <div>
              <span className="block text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Pinky</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-bold font-mono text-[9px] border border-slate-100 shadow-sm">A</span>
            </div>
            <div>
              <span className="block text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Ring</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-bold font-mono text-[9px] border border-slate-100 shadow-sm">S</span>
            </div>
            <div>
              <span className="block text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Middle</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-bold font-mono text-[9px] border border-slate-100 shadow-sm">D</span>
            </div>
            <div>
              <span className="block text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Index</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-bold font-mono text-[9px] border border-slate-100 shadow-sm">F</span>
            </div>
          </div>

          <div className="text-[9px] text-slate-400 font-bold font-mono uppercase tracking-wider">SPACE [Thumbs]</div>

          {/* Right hand */}
          <div className="flex gap-2 items-end text-center">
            <div>
              <span className="block text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Index</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-bold font-mono text-[9px] border border-slate-100 shadow-sm">J</span>
            </div>
            <div>
              <span className="block text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Middle</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-bold font-mono text-[9px] border border-slate-100 shadow-sm">K</span>
            </div>
            <div>
              <span className="block text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Ring</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-bold font-mono text-[9px] border border-slate-100 shadow-sm">L</span>
            </div>
            <div>
              <span className="block text-[7px] font-bold text-slate-400 mb-0.5 uppercase">Pinky</span>
              <span className="inline-block px-1.5 py-0.5 rounded bg-slate-50 text-slate-600 font-bold font-mono text-[9px] border border-slate-100 shadow-sm">;</span>
            </div>
          </div>
        </div>
      </div>

      {/* Course Tiers Toggle Controls */}
      <div className="flex gap-1.5 bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50 overflow-x-auto scrollbar-none">
        {(['all', 'beginner', 'intermediate', 'advanced'] as const).map((tier) => (
          <button
            key={tier}
            onClick={() => setActiveTier(tier)}
            className={`cursor-pointer px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all whitespace-nowrap ${
              activeTier === tier 
                ? 'bg-indigo-600 text-white shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
            }`}
          >
            {tier === 'all' ? 'All Milestones' : `${tier}`}
          </button>
        ))}
      </div>

      {/* Lesson List Panels */}
      <div className="space-y-3">
        {filteredLessons.map((lesson, idx) => {
          const starsEarned = getLessonStars(lesson);
          const tierBorderColors = {
            beginner: 'border-l-4 border-l-emerald-400',
            intermediate: 'border-l-4 border-l-indigo-400',
            advanced: 'border-l-4 border-l-amber-400'
          };

          return (
            <div 
              key={lesson.id}
              className={`border border-slate-100 bg-white p-4 rounded-2xl shadow-sm transition-all hover:border-indigo-100 hover:shadow-md flex items-center justify-between gap-4 ${tierBorderColors[lesson.tier]} group`}
            >
              <div className="space-y-1 flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className={`text-[8px] font-bold uppercase px-1.5 py-0.5 rounded ${
                    lesson.tier === 'beginner' ? 'bg-emerald-50 text-emerald-600 border border-emerald-100/50' :
                    lesson.tier === 'intermediate' ? 'bg-indigo-5  text-indigo-600 border border-indigo-100/50' :
                    'bg-amber-50 text-amber-600 border border-amber-100/50'
                  }`}>
                    {lesson.tier}
                  </span>
                  <span className="text-[9px] font-bold font-mono text-slate-400">Lesson #{idx + 1}</span>
                  {renderStars(starsEarned)}
                </div>

                <h4 className="text-sm font-bold text-slate-800 tracking-tight group-hover:text-indigo-600 transition-colors">
                  {lesson.title}
                </h4>
                
                <p className="text-xs text-slate-500 leading-normal line-clamp-1 font-sans">
                  {lesson.description}
                </p>

                <div className="flex gap-4 pt-1.5 text-[9px] text-slate-400 font-bold uppercase font-mono">
                  <span>TARGET: <strong className="text-slate-600 font-extrabold">{lesson.targetWpm} WPM</strong></span>
                  <span>LENGTH: <strong className="text-slate-600 font-extrabold">{lesson.content.length} chars</strong></span>
                </div>
              </div>

              {/* Action Circle */}
              <button
                onClick={() => onSelectLesson(lesson)}
                className="flex-shrink-0 w-11 h-11 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all flex items-center justify-center cursor-pointer shadow-sm hover:scale-103 hover:shadow-indigo-600/10"
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </button>
            </div>
          );
        })}

        {filteredLessons.length === 0 && (
          <div className="py-12 text-center text-slate-400 text-xs font-semibold">
            No lessons available for this selection.
          </div>
        )}
      </div>

      {/* Keyboard Layout and posture tips card */}
      <div className="p-4 border border-amber-100 rounded-2xl bg-amber-50/45 text-xs text-slate-600 space-y-2 shadow-sm">
        <h5 className="font-bold text-slate-800 inline-flex items-center gap-1">
          <Award className="w-4 h-4 text-amber-500 fill-amber-500/10" />
          Typing Master Stars Criteria
        </h5>
        <ul className="list-disc pl-5 space-y-1.5 text-[11px] text-slate-600">
          <li>⭐⭐⭐ (3 Stars): Average speed exceeds targets by 10+ WPM with accuracy of 95% or higher.</li>
          <li>⭐⭐ (2 Stars): Average speed is on par with the target WPM with 90%+ accuracy.</li>
          <li>⭐ (1 Star): Speed completes below targets but maintains basic competency of 85%+ accuracy.</li>
        </ul>
      </div>

    </div>
  );
}
