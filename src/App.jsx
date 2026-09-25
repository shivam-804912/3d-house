import React, { useEffect, useRef, useState } from 'react';
import { WorldScene } from './scene/WorldScene.js';
import { natureAudio } from './scene/audio.js';
import UIOverlay from './components/UIOverlay.jsx';
import { Mountain } from 'lucide-react';

export default function App() {
  const mountRef = useRef(null);
  const worldRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [timeOfDay, setTimeOfDay] = useState('day');
  const [weather, setWeather] = useState('clear');
  const [cameraPreset, setCameraPreset] = useState('panorama');
  const [houseLights, setHouseLights] = useState(true);
  const [smokeActive, setSmokeActive] = useState(true);
  const [autoOrbit, setAutoOrbit] = useState(false);

  // Audio State
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.45);

  // Interactive landmark popover
  const [activeLandmark, setActiveLandmark] = useState(null);

  // Initialize Three.js scene
  useEffect(() => {
    if (!mountRef.current) return;

    // Small delay to ensure container dimensions are ready
    const timer = setTimeout(() => {
      try {
        const world = new WorldScene(mountRef.current, (landmarkData) => {
          setActiveLandmark(landmarkData);
        });
        worldRef.current = world;
        setLoading(false);
      } catch (err) {
        console.error("Error creating 3D World Scene:", err);
        setLoading(false);
      }
    }, 150);

    return () => {
      clearTimeout(timer);
      if (worldRef.current) {
        worldRef.current.destroy();
        worldRef.current = null;
      }
      natureAudio.destroy();
    };
  }, []);

  // Sync Time of Day
  const handleTimeOfDayChange = (newTime) => {
    setTimeOfDay(newTime);
    if (worldRef.current) {
      worldRef.current.setTimeOfDay(newTime);
    }
    natureAudio.setTimeOfDay(newTime);
  };

  // Sync Weather
  const handleWeatherChange = (newWeather) => {
    setWeather(newWeather);
    if (worldRef.current) {
      worldRef.current.setWeather(newWeather);
    }
  };

  // Sync Camera Presets
  const handleCameraPresetChange = (preset) => {
    setCameraPreset(preset);
    setAutoOrbit(false);
    if (worldRef.current) {
      worldRef.current.setCameraPreset(preset);
    }
  };

  // Sync House Lights
  const handleHouseLightsToggle = (enabled) => {
    setHouseLights(enabled);
    if (worldRef.current) {
      worldRef.current.toggleHouseLights(enabled);
    }
  };

  // Sync Smoke
  const handleSmokeToggle = (enabled) => {
    setSmokeActive(enabled);
    if (worldRef.current) {
      worldRef.current.toggleSmoke(enabled);
    }
  };

  // Sync Auto Orbit
  const handleAutoOrbitToggle = (enabled) => {
    setAutoOrbit(enabled);
    if (worldRef.current) {
      worldRef.current.toggleAutoOrbit(enabled);
    }
  };

  // Sync Audio Toggle
  const handleToggleAudio = () => {
    const isNowPlaying = natureAudio.toggle();
    setAudioPlaying(isNowPlaying);
  };

  // Sync Audio Volume
  const handleVolumeChange = (newVol) => {
    setVolume(newVol);
    natureAudio.setVolume(newVol);
  };

  return (
    <div className="fixed inset-0 w-full h-full min-h-[100dvh] max-h-[100dvh] overflow-hidden bg-slate-950 font-sans select-none touch-none">
      {/* Three.js 3D WebGL Canvas Mount */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none select-none" />

      {/* Loading Screen */}
      {loading && (
        <div className="absolute inset-0 bg-slate-950 flex flex-col items-center justify-center gap-4 text-white z-50 transition-opacity duration-700">
          <div className="relative">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-500 via-emerald-500 to-sky-400 animate-spin flex items-center justify-center p-0.5">
              <div className="w-full h-full bg-slate-950 rounded-3xl flex items-center justify-center">
                <Mountain className="w-7 h-7 text-emerald-400" />
              </div>
            </div>
          </div>
          <div className="text-center">
            <h2 className="text-lg font-bold font-heading tracking-wide">
              Crafting Alpine Haven 3D
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Sculpting mountain ridges, carving riverbed, building timber chalet...
            </p>
          </div>
        </div>
      )}

      {/* UI Overlay */}
      {!loading && (
        <UIOverlay
          timeOfDay={timeOfDay}
          setTimeOfDay={handleTimeOfDayChange}
          weather={weather}
          setWeather={handleWeatherChange}
          cameraPreset={cameraPreset}
          setCameraPreset={handleCameraPresetChange}
          houseLights={houseLights}
          setHouseLights={handleHouseLightsToggle}
          smokeActive={smokeActive}
          setSmokeActive={handleSmokeToggle}
          autoOrbit={autoOrbit}
          setAutoOrbit={handleAutoOrbitToggle}
          audioPlaying={audioPlaying}
          toggleAudio={handleToggleAudio}
          volume={volume}
          setVolume={handleVolumeChange}
          activeLandmark={activeLandmark}
          setActiveLandmark={setActiveLandmark}
        />
      )}
    </div>
  );
}
