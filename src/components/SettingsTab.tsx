import React, { useState } from 'react';
import { UserProfile } from '../types';
import { synth } from '../utils/audio';
import { Settings, Volume2, VolumeX, User, Info, Sliders, Music, Zap, Eye } from 'lucide-react';

interface SettingsTabProps {
  profile: UserProfile;
  onChangeName: (name: string) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  activeTheme: string;
  onChangeTheme: (theme: string) => void;
}

export default function SettingsTab({ 
  profile, 
  onChangeName, 
  soundEnabled, 
  onToggleSound,
  activeTheme,
  onChangeTheme 
}: SettingsTabProps) {
  
  const [nameInput, setNameInput] = useState(profile.username);
  const [clickerType, setClickerType] = useState<'cyber' | 'retro' | 'classic'>('retro');

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onChangeName(nameInput.trim());
    }
  };

  const handleSoundPreset = (type: 'cyber' | 'retro' | 'classic') => {
    setClickerType(type);
    synth.setSoundType(type);
    synth.toggle(true);
    onToggleSound(true);
    // Play a sample click
    synth.playKeyPress(true);
  };

  return (
    <div className="space-y-4 animate-fade-in px-1 select-none">
      
      {/* Name customizer */}
      <div className="p-4.5 border border-slate-150 bg-white rounded-2xl space-y-3.5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
          <User className="w-4 h-4 text-indigo-600" /> PILOT IDENTITY CONFIG
        </h3>

        <form onSubmit={handleSaveName} className="flex gap-2">
          <input
            type="text"
            value={nameInput}
            onChange={(e) => setNameInput(e.target.value)}
            placeholder="Change pilot name..."
            maxLength={18}
            className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 font-sans focus:ring-1 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="cursor-pointer px-4.5 py-2.5 bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl text-xs font-bold hover:scale-103 transition-transform shadow-md shadow-indigo-600/10"
          >
            Update
          </button>
        </form>
      </div>

      {/* Keyboard Sound settings */}
      <div className="p-4.5 border border-slate-150 bg-white rounded-2xl space-y-4 shadow-sm">
        <div className="flex justify-between items-center gap-2">
          <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
            <Volume2 className="w-4 h-4 text-indigo-600" /> KEYBOARD DEEP SYNTH
          </h3>

          <button
            onClick={() => {
              const nextVal = !soundEnabled;
              onToggleSound(nextVal);
              synth.toggle(nextVal);
            }}
            className={`px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-colors cursor-pointer uppercase ${
              soundEnabled 
                ? 'bg-indigo-50 border-indigo-500 text-indigo-650' 
                : 'bg-slate-50 border-slate-200 text-slate-400'
            }`}
          >
            {soundEnabled ? 'SFX ON' : 'SFX OFF'}
          </button>
        </div>

        <div className="space-y-2">
          <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">Sound presets</p>
          <div className="grid grid-cols-3 gap-2">
             {[
               { id: 'cyber', label: 'Hyper Laser' },
               { id: 'retro', label: 'Mechanical' },
               { id: 'classic', label: 'Classic Tick' }
             ].map((snd) => (
              <button
                key={snd.id}
                onClick={() => handleSoundPreset(snd.id as any)}
                type="button"
                className={`cursor-pointer px-2 py-2.5 rounded-xl text-[10px] font-bold text-center border transition-all ${
                  clickerType === snd.id && soundEnabled
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-600 font-bold' 
                    : 'bg-slate-50 border-slate-150 text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {snd.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Visual Canvas Aesthetic Customizer */}
      <div className="p-4.5 border border-slate-150 bg-white rounded-2xl space-y-3.5 shadow-sm">
        <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5 uppercase font-mono tracking-wider">
          <Eye className="w-4 h-4 text-indigo-600" /> THEME SELECTION
        </h3>

        <div className="space-y-2">
          <p className="text-[9px] text-slate-400 font-extrabold uppercase font-mono tracking-wider">Aesthetic hue</p>
          <div className="grid grid-cols-2 gap-2">
             {[
               { id: 'hyper_cyan', label: 'Bright Indigo Bloom', style: 'border-indigo-400 text-indigo-650' },
               { id: 'cosmic_purple', label: 'Amber Gold Spark', style: 'border-amber-400 text-amber-650' }
             ].map((t) => (
              <button
                key={t.id}
                onClick={() => onChangeTheme(t.id)}
                className={`cursor-pointer p-3.5 rounded-xl text-left border transition-all ${
                  activeTheme === t.id 
                    ? 'bg-indigo-50/50 border-indigo-500 text-indigo-700 font-bold ring-1 ring-indigo-500' 
                    : 'bg-slate-50 border-slate-100 text-slate-550 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <div className="text-xs">{t.label}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* System info */}
      <div className="p-4 border border-amber-100 rounded-2xl bg-amber-50/45 text-[11px] text-slate-650 leading-normal space-y-1 shadow-sm font-sans">
        <span className="font-bold text-slate-800 flex items-center gap-1"><Info className="w-4.5 h-4.5 text-amber-500 fill-amber-500/10" /> Service Engine Specs</span>
        <p className="text-slate-550">TypeMaster Pro v1.4.0 — Running synthesized sound oscillator circuits, high accuracy local storage buffers, and secure server-side proxy engines.</p>
      </div>

    </div>
  );
}
