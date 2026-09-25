import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Sunset,
  CloudRain,
  Volume2,
  VolumeX,
  Home,
  Compass,
  Mountain,
  Waves,
  Lightbulb,
  Flame,
  RotateCw,
  Maximize2,
  Minimize2,
  Sparkles,
  Info,
  X
} from 'lucide-react';

export default function UIOverlay({
  timeOfDay,
  setTimeOfDay,
  weather,
  setWeather,
  cameraPreset,
  setCameraPreset,
  houseLights,
  setHouseLights,
  smokeActive,
  setSmokeActive,
  autoOrbit,
  setAutoOrbit,
  audioPlaying,
  toggleAudio,
  volume,
  setVolume,
  activeLandmark,
  setActiveLandmark,
}) {
  const [showHelp, setShowHelp] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        setIsFullscreen(false);
      }
    }
  };

  const cameraOptions = [
    { id: 'panorama', label: 'Valley Vista', icon: <Compass className="w-4 h-4" /> },
    { id: 'chalet', label: 'Cozy Chalet', icon: <Home className="w-4 h-4" /> },
    { id: 'river', label: 'River & Pier', icon: <Waves className="w-4 h-4" /> },
    { id: 'bridge', label: 'Footbridge', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'summit', label: 'Eagle Summit', icon: <Mountain className="w-4 h-4" /> },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-4 sm:p-6 select-none overflow-hidden font-sans">
      {/* Top Navigation Bar */}
      <header className="flex items-center justify-between pointer-events-auto">
        {/* Brand / Title Card */}
        <div className="flex items-center gap-3 bg-slate-950/65 backdrop-blur-md border border-white/10 px-4 py-2.5 rounded-2xl shadow-2xl text-white">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-sky-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <Mountain className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white font-heading">
                ALPENHAVEN
              </h1>
              <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Three.js 3D
              </span>
            </div>
            <p className="text-xs text-slate-300/80 font-medium">
              Chalet, Mountain Ridge & Living River
            </p>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-2 bg-slate-950/65 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-2xl text-white">
          {/* Audio Synthesizer Toggle */}
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl hover:bg-white/5 transition-colors">
            <button
              onClick={toggleAudio}
              className={`p-1.5 rounded-lg transition-all ${
                audioPlaying
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
              title={audioPlaying ? 'Mute Procedural Stream & Nature Audio' : 'Play Nature & River Audio'}
            >
              {audioPlaying ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {audioPlaying && (
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                title="Audio Volume"
              />
            )}
          </div>

          <div className="w-px h-5 bg-white/10 my-auto" />

          {/* Cinematic Auto-Orbit */}
          <button
            onClick={() => setAutoOrbit(!autoOrbit)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              autoOrbit
                ? 'bg-sky-500/30 text-sky-200 border border-sky-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Cinematic Orbit Camera"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoOrbit ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Orbit</span>
          </button>

          {/* Help Instructions */}
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            title="Camera Controls Guide"
          >
            <Info className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={toggleFullscreen}
            className="p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            title="Toggle Fullscreen"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Middle Interactive Landmark Popover Card */}
      {activeLandmark && (
        <div className="self-center pointer-events-auto max-w-sm w-full mx-4 bg-slate-950/80 backdrop-blur-xl border border-white/15 p-5 rounded-3xl shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeLandmark.icon}</span>
              <div>
                <h3 className="font-bold text-base text-white tracking-wide font-heading">
                  {activeLandmark.name}
                </h3>
                <span className="text-[11px] text-amber-400 font-medium">Landmark Highlight</span>
              </div>
            </div>
            <button
              onClick={() => setActiveLandmark(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed mt-2 mb-4">
            {activeLandmark.desc}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setActiveLandmark(null)}
              className="w-full py-2 px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="self-center pointer-events-auto max-w-md w-full mx-4 bg-slate-950/85 backdrop-blur-xl border border-white/15 p-6 rounded-3xl shadow-2xl text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Info className="w-5 h-5 text-sky-400" />
              <h3 className="font-bold text-base font-heading">3D Navigation & Controls</h3>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ul className="space-y-2.5 text-xs text-slate-300">
            <li className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white font-mono text-[11px]">🖱️ Left Drag</span>
              <span>Rotate & orbit camera 360° around the valley</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white font-mono text-[11px]">📜 Scroll</span>
              <span>Smoothly zoom in / out towards mountains & house</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white font-mono text-[11px]">🖱️ Right Drag</span>
              <span>Pan camera position sideways and vertically</span>
            </li>
            <li className="flex items-center gap-2">
              <span className="px-2 py-1 rounded bg-white/10 text-white font-mono text-[11px]">👆 Click World</span>
              <span>Click on Chalet, Bridge, Pier, or Peaks to inspect & focus</span>
            </li>
          </ul>
          <button
            onClick={() => setShowHelp(false)}
            className="w-full mt-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 font-semibold text-xs text-white shadow-lg shadow-sky-500/25 transition-all"
          >
            Got it, Let's Explore!
          </button>
        </div>
      )}

      {/* Bottom Main Interactive Control Dock */}
      <footer className="pointer-events-auto flex flex-col items-center gap-3">
        {/* Quick Landmark Buttons */}
        <div className="flex items-center gap-1.5 bg-slate-950/70 backdrop-blur-md border border-white/10 p-1.5 rounded-2xl shadow-xl overflow-x-auto max-w-full">
          {cameraOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setCameraPreset(opt.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                cameraPreset === opt.id
                  ? 'bg-white text-slate-900 shadow-md shadow-white/10 font-bold'
                  : 'text-slate-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {opt.icon}
              <span>{opt.label}</span>
            </button>
          ))}
        </div>

        {/* Floating Glassmorphic Master Hub */}
        <div className="bg-slate-950/80 backdrop-blur-xl border border-white/15 px-4 py-3 rounded-3xl shadow-2xl text-white flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Time of Day Cycle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Atmosphere:
            </span>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setTimeOfDay('day')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeOfDay === 'day'
                    ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Sunny Daylight"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Day</span>
              </button>
              <button
                onClick={() => setTimeOfDay('sunset')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeOfDay === 'sunset'
                    ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-rose-500/25'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Golden Sunset"
              >
                <Sunset className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Sunset</span>
              </button>
              <button
                onClick={() => setTimeOfDay('night')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  timeOfDay === 'night'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
                title="Starry Night & Fireflies"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden md:inline">Night</span>
              </button>
            </div>
          </div>

          <div className="w-px h-6 bg-white/15 hidden sm:block" />

          {/* Weather Toggle */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1 hidden sm:inline">
              Weather:
            </span>
            <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-1 gap-1">
              <button
                onClick={() => setWeather('clear')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  weather === 'clear'
                    ? 'bg-sky-400 text-slate-950 font-bold'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
              <button
                onClick={() => setWeather('rain')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  weather === 'rain'
                    ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <CloudRain className="w-3.5 h-3.5" />
                <span>Rain</span>
              </button>
            </div>
          </div>

          <div className="w-px h-6 bg-white/15 hidden md:block" />

          {/* Chalet Features (Lights & Hearth Smoke) */}
          <div className="flex items-center gap-1.5">
            {/* Interior Lights Toggle */}
            <button
              onClick={() => setHouseLights(!houseLights)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
                houseLights
                  ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Toggle House Interior & Porch Lights"
            >
              <Lightbulb className={`w-3.5 h-3.5 ${houseLights ? 'fill-amber-300 text-amber-400' : ''}`} />
              <span className="hidden sm:inline">Lights</span>
            </button>

            {/* Chimney Fire & Smoke Toggle */}
            <button
              onClick={() => setSmokeActive(!smokeActive)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition-all ${
                smokeActive
                  ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
                  : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
              }`}
              title="Toggle Hearth Chimney Smoke"
            >
              <Flame className={`w-3.5 h-3.5 ${smokeActive ? 'fill-orange-400 text-orange-400' : ''}`} />
              <span className="hidden sm:inline">Hearth</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
