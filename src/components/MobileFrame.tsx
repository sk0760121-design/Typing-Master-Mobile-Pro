import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Monitor, 
  Battery, 
  Wifi, 
  Signal, 
  Sparkles, 
  Tablet, 
  Copy, 
  Check, 
  AlertCircle, 
  QrCode, 
  ExternalLink,
  Laptop
} from 'lucide-react';

interface MobileFrameProps {
  children: React.ReactNode;
}

export default function MobileFrame({ children }: MobileFrameProps) {
  // Device Modes:
  // - 'blocked': The desktop enforcement screen (with QR code and bypass simulator buttons)
  // - 'native': Full-viewport edge-to-edge (for real mobile/tablet browsers & simulator frames)
  // - 'simulated_phone': Desktop simulated phone frame (iPhone Pro bezel)
  // - 'simulated_tablet': Desktop simulated tablet frame (iPad Pro bezel)
  const [deviceMode, setDeviceMode] = useState<'blocked' | 'native' | 'simulated_phone' | 'simulated_tablet'>('blocked');
  const [copied, setCopied] = useState(false);
  const [timeStr, setTimeStr] = useState("10:46 AM");
  const [appUrl, setAppUrl] = useState("https://ai.studio/build");

  // Determine current window location to populate QR Code link
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAppUrl(window.location.href);
    }
  }, []);

  // Detect physical device type on load & handle resize
  useEffect(() => {
    const detectDevice = () => {
      const ua = navigator.userAgent || navigator.vendor || (window as any).opera;
      const isMobileOS = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
      const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const isNarrow = window.innerWidth <= 1200;

      if (isMobileOS || isNarrow) {
        setDeviceMode('native');
      } else {
        // Laptop/desktop browser screen scale - show blocked layout first
        setDeviceMode('blocked');
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  // Local clock simulator for the virtual device status bars
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      let hrs = now.getHours();
      const min = now.getMinutes();
      const minsStr = min < 10 ? `0${min}` : min;
      const ampm = hrs >= 12 ? 'PM' : 'AM';
      hrs = hrs % 12;
      hrs = hrs ? hrs : 12; // 12-hour clock
      setTimeStr(`${hrs}:${minsStr} ${ampm}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Copy app link helper
  const handleCopyLink = () => {
    navigator.clipboard.writeText(appUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // 1. Native Fullscreen Immersive Mode (for authentic and clean mobile rendering)
  if (deviceMode === 'native') {
    return (
      <div id="native-fluid-wrapper" className="min-h-screen w-full bg-white flex flex-col justify-between overflow-x-hidden relative">
        {children}
      </div>
    );
  }

  // 2. Desktop Block Screen View (polite restriction requiring phone/tablet login scan)
  if (deviceMode === 'blocked') {
    return (
      <div id="desktop-restricted-portal" className="min-h-screen bg-slate-50 text-slate-800 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none animate-fade-in font-sans">
        
        {/* Ambient fluid aesthetic background patterns */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-85"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

        {/* Central Card layout */}
        <div className="w-full max-w-2xl bg-white/95 border border-slate-200/80 rounded-[32px] p-6 md:p-10 shadow-2xl relative z-10 flex flex-col md:flex-row gap-8 items-center animate-scale-up backdrop-blur-md">
          
          {/* Left Column: Premium Interactive Phone Illustration */}
          <div className="w-full md:w-5/12 flex flex-col items-center justify-center relative">
            <div className="w-48 h-96 bg-slate-900 rounded-[36px] border-[5px] border-slate-800 shadow-xl relative overflow-hidden flex flex-col justify-between p-3 select-none">
              
              {/* Phone Camera Notch notch and speaker */}
              <div className="w-20 h-4 bg-slate-800 rounded-b-xl mx-auto flex items-center justify-center">
                <div className="w-8 h-1 bg-slate-700 rounded-full mb-0.5"></div>
              </div>

              {/* Internal Mock interface preview typing */}
              <div className="flex-1 flex flex-col justify-center items-center text-center space-y-4 px-2">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xl shadow-md animate-bounce">
                  🚀
                </div>
                <div className="space-y-1">
                  <span className="block text-[10px] font-mono font-black text-indigo-500 uppercase tracking-widest">
                    TYPING MASTER
                  </span>
                  <span className="block text-[8px] text-slate-400 font-bold leading-normal">
                    FINGER VELOCITY 2.0
                  </span>
                </div>
                
                {/* Simulated keyboard characters keys mockup */}
                <div className="grid grid-cols-4 gap-1 w-full pt-4">
                  {['A','S','D','F','J','K','L',';'].map((k) => (
                    <div key={k} className="bg-slate-800 text-white text-[7px] font-mono p-1 rounded border border-slate-700 leading-none">
                      {k}
                    </div>
                  ))}
                </div>
              </div>

              {/* Mock home indicator */}
              <div className="w-16 h-1 bg-slate-700 rounded-full mx-auto mt-2"></div>
            </div>

            {/* Glowing rings representing wireless beacon aura */}
            <div className="absolute inset-0 bg-indigo-500/5 rounded-full filter blur-xl -z-10 animate-pulse"></div>
          </div>

          {/* Right Column: Blocking info alert & direct simulator triggers */}
          <div className="w-full md:w-7/12 flex flex-col justify-center space-y-6">
            
            <div className="space-y-2">
              <span className="text-[10px] font-mono font-black text-indigo-650 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full uppercase tracking-wider inline-block">
                🔒 Protected Device Restriction
              </span>
              <h2 className="text-xl md:text-2xl font-extrabold text-slate-800 tracking-tight leading-tight">
                Typing Master Mobile Pro
              </h2>
            </div>

            <div className="p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-650 leading-relaxed font-sans">
                <strong>Designed only for mobile and tablet devices.</strong> Please open this application on your smartphone or iPad/Tablet tool to experience highly reactive finger coordinates and touch optimization.
              </p>
            </div>

            {/* Interactive Vector QR Code generator with laser beam indicator */}
            <div className="flex items-center gap-4 bg-slate-50 border border-slate-150 p-3.5 rounded-2xl relative overflow-hidden">
              <div className="relative w-20 h-20 bg-white border border-slate-200 rounded-xl p-1.5 flex items-center justify-center shrink-0 shadow-inner group">
                
                {/* Laser scan animation line */}
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 to-indigo-500 shadow-md shadow-indigo-500/50 animate-bounce top-1 z-20"></div>

                {/* Simulated high-fidelity vector QR Code grids */}
                <svg className="w-16 h-16 text-slate-800" viewBox="0 0 24 24" fill="currentColor">
                  {/* Position detection markers */}
                  <path d="M1 1h6v6H1V1zm1 1v4h4V2H2z" />
                  <path d="M17 1h6v6h-6V1zm1 1v4h4V2h-4z" />
                  <path d="M1 17h6v6H1v-6zm1 1v4h4v-4H2z" />
                  {/* Randomized QR matrix dots */}
                  <rect x="3" y="3" width="2" height="2" />
                  <rect x="19" y="3" width="2" height="2" />
                  <rect x="3" y="19" width="2" height="2" />
                  <rect x="10" y="2" width="2" height="3" />
                  <rect x="14" y="5" width="2" height="2" />
                  <rect x="9" y="10" width="4" height="2" />
                  <rect x="15" y="10" width="3" height="3" />
                  <rect x="10" y="15" width="3" height="2" />
                  <rect x="16" y="16" width="3" height="4" />
                  <rect x="2" y="10" width="3" height="2" />
                  <rect x="5" y="13" width="2" height="3" />
                </svg>
              </div>

              <div className="flex-1 space-y-1">
                <span className="text-[9px] font-bold font-mono text-slate-400 uppercase tracking-widest block">
                  Quick Scan QR Code
                </span>
                <span className="text-xs text-slate-600 font-semibold block leading-tight">
                  Point camera to launch on phone
                </span>
                
                {/* Dynamic Copy Link utility */}
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="cursor-pointer text-[10px] text-indigo-650 hover:text-indigo-700 font-bold font-mono flex items-center gap-1 mt-1 transition-all"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-500" /> Copied Link!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy address url
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Sandbox Simulation Bypasser Controls */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5">
              <span className="block text-[9.5px] font-bold font-mono text-slate-400 uppercase tracking-wider text-center md:text-left">
                🛠️ Simulator Bypass (Design evaluation sandbox)
              </span>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeviceMode('simulated_phone')}
                  className="cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs py-2.5 px-4 rounded-xl shadow-md shadow-indigo-600/10 flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <Smartphone className="w-4 h-4 text-indigo-200" /> Simulate Phone
                </button>

                <button
                  type="button"
                  onClick={() => setDeviceMode('simulated_tablet')}
                  className="cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-200"
                >
                  <Tablet className="w-4 h-4 text-slate-500" /> Simulate Tablet
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // 3. Desktop Simulated Mobile or Tablet with dynamic device bezels and backgrounds
  const isTablet = deviceMode === 'simulated_tablet';

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-800 flex flex-col items-center justify-center p-3 sm:p-5 relative overflow-hidden select-none animate-fade-in font-sans">
      
      {/* Dynamic Slate desk space grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none opacity-85"></div>
      <div className="absolute top-10 left-10 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Pill control simulator controller panel */}
      <div className="z-25 flex justify-center items-center gap-1.5 mb-4 bg-white/95 px-2 py-1.5 rounded-2xl border border-slate-200/80 shadow-md">
        
        <span className="text-[9px] font-bold font-mono text-slate-400 uppercase border-r border-slate-200 pr-2.5 mr-1.5 select-none shrink-0">
          ⚙️ Workspace simulator:
        </span>

        <button
          onClick={() => setDeviceMode('simulated_phone')}
          className={`cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
            deviceMode === 'simulated_phone'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
              : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" /> Phone Frame
        </button>

        <button
          onClick={() => setDeviceMode('simulated_tablet')}
          className={`cursor-pointer inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase transition-all ${
            deviceMode === 'simulated_tablet'
              ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/10' 
              : 'bg-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Tablet className="w-3.5 h-3.5" /> Tablet Frame
        </button>

        <button
          onClick={() => setDeviceMode('blocked')}
          className="cursor-pointer inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-[10px] font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 transition-all uppercase"
        >
          <AlertCircle className="w-3.5 h-3.5" /> Blocker view
        </button>
      </div>

      {/* Active Device Bezel simulator frame */}
      <div 
        className={`relative z-10 w-full transition-all duration-300 shadow-[0_25px_60px_rgba(79,70,229,0.12)] bg-slate-900 border-[#cbd5e1] rounded-[48px] overflow-hidden flex flex-col justify-between ${
          isTablet
            ? 'max-w-[960px] min-h-[940px] aspect-[4/3] border-[10px] border-slate-850 p-4' // Tablet landscape/portrait hybrid optimized
            : 'max-w-[415px] min-h-[730px] aspect-[9/19] border-[8px] border-slate-750 p-3.5'   // Standard mobile template
        }`}
      >
        {/* Dynamic device camera element / notch */}
        {isTablet ? (
          // Tablet thin circular layout
          <div className="absolute top-3 left-1/2 transform -translate-x-1/2 w-3.5 h-3.5 bg-slate-800 rounded-full z-45 flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-slate-950 rounded-full"></div>
          </div>
        ) : (
          // Phone Pill camera notch and speaker structure
          <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-6 bg-slate-205/95 rounded-b-2xl z-40 flex items-center justify-center p-1">
            <div className="w-16 h-1 bg-slate-350 rounded-full mb-1"></div>
            <div className="w-3 h-3 bg-slate-400 rounded-full absolute right-6"></div>
          </div>
        )}

        {/* Dynamic Device OS Status Bar */}
        <div className="z-30 flex justify-between items-center px-6 pt-3 pb-2 text-[10px] font-semibold text-slate-400 select-none">
          <span>{timeStr}</span>
          <div className="flex items-center gap-2">
            <Signal className="w-3.5 h-3.5" />
            <span className="text-[9px] font-bold">5G LTE</span>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4 text-indigo-400" />
          </div>
        </div>

        {/* Dynamic Inner Fullscreen Viewport Screen */}
        <div className="flex-1 bg-white rounded-[32px] overflow-hidden relative border border-slate-200/40 flex flex-col justify-between text-slate-800">
          <div className="flex-1 overflow-y-auto scrollbar-none scroll-smooth flex flex-col p-4 bg-white">
            {children}
          </div>
        </div>

        {/* Dynamic physical home slider line bar indicator */}
        <div className="py-2 flex justify-center z-40 relative">
          <div className="w-28 h-1 bg-slate-650 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
