import { whenAudioRunning } from "./audio-context";
import { soundPref } from "./sound-preference";

// Synthesized santoor via Karplus-Strong, played in Raag Bhupali,
// with a shared reverb so everything sits in the same quiet room.
// No audio files. Muted by default; the visitor opts in via the nav toggle.

// one shared bus: dry signal plus a soft 2-second room, so plucks ring
// instead of stopping dead (the dryness was what read as "un-serene")
let bus: GainNode | null = null;

function ensureBus(c: AudioContext) {
  if (bus) return bus;
  bus = c.createGain();
  bus.gain.value = 1;
  bus.connect(c.destination);

  const dur = 2.2;
  const len = Math.floor(c.sampleRate * dur);
  const ir = c.createBuffer(2, len, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const d = ir.getChannelData(ch);
    for (let i = 0; i < len; i++) {
      d[i] = (Math.random() * 2 - 1) * Math.exp((-3.2 * i) / len);
    }
  }
  const verb = c.createConvolver();
  verb.buffer = ir;
  const wet = c.createGain();
  wet.gain.value = 0.3;
  bus.connect(verb);
  verb.connect(wet);
  wet.connect(c.destination);
  return bus;
}

// Raag Bhupali on D (Sa Re Ga Pa Dha = D E F# A B): no semitones, serene
const SCALE = [
  146.83, 164.81, 185.0, 220.0, 246.94, 293.66, 329.63, 369.99, 440.0, 493.88,
];

export function pluck(noteIndex?: number, gain = 0.13) {
  if (!soundPref()) return;
  whenAudioRunning((c) => pluckNow(c, noteIndex, gain));
}

function pluckNow(c: AudioContext, noteIndex?: number, gain = 0.13) {
  const idx =
    noteIndex !== undefined
      ? ((noteIndex % SCALE.length) + SCALE.length) % SCALE.length
      : Math.floor(Math.random() * SCALE.length);
  const freq = SCALE[idx];

  // a santoor strike is really two: the hammer touches the string twice,
  // and its paired strings are never perfectly in tune with each other
  strikeString(c, freq, gain, 0);
  strikeString(c, freq * 1.004, gain * 0.55, 0.024);
}

function strikeString(
  c: AudioContext,
  freq: number,
  gain: number,
  offset: number
) {
  const dur = 2.2;
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
    ring[ri] = 0.5 * (cur + nxt) * 0.9975;
    data[i] = cur;
    ri = (ri + 1) % period;
  }

  const src = c.createBufferSource();
  src.buffer = buf;
  const lp = c.createBiquadFilter();
  lp.type = "lowpass";
  lp.frequency.value = 1550;
  const g = c.createGain();
  const t = c.currentTime + offset;
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(lp).connect(g).connect(ensureBus(c));
  src.start(t);
}

// canonical Bhupali phrases (indices into SCALE, 0 = Sa), always calm,
// always resolving upward: the raag's own vocabulary instead of dice
const PHRASES = [
  [0, 2, 3], // Sa Ga Pa
  [2, 3, 4], // Ga Pa Dha
  [3, 4, 5], // Pa Dha Sa'
  [0, 3, 5], // Sa Pa Sa'
  [2, 3, 5], // Ga Pa Sa'
];

function playPhrase(phrase: number[], gains: number[], spacing = 160) {
  phrase.forEach((note, i) => {
    const jitter = Math.random() * 30;
    setTimeout(() => pluck(note, gains[i] ?? 0.06), i * spacing + jitter);
  });
}

// a short phrase for page transitions
export function transitionMotif() {
  if (!soundPref()) return;
  playPhrase(
    PHRASES[Math.floor(Math.random() * PHRASES.length)],
    [0.09, 0.075, 0.06]
  );
}

// the greeting when sound is switched on: Sa, Pa, upper Sa
export function chime() {
  if (!soundPref()) return;
  playPhrase([0, 3, 5], [0.08, 0.07, 0.06], 190);
}

// blockprint stamp: a wood block pressed into cloth, no drum
export function stamp() {
  if (!soundPref()) return;
  whenAudioRunning(stampNow);
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
  bp.frequency.value = 340;
  bp.Q.value = 0.8;
  const ng = c.createGain();
  ng.gain.setValueAtTime(0.09, t);
  ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.16);
  noise.connect(bp).connect(ng).connect(ensureBus(c));
  noise.start(t);

  // the wood's single soft knock under the cloth
  const knock = c.createOscillator();
  knock.type = "sine";
  knock.frequency.value = 90;
  const kg = c.createGain();
  kg.gain.setValueAtTime(0.055, t);
  kg.gain.exponentialRampToValueAtTime(0.0001, t + 0.09);
  knock.connect(kg).connect(ensureBus(c));
  knock.start(t);
  knock.stop(t + 0.1);

  // the faintest low string under the press
  pluck(0, 0.04);
}

// a lighter touch of the same block: fingertips testing the carve,
// for hovering the pursuit blocks (no string under it, no knock)
export function press() {
  if (!soundPref()) return;
  whenAudioRunning((c) => {
    const t = c.currentTime;
    const n = Math.floor(c.sampleRate * 0.09);
    const buf = c.createBuffer(1, n, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) {
      const env = Math.pow(1 - i / n, 2.6);
      d[i] = (Math.random() * 2 - 1) * env;
    }
    const noise = c.createBufferSource();
    noise.buffer = buf;
    const bp = c.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.value = 480;
    bp.Q.value = 0.9;
    const g = c.createGain();
    g.gain.setValueAtTime(0.05, t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.1);
    noise.connect(bp).connect(g).connect(ensureBus(c));
    noise.start(t);
  });
}

// wind that follows the pointer across the hero (kept dry: it's the room)
let wind: {
  context: AudioContext;
  gain: GainNode;
  filter: BiquadFilterNode;
} | null = null;

function ensureWind(c: AudioContext) {
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
  wind = { context: c, gain, filter };
  return wind;
}

export function windPulse(intensity: number) {
  if (!soundPref()) return;
  whenAudioRunning((context) => windPulseNow(context, intensity));
}

function windPulseNow(c: AudioContext, intensity: number) {
  const w = ensureWind(c);
  const t = c.currentTime;
  const target = Math.min(0.035, intensity * 0.035);
  w.gain.gain.cancelScheduledValues(t);
  w.gain.gain.setTargetAtTime(target, t, 0.14);
  w.gain.gain.setTargetAtTime(0, t + 0.25, 0.7);
  w.filter.frequency.cancelScheduledValues(t);
  w.filter.frequency.setTargetAtTime(360 + intensity * 320, t, 0.2);
}

export function stopWind() {
  if (wind) {
    wind.gain.gain.setTargetAtTime(0, wind.context.currentTime, 0.05);
  }
}
