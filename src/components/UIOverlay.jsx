import React, { useState, useEffect } from 'react';
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
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
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
  const [isUiVisible, setIsUiVisible] = useState(true);
  const [isDockCollapsed, setIsDockCollapsed] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [canFullscreen, setCanFullscreen] = useState(false);

  useEffect(() => {
    // Check if fullscreen API is supported on current device/browser
    const supported = !!(
      document.fullscreenEnabled ||
      document.webkitFullscreenEnabled ||
      document.mozFullScreenEnabled ||
      document.msFullscreenEnabled
    );
    setCanFullscreen(supported);

    const handleFullscreenChange = () => {
      setIsFullscreen(
        !!(
          document.fullscreenElement ||
          document.webkitFullscreenElement ||
          document.mozFullScreenElement
        )
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullscreen = () => {
    try {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen().catch(() => {});
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen().catch(() => {});
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
      }
    } catch {
      // Ignore fullscreen permission rejections
    }
  };

  const cameraOptions = [
    { id: 'panorama', label: 'Valley Vista', shortLabel: 'Vista', icon: <Compass className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'chalet', label: 'Cozy Chalet', shortLabel: 'Chalet', icon: <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'river', label: 'River & Pier', shortLabel: 'River', icon: <Waves className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'bridge', label: 'Footbridge', shortLabel: 'Bridge', icon: <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
    { id: 'summit', label: 'Eagle Summit', shortLabel: 'Summit', icon: <Mountain className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-2.5 sm:p-5 select-none overflow-hidden font-sans safe-top safe-bottom safe-left safe-right">
      {/* Top Header Bar */}
      <header
        className={`flex items-center justify-between gap-2 pointer-events-auto transition-all duration-300 ${
          isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-6 pointer-events-none'
        }`}
      >
        {/* Brand / Logo Card */}
        <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/75 backdrop-blur-xl border border-white/10 px-2.5 py-1.5 sm:px-3.5 sm:py-2.5 rounded-2xl shadow-2xl text-white max-w-[65%] sm:max-w-none">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-sky-400 flex items-center justify-center shrink-0 shadow-md shadow-emerald-500/20">
            <Mountain className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base font-bold tracking-tight text-white font-heading truncate">
                ALPENHAVEN
              </h1>
              <span className="text-[9px] sm:text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                <span className="hidden sm:inline">Three.js </span>3D
              </span>
            </div>
            <p className="hidden sm:block text-[11px] sm:text-xs text-slate-300/80 font-medium truncate">
              Chalet, Mountain Ridge & Living River
            </p>
          </div>
        </div>

        {/* Top Right Quick Controls */}
        <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/75 backdrop-blur-xl border border-white/10 p-1 sm:p-1.5 rounded-2xl shadow-2xl text-white">
          {/* Audio Synthesizer Toggle */}
          <div className="relative flex items-center">
            <button
              onClick={toggleAudio}
              className={`p-1.5 sm:p-2 rounded-xl transition-all ${
                audioPlaying
                  ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 shadow-sm shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
              title={audioPlaying ? 'Mute Procedural Stream & Nature Audio' : 'Play Nature & River Audio'}
              aria-label="Toggle Audio"
            >
              {audioPlaying ? <Volume2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /> : <VolumeX className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
            </button>

            {/* Quick volume trigger on touch / mobile */}
            {audioPlaying && (
              <div className="hidden sm:flex items-center ml-1.5 pr-1">
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={volume}
                  onChange={(e) => setVolume(parseFloat(e.target.value))}
                  className="w-14 sm:w-16 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  title="Audio Volume"
                  aria-label="Volume slider"
                />
              </div>
            )}
          </div>

          <div className="w-px h-4 sm:h-5 bg-white/10 my-auto" />

          {/* Cinematic Auto-Orbit */}
          <button
            onClick={() => setAutoOrbit(!autoOrbit)}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
              autoOrbit
                ? 'bg-sky-500/30 text-sky-200 border border-sky-500/40 shadow-sm'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
            title="Toggle Cinematic Auto-Orbit"
            aria-label="Toggle Auto Orbit"
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoOrbit ? 'animate-spin' : ''}`} />
            <span className="hidden md:inline">Orbit</span>
          </button>

          {/* Help Instructions */}
          <button
            onClick={() => setShowHelp(true)}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            title="3D Navigation & Controls Guide"
            aria-label="Controls guide"
          >
            <Info className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Zen / Immersion Mode Toggle (Hide UI) */}
          <button
            onClick={() => setIsUiVisible(false)}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
            title="Hide Interface (Zen Mode)"
            aria-label="Hide UI"
          >
            <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </button>

          {/* Fullscreen Toggle (if supported by browser) */}
          {canFullscreen && (
            <button
              onClick={toggleFullscreen}
              className="p-1.5 sm:p-2 text-slate-300 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
              title="Toggle Fullscreen"
              aria-label="Toggle Fullscreen"
            >
              {isFullscreen ? (
                <Minimize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </button>
          )}
        </div>
      </header>

      {/* Floating Restore UI Button (When in Zen Mode) */}
      {!isUiVisible && (
        <button
          onClick={() => setIsUiVisible(true)}
          className="pointer-events-auto fixed top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-2 bg-slate-950/80 backdrop-blur-xl border border-white/20 text-white px-3.5 py-2 rounded-2xl shadow-2xl hover:bg-slate-900 transition-all text-xs font-semibold animate-in fade-in zoom-in-95 duration-200"
          title="Show Interface Controls"
        >
          <Eye className="w-4 h-4 text-emerald-400" />
          <span>Show Controls</span>
        </button>
      )}

      {/* Middle Interactive Landmark Popover Card */}
      {activeLandmark && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 pointer-events-auto z-40 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={() => setActiveLandmark(null)}
        >
          <div
            className="max-w-sm w-full bg-slate-950/90 backdrop-blur-2xl border border-white/20 p-5 rounded-3xl shadow-2xl text-white animate-in fade-in zoom-in-95 duration-200 max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
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
                aria-label="Close"
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
                className="w-full py-2.5 px-3 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                Explore Landscape
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 pointer-events-auto z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
        >
          <div
            className="max-w-md w-full bg-slate-950/90 backdrop-blur-2xl border border-white/20 p-5 sm:p-6 rounded-3xl shadow-2xl text-white max-h-[85dvh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center text-sky-400">
                  <Info className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-heading">3D Navigation & Controls</h3>
                  <p className="text-[11px] text-slate-400">Touch and mouse gestures</p>
                </div>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-white/10 transition-colors"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-300">
              <li className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-2xl border border-white/5">
                <span className="px-2 py-1 rounded-lg bg-white/10 text-white font-mono text-[10px] shrink-0">
                  🖱️ 1-Finger / Drag
                </span>
                <span>Orbit and rotate 360° around the valley and chalet</span>
              </li>
              <li className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-2xl border border-white/5">
                <span className="px-2 py-1 rounded-lg bg-white/10 text-white font-mono text-[10px] shrink-0">
                  🤏 Pinch / Scroll
                </span>
                <span>Zoom smoothly in and out towards mountain peaks and river</span>
              </li>
              <li className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-2xl border border-white/5">
                <span className="px-2 py-1 rounded-lg bg-white/10 text-white font-mono text-[10px] shrink-0">
                  ✌️ 2-Finger / Right Drag
                </span>
                <span>Pan camera view across the landscape</span>
              </li>
              <li className="flex items-start gap-2.5 bg-white/5 p-2.5 rounded-2xl border border-white/5">
                <span className="px-2 py-1 rounded-lg bg-white/10 text-white font-mono text-[10px] shrink-0">
                  👆 Tap / Click
                </span>
                <span>Tap on the Chalet, River Pier, or Bridge to inspect</span>
              </li>
            </ul>

            <button
              onClick={() => setShowHelp(false)}
              className="w-full mt-5 py-2.5 rounded-2xl bg-sky-500 hover:bg-sky-400 font-semibold text-xs text-white shadow-lg shadow-sky-500/25 transition-all"
            >
              Start Exploring!
            </button>
          </div>
        </div>
      )}

      {/* Bottom Main Interactive Control Hub */}
      <footer
        className={`pointer-events-auto flex flex-col items-center gap-2 sm:gap-2.5 max-w-full transition-all duration-300 ${
          isUiVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        {/* Quick Landmark Buttons (Clean Horizontal Scrollable Chips) */}
        <div className="w-full flex items-center justify-center">
          <div className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/75 backdrop-blur-xl border border-white/10 p-1 sm:p-1.5 rounded-2xl shadow-xl overflow-x-auto no-scrollbar max-w-[95vw] sm:max-w-full">
            {cameraOptions.map((opt) => {
              const isActive = cameraPreset === opt.id;
              return (
                <button
                  key={opt.id}
                  onClick={() => setCameraPreset(opt.id)}
                  className={`flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold whitespace-nowrap transition-all shrink-0 ${
                    isActive
                      ? 'bg-white text-slate-900 shadow-md shadow-white/20 font-bold scale-[1.02]'
                      : 'text-slate-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {opt.icon}
                  <span className="hidden xs:inline">{opt.label}</span>
                  <span className="xs:hidden">{opt.shortLabel}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Floating Master Environment & Atmosphere Hub */}
        <div className="w-full flex flex-col items-center">
          {/* Optional collapse toggle pill for ultra small screens */}
          <div className="sm:hidden mb-1">
            <button
              onClick={() => setIsDockCollapsed(!isDockCollapsed)}
              className="flex items-center gap-1 px-3 py-0.5 rounded-full bg-slate-950/70 border border-white/10 text-[10px] text-slate-300 font-medium backdrop-blur-md"
            >
              <span>{isDockCollapsed ? 'Show Controls' : 'Minimize'}</span>
              {isDockCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>
          </div>

          {!isDockCollapsed && (
            <div className="bg-slate-950/80 backdrop-blur-2xl border border-white/15 px-3 py-2 sm:px-4 sm:py-2.5 rounded-3xl shadow-2xl text-white flex flex-wrap items-center justify-center gap-2 sm:gap-4 max-w-[96vw] sm:max-w-none">
              {/* Atmosphere (Day / Sunset / Night) */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-0.5 hidden lg:inline">
                  Atmosphere:
                </span>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                  <button
                    onClick={() => setTimeOfDay('day')}
                    className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                      timeOfDay === 'day'
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/25 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Sunny Daylight"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Day</span>
                  </button>
                  <button
                    onClick={() => setTimeOfDay('sunset')}
                    className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                      timeOfDay === 'sunset'
                        ? 'bg-gradient-to-r from-orange-500 to-rose-500 text-white shadow-md shadow-rose-500/25 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Golden Sunset"
                  >
                    <Sunset className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Sunset</span>
                  </button>
                  <button
                    onClick={() => setTimeOfDay('night')}
                    className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                      timeOfDay === 'night'
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 font-bold'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Starry Night & Fireflies"
                  >
                    <Moon className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Night</span>
                  </button>
                </div>
              </div>

              <div className="w-px h-5 bg-white/15 hidden xs:block" />

              {/* Weather (Clear / Rain) */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-0.5 hidden lg:inline">
                  Weather:
                </span>
                <div className="flex items-center bg-white/5 border border-white/10 rounded-2xl p-0.5 sm:p-1 gap-0.5 sm:gap-1">
                  <button
                    onClick={() => setWeather('clear')}
                    className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                      weather === 'clear'
                        ? 'bg-sky-400 text-slate-950 font-bold shadow-md shadow-sky-400/20'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Clear Sky"
                  >
                    <Sun className="w-3.5 h-3.5" />
                    <span>Clear</span>
                  </button>
                  <button
                    onClick={() => setWeather('rain')}
                    className={`flex items-center gap-1 px-2 py-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-[11px] sm:text-xs font-semibold transition-all ${
                      weather === 'rain'
                        ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/30'
                        : 'text-slate-300 hover:text-white hover:bg-white/10'
                    }`}
                    title="Gentle Rain & Mist"
                  >
                    <CloudRain className="w-3.5 h-3.5" />
                    <span>Rain</span>
                  </button>
                </div>
              </div>

              <div className="w-px h-5 bg-white/15 hidden sm:block" />

              {/* Chalet Features (Lights & Hearth Smoke) */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                {/* Interior Lights Toggle */}
                <button
                  onClick={() => setHouseLights(!houseLights)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold border transition-all ${
                    houseLights
                      ? 'bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle Chalet Interior & Porch Lights"
                >
                  <Lightbulb className={`w-3.5 h-3.5 ${houseLights ? 'fill-amber-300 text-amber-400' : ''}`} />
                  <span className="hidden xs:inline">Lights</span>
                </button>

                {/* Chimney Fire & Smoke Toggle */}
                <button
                  onClick={() => setSmokeActive(!smokeActive)}
                  className={`flex items-center gap-1 px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl sm:rounded-2xl text-[11px] sm:text-xs font-semibold border transition-all ${
                    smokeActive
                      ? 'bg-orange-500/20 text-orange-300 border-orange-500/40 shadow-sm'
                      : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'
                  }`}
                  title="Toggle Hearth Chimney Smoke"
                >
                  <Flame className={`w-3.5 h-3.5 ${smokeActive ? 'fill-orange-400 text-orange-400' : ''}`} />
                  <span className="hidden xs:inline">Hearth</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
