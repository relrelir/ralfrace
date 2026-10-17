import * as THREE from 'three';
import { TrackData, makeFrame } from './trackdata.js';
import { buildTrackScene } from './trackmesh.js';
import { Kart, BODIES } from './physics.js';
import { AIDriver } from './ai.js';
import { buildCar, makeGhost, COLORS, TRAILS } from './carmodel.js';
import { ItemManager, ITEM_INFO } from './items.js';
import { Particles } from './particles.js';
import { shadowTexture } from './textures.js';

const DIFF = {
  easy: { aiMul: 0.8, assist: 0.7 },
  normal: { aiMul: 0.9, assist: 0.45 },
  hard: { aiMul: 0.98, assist: 0.15 },
};

const AI_NAMES = ['מנטה', 'סוכריון', 'קרמלה', 'שוקו', 'מרשי', 'טופי', 'לקריצה', 'גומי'];
const AI_BODIES = ['kart', 'cupcake', 'cookie', 'donut', 'gummy', 'icecream'];
const AI_WHEELS = ['donut', 'cookie', 'mint', 'gumball', 'licorice'];
const AI_PATTERNS = ['none', 'stripes', 'dots', 'sprinkles', 'none', 'checker'];
const GHOST_DT = 0.05;

export function medalTimes(track) {
  const L = track.length;
  return [L / 35, L / 41, L / 46]; // bronze, silver, gold (one lap)
}

function fmt(t) {
  if (!isFinite(t)) return '--:--.--';
  const m = Math.floor(t / 60), s = t - m * 60;
  return `${m}:${s < 10 ? '0' : ''}${s.toFixed(2)}`;
}
export { fmt as formatTime };

function wrapDelta(d, L) { d = ((d % L) + L) % L; return d > L / 2 ? d - L : d; }

export class Race {
  constructor(game, opts) {
    this.game = game;
    this.opts = opts;
    this.mode = opts.mode;               // 'race' | 'time'
    this.humans = opts.players.length;   // 1 or 2
    this.split = this.humans === 2;
    const diff = DIFF[opts.difficulty] || DIFF.normal;

    const scene = new THREE.Scene();
    this.scene = scene;
    const def = opts.trackDef;
    this.track = new TrackData(def);
    this.laps = this.mode === 'time' ? 1 : def.laps;
    scene.fog = new THREE.Fog(def.theme.fog, 180, 1100);
    scene.add(new THREE.HemisphereLight('#ffffff', def.theme.ground, 1.6));
    const sun = new THREE.DirectionalLight('#fff6e0', 1.6);
    sun.position.set(0.4, 1, 0.3);
    scene.add(sun);
    this.trackGroup = buildTrackScene(this.track);
    scene.add(this.trackGroup);
    this.sky = this.trackGroup.children.find(c => c.userData.followCamera);
    this.items = new ItemManager(this.track, scene, { items: this.mode === 'race', coins: this.mode === 'race' });
    this.particles = new Particles(scene);
    this.frame = makeFrame();
    this.shadowMat = new THREE.MeshBasicMaterial({ map: shadowTexture(), transparent: true, depthWrite: false });
    this.shadowGeo = new THREE.PlaneGeometry(3.2, 4.2).rotateX(-Math.PI / 2);

    // ---------- karts ----------
    this.racers = [];
    const total = this.mode === 'race' ? 6 : 1;
    const humanSlots = this.split ? [3, 2] : [3];
    let aiCount = 0;
    for (let slot = 0; slot < total; slot++) {
      const hi = humanSlots.indexOf(slot);
      const row = Math.floor(slot / 2), col = slot % 2;
      const dist = this.mode === 'time' ? -6 : -8 - row * 8;
      const x = this.mode === 'time' ? 0 : (col ? 3.5 : -3.5);
      if (hi >= 0 || (this.mode === 'time' && slot === 0)) {
        const p = opts.players[hi >= 0 ? hi : 0];
        const k = new Kart(this.track, BODIES[p.car.body], { dist, x, assist: diff.assist });
        k.collectsCoins = true;
        this.addRacer(k, p.car, p.name, hi >= 0 ? hi : 0);
      } else {
        const pick = (list, k) => list[(aiCount * k + (opts.seed || 0)) % list.length];
        const body = pick(AI_BODIES, 1);
        const car = {
          body, wheels: pick(AI_WHEELS, 2), color: pick(COLORS, 5), accent: pick(COLORS, 7),
          topper: pick(['none', 'cherry', 'star', 'bow', 'candle', 'chef'], 3), pattern: pick(AI_PATTERNS, 1),
        };
        const k = new Kart(this.track, BODIES[body], { dist, x, assist: 0.5 });
        k.baseMul = diff.aiMul * (0.97 + aiCount * 0.012);
        k.speedMul = k.baseMul;
        const r = this.addRacer(k, car, AI_NAMES[(aiCount + (opts.seed || 0)) % AI_NAMES.length], -1);
        r.ai = new AIDriver(k, this.track, (aiCount + 1) / 7);
        aiCount++;
      }
    }
    this.humanRacers = this.racers.filter(r => r.human >= 0).sort((a, b) => a.human - b.human);

    // ---------- ghost ----------
    this.ghostData = this.mode === 'time' ? opts.ghost : null;
    if (this.ghostData) {
      this.ghostModel = makeGhost(buildCar(this.ghostData.car || opts.players[0].car));
      scene.add(this.ghostModel);
    }
    this.recording = [];

    // ---------- cameras ----------
    this.cams = this.humanRacers.map(() => ({
      cam: new THREE.PerspectiveCamera(70, 1, 0.1, 6000),
      pos: null, up: new THREE.Vector3(0, 1, 0), fwd: new THREE.Vector3(),
    }));

    this.state = 'countdown';
    this.countdown = 3.6;
    this.lastCount = 4;
    this.time = 0;          // race clock (starts at GO)
    this.clock = 0;         // wall clock incl. countdown
    this.finishedCount = 0;
    this.endTimer = 0;
    this.splits = [];
    this.buildHud();
  }

  addRacer(kart, car, name, human) {
    const model = buildCar(car);
    this.scene.add(model);
    const shadow = new THREE.Mesh(this.shadowGeo, this.shadowMat);
    shadow.renderOrder = 1;
    this.scene.add(shadow);
    const r = { kart, model, shadow, car, name, human, ai: null, place: 0, lapShown: 1, cpIndex: 0, gasHeldAt: -1 };
    kart.racer = r;
    this.racers.push(r);
    return r;
  }

  // ---------------------------------------------------------------- HUD
  buildHud() {
    const hud = document.getElementById('hud');
    hud.innerHTML = '';
    hud.className = this.split ? 'split' : '';
    this.hudPanels = this.humanRacers.map((r, i) => {
      const el = document.createElement('div');
      el.className = 'hudp';
      el.innerHTML = `
        <div class="hud-top">
          <div class="pos"><span class="pnum">-</span><small>/${this.racers.length}</small></div>
          <div class="lap"></div>
          <div class="timer">0:00.00</div>
        </div>
        <div class="itembox"><span></span></div>
        <div class="coins">🪙 <b>0</b></div>
        <div class="speed"><b>0</b> קמ"ש</div>
        <div class="msg"></div>
        <div class="sub"></div>
        ${this.split ? `<div class="pname">${r.name}</div>` : '<canvas class="minimap" width="160" height="160"></canvas>'}`;
      hud.appendChild(el);
      if (this.mode === 'time') { el.querySelector('.pos').style.display = 'none'; el.querySelector('.itembox').style.display = 'none'; el.querySelector('.coins').style.display = 'none'; }
      return {
        el, pos: el.querySelector('.pnum'), lap: el.querySelector('.lap'), timer: el.querySelector('.timer'),
        item: el.querySelector('.itembox span'), itemBox: el.querySelector('.itembox'), coins: el.querySelector('.coins b'), speed: el.querySelector('.speed b'),
        msg: el.querySelector('.msg'), sub: el.querySelector('.sub'), minimap: el.querySelector('.minimap'), msgT: 0, subT: 0,
      };
    });
    const mm = this.hudPanels[0]?.minimap;
    if (mm) this.prepMinimap(mm);
  }

  prepMinimap(canvas) {
    const T = this.track;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < T.N; i++) {
      minX = Math.min(minX, T.pos[i * 3]); maxX = Math.max(maxX, T.pos[i * 3]);
      minZ = Math.min(minZ, T.pos[i * 3 + 2]); maxZ = Math.max(maxZ, T.pos[i * 3 + 2]);
    }
    const sc = 140 / Math.max(maxX - minX, maxZ - minZ);
    const ox = 80 - (minX + maxX) / 2 * sc, oz = 80 - (minZ + maxZ) / 2 * sc;
    this.mm = { sc, ox, oz, ctx: canvas.getContext('2d') };
    const bg = document.createElement('canvas'); bg.width = bg.height = 160;
    const g = bg.getContext('2d');
    g.lineCap = g.lineJoin = 'round';
    g.strokeStyle = 'rgba(255,255,255,0.9)'; g.lineWidth = 7;
    g.beginPath();
    for (let i = 0; i <= T.N; i += 4) {
      const k = i % T.N;
      const x = T.pos[k * 3] * sc + ox, y = T.pos[k * 3 + 2] * sc + oz;
      if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.closePath(); g.stroke();
    g.strokeStyle = 'rgba(120,60,140,0.9)'; g.lineWidth = 3; g.stroke();
    this.mm.bg = bg;
  }

  drawMinimap() {
    const mm = this.mm;
    if (!mm) return;
    const g = mm.ctx;
    g.clearRect(0, 0, 160, 160);
    g.drawImage(mm.bg, 0, 0);
    const v = new THREE.Vector3();
    for (const r of [...this.racers].reverse()) {
      this.track.toWorld(r.kart.dist, r.kart.x, 0, v);
      g.fillStyle = r.car.color;
      g.strokeStyle = r.human >= 0 ? '#000' : '#fff';
      g.lineWidth = 2;
      g.beginPath(); g.arc(v.x * mm.sc + mm.ox, v.z * mm.sc + mm.oz, r.human >= 0 ? 6 : 4, 0, Math.PI * 2); g.fill(); g.stroke();
    }
  }

  flash(i, text, dur = 1.2, cls = '') {
    const p = this.hudPanels[i];
    if (!p) return;
    p.msg.textContent = text;
    p.msg.className = 'msg show ' + cls;
    p.msgT = dur;
  }

  sub(i, text, dur = 2, cls = '') {
    const p = this.hudPanels[i];
    if (!p) return;
    p.sub.innerHTML = text;
    p.sub.className = 'sub show ' + cls;
    p.subT = dur;
  }

  // ---------------------------------------------------------------- update
  update(dt) {
    const input = this.game.input;
    const audio = this.game.audio;
    this.clock += dt;

    // countdown
    if (this.state === 'countdown') {
      this.countdown -= dt;
      const n = Math.ceil(this.countdown);
      if (n !== this.lastCount && n >= 1 && n <= 3) {
        this.lastCount = n;
        this.hudPanels.forEach((_, i) => this.flash(i, String(n), 0.9, 'count'));
        audio.sfx('beep');
      }
      for (const r of this.humanRacers) {
        const inp = input.get(r.human, this.split);
        if (inp.gas && r.gasHeldAt < 0) r.gasHeldAt = this.countdown;
        if (!inp.gas) r.gasHeldAt = -1;
      }
      if (this.countdown <= 0) {
        this.state = 'running';
        this.hudPanels.forEach((_, i) => this.flash(i, '!סעו', 0.8, 'go'));
        audio.sfx('go');
        for (const r of this.racers) {
          r.kart.frozen = false;
          // rocket start: pressed gas during the "1"
          if (r.human >= 0 && r.gasHeldAt > 0 && r.gasHeldAt < 1.1) { r.kart.boost = 1.0; r.kart.events.push({ type: 'boost', level: 2 }); this.sub(r.human, '!זינוק טורבו', 1.2, 'good'); }
          if (r.ai && Math.random() < 0.4) r.kart.boost = 0.6;
        }
      }
    } else {
      this.time += dt;
    }

    // inputs / AI
    const ranking = this.ranking();
    const hazards = this.items.hazards();
    const karts = this.racers.map(r => r.kart);
    const leadHuman = Math.max(...this.humanRacers.map(r => r.kart.dist));
    for (const r of this.racers) {
      const k = r.kart;
      if (r.human >= 0 && !k.finished && !this.game.autopilot) {
        const inp = input.get(r.human, this.split);
        Object.assign(k.input, inp);
      } else {
        if (!r.ai) r.ai = new AIDriver(k, this.track, 0.5);
        r.ai.update(dt, karts, hazards);
        if (r.human < 0 && this.mode === 'race') {
          // gentle rubber band keeps races exciting for kids
          const d = k.dist - leadHuman;
          let target = k.baseMul;
          if (d > 30) target *= 0.92; else if (d < -60) target *= 1.08; else if (d < -25) target *= 1.03;
          k.speedMul += (target - k.speedMul) * Math.min(1, dt);
        }
      }
      if (k.input.item && k.item && this.state === 'running') this.items.use(k, karts);
    }

    // physics (fixed substeps)
    const sub = Math.max(1, Math.ceil(dt / (1 / 120)));
    const h = dt / sub;
    for (let s = 0; s < sub; s++) {
      for (const k of karts) k.step(h);
      this.collide(karts);
    }

    if (this.state !== 'countdown') this.items.update(dt, karts, ranking, this.clock);
    else this.items.update(0, [], ranking, this.clock);

    // race progress
    for (const r of this.racers) this.progress(r);

    // ghost
    if (this.state === 'running' && this.mode === 'time') {
      const k = this.humanRacers[0].kart;
      const idx = Math.floor(this.time / GHOST_DT);
      while (this.recording.length <= idx && !k.finished) {
        this.recording.push([+k.dist.toFixed(2), +k.x.toFixed(2), +k.h.toFixed(2), +k.yaw.toFixed(3)]);
      }
    }

    // events → sound + particles
    for (const r of this.racers) this.handleEvents(r);
    for (const e of this.items.events) {
      if (e.type === 'boxPop') this.particles.burst(e.pos, '#ff9ae6', 18, 7);
      else if (e.type === 'coinPop') this.particles.burst(e.pos, '#ffd23f', 10, 5);
      else if (e.type === 'boom') { this.particles.burst(e.pos, '#ff6a00', 30, 10); audio.sfx('boom'); }
      else if (e.type === 'trail') this.particles.emit(e.pos, new THREE.Vector3(0, 1, 0), '#ffffff', 0.4, 1);
    }
    this.items.events.length = 0;

    // visuals
    for (const r of this.racers) this.place3D(r, dt);
    if (this.ghostModel) this.placeGhost();
    this.particles.update(dt);
    this.cams.forEach((c, i) => this.updateCamera(c, this.humanRacers[i], dt));
    this.updateHud(dt, ranking);

    // engines
    this.humanRacers.forEach((r, i) => {
      const k = r.kart;
      audio.setEngine(i, Math.min(1.3, Math.abs(k.v) / 46), k.boost > 0, true);
    });

    // end of race
    if (this.state === 'running' && this.humanRacers.every(r => r.kart.finished)) {
      this.state = 'finishing';
      this.endTimer = this.mode === 'time' ? 1.6 : 3.2;
    }
    if (this.state === 'finishing') {
      this.endTimer -= dt;
      if (this.endTimer <= 0) { this.state = 'done'; this.game.onRaceFinished(this.results()); }
    }
  }

  collide(karts) {
    const L = this.track.length;
    for (let i = 0; i < karts.length; i++) {
      for (let j = i + 1; j < karts.length; j++) {
        const a = karts[i], b = karts[j];
        const dd = wrapDelta(a.dist - b.dist, L);
        const dx = a.x - b.x;
        if (Math.abs(dd) < 2.8 && Math.abs(dx) < 2.0 && Math.abs(a.h - b.h) < 1.5) {
          const push = (2.0 - Math.abs(dx)) / 2 * (dx >= 0 ? 1 : -1);
          a.x += push; b.x -= push;
          if (Math.abs(dx) < 1.4) {
            const [back, front] = dd < 0 ? [a, b] : [b, a];
            if (back.v > front.v) {
              const avg = (back.v + front.v) / 2;
              back.v = avg * 0.95; front.v = Math.max(front.v, avg);
              back.dist -= 0.05;
            }
          }
          const rel = Math.abs(a.v - b.v) + Math.abs(push) * 10;
          if (rel > 3 && (a.racer.human >= 0 || b.racer.human >= 0) && (this.lastBump || 0) < this.clock - 0.25) {
            this.lastBump = this.clock;
            this.game.audio.sfx('bump');
          }
        }
      }
    }
  }

  progress(r) {
    const k = r.kart, L = this.track.length;
    if (k.finished) return;
    const lap = Math.max(1, Math.floor(k.dist / L) + 1);
    if (r.human >= 0 && this.state === 'running') {
      // split checkpoints
      const cps = this.track.checkpoints;
      const lapStart = (lap - 1) * L;
      while (r.cpIndex < cps.length && k.dist >= lapStart + cps[r.cpIndex] && k.dist < lapStart + L) {
        this.onCheckpoint(r, r.cpIndex);
        r.cpIndex++;
      }
      if (lap > r.lapShown && lap <= this.laps) {
        r.lapShown = lap;
        r.cpIndex = 0;
        this.flash(r.human, lap === this.laps ? '!הקפה אחרונה' : `הקפה ${lap}`, 1.5, 'lap');
        this.game.audio.sfx('lap');
      }
    }
    if (k.dist >= this.laps * L && this.state !== 'countdown') {
      k.finished = true;
      k.finishTime = this.time;
      r.place = ++this.finishedCount;
      if (r.human >= 0) {
        k.input.item = false;
        this.game.audio.sfx(r.place === 1 || this.mode === 'time' ? 'win' : 'finish');
        const msg = this.mode === 'time' ? fmt(k.finishTime) : r.place === 1 ? '!ניצחון' : `מקום ${r.place}`;
        this.flash(r.human, msg, 10, 'finish');
        this.particles.burst(r.model.position, '#ffd23f', 40, 12);
      }
    }
  }

  onCheckpoint(r, idx) {
    this.game.audio.sfx('checkpoint');
    if (this.mode !== 'time') return;
    const t = this.time;
    this.splits[idx] = t;
    const ref = this.ghostData?.splits?.[idx];
    if (ref != null) {
      const d = t - ref;
      this.sub(r.human, `${d <= 0 ? '−' : '+'}${Math.abs(d).toFixed(2)}`, 2, d <= 0 ? 'good' : 'bad');
    } else {
      this.sub(r.human, fmt(t), 1.5);
    }
  }

  handleEvents(r) {
    const k = r.kart, audio = this.game.audio;
    const mine = r.human >= 0;
    for (const e of k.events) {
      switch (e.type) {
        case 'boost':
          if (mine) audio.sfx(e.level === 3 ? 'boost' : 'miniboost');
          if (mine && e.level < 3) this.sub(r.human, e.level === 2 ? '!טורבו כתום' : '!טורבו כחול', 1, 'good');
          break;
        case 'bump': if (mine) audio.sfx('bump'); break;
        case 'jump': if (mine) audio.sfx('jump'); break;
        case 'land': if (mine) audio.sfx('land'); this.particles.burst(r.model.position, '#ffffff', 10, 4); break;
        case 'spin': audio.sfx('spin'); break;
        case 'shieldPop': audio.sfx('pop'); this.particles.burst(r.model.position, '#ff8ad8', 20, 6); break;
        case 'shieldOn': if (mine) audio.sfx('shield'); break;
        case 'sticky': if (mine) audio.sfx('sticky'); break;
        case 'itemGet': if (mine) audio.sfx('item'); break;
        case 'coin': if (mine) audio.sfx('coin'); break;
        case 'fire': audio.sfx('fire'); break;
        case 'drop': if (mine) audio.sfx('drop'); break;
        default: break;
      }
    }
    k.events.length = 0;
  }

  ranking() {
    return [...this.racers].sort((a, b) => {
      if (a.kart.finished && b.kart.finished) return a.place - b.place;
      if (a.kart.finished) return -1;
      if (b.kart.finished) return 1;
      return b.kart.dist - a.kart.dist;
    }).map(r => r.kart);
  }

  // ---------------------------------------------------------------- visuals
  place3D(r, dt) {
    const k = r.kart, m = r.model, fr = this.frame;
    this.track.frame(k.dist, fr);
    let yaw = k.yaw;
    if (k.drifting) yaw += k.driftDir * 0.38;
    if (k.spin > 0) yaw += k.spin * 11;
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const fwd = new THREE.Vector3().copy(fr.tan).multiplyScalar(c).addScaledVector(fr.right, s);
    const right = new THREE.Vector3().copy(fr.right).multiplyScalar(c).addScaledVector(fr.tan, -s);
    m.position.copy(fr.pos).addScaledVector(fr.right, k.x).addScaledVector(fr.up, k.h);
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, fr.up, fwd.clone().negate()));
    const ud = m.userData;
    // chassis lean
    const speedR = Math.min(1, Math.abs(k.v) / 46);
    const roll = -k.input.steer * 0.07 * speedR + (k.drifting ? -k.driftDir * 0.06 : 0);
    const pitch = k.h > 0.05 ? -k.vh * 0.015 : 0;
    ud.chassis.rotation.z += (roll - ud.chassis.rotation.z) * Math.min(1, dt * 8);
    ud.chassis.rotation.x += (pitch - ud.chassis.rotation.x) * Math.min(1, dt * 8);
    for (const w of ud.wheels) w.rotation.x -= k.v * dt / 0.45;
    if (ud.spinner) ud.spinner.rotation.y += dt * (6 + Math.abs(k.v) * 0.4);
    for (const p of ud.front) p.rotation.y = -k.input.steer * 0.4;
    ud.shield.visible = k.shield > 0;
    if (k.shield > 0) ud.shield.rotation.y += dt * 2;
    if (k.sticky > 0) ud.chassis.position.y = Math.sin(this.clock * 20) * 0.05; else ud.chassis.position.y = 0;

    // shadow on the road
    r.shadow.position.copy(fr.pos).addScaledVector(fr.right, k.x).addScaledVector(fr.up, this.rampAt(k) + 0.08);
    r.shadow.quaternion.copy(m.quaternion);
    r.shadow.scale.setScalar(Math.max(0.4, 1 - k.h * 0.08));

    // particles
    const rear = new THREE.Vector3();
    if (k.drifting && k.h < 0.1) {
      const col = k.driftCharge > 1.5 ? '#ff8a00' : k.driftCharge > 0.7 ? '#4fc3ff' : '#ffffff';
      for (const side of [-1, 1]) {
        rear.set(side * 1.0, 0.2, 1.1).applyQuaternion(m.quaternion).add(m.position);
        this.particles.emit(rear, fr.up.clone().multiplyScalar(2).addScaledVector(fwd, -3), col, 0.25, 2);
      }
    }
    if (k.boost > 0) {
      for (const ex of ud.exhausts) {
        rear.copy(ex).applyQuaternion(m.quaternion).add(m.position);
        const cols = (TRAILS[r.car.trail] || TRAILS.classic).colors;
        this.particles.emit(rear, fwd.clone().multiplyScalar(-8), cols[Math.floor(Math.random() * cols.length)], 0.25, 1.5);
      }
    }
    if (k.spin > 0 && Math.random() < 0.5) {
      rear.copy(m.position).addScaledVector(fr.up, 2.2);
      this.particles.emit(rear, fr.up.clone().multiplyScalar(2), '#ffe14f', 0.5, 3);
    }
  }

  rampAt(k) { return k.groundH || 0; }

  placeGhost() {
    const g = this.ghostData, m = this.ghostModel;
    const t = Math.max(0, this.time) / GHOST_DT;
    const i = Math.min(g.frames.length - 1, Math.floor(t)), j = Math.min(g.frames.length - 1, i + 1), f = t - Math.floor(t);
    const a = g.frames[i], b = g.frames[j];
    const dist = a[0] + (b[0] - a[0]) * f, x = a[1] + (b[1] - a[1]) * f, h = a[2] + (b[2] - a[2]) * f, yaw = a[3] + (b[3] - a[3]) * f;
    const fr = this.frame;
    this.track.frame(dist, fr);
    const c = Math.cos(yaw), s = Math.sin(yaw);
    const fwd = new THREE.Vector3().copy(fr.tan).multiplyScalar(c).addScaledVector(fr.right, s);
    const right = new THREE.Vector3().copy(fr.right).multiplyScalar(c).addScaledVector(fr.tan, -s);
    m.position.copy(fr.pos).addScaledVector(fr.right, x).addScaledVector(fr.up, h);
    m.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(right, fr.up, fwd.negate()));
    // fade out when you are right on top of it
    const me = this.humanRacers[0].kart;
    m.visible = Math.abs(dist - me.dist) > 2.5 || Math.abs(x - me.x) > 2.2;
  }

  updateCamera(c, r, dt) {
    const k = r.kart, fr = this.frame;
    this.track.frame(k.dist, fr);
    const camYaw = k.yaw * 0.6;
    const fwd = new THREE.Vector3().copy(fr.tan).multiplyScalar(Math.cos(camYaw)).addScaledVector(fr.right, Math.sin(camYaw));
    const target = r.model.position;
    const speedR = Math.min(1.3, Math.abs(k.v) / 46);
    const back = 7.2 + speedR * 1.6, upOff = 2.9 + speedR * 0.3;
    const desired = new THREE.Vector3().copy(target).addScaledVector(fwd, -back).addScaledVector(fr.up, upOff);
    if (!c.pos) { c.pos = desired.clone(); c.up.copy(fr.up); c.fwd.copy(fwd); }
    const a = 1 - Math.exp(-dt * 9);
    c.pos.lerp(desired, a);
    c.up.lerp(fr.up, 1 - Math.exp(-dt * 6)).normalize();
    c.fwd.lerp(fwd, 1 - Math.exp(-dt * 8)).normalize();
    // keep the camera at a sane distance even when smoothing lags at high speed
    const off = c.pos.clone().sub(target);
    const len = off.length();
    if (len > back * 1.6) c.pos.copy(target).addScaledVector(off.normalize(), back * 1.6);
    const cam = c.cam;
    cam.position.copy(c.pos);
    cam.up.copy(c.up);
    cam.lookAt(new THREE.Vector3().copy(target).addScaledVector(c.fwd, 5).addScaledVector(fr.up, 1.3));
    const fov = 66 + speedR * 10 + (k.boost > 0 ? 8 : 0);
    cam.fov += (fov - cam.fov) * Math.min(1, dt * 4);
    cam.updateProjectionMatrix();
  }

  updateHud(dt, ranking) {
    this.humanRacers.forEach((r, i) => {
      const p = this.hudPanels[i], k = r.kart;
      const place = k.finished ? r.place : ranking.indexOf(k) + 1;
      p.pos.textContent = place;
      p.lap.textContent = this.mode === 'time' ? 'נגד השעון' : `הקפה ${Math.min(this.laps, Math.max(1, r.lapShown))}/${this.laps}`;
      p.timer.textContent = fmt(k.finished ? k.finishTime : Math.max(0, this.time));
      p.speed.textContent = Math.round(Math.abs(k.v) * 3.6);
      p.coins.textContent = k.coins;
      const icon = k.item ? ITEM_INFO[k.item].icon : '';
      if (p.item.textContent !== icon) { p.item.textContent = icon; p.itemBox.classList.toggle('has', !!icon); }
      if (p.msgT > 0) { p.msgT -= dt; if (p.msgT <= 0) p.msg.className = 'msg'; }
      if (p.subT > 0) { p.subT -= dt; if (p.subT <= 0) p.sub.className = 'sub'; }
    });
    if (this.mm && Math.floor(this.clock * 20) !== this.mmTick) { this.mmTick = Math.floor(this.clock * 20); this.drawMinimap(); }
  }

  // ---------------------------------------------------------------- results
  results() {
    const L = this.track.length;
    const standings = [...this.racers].sort((a, b) => {
      const ta = a.kart.finished ? a.kart.finishTime : this.time + (this.laps * L - a.kart.dist) / 40;
      const tb = b.kart.finished ? b.kart.finishTime : this.time + (this.laps * L - b.kart.dist) / 40;
      return ta - tb;
    }).map((r, i) => ({
      name: r.name, human: r.human, color: r.car.color, place: i + 1,
      time: r.kart.finished ? r.kart.finishTime : this.time + (this.laps * L - r.kart.dist) / 40,
      estimated: !r.kart.finished, coins: r.kart.coins,
    }));
    const res = { mode: this.mode, trackId: this.opts.trackDef.id, standings, split: this.split };
    if (this.mode === 'time') {
      const t = this.humanRacers[0].kart.finishTime;
      res.time = t;
      res.medals = medalTimes(this.track);
      res.ghost = { time: t, frames: this.recording, splits: this.splits, car: this.opts.players[0].car };
    }
    return res;
  }

  // ---------------------------------------------------------------- render
  render(renderer, w, h) {
    const n = this.cams.length;
    renderer.setScissorTest(n > 1);
    this.cams.forEach((c, i) => {
      const vh = h / n;
      const y = n > 1 ? (n - 1 - i) * vh : 0;
      c.cam.aspect = w / vh;
      c.cam.updateProjectionMatrix();
      renderer.setViewport(0, y, w, vh);
      renderer.setScissor(0, y, w, vh);
      if (this.sky) this.sky.position.copy(c.cam.position);
      renderer.render(this.scene, c.cam);
    });
    renderer.setScissorTest(false);
  }

  dispose() {
    this.items.dispose();
    this.scene.traverse(o => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of ms) { if (m.map) m.map.dispose(); m.dispose(); }
      }
    });
    document.getElementById('hud').innerHTML = '';
  }
}
