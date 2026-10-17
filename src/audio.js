// All sound is synthesised with WebAudio: engines, effects and a chiptune soundtrack.

const NOTE = n => 440 * Math.pow(2, (n - 69) / 12);

export class Audio {
  constructor() {
    this.ctx = null;
    this.musicVol = 0.5; this.sfxVol = 0.8;
    this.engines = [];
    this.song = null;
  }

  // must be called from a user gesture
  unlock() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      this.ctx = new AC();
      this.master = this.ctx.createGain(); this.master.connect(this.ctx.destination);
      this.musicBus = this.ctx.createGain(); this.musicBus.connect(this.master);
      this.sfxBus = this.ctx.createGain(); this.sfxBus.connect(this.master);
      this.setVolumes(this.musicVol, this.sfxVol);
      const len = this.ctx.sampleRate;
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
  }

  setVolumes(music, sfx) {
    this.musicVol = music; this.sfxVol = sfx;
    if (!this.ctx) return;
    this.musicBus.gain.value = music * 0.35;
    this.sfxBus.gain.value = sfx;
  }

  pauseAll(paused) {
    if (!this.ctx) return;
    if (paused) this.ctx.suspend(); else this.ctx.resume();
  }

  // ---------------- engines ----------------
  startEngines(n) {
    this.stopEngines();
    if (!this.ctx) return;
    for (let i = 0; i < n; i++) {
      const c = this.ctx;
      const o1 = c.createOscillator(); o1.type = 'sawtooth';
      const o2 = c.createOscillator(); o2.type = 'square';
      const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 700;
      const g = c.createGain(); g.gain.value = 0;
      o1.connect(f); o2.connect(f); f.connect(g); g.connect(this.sfxBus);
      o1.start(); o2.start();
      this.engines.push({ o1, o2, f, g });
    }
  }

  setEngine(i, speedRatio, boosting, active = true) {
    const e = this.engines[i];
    if (!e) return;
    const t = this.ctx.currentTime;
    const base = 55 + speedRatio * 150 + (boosting ? 40 : 0);
    e.o1.frequency.setTargetAtTime(base, t, 0.05);
    e.o2.frequency.setTargetAtTime(base * 0.5, t, 0.05);
    e.f.frequency.setTargetAtTime(500 + speedRatio * 1600, t, 0.05);
    const vol = active ? (0.05 + speedRatio * 0.06) / Math.max(1, this.engines.length * 0.8) : 0;
    e.g.gain.setTargetAtTime(vol, t, 0.08);
  }

  stopEngines() {
    for (const e of this.engines) { try { e.o1.stop(); e.o2.stop(); e.g.disconnect(); } catch { /* already stopped */ } }
    this.engines = [];
  }

  // ---------------- effects ----------------
  tone(freq, dur, type = 'square', vol = 0.2, slideTo = null, when = 0) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(); o.type = type;
    const g = c.createGain();
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.sfxBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  noiseHit(dur, vol = 0.3, freq = 1200, type = 'lowpass', when = 0, bus = null) {
    if (!this.ctx) return;
    const c = this.ctx, t = c.currentTime + when;
    const s = c.createBufferSource(); s.buffer = this.noise;
    const f = c.createBiquadFilter(); f.type = type; f.frequency.value = freq;
    const g = c.createGain();
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(bus || this.sfxBus);
    s.start(t, Math.random() * 0.5); s.stop(t + dur + 0.02);
  }

  sfx(name) {
    if (!this.ctx) return;
    switch (name) {
      case 'coin': this.tone(988, 0.08, 'square', 0.12); this.tone(1319, 0.18, 'square', 0.12, null, 0.07); break;
      case 'item': for (let i = 0; i < 4; i++) this.tone(600 + i * 200, 0.07, 'triangle', 0.15, null, i * 0.05); break;
      case 'boost': this.tone(200, 0.5, 'sawtooth', 0.15, 900); this.noiseHit(0.4, 0.15, 3000, 'highpass'); break;
      case 'miniboost': this.tone(300, 0.3, 'sawtooth', 0.12, 800); break;
      case 'bump': this.noiseHit(0.15, 0.35, 500); this.tone(110, 0.12, 'square', 0.15, 60); break;
      case 'jump': this.tone(300, 0.35, 'triangle', 0.2, 900); break;
      case 'land': this.noiseHit(0.2, 0.3, 400); break;
      case 'spin': this.tone(800, 0.6, 'square', 0.15, 120); break;
      case 'boom': this.noiseHit(0.6, 0.5, 900); this.tone(150, 0.4, 'sawtooth', 0.2, 40); break;
      case 'fire': this.tone(400, 0.25, 'sawtooth', 0.15, 1200); this.noiseHit(0.3, 0.2, 2500, 'highpass'); break;
      case 'shield': this.tone(500, 0.3, 'sine', 0.2, 1000); this.tone(750, 0.3, 'sine', 0.15, 1500, 0.05); break;
      case 'pop': this.tone(900, 0.12, 'sine', 0.25, 200); break;
      case 'sticky': this.tone(200, 0.4, 'triangle', 0.25, 80); break;
      case 'drop': this.tone(300, 0.15, 'triangle', 0.2, 150); break;
      case 'beep': this.tone(660, 0.25, 'square', 0.2); break;
      case 'go': this.tone(1320, 0.6, 'square', 0.22); break;
      case 'lap': [784, 988, 1175].forEach((f, i) => this.tone(f, 0.15, 'square', 0.15, null, i * 0.09)); break;
      case 'checkpoint': this.tone(1047, 0.12, 'triangle', 0.18); this.tone(1568, 0.2, 'triangle', 0.15, null, 0.08); break;
      case 'click': this.tone(700, 0.05, 'square', 0.1); break;
      case 'buy': [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.12, 'square', 0.13, null, i * 0.07)); break;
      case 'win': [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'square', 0.15, null, i * 0.13)); break;
      case 'finish': [659, 784, 988, 1319].forEach((f, i) => this.tone(f, 0.25, 'triangle', 0.18, null, i * 0.12)); break;
      default: break;
    }
  }

  // ---------------- music ----------------
  playMusic(kind) {
    if (!this.ctx) return;
    if (this.song && this.song.kind === kind) return;
    this.stopMusic();
    const song = makeSong(kind);
    song.kind = kind;
    song.step = 0;
    song.nextTime = this.ctx.currentTime + 0.1;
    song.timer = setInterval(() => this.schedule(song), 25);
    this.song = song;
  }

  stopMusic() {
    if (this.song) clearInterval(this.song.timer);
    this.song = null;
  }

  schedule(song) {
    const c = this.ctx;
    if (!c || c.state !== 'running') return;
    const stepDur = 60 / song.bpm / 4;
    while (song.nextTime < c.currentTime + 0.12) {
      const i = song.step % song.length;
      const t = song.nextTime - c.currentTime;
      const mel = song.melody[i], bass = song.bass[i], arp = song.arp[i];
      if (mel != null) this.musicNote(NOTE(mel), stepDur * (song.melLen[i] || 1) * 0.95, 'square', 0.16, t);
      if (bass != null) this.musicNote(NOTE(bass), stepDur * 1.8, 'triangle', 0.35, t);
      if (arp != null) this.musicNote(NOTE(arp), stepDur * 0.6, 'square', 0.05, t);
      if (song.drums) {
        const d = i % 16;
        if (d === 0 || d === 8 || d === 10) this.kick(t);
        if (d === 4 || d === 12) this.noiseHit(0.12, 0.25, 1800, 'bandpass', t, this.musicBus);
        if (d % 2 === 0) this.noiseHit(0.03, 0.08, 7000, 'highpass', t, this.musicBus);
      }
      song.nextTime += stepDur;
      song.step++;
    }
  }

  musicNote(freq, dur, type, vol, when) {
    const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(); o.type = type;
    const g = c.createGain();
    o.frequency.value = freq;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.01);
    g.gain.setValueAtTime(vol, t + dur * 0.7);
    g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    o.connect(g); g.connect(this.musicBus);
    o.start(t); o.stop(t + dur + 0.02);
  }

  kick(when) {
    const c = this.ctx, t = c.currentTime + when;
    const o = c.createOscillator(); const g = c.createGain();
    o.frequency.setValueAtTime(150, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12);
    g.gain.setValueAtTime(0.6, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
    o.connect(g); g.connect(this.musicBus);
    o.start(t); o.stop(t + 0.2);
  }
}

// Deterministic little composer: chord progression + melody built from chord tones.
function makeSong(kind) {
  let seed = kind === 'race' ? 7 : kind === 'menu' ? 3 : 11;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const prog = kind === 'race'
    ? [[60, 64, 67], [57, 60, 64], [53, 57, 60], [55, 59, 62], [60, 64, 67], [57, 60, 64], [62, 65, 69], [55, 59, 62]]
    : [[60, 64, 67], [53, 57, 60], [57, 60, 64], [55, 59, 62]];
  const bars = prog.length, length = bars * 16;
  const melody = new Array(length).fill(null), melLen = new Array(length).fill(1);
  const bass = new Array(length).fill(null), arp = new Array(length).fill(null);
  // a motif of 16 steps reused with chord transposition
  const motif = [];
  for (let s = 0; s < 16; s++) motif.push(s % 4 === 0 ? true : rnd() < (kind === 'race' ? 0.45 : 0.3));
  for (let b = 0; b < bars; b++) {
    const ch = prog[b];
    for (let s = 0; s < 16; s++) {
      const i = b * 16 + s;
      if (s % 4 === 0) bass[i] = ch[0] - 24 + (s === 8 && kind === 'race' ? 7 : 0);
      if (kind === 'race' && s % 4 === 2) bass[i] = ch[0] - 12;
      arp[i] = ch[s % 3] + 12;
      if (motif[s]) {
        const pool = [ch[0], ch[1], ch[2], ch[0] + 12, ch[1] + 12];
        melody[i] = pool[Math.floor(rnd() * pool.length)] + 12;
        melLen[i] = s % 4 === 0 ? 2 : 1;
      }
    }
  }
  return { bpm: kind === 'race' ? 150 : 112, length, melody, melLen, bass, arp, drums: kind === 'race' };
}
