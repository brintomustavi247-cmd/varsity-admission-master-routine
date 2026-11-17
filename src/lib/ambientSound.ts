import type { AmbientSoundType } from '../types/timer';

let audioCtx: AudioContext | null = null;
let currentSourceNode: AudioNode | null = null;
let currentGainNode: GainNode | null = null;
let currentLfoTimer: number | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!Ctx) return null;
  if (!audioCtx) {
    audioCtx = new Ctx();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function stopAmbientSound() {
  if (currentLfoTimer) {
    window.clearInterval(currentLfoTimer);
    currentLfoTimer = null;
  }
  if (currentGainNode && audioCtx) {
    try {
      currentGainNode.gain.linearRampToValueAtTime(0.001, audioCtx.currentTime + 0.3);
    } catch {
      // Ignore
    }
  }
  setTimeout(() => {
    try {
      if (currentSourceNode) {
        if ('stop' in currentSourceNode && typeof (currentSourceNode as AudioScheduledSourceNode).stop === 'function') {
          (currentSourceNode as AudioScheduledSourceNode).stop();
        }
        currentSourceNode.disconnect();
        currentSourceNode = null;
      }
      if (currentGainNode) {
        currentGainNode.disconnect();
        currentGainNode = null;
      }
    } catch {
      // Ignore
    }
  }, 350);
}

export function playAmbientSound(type: AmbientSoundType, volume: number = 0.35) {
  stopAmbientSound();
  if (type === 'none') return;

  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime + 0.8);
    gainNode.connect(ctx.destination);
    currentGainNode = gainNode;

    const bufferSize = ctx.sampleRate * 4; // 4 seconds looping buffer
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);

    if (type === 'rain') {
      // Soft pinkish rain noise
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.18;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1100, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      noiseSource.start();
      currentSourceNode = noiseSource;
    } else if (type === 'waves') {
      // Ocean waves with swell modulation
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.02 * white) / 1.02;
        data[i] = lastOut * 3.5;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      // Wave swell LFO
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      lfo.frequency.setValueAtTime(0.18, ctx.currentTime); // 1 wave every ~5.5s
      lfoGain.gain.setValueAtTime(300, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      lfo.start();

      noiseSource.connect(filter);
      filter.connect(gainNode);
      noiseSource.start();
      currentSourceNode = noiseSource;
    } else if (type === 'cafe') {
      // Cozy warm brown rumble
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        lastOut = (lastOut + 0.015 * white) / 1.015;
        data[i] = lastOut * 2.8;
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      noiseSource.connect(filter);
      filter.connect(gainNode);
      noiseSource.start();
      currentSourceNode = noiseSource;
    } else if (type === 'ticking') {
      // Clock ticking every 1 second
      const tick = () => {
        if (!audioCtx || audioCtx.state !== 'running') return;
        try {
          const osc = audioCtx.createOscillator();
          const tickGain = audioCtx.createGain();
          const t = audioCtx.currentTime;
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200, t);
          osc.frequency.exponentialRampToValueAtTime(300, t + 0.03);
          tickGain.gain.setValueAtTime(0.001, t);
          tickGain.gain.linearRampToValueAtTime(volume * 0.45, t + 0.005);
          tickGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.04);
          osc.connect(tickGain);
          tickGain.connect(audioCtx.destination);
          osc.start(t);
          osc.stop(t + 0.05);
        } catch {
          // Ignore
        }
      };

      tick();
      currentLfoTimer = window.setInterval(tick, 1000);
    }
  } catch (err) {
    console.warn('Failed to start ambient sound:', err);
  }
}

/**
 * Plays a triumphant, gentle celebration chime when Pomodoro study time finishes!
 */
export function playTimerFinishFanfare() {
  const ctx = getAudioContext();
  if (!ctx) return;

  try {
    const now = ctx.currentTime;
    // Ascending celebratory arpeggio (G4 -> B4 -> D5 -> G5)
    const freqs = [392.0, 493.88, 587.33, 783.99, 987.77];
    freqs.forEach((freq, idx) => {
      const start = now + idx * 0.12;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.08, start + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0008, start + 0.85);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 0.9);
    });
  } catch {
    // Ignore audio error
  }
}
