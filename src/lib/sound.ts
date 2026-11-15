let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
    return null;
  }
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

export function playTaskChime(enabled: boolean) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(659.25, now);
    osc.frequency.exponentialRampToValueAtTime(987.77, now + 0.14);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.065, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.34);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.35);
  } catch {
    // Ignore audio context errors
  }
}

export function playMissionFanfare(enabled: boolean) {
  if (!enabled) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  try {
    const now = ctx.currentTime;

    // Crisp metallic blade-clash shimmer synced with the crossed-swords impact (~0.28s)
    const impactTime = now + 0.28;
    const clashPartials = [1975.53, 2793.83, 3951.07];
    clashPartials.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = i === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, impactTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.992, impactTime + 0.45);
      gain.gain.setValueAtTime(0.001, impactTime);
      gain.gain.linearRampToValueAtTime(0.042 / (i + 1), impactTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0008, impactTime + 0.48);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(impactTime);
      osc.stop(impactTime + 0.5);
    });

    // Silky royal oceanic victory chord swell (Cmaj9: C5, E5, G5, B5, D6)
    const notes = [523.25, 659.25, 783.99, 987.77, 1174.66];
    notes.forEach((freq, idx) => {
      const start = now + 0.32 + idx * 0.085;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, start);
      gain.gain.setValueAtTime(0.001, start);
      gain.gain.linearRampToValueAtTime(0.055, start + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 1.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(start);
      osc.stop(start + 1.2);
    });
  } catch {
    // Ignore audio context errors
  }
}
