// Procedural Web Audio API Sound Generator for Alpine Haven
// No external MP3/audio files needed - completely reliable and zero latency!

class NatureAudioSystem {
  constructor() {
    this.ctx = null;
    this.isPlaying = false;
    this.volume = 0.5;
    this.masterGain = null;
    this.riverGain = null;
    this.windGain = null;
    this.natureGain = null;
    this.timeOfDay = 'day'; // 'day', 'sunset', 'night'
    this.chirpInterval = null;
  }

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    this.ctx = new AudioContext();

    // Master Gain
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);

    // 1. River Stream Sound
    this.setupRiverSound();

    // 2. Mountain Wind / Breeze Sound
    this.setupWindSound();

    // 3. Ambient Wildlife (Birds & Crickets)
    this.setupNatureSounds();
  }

  createNoiseBuffer(seconds = 5) {
    const bufferSize = this.ctx.sampleRate * seconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Pink-ish noise
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.05;
      b6 = white * 0.115926;
    }
    return buffer;
  }

  setupRiverSound() {
    const noiseBuffer = this.createNoiseBuffer(6);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    // Dual bandpass filter for bubbling water resonance
    const filter1 = this.ctx.createBiquadFilter();
    filter1.type = 'bandpass';
    filter1.frequency.setValueAtTime(480, this.ctx.currentTime);
    filter1.Q.setValueAtTime(2.2, this.ctx.currentTime);

    const filter2 = this.ctx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.setValueAtTime(1100, this.ctx.currentTime);

    // LFO for bubbling ebb and flow
    const lfo = this.ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.35, this.ctx.currentTime);

    const lfoGain = this.ctx.createGain();
    lfoGain.gain.setValueAtTime(70, this.ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(filter1.frequency);

    this.riverGain = this.ctx.createGain();
    this.riverGain.gain.setValueAtTime(0.4, this.ctx.currentTime);

    noiseSource.connect(filter1);
    filter1.connect(filter2);
    filter2.connect(this.riverGain);
    this.riverGain.connect(this.masterGain);

    noiseSource.start();
    lfo.start();
  }

  setupWindSound() {
    const noiseBuffer = this.createNoiseBuffer(8);
    const noiseSource = this.ctx.createBufferSource();
    noiseSource.buffer = noiseBuffer;
    noiseSource.loop = true;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(280, this.ctx.currentTime);
    filter.Q.setValueAtTime(3.0, this.ctx.currentTime);

    // Slow wind gust LFO
    const windLfo = this.ctx.createOscillator();
    windLfo.type = 'sine';
    windLfo.frequency.setValueAtTime(0.12, this.ctx.currentTime);

    const windLfoGain = this.ctx.createGain();
    windLfoGain.gain.setValueAtTime(120, this.ctx.currentTime);
    windLfo.connect(windLfoGain);
    windLfoGain.connect(filter.frequency);

    this.windGain = this.ctx.createGain();
    this.windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    noiseSource.connect(filter);
    filter.connect(this.windGain);
    this.windGain.connect(this.masterGain);

    noiseSource.start();
    windLfo.start();
  }

  setupNatureSounds() {
    this.natureGain = this.ctx.createGain();
    this.natureGain.gain.setValueAtTime(0.2, this.ctx.currentTime);
    this.natureGain.connect(this.masterGain);

    // Periodically trigger birds or crickets depending on time of day
    this.scheduleNextNatureSound();
  }

  scheduleNextNatureSound() {
    if (this.chirpInterval) clearTimeout(this.chirpInterval);
    const delay = 2500 + Math.random() * 4500;
    this.chirpInterval = setTimeout(() => {
      if (this.isPlaying && this.ctx && this.ctx.state === 'running') {
        if (this.timeOfDay === 'night') {
          this.playCricketChirp();
        } else {
          this.playBirdTweet();
        }
      }
      this.scheduleNextNatureSound();
    }, delay);
  }

  playBirdTweet() {
    if (!this.ctx || !this.natureGain) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    const baseFreq = 2200 + Math.random() * 800;
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, now + 0.08);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.9, now + 0.18);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.04, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.22);

    osc.connect(gain);
    gain.connect(this.natureGain);

    osc.start(now);
    osc.stop(now + 0.25);
  }

  playCricketChirp() {
    if (!this.ctx || !this.natureGain) return;
    const now = this.ctx.currentTime;
    for (let i = 0; i < 3; i++) {
      const t = now + i * 0.06;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(4500 + Math.random() * 300, t);
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.025, t + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.045);
      osc.connect(gain);
      gain.connect(this.natureGain);
      osc.start(t);
      osc.stop(t + 0.05);
    }
  }

  toggle() {
    if (!this.ctx) {
      this.init();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }

    this.isPlaying = !this.isPlaying;
    const now = this.ctx.currentTime;
    if (this.isPlaying) {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(this.volume, now + 0.8);
    } else {
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, now);
      this.masterGain.gain.linearRampToValueAtTime(0, now + 0.5);
    }
    return this.isPlaying;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx && this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(this.volume, this.ctx.currentTime, 0.05);
    }
  }

  setTimeOfDay(time) {
    this.timeOfDay = time;
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    if (time === 'night') {
      if (this.windGain) this.windGain.gain.setTargetAtTime(0.35, now, 1.0);
      if (this.riverGain) this.riverGain.gain.setTargetAtTime(0.35, now, 1.0);
    } else {
      if (this.windGain) this.windGain.gain.setTargetAtTime(0.2, now, 1.0);
      if (this.riverGain) this.riverGain.gain.setTargetAtTime(0.4, now, 1.0);
    }
  }

  destroy() {
    if (this.chirpInterval) clearTimeout(this.chirpInterval);
    if (this.ctx) {
      try {
        this.ctx.close();
      } catch {
        // ignore
      }
      this.ctx = null;
    }
  }
}

export const natureAudio = new NatureAudioSystem();
