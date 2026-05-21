import React, { useState } from 'react';
import { UserProfile, TypingRecord } from '../types';
import { Sparkles, Play, ShieldAlert, Cpu, Keyboard, Activity, RefreshCw } from 'lucide-react';

interface CustomAiDrillsProps {
  profile: UserProfile;
  onLaunchPractice: (text: string, title: string, mode: TypingRecord['mode']) => void;
}

export default function CustomAiDrills({ profile, onLaunchPractice }: CustomAiDrillsProps) {
  const [loading, setLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'cyberpunk' | 'motivational' | 'technical' | 'fantasy'>('cyberpunk');

  const weakKeysList = Object.keys(profile.weakKeys);

  const requestAiParagraph = async () => {
    setLoading(true);
    setAiMessage(null);

    try {
      const res = await fetch("/api/generate-text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          weakKeys: weakKeysList,
          difficulty: profile.bestWpm > 55 ? "advanced" : profile.bestWpm > 30 ? "intermediate" : "beginner",
          category: selectedStyle
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.text) {
        onLaunchPractice(
          data.text,
          `AI Custom Drill [Focus: ${weakKeysList.slice(0, 3).join(', ').toUpperCase() || 'Gen'}]`,
          'custom_ai'
        );
      }
    } catch (e: any) {
      console.error(e);
      setLoading(false);
      setAiMessage("Network congestion occurred. Defaulting to local rapid-drill buffers.");
    }
  };

  return (
    <div className="space-y-4 animate-fade-in px-1">
      {/* Smart Drills Header Card */}
      <div className="p-4.5 border border-indigo-100 bg-indigo-50/45 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-indigo-100 text-indigo-650 mt-0.5 shadow-sm">
            <Cpu className="w-5 h-5 animate-pulse text-indigo-650" />
          </div>
          <div className="space-y-0.5 flex-1">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 leading-tight">
              Adaptive AI Drills
            </h3>
            <p className="text-[11px] text-slate-500 leading-relaxed font-sans">
              Our neural pilot tracks your key strokes and detects mistyped letters. Tap below to have our server-side LLM compile personalized paragraphs focusing precisely on your weak key combinations.
            </p>
          </div>
        </div>
      </div>

      {/* Grid: Selected Weak Keys Monitor & AI Settings */}
      <div className="grid grid-cols-1 gap-4">
        
        {/* Identified Weak Keys Monitor */}
        <div className="p-4 border border-slate-150 bg-white rounded-2xl shadow-sm flex flex-col justify-between space-y-3">
          <div>
            <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 uppercase">IDENTIFIED WEAKNESS AREAS</span>
            <h4 className="text-xs font-bold text-slate-800 mt-0.5">Mistyped Characters Trace</h4>
          </div>

          {weakKeysList.length > 0 ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-1.5 pt-1">
                {weakKeysList.map((char) => (
                  <span key={char} className="px-2.5 py-1 rounded-xl bg-rose-50 border border-rose-100 text-red-500 font-bold font-mono text-xs shadow-sm">
                    {char.toUpperCase()} : {profile.weakKeys[char]}x
                  </span>
                ))}
              </div>
              <p className="text-[10px] text-slate-450 leading-normal font-sans">
                These letters recorded highest failure latencies or incorrect index matches in recent training.
              </p>
            </div>
          ) : (
            <div className="p-4 border border-dashed border-slate-200 rounded-xl bg-slate-50 text-center text-slate-400">
              <Activity className="w-8 h-8 mx-auto opacity-30 text-indigo-500 mb-1" />
              <p className="text-xs font-medium text-slate-500">No key failures detected yet. Practice to spawn tags!</p>
            </div>
          )}

          <div className="text-[9px] text-slate-400 font-bold font-mono">
            *Requires a minimum of 1 mistyped letter for focus matching.
          </div>
        </div>

        {/* AI Subject Settings */}
        <div className="p-4 border border-slate-150 bg-white rounded-2xl shadow-sm space-y-3 flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-bold font-mono tracking-wider text-slate-400 uppercase">AI THEMATIC PARADIGM</span>
            <h4 className="text-xs font-bold text-slate-800 mt-0.5">Paragraph Style Customizer</h4>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-1">
            {[
              { id: 'cyberpunk', label: 'Pro Technical Code' },
              { id: 'technical', label: 'Developer Drills' },
              { id: 'motivational', label: 'Life Inspirations' },
              { id: 'fantasy', label: 'Epic Fantasy Prose' }
            ].map((theme) => (
              <button
                key={theme.id}
                onClick={() => setSelectedStyle(theme.id as any)}
                type="button"
                className={`cursor-pointer px-3 py-2.5 rounded-xl text-xs font-bold text-left border transition-all ${
                  selectedStyle === theme.id 
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 font-bold' 
                    : 'bg-slate-50 border-slate-100 text-slate-500 hover:text-slate-805 hover:bg-slate-100'
                }`}
              >
                {theme.label}
              </button>
            ))}
          </div>

          <div className="text-[9px] text-slate-400 font-bold font-mono">
            Target difficulty scales automatically to your past speed averages.
          </div>
        </div>

      </div>

      {/* Main launch button trigger */}
      <div className="border border-slate-150 bg-white p-5 rounded-2xl shadow-sm text-center space-y-4">
        {loading ? (
          <div className="space-y-3 py-4">
            <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
            <div className="text-xs font-bold font-mono text-indigo-600 animate-pulse uppercase">
              QUERYING ADAPTIVE DRILLS GENERATION ENGINE...
            </div>
            <p className="text-[10px] text-slate-450 max-w-xs mx-auto font-sans font-medium">
              Compiles a customized typing course in under 5 seconds.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-500 font-sans font-medium">
              Ready to challenge your target precision on keys: <strong className="text-indigo-600 font-bold font-mono uppercase"> {weakKeysList.length > 0 ? weakKeysList.slice(0, 5).join(', ') : 'Home Row Standard Keys'}</strong>.
            </p>
            <button
              onClick={requestAiParagraph}
              className="px-6 py-3.5 rounded-xl bg-indigo-650 text-white font-bold text-xs hover:scale-102 transition-all cursor-pointer flex items-center justify-center gap-1.5 mx-auto shadow-md shadow-indigo-600/10 hover:bg-indigo-700"
            >
              <Sparkles className="w-4 h-4 fill-white text-white animate-pulse" />
              Generate Smart AI Paragraph
            </button>
          </div>
        )}

        {aiMessage && (
          <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-xs text-left flex items-start gap-1.5">
            <ShieldAlert className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
            <span>{aiMessage}</span>
          </div>
        )}
      </div>

    </div>
  );
}
