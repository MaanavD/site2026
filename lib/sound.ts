// Synthesized koto/biwa plucks via Karplus-Strong, plus a wind layer.
// No audio files. Muted by default; the visitor opts in via the nav toggle.

let ctx: AudioContext | null = null;
let enabled = false;

export function soundPref() {
  if (typeof window === "undefined") return false;
  enabled = localStorage.getItem("sound") === "on";
  return enabled;
}

export function setSound(on: boolean) {
  enabled = on;
  localStorage.setItem("sound", on ? "on" : "off");
  if (on) ensureCtx();
  else stopWind();
}

function ensureCtx() {
  if (!ctx) ctx = new AudioContext();
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

// browsers suspend idle AudioContexts; notes scheduled while suspended are
// silently dropped, so every sound waits for a confirmed-running context
function whenRunning(cb: (c: AudioContext) => void) {
  const c = ensureCtx();
  if (c.state === "running") cb(c);
  else c.resume().then(() => cb(c)).catch(() => {});
}

// yo scale on D (D E G A B): no semitones, open and serene
const SCALE = [146.83, 164.81, 196.0, 220.0, 246.94, 293.66, 329.63, 392.0];

export function pluck(noteIndex?: number, gain = 0.13) {
  if (!enabled) return;
  whenRunning((c) => pluckNow(c, noteIndex, gain));
}

function pluckNow(c: AudioContext, noteIndex?: number, gain = 0.13) {
  const idx =
    noteIndex !== undefined
      ? ((noteIndex % SCALE.length) + SCALE.length) % SCALE.length
      : Math.floor(Math.random() * SCALE.length);
  const freq = SCALE[idx];

  const dur = 1.8;
  const sr = c.sampleRate;
  const n = Math.floor(sr * dur);
  const buf = c.createBuffer(1, n, sr);
  const data = buf.getChannelData(0);

  const period = Math.max(2, Math.round(sr / freq));
  const ring = new Float32Array(period);
  for (let i = 0; i < period; i++) ring[i] = Math.random() * 2 - 1;

  let ri = 0;
  for (let i = 0; i < n; i++) {
    const cur = ring[ri];
    const nxt = ring[(ri + 1) % period];
    ring[ri] = 0.5 * (cur + nxt) * 0.9962;
    data[i] = cur;
    ri = (ri + 1) % period;
  }

  const src = c.createBufferSource();
  src.buffer = buf;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1900;
  const g = c.createGain();
  g.gain.setValueAtTime(gain, c.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + dur);
  src.connect(lp).connect(g).connect(c.destination);
  src.start();
}

// short rising phrase for page transitions: gentle, open intervals only
export function transitionMotif() {
  if (!enabled) return;
  const base = 1 + Math.floor(Math.random() * 3);
  pluck(base, 0.09);
  setTimeout(() => pluck(base + 2, 0.07), 140 + Math.random() * 50);
  if (Math.random() < 0.5) {
    setTimeout(() => pluck(base + 5, 0.05), 330 + Math.random() * 70);
  }
}

// hanko stamp: a soft press into paper, no drum
export function stamp() {
  if (!enabled) return;
  whenRunning(stampNow);
}

function stampNow(c: AudioContext) {
  const t = c.currentTime;

  const n = Math.floor(c.sampleRate * 0.14);
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) {
    const env = Math.pow(1 - i / n, 2.2);
    d[i] = (Math.random() * 2 - 1) * env;
  }
  const noise = c.createBufferSource();
  noise.buffer = buf;
  const bp = c.createBiquadFilter();
  bp.type = "bandpass";
  bp.frequency.value = 620;
  bp.Q.value = 1.1;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.11, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  noise.connect(bp).connect(ng).connect(c.destination);
  noise.start(t);

  // the faintest low string under the press
  pluck(0, 0.045);
}

// wind that follows the pointer across the hero ink
let wind: { gain: GainNode; filter: BiquadFilterNode } | null = null;

function ensureWind() {
  const c = ensureCtx();
  if (wind) return wind;
  // pink noise (Paul Kellet), far softer than white
  const len = c.sampleRate * 2;
  const buf = c.createBuffer(1, len, c.sampleRate);
  const d = buf.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < len; i++) {
    const w = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + w * 0.0555179;
    b1 = 0.99332 * b1 + w * 0.0750759;
    b2 = 0.969 * b2 + w * 0.153852;
    b3 = 0.8665 * b3 + w * 0.3104856;
    b4 = 0.55 * b4 + w * 0.5329522;
    b5 = -0.7616 * b5 - w * 0.016898;
    d[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.09;
    b6 = w * 0.115926;
  }
  const src = c.createBufferSource();
  src.buffer = buf;
  src.loop = true;
  const filter = c.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = 420;
  filter.Q.value = 0.4;
  const gain = c.createGain();
  gain.gain.value = 0;
  src.connect(filter).connect(gain).connect(c.destination);
  src.start();
  wind = { gain, filter };
  return wind;
}

export function windPulse(intensity: number) {
  if (!enabled) return;
  whenRunning(() => windPulseNow(intensity));
}

function windPulseNow(intensity: number) {
  const c = ensureCtx();
  const w = ensureWind();
  const t = c.currentTime;
  const target = Math.min(0.035, intensity * 0.035);
  w.gain.gain.cancelScheduledValues(t);
  w.gain.gain.setTargetAtTime(target, t, 0.14);
  w.gain.gain.setTargetAtTime(0, t + 0.25, 0.7);
  w.filter.frequency.cancelScheduledValues(t);
  w.filter.frequency.setTargetAtTime(360 + intensity * 320, t, 0.2);
}

function stopWind() {
  if (wind && ctx) {
    wind.gain.gain.setTargetAtTime(0, ctx.currentTime, 0.05);
  }
}
