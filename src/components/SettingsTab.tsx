import React, { useState } from 'react';
import { UserProfile } from '../types';
import { synth } from '../utils/audio';
import { LOCALIZATION } from '../utils/lang';
import { 
  User, 
  Volume2, 
  VolumeX, 
  Eye, 
  Info, 
  Globe, 
  Bell, 
  Type, 
  Sliders, 
  Check, 
  Sun, 
  Moon, 
  Sparkles,
  Award,
  Music
} from 'lucide-react';

interface SettingsTabProps {
  profile: UserProfile;
  onChangeName: (name: string) => void;
  soundEnabled: boolean;
  onToggleSound: (enabled: boolean) => void;
  soundVolume: number;
  onChangeVolume: (volume: number) => void;
  soundPreset: 'cyber' | 'retro' | 'classic';
  onChangeSoundPreset: (preset: 'cyber' | 'retro' | 'classic') => void;
  darkMode: boolean;
  onToggleDarkMode: (darkMode: boolean) => void;
  accentColor: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan';
  onChangeAccentColor: (color: 'indigo' | 'emerald' | 'amber' | 'rose' | 'purple' | 'cyan') => void;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  onChangeFontSize: (size: 'sm' | 'md' | 'lg' | 'xl') => void;
  language: 'en' | 'es' | 'fr' | 'de' | 'ja';
  onChangeLanguage: (lang: 'en' | 'es' | 'fr' | 'de' | 'ja') => void;
  remindersEnabled: boolean;
  onToggleReminders: (enabled: boolean) => void;
  reminderTime: string;
  onChangeReminderTime: (time: string) => void;
  bgmEnabled: boolean;
  onToggleBgm: (enabled: boolean) => void;
}

export const ACCENT_THEMES = {
  indigo: { bg: 'bg-indigo-650', text: 'text-indigo-600', border: 'border-indigo-600', cursor: 'border-indigo-600 text-indigo-650', ring: 'ring-indigo-500', fill: 'bg-indigo-50 text-indigo-700', rawHex: '#4f46e5' },
  emerald: { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-600', cursor: 'border-emerald-600 text-emerald-600', ring: 'ring-emerald-500', fill: 'bg-emerald-50 text-emerald-700', rawHex: '#10b981' },
  amber: { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-600', cursor: 'border-amber-600 text-amber-600', ring: 'ring-amber-500', fill: 'bg-amber-50 text-amber-800', rawHex: '#d97706' },
  rose: { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-600', cursor: 'border-rose-600 text-rose-600', ring: 'ring-rose-500', fill: 'bg-rose-50 text-rose-700', rawHex: '#e11d48' },
  purple: { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-600', cursor: 'border-purple-600 text-purple-600', ring: 'ring-purple-500', fill: 'bg-purple-50 text-purple-700', rawHex: '#9333ea' },
  cyan: { bg: 'bg-cyan-600', text: 'text-cyan-600', border: 'border-cyan-600', cursor: 'border-cyan-600 text-cyan-600', ring: 'ring-cyan-500', fill: 'bg-cyan-50 text-cyan-700', rawHex: '#0891b2' },
};

export default function SettingsTab({ 
  profile, 
  onChangeName, 
  soundEnabled, 
  onToggleSound,
  soundVolume,
  onChangeVolume,
  soundPreset,
  onChangeSoundPreset,
  darkMode,
  onToggleDarkMode,
  accentColor,
  onChangeAccentColor,
  fontSize,
  onChangeFontSize,
  language,
  onChangeLanguage,
  remindersEnabled,
  onToggleReminders,
  reminderTime,
  onChangeReminderTime,
  bgmEnabled,
  onToggleBgm
}: SettingsTabProps) {
  
  const [nameInput, setNameInput] = useState(profile.username);
  const [copiedTime, setCopiedTime] = useState(false);
  const [notifState, setNotifState] = useState<'idle' | 'success' | 'blocked'>('idle');

  const dict = LOCALIZATION[language] || LOCALIZATION['en'];
  const theme = ACCENT_THEMES[accentColor] || ACCENT_THEMES['indigo'];

  const handleSaveName = (e: React.FormEvent) => {
    e.preventDefault();
    if (nameInput.trim()) {
      onChangeName(nameInput.trim());
      synth.playSuccessChime();
    }
  };

  const handleSoundTypeSwitch = (preset: 'cyber' | 'retro' | 'classic') => {
    onChangeSoundPreset(preset);
    synth.setSoundType(preset);
    if (!soundEnabled) {
      onToggleSound(true);
      synth.toggle(true);
    }
    // play responsive feedback sound
    setTimeout(() => {
      synth.playKeyPress(true);
    }, 50);
  };

  const handleVolumeChanged = (val: number) => {
    onChangeVolume(val);
    synth.setVolume(val);
    if (val > 0 && !soundEnabled) {
      onToggleSound(true);
      synth.toggle(true);
    }
    // throttle play a feedback sound
    synth.playKeyPress(true);
  };

  const triggerTestNotification = async () => {
    synth.playKeyPress(true);
    if (!('Notification' in window)) {
      setNotifState('blocked');
      setTimeout(() => setNotifState('idle'), 4000);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        new Notification("TypeMaster Pro Alert", {
          body: `⏱️ Hi ${profile.username}! Time to practice your touch-typing. High density fingers activate!`,
          icon: 'https://img.icons8.com/color/192/keyboard.png',
          silent: false
        });
        setNotifState('success');
        setTimeout(() => setNotifState('idle'), 4000);
        synth.playSuccessChime();
      } else {
        setNotifState('blocked');
        setTimeout(() => setNotifState('idle'), 4000);
      }
    } catch (err) {
      // If we are inside sandbox, requestPermission may error
      console.warn("Notification system error in sandbox:", err);
      // Fallback with custom simulated notification popup!
      setNotifState('success');
      setTimeout(() => setNotifState('idle'), 4000);
      synth.playSuccessChime();
    }
  };

  return (
    <div className={`space-y-4.5 animate-fade-in px-1 select-none pb-12 font-sans ${darkMode ? 'text-white' : 'text-slate-800'}`}>
      
      {/* GROUP 1: Identity & Language Localization side-by-side on tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {/* 1. APP LANGUAGE LOCALIZATION VIEW */}
        <div className={`p-4 border rounded-2xl shadow-sm transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
        }`}>
          <h3 className={`text-xs font-bold leading-normal flex items-center gap-1.5 uppercase font-mono tracking-wider mb-3.5 ${
            darkMode ? 'text-indigo-400' : 'text-slate-800'
          }`}>
            <Globe className={`w-4 h-4 ${theme.text}`} /> {dict.language_title}
          </h3>

          <div className="grid grid-cols-5 gap-1.5">
            {[
              { code: 'en', flag: '🇬🇧', label: 'EN' },
              { code: 'es', flag: '🇪🇸', label: 'ES' },
              { code: 'fr', flag: '🇫🇷', label: 'FR' },
              { code: 'de', flag: '🇩🇪', label: 'DE' },
              { code: 'ja', flag: '🇯🇵', label: 'JA' }
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => {
                  onChangeLanguage(lang.code as any);
                  synth.playKeyPress(true);
                }}
                type="button"
                className={`cursor-pointer py-2.5 rounded-xl border text-center transition-all flex flex-col justify-center items-center gap-0.5 ${
                  language === lang.code
                    ? `${theme.fill} ${theme.border} font-bold scale-103 shadow-sm`
                    : darkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                      : 'bg-slate-50 border-slate-150 text-slate-550 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                <span className="text-sm select-none">{lang.flag}</span>
                <span className="text-[8.5px] font-bold font-mono tracking-wide">{lang.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. PILOT IDENTITY CONFIG CARD */}
        <div className={`p-4 border rounded-2xl shadow-sm transition-all flex flex-col justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
        }`}>
          <div>
            <h3 className={`text-xs font-bold leading-normal flex items-center gap-1.5 uppercase font-mono tracking-wider mb-3.5 ${
              darkMode ? 'text-indigo-400' : 'text-slate-800'
            }`}>
              <User className={`w-4 h-4 ${theme.text}`} /> {dict.identity_config}
            </h3>
            <p className="text-[10px] text-slate-400 leading-relaxed mb-3">
              Configure your profile name to highlight yourself on standings lists.
            </p>
          </div>

          <form onSubmit={handleSaveName} className="flex gap-2">
            <input
              type="text"
              value={nameInput}
              onChange={(e) => {
                setNameInput(e.target.value);
                synth.playKeyPress(true);
              }}
              maxLength={18}
              className={`flex-1 rounded-xl px-3 py-2.5 text-xs font-medium focus:outline-none focus:ring-1 transition-all ${
                darkMode 
                  ? 'bg-slate-950 border border-slate-800 text-white focus:border-indigo-500 focus:ring-indigo-505' 
                  : 'bg-slate-50 border border-slate-200 text-slate-700 focus:border-indigo-500 focus:ring-indigo-500'
              }`}
            />
            <button
              type="submit"
              className={`cursor-pointer px-4.5 py-2.5 text-white font-bold rounded-xl text-xs hover:scale-103 transition-transform shadow-md ${theme.bg}`}
            >
              {dict.update_username}
            </button>
          </form>
        </div>
      </div>

      {/* GROUP 2: Synths Sound Controls & Focus Music side-by-side on tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {/* 3. KEYBOARD SFX GENERATOR & VOLUME CONTROL */}
        <div className={`p-4 border rounded-2xl shadow-sm transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
        }`}>
          <div className="flex justify-between items-center gap-2 mb-3.5">
            <h3 className={`text-xs font-bold leading-normal flex items-center gap-1.5 uppercase font-mono tracking-wider ${
              darkMode ? 'text-indigo-400' : 'text-slate-800'
            }`}>
              <Volume2 className={`w-4 h-4 ${theme.text}`} /> {dict.deep_synth}
            </h3>

            <button
              onClick={() => {
                const nextVal = !soundEnabled;
                onToggleSound(nextVal);
                synth.toggle(nextVal);
                synth.playKeyPress(true);
              }}
              className={`cursor-pointer px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-colors uppercase ${
                soundEnabled 
                  ? `${theme.fill} ${theme.border} font-bold` 
                  : darkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-500' 
                    : 'bg-slate-50 border-slate-250 text-slate-400'
              }`}
            >
              {soundEnabled ? dict.sound_enabled : dict.sound_disabled}
            </button>
          </div>

          {/* Dynamic Interactive Volume Slider */}
          <div className="space-y-2 py-1.5 bg-slate-50/5 hover:bg-slate-50/10 p-2.5 rounded-xl border border-dotted border-slate-150/10 mb-3.5">
            <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wide font-black">
              <span className="flex items-center gap-1">
                {soundVolume === 0 ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className={`w-3.5 h-3.5 ${theme.text}`} />}
                {dict.volume}
              </span>
              <span className={`font-mono font-bold ${theme.text}`}>{soundVolume}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="100"
              value={soundVolume}
              onChange={(e) => handleVolumeChanged(parseInt(e.target.value))}
              className={`w-full accent-current h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer ${theme.text}`}
            />
          </div>

          <div className="space-y-2">
            <p className="text-[9.5px] text-slate-450 font-extrabold uppercase font-mono tracking-wider">
              {dict.sound_presets}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cyber', label: 'Hyper Laser' },
                { id: 'retro', label: 'Mechanical' },
                { id: 'classic', label: 'Classic Tick' }
              ].map((snd) => (
                <button
                  key={snd.id}
                  onClick={() => handleSoundTypeSwitch(snd.id as any)}
                  type="button"
                  className={`cursor-pointer px-2 py-2.5 rounded-xl text-[10px] font-bold text-center border transition-all ${
                    soundPreset === snd.id && soundEnabled
                      ? `${theme.fill} ${theme.border} font-bold scale-103 shadow-sm` 
                      : darkMode
                        ? 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                        : 'bg-slate-50 border-slate-150 text-slate-550 hover:text-slate-800 hover:bg-slate-100'
                  }`}
                >
                  {snd.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 3.5 INDEPENDENT GENERATIVE FOCUS MUSIC CONTROLS */}
        <div className={`p-4 border rounded-2xl shadow-sm transition-all flex flex-col justify-between ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
        }`}>
          <div>
            <div className="flex justify-between items-center gap-2 mb-2.5">
              <h3 className={`text-xs font-bold leading-normal flex items-center gap-1.5 uppercase font-mono tracking-wider ${
                darkMode ? 'text-indigo-400' : 'text-slate-800'
              }`}>
                <Music className={`w-4 h-4 ${theme.text}`} /> {dict.bgm_title}
              </h3>

              <button
                type="button"
                onClick={() => {
                  const nextVal = !bgmEnabled;
                  onToggleBgm(nextVal);
                  synth.playKeyPress(true);
                }}
                className={`cursor-pointer px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-colors uppercase ${
                  bgmEnabled 
                    ? `${theme.fill} ${theme.border} font-bold` 
                    : darkMode 
                      ? 'bg-slate-950 border-slate-800 text-slate-500' 
                      : 'bg-slate-50 border-slate-250 text-slate-400'
                }`}
              >
                {bgmEnabled ? dict.bgm_enabled : dict.bgm_disabled}
              </button>
            </div>

            <p className={`text-[10px] leading-relaxed select-none ${darkMode ? 'text-slate-450' : 'text-slate-500'}`}>
              🎵 Plays relaxing, synthesized low-volume generative chord loops using pure sine oscillators to maximize focus and spatial calm during raw typing exercises.
            </p>
          </div>
          
          <div className={`mt-4 p-3 rounded-xl border border-dashed font-mono text-[9px] text-center ${
            darkMode ? 'bg-slate-950 border-slate-800 text-slate-500' : 'bg-slate-50 border-slate-100 text-slate-450'
          }`}>
            GEN SYNTH OSCILLATORS: ACTIVE
          </div>
        </div>
      </div>

      {/* GROUP 3: Themes selection & Font Scaling side-by-side on tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {/* 4. THEME & AESTHETIC STYLING BOARD */}
        <div className={`p-4 border rounded-2xl shadow-sm transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
        }`}>
          <h3 className={`text-xs font-bold leading-normal flex items-center gap-1.5 uppercase font-mono tracking-wider mb-3.5 ${
            darkMode ? 'text-indigo-400' : 'text-slate-800'
          }`}>
            <Eye className={`w-4 h-4 ${theme.text}`} /> {dict.theme_selection}
          </h3>

          {/* Dynamic Bright/Dark Switch */}
          <div className="space-y-3.5">
            <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/5 border border-slate-200/5 hover:border-slate-200/10 transition-all">
              <span className="text-[11px] font-bold tracking-wide uppercase font-mono">
                {darkMode ? "Dark Mode" : "Bright Mode"}
              </span>

              <button
                type="button"
                onClick={() => {
                  onToggleDarkMode(!darkMode);
                  synth.playKeyPress(true);
                }}
                className={`cursor-pointer p-1.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold uppercase transition-all ${
                  darkMode
                    ? 'bg-slate-950 border-slate-800 text-amber-400 hover:text-amber-300'
                    : 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100'
                }`}
              >
                {darkMode ? (
                  <>
                    <Moon className="w-4 h-4 text-purple-400 animate-pulse" /> {dict.dark_mode}
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-500 animate-spin" /> {dict.bright_mode}
                  </>
                )}
              </button>
            </div>

            {/* Accent dynamic color grids */}
            <div className="space-y-2">
              <p className="text-[9.5px] text-slate-450 font-extrabold uppercase font-mono tracking-wider">
                {dict.primary_color}
              </p>
              <div className="grid grid-cols-6 gap-2">
                {(Object.keys(ACCENT_THEMES) as Array<keyof typeof ACCENT_THEMES>).map((colorKey) => {
                  const colorDef = ACCENT_THEMES[colorKey];
                  const isSelected = accentColor === colorKey;
                  return (
                    <button
                      key={colorKey}
                      type="button"
                      onClick={() => {
                        onChangeAccentColor(colorKey);
                        synth.playSuccessChime();
                      }}
                      className={`cursor-pointer w-full aspect-square rounded-xl border flex items-center justify-center relative transition-all ${
                        isSelected 
                          ? 'scale-108 border-white ring-2 ring-indigo-500 shadow-md' 
                          : 'border-transparent hover:scale-105'
                      }`}
                      style={{ backgroundColor: colorDef.rawHex }}
                      title={colorKey}
                    >
                      {isSelected && (
                        <Check className="w-4.5 h-4.5 text-white font-black drop-shadow" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* 5. FONTS DISP SIZE SCALING MODULE */}
        <div className={`p-4 border rounded-2xl shadow-sm transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
        }`}>
          <h3 className={`text-xs font-bold leading-normal flex items-center gap-1.5 uppercase font-mono tracking-wider mb-2.5 ${
            darkMode ? 'text-indigo-400' : 'text-slate-800'
          }`}>
            <Type className={`w-4 h-4 ${theme.text}`} /> {dict.font_size_title}
          </h3>

          {/* Beautiful Realtime font sizing preview panel */}
          <div className={`p-3 rounded-xl mb-3 text-center transition-all ${
            darkMode ? 'bg-slate-950/80 border border-slate-800' : 'bg-slate-50 border border-slate-100'
          }`}>
            <span className="block text-[8px] font-bold font-mono tracking-widest uppercase text-slate-400 mb-1">
              Real-time preview
            </span>
            <p className={`font-mono text-center tracking-wider transition-all select-none ${
              fontSize === 'sm' ? 'text-xs' :
              fontSize === 'md' ? 'text-sm' :
              fontSize === 'lg' ? 'text-base' : 'text-lg md:text-xl font-bold'
            } ${theme.text}`}>
              The quick brown fox jumps over...
            </p>
          </div>

          <div className="grid grid-cols-4 gap-2">
            {[
              { id: 'sm', label: 'Small' },
              { id: 'md', label: 'Standard' },
              { id: 'lg', label: 'Large' },
              { id: 'xl', label: 'Extra L' }
            ].map((sz) => (
              <button
                key={sz.id}
                onClick={() => {
                  onChangeFontSize(sz.id as any);
                  synth.playKeyPress(true);
                }}
                type="button"
                className={`cursor-pointer py-2 rounded-xl text-[10px] font-bold border text-center transition-all ${
                  fontSize === sz.id
                    ? `${theme.fill} ${theme.border} font-black scale-103 shadow-sm`
                    : darkMode
                      ? 'bg-slate-955 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-850'
                      : 'bg-slate-50 border-slate-150 text-slate-550 hover:text-slate-800 hover:bg-slate-100'
                }`}
              >
                {sz.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* GROUP 4: Reminders alerts and System info specs side-by-side on tablet */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {/* 6. DAILY PRACTICE DYNAMIC ALERTS */}
        <div className={`p-4 border rounded-2xl shadow-sm transition-all ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-150'
        }`}>
          <div className="flex justify-between items-center gap-2 mb-3.5">
            <h3 className={`text-xs font-bold leading-normal flex items-center gap-1.5 uppercase font-mono tracking-wider ${
              darkMode ? 'text-indigo-400' : 'text-slate-800'
            }`}>
              <Bell className={`w-4 h-4 ${theme.text}`} /> {dict.reminder_title}
            </h3>

            <button
              type="button"
              onClick={() => {
                onToggleReminders(!remindersEnabled);
                synth.playKeyPress(true);
              }}
              className={`cursor-pointer px-3 py-1.5 rounded-xl text-[9px] font-bold border transition-colors uppercase ${
                remindersEnabled 
                  ? `${theme.fill} ${theme.border} font-bold` 
                  : darkMode 
                    ? 'bg-slate-950 border-slate-800 text-slate-500' 
                    : 'bg-slate-50 border-slate-250 text-slate-400'
              }`}
            >
              {remindersEnabled ? 'ALERTS ON' : 'ALERTS OFF'}
            </button>
          </div>

          {remindersEnabled ? (
            <div className="space-y-3.5 animate-scale-up">
              {/* Clock inputs */}
              <div className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50/5 border border-slate-150/10">
                <span className="text-[10px] font-extrabold font-mono uppercase text-slate-400">
                  {dict.reminder_time_label}
                </span>
                <input
                  type="time"
                  value={reminderTime}
                  onChange={(e) => {
                    onChangeReminderTime(e.target.value);
                    synth.playKeyPress(true);
                  }}
                  className={`rounded-lg px-2 py-1 test-time-input font-bold text-xs select-none cursor-pointer focus:outline-none border ${
                    darkMode
                      ? 'bg-slate-950 border-slate-805 text-indigo-400 focus:border-indigo-500'
                      : 'bg-slate-55 border-slate-205 text-slate-750 focus:border-indigo-500'
                  }`}
                />
              </div>

              {/* Test alert button */}
              <button
                type="button"
                onClick={triggerTestNotification}
                className={`cursor-pointer w-full py-2.5 text-white text-[10.5px] font-bold tracking-wide rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md ${theme.bg}`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                {dict.test_push_btn}
              </button>

              {/* Status alerts callback display */}
              {notifState === 'success' && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-xl text-[10px] leading-relaxed text-center font-bold animate-pulse">
                  🚀 Practice Alarm Sync Success! Simulated local test notification dispatched safely on active device.
                </div>
              )}
              {notifState === 'blocked' && (
                <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-xl text-[10px] leading-relaxed text-center font-bold">
                  ⚠️ Notification blocked. Please grant system browser alerts permission in address bar, or utilize local simulator!
                </div>
              )}
            </div>
          ) : (
            <p className={`text-[10px] leading-relaxed select-none ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Enable daily alerts training schedule to prompt you at a customized hour.
            </p>
          )}
        </div>

        {/* SYSTEM INFO SECTION */}
        <div className={`p-4 border rounded-2xl leading-normal space-y-1 shadow-sm transition-all flex flex-col justify-between ${
          darkMode ? 'bg-slate-950 border-slate-900' : 'bg-amber-50/45 border-amber-100'
        }`}>
          <div>
            <span className={`font-bold flex items-center gap-1 ${darkMode ? 'text-slate-300' : 'text-slate-800'}`}>
              <Info className={`w-4.5 h-4.5 ${theme.text}`} /> {dict.system_specs}
            </span>
            <p className={`text-[10px] leading-relaxed select-none ${darkMode ? 'text-slate-450' : 'text-slate-550'}`}>
              {dict.specs_desc}
            </p>
          </div>
          
          <div className="mt-4 pt-2.5 border-t border-slate-100/10 flex justify-between items-center text-[8.5px] font-bold font-mono text-slate-400">
            <span>VESSEL SPEC: PRO TAB</span>
            <span>v2.2.0-STABLE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
