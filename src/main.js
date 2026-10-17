import '@fontsource/rubik/400.css';
import '@fontsource/rubik/700.css';
import '@fontsource/rubik/900.css';
import './style.css';
import * as THREE from 'three';
import { TRACKS } from './trackdefs.js';
import { BODIES } from './physics.js';
import { WHEELS, TOPPERS, PATTERNS, FINISHES, TRAILS, COLORS } from './carmodel.js';
import { Race, formatTime } from './race.js';
import { GarageScene } from './garage.js';
import { Input, createTouchControls, resetTouch } from './input.js';
import { Audio } from './audio.js';
import { loadSave, writeSave, loadGhost, writeGhost } from './save.js';

const $ = sel => document.querySelector(sel);
const MEDAL = ['', '🥉', '🥈', '🥇'];
const TROPHY = { 1: '🏆', 2: '🥈', 3: '🥉' };
const WORLD_SIZE = 5;

// garage categories: save.owned[group] holds what the player has, car[key] what is fitted
const PARTS = {
  bodies: { key: 'body', list: BODIES },
  wheels: { key: 'wheels', list: WHEELS },
  toppers: { key: 'topper', list: TOPPERS },
  patterns: { key: 'pattern', list: PATTERNS },
  finishes: { key: 'finish', list: FINISHES },
  trails: { key: 'trail', list: TRAILS },
};

class Game {
  constructor() {
    this.save = loadSave();
    this.input = new Input();
    this.audio = new Audio();
    this.audio.setVolumes(this.save.settings.music, this.save.settings.sfx);
    this.isTouch = matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window;

    const canvas = $('#game');
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: !this.isTouch, powerPreference: 'high-performance' });
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.applyQuality();
    this.garage = new GarageScene();
    this.garage.setCar(this.save.car);
    this.race = null;
    this.paused = false;
    this.ui = $('#ui');
    this.screen = null;
    this.garageOffset = 0;

    window.addEventListener('resize', () => this.resize());
    this.resize();
    // first interaction unlocks audio
    const unlock = () => { this.audio.unlock(); this.audio.playMusic(this.race ? 'race' : 'menu'); };
    window.addEventListener('pointerdown', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.race && !this.paused) this.pause(); });

    this.showMain();
    this.last = performance.now();
    this.renderer.setAnimationLoop(t => this.frame(t));
  }

  applyQuality() {
    const q = this.save.settings.quality;
    const dpr = window.devicePixelRatio || 1;
    const ratio = q === 'low' ? 0.75 : q === 'high' ? Math.min(dpr, 2) : Math.min(dpr, this.isTouch ? 1.25 : 1.5);
    this.renderer.setPixelRatio(ratio);
  }

  resize() {
    this.w = window.innerWidth; this.h = window.innerHeight;
    this.renderer.setSize(this.w, this.h, false);
  }

  persist() { writeSave(this.save); }

  // ------------------------------------------------------------ loop
  frame(now) {
    let dt = (now - this.last) / 1000;
    this.last = now;
    dt = Math.min(dt, 1 / 20);
    this.input.poll();
    if (this.race) {
      if (this.input.pausePressed() && this.race.state !== 'done') { this.paused ? this.resume() : this.pause(); }
      if (this.input.restartPressed() && this.race.state !== 'done') this.restartRace();
      if (this.race && !this.paused) this.race.update(dt);
      if (this.race) this.race.render(this.renderer, this.w, this.h);
    } else {
      this.garage.update(dt);
      this.garage.render(this.renderer, this.w, this.h, this.garageOffset);
    }
    this.input.endFrame();
  }

  // ------------------------------------------------------------ helpers
  click() { this.audio.unlock(); this.audio.sfx('click'); }

  setScreen(html, cls = '') {
    this.ui.className = 'ui ' + cls;
    this.ui.innerHTML = html;
    this.ui.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', e => {
      this.click();
      this.actions[b.dataset.act]?.call(this, b.dataset.arg, e);
    }));
  }

  coinBar() { return `<div class="coinbar">🪙 <b>${this.save.coins}</b></div>`; }

  // ------------------------------------------------------------ screens
  showMain() {
    this.garageOffset = this.w > 760 ? this.w * 0.2 : 0;
    this.garage.setCar(this.save.car);
    this.audio.playMusic('menu');
    this.setScreen(`
      ${this.coinBar()}
      <div class="title">
        <h1>מרוץ<br><span>הממתקים</span></h1>
        <p>🍭 מרוצים מתוקים במהירות מטורפת 🍩</p>
      </div>
      <div class="menu">
        <button class="big pink" data-act="pick" data-arg="race">🏁 מרוץ</button>
        <button class="big blue" data-act="pick" data-arg="time">⏱️ נגד השעון</button>
        <button class="big yellow ${this.isTouch ? 'disabled' : ''}" data-act="pick" data-arg="split" ${this.isTouch ? 'title="דורש מקלדת"' : ''}>👫 2 שחקנים</button>
        <div class="row">
          <button class="mid green" data-act="garage">🛠️ המוסך</button>
          <button class="mid purple" data-act="settings">⚙️ הגדרות</button>
          <button class="mid gray" data-act="help">❔ איך משחקים</button>
        </div>
      </div>`, 'main');
  }

  // achievements that unlock garage items and tracks
  progress() {
    const medals = Object.values(this.save.medals), trophies = this.save.trophies;
    return {
      gold: medals.filter(m => m === 3).length,
      trophy: Object.values(trophies).filter(p => p === 1).length,
      allTracks: TRACKS.every(t => trophies[t.id]),
    };
  }

  unlockMet(u) {
    const p = this.progress();
    return u.need === 'allTracks' ? p.allTracks : p[u.need] >= u.n;
  }

  unlockLabel(u) {
    if (u.need === 'gold') return `🥇×${u.n}`;
    if (u.need === 'trophy') return `🏆×${u.n}`;
    return '🏁 כל המסלולים';
  }

  // a track opens when bought, or for free after a podium on the track before it
  trackOpen(i) {
    const t = TRACKS[i];
    if (this.save.ownedTracks.includes(t.id)) return true;
    const prev = TRACKS[i - 1];
    return !!prev && this.save.trophies[prev.id] <= 3;
  }

  showTracks(mode) {
    this.mode = mode;
    this.garageOffset = 0;
    const card = (t, i) => {
      const owned = this.trackOpen(i);
      const medal = this.save.medals[t.id] || 0;
      const trophy = this.save.trophies[t.id];
      const best = this.save.bestTimes[t.id];
      const extra = mode === 'time'
        ? `<div class="meta">${MEDAL[medal] || '—'} ${best ? formatTime(best) : ''}</div>`
        : `<div class="meta">${trophy ? (TROPHY[trophy] || '🎗️') + ' מקום ' + trophy : '—'}</div>`;
      const lock = `<div class="lock">🔒 ${t.cost} 🪙${i > 0 ? `<small>או מקום 1–3 ב"${TRACKS[i - 1].name}"</small>` : ''}</div>`;
      return `<button class="track ${owned ? '' : 'locked'}" data-act="track" data-arg="${t.id}" style="--c1:${t.theme.sky1};--c2:${t.theme.road}">
        <div class="tnum">${i + 1}</div>
        <div class="tname">${t.name}</div>
        <div class="tdesc">${t.desc}</div>
        ${owned ? extra : lock}
      </button>`;
    };
    let worlds = '';
    for (let w = 0; w * WORLD_SIZE < TRACKS.length; w++) {
      const list = TRACKS.slice(w * WORLD_SIZE, (w + 1) * WORLD_SIZE);
      worlds += `<h3 class="world">🌍 עולם ${w + 1}</h3><div class="tracks">${list.map((t, k) => card(t, w * WORLD_SIZE + k)).join('')}</div>`;
    }
    const title = { race: '🏁 מרוץ', time: '⏱️ נגד השעון', split: '👫 2 שחקנים' }[mode];
    this.setScreen(`
      ${this.coinBar()}
      <h2>${title} – בחרו מסלול</h2>
      ${worlds}
      <div class="bottom"><button class="mid gray" data-act="back">→ חזרה</button></div>`, 'tracksel');
  }

  showGarage(player = 0) {
    this.garagePlayer = player;
    this.garageTab ||= 'body';
    const tab = this.garageTab;
    const car = player === 0 ? this.save.car : this.save.car2;
    this.garage.setCar(car);
    this.garageOffset = this.w > 700 ? -this.w * 0.22 : 0;
    const owned = this.save.owned;
    const opts = group => {
      const { key, list } = PARTS[group];
      return `<div class="opts">${Object.entries(list).map(([id, info]) => {
        const have = owned[group].includes(id);
        const price = info.unlock ? (this.unlockMet(info.unlock) ? '✨ נפתח!' : `🔒 ${this.unlockLabel(info.unlock)}`) : `🔒 ${info.cost} 🪙`;
        const swatch = info.colors ? `<span class="trailsw">${info.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span>` : '';
        return `<button class="opt ${car[key] === id ? 'sel' : ''} ${have ? '' : 'locked'}" data-act="part" data-arg="${group}:${id}">
          ${swatch}${info.name}${have ? '' : `<small>${price}</small>`}</button>`;
      }).join('')}</div>`;
    };
    const swatches = key => `<div class="swatches">${COLORS.map(c => `<button class="sw ${car[key] === c ? 'sel' : ''}" style="background:${c}" data-act="color" data-arg="${key}:${c}" aria-label="צבע"></button>`).join('')}</div>`;
    const st = BODIES[car.body];
    const bar = (v, min, max) => `<i style="width:${Math.round(15 + 85 * (v - min) / (max - min))}%"></i>`;
    const tabs = [['body', '🏎️ מכונית'], ['wheels', '🛞 גלגלים'], ['topper', '👑 קישוט'], ['paint', '🎨 צבע'], ['fx', '✨ אפקטים']];
    const content = {
      body: `${opts('bodies')}
        <div class="stats">
          <div>מהירות <span class="bar">${bar(st.maxSpeed, 43, 51)}</span></div>
          <div>תאוצה <span class="bar">${bar(st.accel, 19, 32)}</span></div>
          <div>שליטה <span class="bar">${bar(st.handling, 2.0, 2.8)}</span></div>
        </div>`,
      wheels: opts('wheels'),
      topper: opts('toppers'),
      paint: `<h3>צבע ראשי</h3>${swatches('color')}<h3>צבע משני</h3>${swatches('accent')}<h3>דוגמה</h3>${opts('patterns')}<h3>גימור</h3>${opts('finishes')}`,
      fx: `<h3>שובל טורבו</h3>${opts('trails')}`,
    }[tab];
    this.setScreen(`
      ${this.coinBar()}
      <div class="garage">
        <h2>🛠️ המוסך</h2>
        <div class="tabs">
          <button class="${player === 0 ? 'sel' : ''}" data-act="gtab" data-arg="0">שחקן 1</button>
          <button class="${player === 1 ? 'sel' : ''}" data-act="gtab" data-arg="1">שחקן 2</button>
        </div>
        <div class="gtabs">${tabs.map(([id, label]) => `<button class="${tab === id ? 'sel' : ''}" data-act="gsection" data-arg="${id}">${label}</button>`).join('')}</div>
        <div class="gcontent">${content}</div>
        <div class="bottom"><button class="mid green" data-act="back">✔ סיום</button></div>
      </div>`, 'garagescr');
  }

  showSettings() {
    const s = this.save.settings;
    const seg = (key, vals) => `<div class="seg">${vals.map(([v, l]) => `<button class="${s[key] === v ? 'sel' : ''}" data-act="set" data-arg="${key}:${v}">${l}</button>`).join('')}</div>`;
    this.setScreen(`
      <div class="panel">
        <h2>⚙️ הגדרות</h2>
        <label>שם השחקן <input id="pname" maxlength="12" value="${this.save.name.replace(/"/g, '')}"></label>
        <h3>רמת קושי</h3>
        ${seg('difficulty', [['easy', '😊 קל'], ['normal', '😎 רגיל'], ['hard', '🔥 קשה']])}
        <p class="hint">בקל – ההגה עוזר להישאר על המסלול והיריבים איטיים יותר.</p>
        <h3>גז אוטומטי (מסך מגע)</h3>
        ${seg('autoGas', [[true, 'פועל'], [false, 'כבוי']])}
        <h3>גרפיקה</h3>
        ${seg('quality', [['low', 'חסכונית'], ['auto', 'רגילה'], ['high', 'גבוהה']])}
        <h3>מוזיקה</h3><input type="range" id="vmusic" min="0" max="1" step="0.05" value="${s.music}">
        <h3>צלילים</h3><input type="range" id="vsfx" min="0" max="1" step="0.05" value="${s.sfx}">
        <div class="bottom">
          <button class="mid gray" data-act="reset">🗑️ איפוס התקדמות</button>
          <button class="mid green" data-act="back">✔ שמירה</button>
        </div>
      </div>`, 'settings');
    $('#pname').addEventListener('input', e => { this.save.name = e.target.value.trim() || 'שחקן'; this.persist(); });
    $('#vmusic').addEventListener('input', e => { s.music = +e.target.value; this.audio.setVolumes(s.music, s.sfx); this.persist(); });
    $('#vsfx').addEventListener('input', e => { s.sfx = +e.target.value; this.audio.setVolumes(s.music, s.sfx); this.audio.sfx('coin'); this.persist(); });
  }

  showHelp() {
    this.setScreen(`
      <div class="panel help">
        <h2>❔ איך משחקים</h2>
        <table>
          <tr><th></th><th>שחקן 1</th><th>שחקן 2</th></tr>
          <tr><td>גז / ברקס</td><td>W / S</td><td>↑ / ↓</td></tr>
          <tr><td>היגוי</td><td>A / D</td><td>← / →</td></tr>
          <tr><td>דריפט</td><td>Shift שמאלי</td><td>Shift ימני</td></tr>
          <tr><td>שימוש בחפץ</td><td>רווח</td><td>Enter</td></tr>
        </table>
        <p>במשחק לבד אפשר להשתמש גם בחצים, וגם בשלט (ג'ויסטיק). <b>Esc</b> – הפסקה, <b>R</b> – התחלה מחדש מהירה.</p>
        <ul>
          <li>🌀 <b>דריפט:</b> החזיקו דריפט תוך כדי פנייה. כשהניצוצות כחולים או כתומים – שחררו לקבלת טורבו!</li>
          <li>🟧 <b>משטחי טורבו</b> על הכביש נותנים דחיפה. <b>רמפות</b> מעיפות אתכם לאוויר.</li>
          <li>🎁 <b>קופסאות הפתעה:</b> 🚀 טורבו · 🫧 מגן מסטיק · 🍬 מלכודת טופי (נזרקת אחורה) · 🍭 טיל סוכריה (רודף אחרי מי שלפניכם)</li>
          <li>🪙 <b>מטבעות:</b> אספו במרוצים וקנו מסלולים, מכוניות וגלגלים במוסך.</li>
          <li>⏱️ <b>נגד השעון:</b> הקפה אחת נגד רוח הרפאים של השיא שלכם. השיגו 🥉🥈🥇!</li>
          <li>🙌 <b>זינוק טורבו:</b> לחצו גז בדיוק כשמופיע 1 בספירה.</li>
        </ul>
        <div class="bottom"><button class="mid green" data-act="back">!הבנתי</button></div>
      </div>`, 'settings');
  }

  showResults(res) {
    const humans = res.standings.filter(s => s.human >= 0);
    let rewards = 0;
    let html = '';
    if (res.mode === 'time') {
      const t = res.time;
      const [b, s, g] = res.medals;
      const medal = t <= g ? 3 : t <= s ? 2 : t <= b ? 1 : 0;
      const prevMedal = this.save.medals[res.trackId] || 0;
      const prevBest = this.save.bestTimes[res.trackId];
      const record = !prevBest || t < prevBest;
      if (record) { this.save.bestTimes[res.trackId] = t; writeGhost(res.trackId, res.ghost); }
      if (medal > prevMedal) {
        const pay = [0, 10, 20, 40];
        for (let m = prevMedal + 1; m <= medal; m++) rewards += pay[m];
        this.save.medals[res.trackId] = medal;
      }
      html = `
        <div class="bigtime">${formatTime(t)}</div>
        ${record ? '<div class="record">!שיא חדש 🎉</div>' : `<div class="hint">השיא שלך: ${formatTime(prevBest)}</div>`}
        <div class="medals">
          <div class="${medal >= 1 ? 'got' : ''}">🥉<small>${formatTime(b)}</small></div>
          <div class="${medal >= 2 ? 'got' : ''}">🥈<small>${formatTime(s)}</small></div>
          <div class="${medal >= 3 ? 'got' : ''}">🥇<small>${formatTime(g)}</small></div>
        </div>`;
    } else {
      const pay = { 1: 30, 2: 20, 3: 12 };
      for (const h of humans) {
        rewards += (pay[h.place] || 5) + h.coins;
        if (!res.split) {
          const prev = this.save.trophies[res.trackId];
          if (!prev || h.place < prev) this.save.trophies[res.trackId] = h.place;
        }
      }
      const rows = res.standings.map(s => `<tr class="${s.human >= 0 ? 'me' : ''}">
        <td>${s.place}</td><td><i class="dot" style="background:${s.color}"></i>${s.name}</td><td><bdi dir="ltr">${s.estimated ? '~' : ''}${formatTime(s.time)}</bdi></td></tr>`).join('');
      const top = humans[0];
      const headline = res.split
        ? `${(humans.find(h => h.place === Math.min(...humans.map(x => x.place))) || {}).name} !ניצח`
        : top.place === 1 ? '🏆 !ניצחון' : top.place <= 3 ? `!מקום ${top.place} – כל הכבוד` : `מקום ${top.place}`;
      html = `<div class="headline">${headline}</div><table class="standings">${rows}</table>`;
    }
    this.save.coins += rewards;
    this.persist();
    const idx = TRACKS.findIndex(t => t.id === res.trackId);
    const next = TRACKS[idx + 1];
    const nextOwned = next && this.trackOpen(idx + 1);
    this.setScreen(`
      ${this.coinBar()}
      <div class="panel results">
        <h2>${TRACKS[idx].name}</h2>
        ${html}
        ${rewards ? `<div class="reward">+${rewards} 🪙</div>` : ''}
        <div class="bottom">
          <button class="mid pink" data-act="again">↻ שוב</button>
          ${nextOwned ? `<button class="mid blue" data-act="track" data-arg="${next.id}">המסלול הבא ←</button>` : ''}
          <button class="mid gray" data-act="menu">תפריט</button>
        </div>
      </div>`, 'resultscr');
    if (rewards) this.audio.sfx('buy');
  }

  showPause() {
    this.setScreen(`
      <div class="panel pause">
        <h2>⏸️ הפסקה</h2>
        <button class="big green" data-act="resume">▶ המשך</button>
        <button class="big blue" data-act="restart">↻ התחלה מחדש</button>
        <button class="big gray" data-act="quit">🏠 יציאה לתפריט</button>
      </div>`, 'pausescr');
  }

  // ------------------------------------------------------------ race flow
  startRace(trackId) {
    const def = TRACKS.find(t => t.id === trackId);
    this.lastTrack = trackId;
    const players = [{ name: this.save.name, car: this.save.car }];
    if (this.mode === 'split') {
      if (players[0].name === 'שחקן') players[0].name = 'שחקן 1';
      players.push({ name: 'שחקן 2', car: this.save.car2 });
    }
    const opts = {
      trackDef: def, mode: this.mode === 'time' ? 'time' : 'race', players,
      difficulty: this.save.settings.difficulty,
      ghost: this.mode === 'time' ? loadGhost(trackId) : null,
      seed: Math.floor(Math.random() * 8),
    };
    this.lastOpts = opts;
    this.enterRace(opts);
  }

  enterRace(opts) {
    if (this.race) this.race.dispose();
    this.paused = false;
    this.setScreen('', 'racing');
    this.race = new Race(this, opts);
    this.audio.unlock();
    this.audio.playMusic('race');
    this.audio.startEngines(opts.players.length);
    // touch controls
    const old = document.querySelector('.touch');
    if (old) old.remove();
    if (this.isTouch && opts.players.length === 1) {
      const auto = this.save.settings.autoGas ?? true;
      document.body.appendChild(createTouchControls(this.input, { autoGas: auto }));
      resetTouch(this.input);
    }
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'pausebtn';
    pauseBtn.textContent = '⏸';
    pauseBtn.addEventListener('click', () => this.pause());
    this.ui.appendChild(pauseBtn);
    if (this.isTouch) {
      try { document.documentElement.requestFullscreen?.().catch(() => {}); } catch { /* not allowed */ }
      try { screen.orientation?.lock?.('landscape').catch(() => {}); } catch { /* not supported */ }
    }
  }

  restartRace() {
    if (!this.lastOpts) return;
    // reload ghost so a fresh record shows up immediately
    if (this.lastOpts.mode === 'time') this.lastOpts.ghost = loadGhost(this.lastOpts.trackDef.id);
    this.enterRace(this.lastOpts);
  }

  pause() {
    if (!this.race || this.race.state === 'done') return;
    this.paused = true;
    this.audio.pauseAll(true);
    this.showPause();
  }

  resume() {
    this.paused = false;
    this.audio.pauseAll(false);
    this.setScreen('', 'racing');
    const pauseBtn = document.createElement('button');
    pauseBtn.className = 'pausebtn';
    pauseBtn.textContent = '⏸';
    pauseBtn.addEventListener('click', () => this.pause());
    this.ui.appendChild(pauseBtn);
  }

  leaveRace() {
    if (this.race) this.race.dispose();
    this.race = null;
    this.paused = false;
    this.audio.pauseAll(false);
    this.audio.stopEngines();
    document.querySelector('.touch')?.remove();
  }

  // test helper: advance the race without rendering
  simulate(seconds) {
    for (let t = 0; t < seconds && this.race; t += 1 / 60) {
      this.input.poll();
      this.race.update(1 / 60);
      this.input.endFrame();
    }
  }

  onRaceFinished(res) {
    this.leaveRace();
    this.audio.playMusic('menu');
    this.garage.setCar(this.save.car);
    this.showResults(res);
  }
}

Game.prototype.actions = {
  pick(mode) {
    if (mode === 'split' && this.isTouch) { alert('מצב 2 שחקנים דורש מקלדת (מחשב)'); return; }
    this.showTracks(mode);
  },
  garage() { this.showGarage(0); },
  gtab(p) { this.showGarage(+p); },
  settings() { this.showSettings(); },
  help() { this.showHelp(); },
  back() { this.garage.setCar(this.save.car); this.showMain(); },
  menu() { this.showMain(); },
  track(id) {
    const i = TRACKS.findIndex(t => t.id === id);
    const def = TRACKS[i];
    if (!this.trackOpen(i)) {
      if (this.save.coins >= def.cost) {
        if (confirm(`לפתוח את "${def.name}" ב-${def.cost} מטבעות?`)) {
          this.save.coins -= def.cost;
          this.save.ownedTracks.push(id);
          this.persist();
          this.audio.sfx('buy');
          this.showTracks(this.mode);
        }
      } else {
        alert(`צריך ${def.cost} מטבעות כדי לפתוח את המסלול (יש לך ${this.save.coins}).\nאו: סיימו במקום 1–3 ב"${TRACKS[i - 1].name}" והוא ייפתח בחינם!`);
      }
      return;
    }
    this.startRace(id);
  },
  gsection(id) { this.garageTab = id; this.showGarage(this.garagePlayer); },
  part(arg) {
    const [group, id] = arg.split(':');
    const { key, list } = PARTS[group];
    const info = list[id];
    if (!this.save.owned[group].includes(id)) {
      if (info.unlock) {
        if (!this.unlockMet(info.unlock)) {
          const how = { gold: `השיגו ${info.unlock.n} מדליות זהב 🥇 במצב נגד השעון`, trophy: `נצחו (מקום 1 🏆) ב-${info.unlock.n} מסלולים שונים`, allTracks: 'סיימו מרוץ בכל המסלולים' }[info.unlock.need];
          alert(`"${info.name}" נפתח בהישג:\n${how}`);
          return;
        }
        this.audio.sfx('win');
      } else {
        if (this.save.coins < info.cost) { alert(`צריך ${info.cost} מטבעות. יש לך ${this.save.coins}.`); return; }
        if (!confirm(`לקנות "${info.name}" ב-${info.cost} מטבעות?`)) return;
        this.save.coins -= info.cost;
        this.audio.sfx('buy');
      }
      this.save.owned[group].push(id);
    }
    const car = this.garagePlayer === 0 ? this.save.car : this.save.car2;
    car[key] = id;
    this.persist();
    this.showGarage(this.garagePlayer);
  },
  color(arg) {
    const [key, c] = arg.split(':');
    const car = this.garagePlayer === 0 ? this.save.car : this.save.car2;
    car[key] = c;
    this.persist();
    this.showGarage(this.garagePlayer);
  },
  set(arg) {
    const [key, raw] = arg.split(':');
    const v = raw === 'true' ? true : raw === 'false' ? false : raw;
    this.save.settings[key] = v;
    if (key === 'quality') { this.applyQuality(); this.resize(); }
    this.persist();
    this.showSettings();
  },
  reset() {
    if (!confirm('למחוק את כל ההתקדמות, המטבעות והשיאים?')) return;
    localStorage.clear();
    this.save = loadSave();
    this.showMain();
  },
  again() { this.restartRace(); },
  resume() { this.resume(); },
  restart() { this.restartRace(); },
  quit() { this.leaveRace(); this.showMain(); },
};

window.game = new Game();

const native = window.Capacitor?.isNativePlatform?.();
if (native) {
  // Android app: hide the status bar for a full-screen game
  import('@capacitor/status-bar').then(({ StatusBar }) => StatusBar.hide()).catch(() => {});
} else if ('serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
