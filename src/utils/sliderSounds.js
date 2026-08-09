// Procedural Web Audio sound engine for BiSlider interactions.
// Each slider ID has a unique sonic character that evolves across 5 level zones (0-4).
// All synthesis is done in-browser — no audio files required.

let _ctx = null;

function getCtx() {
  if (!_ctx || _ctx.state === 'closed') {
    _ctx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// Maps a 0–100 value to one of 5 levels
export function valueToLevel(value) {
  return Math.min(4, Math.floor(value / 20));
}

// ─────────────────────────────────────────────────────────────────
// 1. effect  ·  Relaxing → Energizing
// Deep forest breath → crackling electric spark
// ─────────────────────────────────────────────────────────────────
function playEffect(level, ctx, t) {
  const configs = [
    { freq: 55,  type: 'sine',     dur: 0.9, vol: 0.30 },  // deep rumble
    { freq: 110, type: 'sine',     dur: 0.65, vol: 0.30 }, // low tone
    { freq: 220, type: 'triangle', dur: 0.45, vol: 0.28 }, // mid warmth
    { freq: 440, type: 'triangle', dur: 0.28, vol: 0.28 }, // bright
    { freq: 880, type: 'square',   dur: 0.14, vol: 0.20 }, // electric crackle
  ];
  const c = configs[level];
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = c.type;
  osc.frequency.setValueAtTime(c.freq, t);
  if (level === 4) {
    osc.frequency.exponentialRampToValueAtTime(c.freq * 2.2, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(c.freq * 0.8, t + 0.14);
  }
  g.gain.setValueAtTime(c.vol, t);
  g.gain.exponentialRampToValueAtTime(0.001, t + c.dur);
  osc.connect(g); g.connect(ctx.destination);
  osc.start(t); osc.stop(t + c.dur + 0.05);
}

// ─────────────────────────────────────────────────────────────────
// 2. thc_sensitivity  ·  Very Sensitive → High Tolerance
// Feather-whisper bell → massive forest floor thud
// ─────────────────────────────────────────────────────────────────
function playThcSensitivity(level, ctx, t) {
  if (level <= 1) {
    // Delicate bell — barely there
    const freq = level === 0 ? 1800 : 1200;
    const vol  = level === 0 ? 0.10 : 0.15;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.1);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 1.15);
  } else {
    // Thud — gets heavier each level
    const baseFreq = [0, 0, 110, 80, 55][level];
    const vol      = [0, 0, 0.45, 0.60, 0.75][level];
    // Pitch-drop boom
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq * 2.5, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.4, t + 0.22);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.38);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.45);
    // Soil/earth noise burst
    const bufSize = Math.floor(ctx.sampleRate * 0.18);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const noise = ctx.createBufferSource();
    noise.buffer = buf;
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass';
    filt.frequency.value = 120 + level * 30;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.28 + (level - 2) * 0.08, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    noise.connect(filt); filt.connect(ng); ng.connect(ctx.destination);
    noise.start(t); noise.stop(t + 0.25);
  }
}

// ─────────────────────────────────────────────────────────────────
// 3. cbd_importance  ·  Not a Factor → Essential
// Empty single tone → resonant healing bowl with harmonics
// ─────────────────────────────────────────────────────────────────
function playCbdImportance(level, ctx, t) {
  const fundamentals = [220, 280, 360, 432, 528]; // 528 Hz = "love frequency"
  const freq = fundamentals[level];
  const harmonics = level + 1; // more harmonics = more essential/whole
  for (let h = 0; h < harmonics; h++) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * (h + 1), t);
    const vol = (0.22 - h * 0.02) / Math.max(1, harmonics - 2);
    g.gain.setValueAtTime(vol, t);
    g.gain.linearRampToValueAtTime(vol * 1.1, t + 0.04);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1.1 - h * 0.08);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t + h * 0.012); osc.stop(t + 1.3);
  }
}

// ─────────────────────────────────────────────────────────────────
// 4. anxiety  ·  Anxiety-Prone → Anxiety-Resistant
// Jittery dissonant tremolo → smooth resolved major chord
// ─────────────────────────────────────────────────────────────────
function playAnxiety(level, ctx, t) {
  if (level === 0) {
    // Shaky minor 2nd — dissonant, fast tremolo
    [233, 246].forEach((freq) => {
      const osc = ctx.createOscillator();
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();
      const g = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      lfo.frequency.setValueAtTime(14, t); // fast nervous tremolo
      lfoGain.gain.setValueAtTime(0.08, t);
      lfo.connect(lfoGain); lfoGain.connect(g.gain);
      g.gain.setValueAtTime(0.13, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(g); g.connect(ctx.destination);
      lfo.start(t); lfo.stop(t + 0.6);
      osc.start(t); osc.stop(t + 0.6);
    });
  } else if (level === 1) {
    // Wobbly — uneasy
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.linearRampToValueAtTime(248, t + 0.06);
    osc.frequency.linearRampToValueAtTime(268, t + 0.12);
    osc.frequency.linearRampToValueAtTime(255, t + 0.20);
    g.gain.setValueAtTime(0.20, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.45);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.5);
  } else {
    // Calming chord — gets fuller and more resolved
    const chords = [
      [330, 392],            // level 2 — partial
      [330, 415, 495],       // level 3 — major triad
      [330, 415, 495, 660],  // level 4 — full octave chord
    ];
    chords[level - 2].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      g.gain.setValueAtTime(0, t + i * 0.025);
      g.gain.linearRampToValueAtTime(0.14, t + i * 0.025 + 0.03);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.85);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t + i * 0.025); osc.stop(t + 1.0);
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// 5. experience  ·  Beginner → Seasoned
// Toy bloop → rich layered musical chord
// ─────────────────────────────────────────────────────────────────
function playExperience(level, ctx, t) {
  if (level === 0) {
    // Toy "bloop" — simple game sound
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(523, t);
    osc.frequency.exponentialRampToValueAtTime(880, t + 0.06);
    osc.frequency.exponentialRampToValueAtTime(523, t + 0.12);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.22);
  } else {
    // Build up harmonic complexity with experience
    const roots  = [0, 196, 220, 196, 165]; // G3, A3, G3, E3
    const root = roots[level];
    const numHarmonics = level;
    for (let h = 0; h < numHarmonics; h++) {
      const ratio = [1, 1.25, 1.5, 2][h]; // root, major third, fifth, octave
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = h === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(root * ratio, t);
      g.gain.setValueAtTime(0, t + h * 0.018);
      g.gain.linearRampToValueAtTime(0.18 / numHarmonics, t + h * 0.018 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.55 + h * 0.12);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t + h * 0.018); osc.stop(t + 0.8);
    }
  }
}

// ─────────────────────────────────────────────────────────────────
// 6. terpene  ·  Earthy/Herbal → Citrus/Fruity
// Deep woody thud → bright ascending xylophone cascade
// ─────────────────────────────────────────────────────────────────
function playTerpene(level, ctx, t) {
  if (level <= 1) {
    // Woody thud — hollow log knock
    const freq = level === 0 ? 75 : 105;
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq * 2.8, t);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.6, t + 0.10);
    g.gain.setValueAtTime(0.55 - level * 0.1, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.32);
    // Knock texture
    const bufSize = Math.floor(ctx.sampleRate * 0.09);
    const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < bufSize; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
    const noise = ctx.createBufferSource(); noise.buffer = buf;
    const filt = ctx.createBiquadFilter(); filt.type = 'bandpass'; filt.frequency.value = 280;
    const ng = ctx.createGain();
    ng.gain.setValueAtTime(0.22, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.10);
    noise.connect(filt); filt.connect(ng); ng.connect(ctx.destination);
    noise.start(t); noise.stop(t + 0.12);
  } else {
    // Xylophone ascending cascade — brighter and more notes each level
    const scales = [
      [523],            // level 2 — single bright note
      [523, 659],       // level 3 — two notes ascending
      [523, 659, 784, 1047], // level 4 — four-note bright cascade
    ];
    const notes = scales[level - 2];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + i * 0.07);
      g.gain.setValueAtTime(0, t + i * 0.07);
      g.gain.linearRampToValueAtTime(0.28 / notes.length, t + i * 0.07 + 0.008);
      g.gain.exponentialRampToValueAtTime(0.001, t + i * 0.07 + 0.42);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t + i * 0.07); osc.stop(t + i * 0.07 + 0.48);
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// 7. context  ·  Solo & Private → Social & Active
// Single soft breath tone → stacked celebratory party chord
// ─────────────────────────────────────────────────────────────────
function playContext(level, ctx, t) {
  const voices = level + 1;
  const baseFreqs = [196, 247, 294, 370, 494]; // G3 up to B4
  for (let i = 0; i < voices; i++) {
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = i === 0 ? 'sine' : 'triangle';
    osc.frequency.setValueAtTime(baseFreqs[i], t + i * 0.028);
    if (level === 4 && i === voices - 1) {
      // Upward sweep on the top voice for social energy
      osc.frequency.exponentialRampToValueAtTime(baseFreqs[i] * 1.5, t + 0.12);
    }
    const vol = level === 0 ? 0.16 : 0.22 / voices;
    g.gain.setValueAtTime(0, t + i * 0.028);
    g.gain.linearRampToValueAtTime(vol, t + i * 0.028 + 0.025);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.55 + i * 0.06);
    osc.connect(g); g.connect(ctx.destination);
    osc.start(t + i * 0.028); osc.stop(t + 0.7 + i * 0.06);
  }
}

// ─────────────────────────────────────────────────────────────────
// 8. purpose  ·  Recreational → Therapeutic
// 8-bit game blip → deep resonant singing bowl
// ─────────────────────────────────────────────────────────────────
function playPurpose(level, ctx, t) {
  if (level <= 1) {
    // 8-bit game boop
    const osc = ctx.createOscillator();
    const g   = ctx.createGain();
    osc.type = 'square';
    const startFreq = level === 0 ? 440 : 330;
    osc.frequency.setValueAtTime(startFreq, t);
    osc.frequency.setValueAtTime(startFreq * 1.33, t + 0.05);
    if (level === 0) osc.frequency.setValueAtTime(startFreq, t + 0.10);
    g.gain.setValueAtTime(0.15, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + (level === 0 ? 0.18 : 0.24));
    // Bit-crunch filter
    const filt = ctx.createBiquadFilter();
    filt.type = 'lowpass'; filt.frequency.value = 1200;
    osc.connect(filt); filt.connect(g); g.connect(ctx.destination);
    osc.start(t); osc.stop(t + 0.30);
  } else {
    // Singing bowl — Solfeggio-adjacent frequencies, increasingly sustained
    const bowlFreqs = [0, 0, 174, 285, 396];
    const freq = bowlFreqs[level];
    const sustainMult = [0, 0, 1.0, 1.6, 2.2][level];
    // Fundamental with slow attack (bowl strike)
    const osc1 = ctx.createOscillator();
    const g1   = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(freq, t);
    g1.gain.setValueAtTime(0, t);
    g1.gain.linearRampToValueAtTime(0.38, t + 0.04);
    g1.gain.exponentialRampToValueAtTime(0.001, t + 1.0 * sustainMult);
    osc1.connect(g1); g1.connect(ctx.destination);
    osc1.start(t); osc1.stop(t + 1.1 * sustainMult);
    // Bowl overtones (inharmonic ratios for realism)
    const overtones = [[2.74, 0.12], [5.40, 0.06]].slice(0, level - 1);
    overtones.forEach(([ratio, vol], i) => {
      const osc = ctx.createOscillator();
      const g   = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq * ratio, t);
      g.gain.setValueAtTime(0, t);
      g.gain.linearRampToValueAtTime(vol, t + 0.05);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.65 * sustainMult);
      osc.connect(g); g.connect(ctx.destination);
      osc.start(t); osc.stop(t + 0.75 * sustainMult);
    });
  }
}

// ─────────────────────────────────────────────────────────────────
// Router
// ─────────────────────────────────────────────────────────────────
const SOUND_MAP = {
  effect:          playEffect,
  thc_sensitivity: playThcSensitivity,
  thc:             playThcSensitivity, // Home page demo alias
  cbd_importance:  playCbdImportance,
  cbd:             playCbdImportance,  // Home page demo alias
  anxiety:         playAnxiety,
  experience:      playExperience,
  terpene:         playTerpene,
  context:         playContext,
  purpose:         playPurpose,
};

export function playSliderSound(soundId, value) {
  if (!soundId || !SOUND_MAP[soundId]) return;
  try {
    const ctx = getCtx();
    const level = valueToLevel(value);
    SOUND_MAP[soundId](level, ctx, ctx.currentTime);
  } catch {
    // AudioContext blocked or not supported — fail silently
  }
}
