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
import { t, setLang, detectLang, LANGS, isRTL, trackName, trackDesc, partName } from './i18n.js';
import { portal, onPortal } from './portal.js';
import { MenuNav } from './menunav.js';

const $ = sel => document.querySelector(sel);
const MEDAL = ['', '🥉', '🥈', '🥇'];
const TROPHY = { 1: '🏆', 2: '🥈', 3: '🥉' };
const WORLD_SIZE = 5;
const CUP_POINTS = [10, 8, 6, 4, 3, 2];
const CUP_PRIZE = { 1: 150, 2: 90, 3: 50 };
const CUPS = [
  { id: 'sweet', tracks: TRACKS.slice(0, 5).map(tr => tr.id), color: '#ff7ad9' },
  { id: 'giant', tracks: TRACKS.slice(5, 10).map(tr => tr.id), color: '#7a4fd6' },
];

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
    this.nav = new MenuNav(this);
    this.screen = null;
    this.garageOffset = 0;
    this.inGameplay = false;

    window.addEventListener('resize', () => this.resize());
    this.resize();
    // first interaction unlocks audio
    const unlock = () => { this.audio.unlock(); this.audio.playMusic(this.race ? 'race' : 'menu'); };
    window.addEventListener('pointerdown', unlock, { once: false });
    window.addEventListener('keydown', unlock, { once: false });
    document.addEventListener('visibilitychange', () => { if (document.hidden && this.race && !this.paused) this.pause(); });

    setLang(detectLang(this.save.settings.lang));
    this.showMain();
    this.last = performance.now();
    this.renderer.setAnimationLoop(now => this.frame(now));
    portal.init().then(() => portal.loadingDone());
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
      else if (this.race) this.nav.update(dt, this.input, { paused: true });
      if (this.race) this.race.render(this.renderer, this.w, this.h);
    } else {
      this.nav.update(dt, this.input);
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
    this.nav?.refresh();
  }

  coinBar() { return `<div class="coinbar">🪙 <b>${this.save.coins}</b></div>`; }

  // ------------------------------------------------------------ screens
  showMain() {
    this.garageOffset = this.w > 760 ? this.w * 0.2 * (isRTL() ? 1 : -1) : 0;
    this.garage.setCar(this.save.car);
    this.audio.playMusic('menu');
    this.setScreen(`
      ${this.coinBar()}
      <div class="title">
        <h1>${t('title1')}<br><span>${t('title2')}</span></h1>
        <p>${t('tagline')}</p>
      </div>
      <div class="menu">
        <button class="big pink" data-act="pick" data-arg="race">${t('mRace')}</button>
        <button class="big orange" data-act="cups">${t('mCup')}</button>
        <button class="big blue" data-act="pick" data-arg="time">${t('mTime')}</button>
        <button class="big yellow ${this.isTouch ? 'disabled' : ''}" data-act="pick" data-arg="split" ${this.isTouch ? `title="${t('needKeyboard')}"` : ''}>${t('mSplit')}</button>
        <div class="row">
          <button class="mid green" data-act="garage">${t('mGarage')}</button>
          <button class="mid purple" data-act="settings">${t('mSettings')}</button>
          <button class="mid gray" data-act="help">${t('mHelp')}</button>
        </div>
      </div>`, 'main');
  }

  // achievements that unlock garage items and tracks
  progress() {
    const medals = Object.values(this.save.medals), trophies = this.save.trophies;
    return {
      gold: medals.filter(m => m === 3).length,
      trophy: Object.values(trophies).filter(p => p === 1).length,
      allTracks: TRACKS.every(tr => trophies[tr.id]),
      cup: Object.values(this.save.cups).filter(p => p === 1).length,
    };
  }

  unlockMet(u) {
    const p = this.progress();
    return u.need === 'allTracks' ? p.allTracks : p[u.need] >= u.n;
  }

  unlockLabel(u) {
    if (u.need === 'gold') return `🥇×${u.n}`;
    if (u.need === 'trophy') return `🏆×${u.n}`;
    if (u.need === 'cup') return t('cupLabel', { n: u.n });
    return t('allTracks');
  }

  // a track opens when bought, or for free after a podium on the track before it
  trackOpen(i) {
    const tr = TRACKS[i];
    if (this.save.ownedTracks.includes(tr.id)) return true;
    const prev = TRACKS[i - 1];
    return !!prev && this.save.trophies[prev.id] <= 3;
  }

  showTracks(mode) {
    this.mode = mode;
    this.garageOffset = 0;
    const card = (tr, i) => {
      const owned = this.trackOpen(i);
      const medal = this.save.medals[tr.id] || 0;
      const trophy = this.save.trophies[tr.id];
      const best = this.save.bestTimes[tr.id];
      const extra = mode === 'time'
        ? `<div class="meta">${MEDAL[medal] || '—'} ${best ? formatTime(best) : ''}</div>`
        : `<div class="meta">${trophy ? (TROPHY[trophy] || '🎗️') + ' ' + t('place', { n: trophy }) : '—'}</div>`;
      const lock = `<div class="lock">🔒 ${tr.cost} 🪙${i > 0 ? `<small>${t('orPodium', { track: trackName(TRACKS[i - 1]) })}</small>` : ''}</div>`;
      return `<button class="track ${owned ? '' : 'locked'}" data-act="track" data-arg="${tr.id}" style="--c1:${tr.theme.sky1};--c2:${tr.theme.road}">
        <div class="tnum">${i + 1}</div>
        <div class="tname">${trackName(tr)}</div>
        <div class="tdesc">${trackDesc(tr)}</div>
        ${owned ? extra : lock}
      </button>`;
    };
    let worlds = '';
    for (let w = 0; w * WORLD_SIZE < TRACKS.length; w++) {
      const list = TRACKS.slice(w * WORLD_SIZE, (w + 1) * WORLD_SIZE);
      worlds += `<h3 class="world">${t('world', { n: w + 1 })}</h3><div class="tracks">${list.map((tr, k) => card(tr, w * WORLD_SIZE + k)).join('')}</div>`;
    }
    const title = t({ race: 'mRace', time: 'mTime', split: 'mSplit' }[mode]);
    this.setScreen(`
      ${this.coinBar()}
      <h2>${title} – ${t('chooseTrack')}</h2>
      ${worlds}
      <div class="bottom"><button class="mid gray" data-act="back">${t('back')}</button></div>`, 'tracksel');
  }

  showGarage(player = 0) {
    this.garagePlayer = player;
    this.garageTab ||= 'body';
    const tab = this.garageTab;
    const car = player === 0 ? this.save.car : this.save.car2;
    this.garage.setCar(car);
    this.garageOffset = this.w > 700 ? -this.w * 0.22 * (isRTL() ? 1 : -1) : 0;
    const owned = this.save.owned;
    const opts = group => {
      const { key, list } = PARTS[group];
      return `<div class="opts">${Object.entries(list).map(([id, info]) => {
        const have = owned[group].includes(id);
        const price = info.unlock ? (this.unlockMet(info.unlock) ? t('unlocked') : `🔒 ${this.unlockLabel(info.unlock)}`) : `🔒 ${info.cost} 🪙`;
        const swatch = info.colors ? `<span class="trailsw">${info.colors.map(c => `<i style="background:${c}"></i>`).join('')}</span>` : '';
        return `<button class="opt ${car[key] === id ? 'sel' : ''} ${have ? '' : 'locked'}" data-act="part" data-arg="${group}:${id}">
          ${swatch}${partName(group, id, info)}${have ? '' : `<small>${price}</small>`}</button>`;
      }).join('')}</div>`;
    };
    const swatches = key => `<div class="swatches">${COLORS.map(c => `<button class="sw ${car[key] === c ? 'sel' : ''}" style="background:${c}" data-act="color" data-arg="${key}:${c}" aria-label="${t('colorLabel')}"></button>`).join('')}</div>`;
    const st = BODIES[car.body];
    const bar = (v, min, max) => `<i style="width:${Math.round(15 + 85 * (v - min) / (max - min))}%"></i>`;
    const tabs = [['body', t('tabBody')], ['wheels', t('tabWheels')], ['topper', t('tabTopper')], ['paint', t('tabPaint')], ['fx', t('tabFx')]];
    const content = {
      body: `${opts('bodies')}
        <div class="stats">
          <div>${t('speed')} <span class="bar">${bar(st.maxSpeed, 43, 51)}</span></div>
          <div>${t('accel')} <span class="bar">${bar(st.accel, 19, 32)}</span></div>
          <div>${t('handling')} <span class="bar">${bar(st.handling, 2.0, 2.8)}</span></div>
        </div>`,
      wheels: opts('wheels'),
      topper: opts('toppers'),
      paint: `<h3>${t('colorMain')}</h3>${swatches('color')}<h3>${t('colorAccent')}</h3>${swatches('accent')}<h3>${t('pattern')}</h3>${opts('patterns')}<h3>${t('finish')}</h3>${opts('finishes')}`,
      fx: `<h3>${t('trail')}</h3>${opts('trails')}`,
    }[tab];
    this.setScreen(`
      ${this.coinBar()}
      <div class="garage">
        <h2>${t('garage')}</h2>
        <div class="tabs">
          <button class="${player === 0 ? 'sel' : ''}" data-act="gtab" data-arg="0">${t('player1')}</button>
          <button class="${player === 1 ? 'sel' : ''}" data-act="gtab" data-arg="1">${t('player2')}</button>
        </div>
        <div class="gtabs">${tabs.map(([id, label]) => `<button class="${tab === id ? 'sel' : ''}" data-act="gsection" data-arg="${id}">${label}</button>`).join('')}</div>
        <div class="gcontent">${content}</div>
        <div class="bottom"><button class="mid green" data-act="back">${t('done')}</button></div>
      </div>`, 'garagescr');
  }

  showSettings() {
    const s = this.save.settings;
    const seg = (key, vals) => `<div class="seg">${vals.map(([v, l]) => `<button class="${s[key] === v ? 'sel' : ''}" data-act="set" data-arg="${key}:${v}">${l}</button>`).join('')}</div>`;
    this.setScreen(`
      <div class="panel">
        <h2>${t('settings')}</h2>
        <label>${t('playerName')} <input id="pname" maxlength="12" value="${this.save.name.replace(/"/g, '')}"></label>
        <h3>${t('difficulty')}</h3>
        ${seg('difficulty', [['easy', t('easy')], ['normal', t('normal')], ['hard', t('hard')]])}
        <p class="hint">${t('easyHint')}</p>
        <h3>${t('autoGas')}</h3>
        ${seg('autoGas', [[true, t('on')], [false, t('off')]])}
        <h3>${t('graphics')}</h3>
        ${seg('quality', [['low', t('gLow')], ['auto', t('gAuto')], ['high', t('gHigh')]])}
        <h3>${t('language')}</h3>
        ${seg('lang', Object.entries(LANGS))}
        <h3>${t('music')}</h3><input type="range" id="vmusic" min="0" max="1" step="0.05" value="${s.music}">
        <h3>${t('sfx')}</h3><input type="range" id="vsfx" min="0" max="1" step="0.05" value="${s.sfx}">
        <div class="bottom">
          <button class="mid gray" data-act="reset">${t('reset')}</button>
          <button class="mid green" data-act="back">${t('save')}</button>
        </div>
      </div>`, 'settings');
    $('#pname').addEventListener('input', e => { this.save.name = e.target.value.trim(); this.persist(); });
    $('#vmusic').addEventListener('input', e => { s.music = +e.target.value; this.audio.setVolumes(s.music, s.sfx); this.persist(); });
    $('#vsfx').addEventListener('input', e => { s.sfx = +e.target.value; this.audio.setVolumes(s.music, s.sfx); this.audio.sfx('coin'); this.persist(); });
  }

  showHelp() {
    this.setScreen(`
      <div class="panel help">
        <h2>${t('help')}</h2>
        <table>
          <tr><th></th><th>${t('player1')}</th><th>${t('player2')}</th></tr>
          <tr><td>${t('gasBrake')}</td><td>W / S</td><td>↑ / ↓</td></tr>
          <tr><td>${t('steer')}</td><td>A / D</td><td>← / →</td></tr>
          <tr><td>${t('drift')}</td><td>${t('leftShift')}</td><td>${t('rightShift')}</td></tr>
          <tr><td>${t('useItem')}</td><td>${t('space')}</td><td>Enter</td></tr>
        </table>
        <p>${t('helpSolo')}</p>
        <ul>
          <li>${t('helpDrift')}</li>
          <li>${t('helpPads')}</li>
          <li>${t('helpItems')}</li>
          <li>${t('helpCoins')}</li>
          <li>${t('helpTime')}</li>
          <li>${t('helpStart')}</li>
        </ul>
        <div class="bottom"><button class="mid green" data-act="back">${t('gotIt')}</button></div>
      </div>`, 'settings');
  }

  showResults(res) {
    const humans = res.standings.filter(s => s.human >= 0);
    let rewards = 0;
    let html = '';
    if (res.mode === 'time') {
      const time = res.time;
      const [b, s, g] = res.medals;
      const medal = time <= g ? 3 : time <= s ? 2 : time <= b ? 1 : 0;
      const prevMedal = this.save.medals[res.trackId] || 0;
      const prevBest = this.save.bestTimes[res.trackId];
      const record = !prevBest || time < prevBest;
      if (record) { this.save.bestTimes[res.trackId] = time; writeGhost(res.trackId, res.ghost); }
      if (medal > prevMedal) {
        const pay = [0, 10, 20, 40];
        for (let m = prevMedal + 1; m <= medal; m++) rewards += pay[m];
        this.save.medals[res.trackId] = medal;
      }
      if (record || medal === 3) portal.happyTime();
      html = `
        <div class="bigtime">${formatTime(time)}</div>
        ${record ? `<div class="record">${t('newRecord')}</div>` : `<div class="hint">${t('yourBest', { time: formatTime(prevBest) })}</div>`}
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
        ? t('wins', { name: (humans.find(h => h.place === Math.min(...humans.map(x => x.place))) || {}).name })
        : top.place === 1 ? t('victory') : top.place <= 3 ? t('podium', { n: top.place }) : t('place', { n: top.place });
      if (!res.split && top.place === 1) portal.happyTime();
      html = `<div class="headline">${headline}</div><table class="standings">${rows}</table>`;
    }
    this.save.coins += rewards;
    this.persist();
    this.lastRewards = rewards; // a rewarded ad can double this once
    const idx = TRACKS.findIndex(tr => tr.id === res.trackId);
    const cupHtml = this.cup && res.mode === 'race' ? this.addCupPoints(res) : '';
    const next = TRACKS[idx + 1];
    const nextOwned = next && this.trackOpen(idx + 1);
    const adBtn = rewards && portal.hasRewarded ? `<button class="mid yellow" data-act="doubleCoins">${t('watchAd')}</button>` : '';
    this.setScreen(`
      ${this.coinBar()}
      <div class="panel results">
        <h2>${trackName(TRACKS[idx])}</h2>
        ${this.cup ? `<div class="hint">${t('cupRace', { n: this.cup.idx + 1, of: this.cup.tracks.length })}</div>` : ''}
        ${html}
        ${cupHtml}
        ${rewards ? `<div class="reward">+${rewards} 🪙</div>` : ''}
        ${adBtn ? `<div class="bottom">${adBtn}</div>` : ''}
        <div class="bottom">${this.cup ? `
          <button class="mid pink" data-act="cupNext">${this.cup.idx + 1 < this.cup.tracks.length ? t('nextRace') : t('finalStandings')}</button>
          <button class="mid gray" data-act="menu">${t('menu')}</button>` : `
          <button class="mid pink" data-act="again">${t('again')}</button>
          ${nextOwned ? `<button class="mid blue" data-act="track" data-arg="${next.id}">${t('nextTrack')}</button>` : ''}
          <button class="mid gray" data-act="menu">${t('menu')}</button>`}
        </div>
      </div>`, 'resultscr');
    if (rewards) this.audio.sfx('buy');
  }

  confirmQuitCup() {
    if (!confirm(t('cupQuit'))) return false;
    this.cup = null;
    return true;
  }

  // ------------------------------------------------------------ championship
  cupOpen(cup) { return cup.tracks.every(id => this.trackOpen(TRACKS.findIndex(tr => tr.id === id))); }

  showCups() {
    this.garageOffset = 0;
    const cards = CUPS.map(cup => {
      const open = this.cupOpen(cup);
      const best = this.save.cups[cup.id];
      return `<button class="track cupcard ${open ? '' : 'locked'}" data-act="cup" data-arg="${cup.id}" style="--c1:${cup.color};--c2:#ffd23f">
        <div class="tname">🏆 ${t('cup_' + cup.id)}</div>
        <div class="tdesc">${cup.tracks.map(id => trackName(TRACKS.find(tr => tr.id === id))).join(' · ')}</div>
        <div class="meta">${open ? (best ? `${TROPHY[best] || '🎗️'} ${t('place', { n: best })}` : '—') : `🔒 ${t('cupLocked')}`}</div>
      </button>`;
    }).join('');
    this.setScreen(`
      ${this.coinBar()}
      <h2>${t('mCup')}</h2>
      <p class="hint light">${t('cupInfo')}</p>
      <div class="tracks cups">${cards}</div>
      <div class="bottom"><button class="mid gray" data-act="back">${t('back')}</button></div>`, 'tracksel');
  }

  startCup(id) {
    const cup = CUPS.find(c => c.id === id);
    this.cup = { id, tracks: cup.tracks, idx: 0, points: {}, seed: Math.floor(Math.random() * 8) };
    this.mode = 'race';
    this.startRace(cup.tracks[0]);
  }

  // adds this race's points and returns the running table
  addCupPoints(res) {
    const pts = this.cup.points;
    for (const s of res.standings) {
      const e = pts[s.name] ||= { name: s.name, color: s.color, human: s.human >= 0, pts: 0 };
      e.pts += CUP_POINTS[s.place - 1] || 0;
      e.last = CUP_POINTS[s.place - 1] || 0;
    }
    const rows = Object.values(pts).sort((a, b) => b.pts - a.pts).map((e, i) => `<tr class="${e.human ? 'me' : ''}">
      <td>${i + 1}</td><td><i class="dot" style="background:${e.color}"></i>${e.name}</td><td class="plus">+${e.last}</td><td><b>${e.pts}</b></td></tr>`).join('');
    return `<h3>${t('points')}</h3><table class="standings cuptable">${rows}</table>`;
  }

  showCupEnd() {
    const cup = this.cup;
    this.cup = null;
    const table = Object.values(cup.points).sort((a, b) => b.pts - a.pts);
    const myPlace = table.findIndex(e => e.human) + 1;
    const prize = CUP_PRIZE[myPlace] || 0;
    this.save.coins += prize;
    const prev = this.save.cups[cup.id];
    if (!prev || myPlace < prev) this.save.cups[cup.id] = myPlace;
    this.persist();
    if (myPlace === 1) { portal.happyTime(); this.audio.sfx('win'); } else this.audio.sfx('finish');
    const podium = [1, 0, 2].map(i => table[i] && `<div class="step s${i + 1}">
        <div class="podname">${table[i].name}</div><i class="dot big" style="background:${table[i].color}"></i>
        <div class="block">${['🥇', '🥈', '🥉'][i]}<b>${table[i].pts}</b></div></div>`).join('');
    this.setScreen(`
      ${this.coinBar()}
      <div class="panel results cupend">
        <h2>🏆 ${t('cup_' + cup.id)}</h2>
        <div class="headline">${myPlace === 1 ? t('champion') : t('cupPlace', { n: myPlace })}</div>
        <div class="podium">${podium}</div>
        ${prize ? `<div class="reward">+${prize} 🪙</div>` : ''}
        <div class="bottom"><button class="mid pink" data-act="cups">${t('mCup')}</button><button class="mid gray" data-act="menu">${t('menu')}</button></div>
      </div>`, 'resultscr');
  }

  showPause() {
    this.setScreen(`
      <div class="panel pause">
        <h2>${t('pause')}</h2>
        <button class="big green" data-act="resume">${t('resume')}</button>
        <button class="big blue" data-act="restart">${t('restart')}</button>
        <button class="big gray" data-act="quit">${t('quit')}</button>
      </div>`, 'pausescr');
  }

  // ------------------------------------------------------------ race flow
  startRace(trackId) {
    const def = TRACKS.find(tr => tr.id === trackId);
    this.lastTrack = trackId;
    const players = [{ name: this.save.name || t(this.mode === 'split' ? 'player1' : 'player'), car: this.save.car }];
    if (this.mode === 'split') players.push({ name: t('player2'), car: this.save.car2 });
    const opts = {
      trackDef: def, mode: this.mode === 'time' ? 'time' : 'race', players,
      difficulty: this.save.settings.difficulty,
      ghost: this.mode === 'time' ? loadGhost(trackId) : null,
      seed: this.cup ? this.cup.seed : Math.floor(Math.random() * 8),
    };
    this.lastOpts = opts;
    this.adBreakThen(() => this.enterRace(opts));
  }

  // portals may show an ad between races; the game and its sound stay paused meanwhile
  async adBreakThen(start) {
    if (onPortal) {
      if (this.adRunning) return;
      this.adRunning = true;
      this.setGameplay(false);
      if (this.race) this.paused = true;
      this.audio.pauseAll(true);
      await portal.commercialBreak();
      this.audio.pauseAll(false);
      this.adRunning = false;
    }
    start();
  }

  setGameplay(on) {
    if (on === this.inGameplay) return;
    this.inGameplay = on;
    if (on) portal.gameplayStart(); else portal.gameplayStop();
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
    this.setGameplay(true);
    if (this.isTouch && !onPortal) {
      try { document.documentElement.requestFullscreen?.().catch(() => {}); } catch { /* not allowed */ }
      try { screen.orientation?.lock?.('landscape').catch(() => {}); } catch { /* not supported */ }
    }
  }

  restartRace() {
    if (!this.lastOpts) return;
    // reload ghost so a fresh record shows up immediately
    if (this.lastOpts.mode === 'time') this.lastOpts.ghost = loadGhost(this.lastOpts.trackDef.id);
    this.adBreakThen(() => this.enterRace(this.lastOpts));
  }

  pause() {
    if (!this.race || this.race.state === 'done') return;
    this.paused = true;
    this.audio.pauseAll(true);
    this.setGameplay(false);
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
    this.setGameplay(true);
  }

  leaveRace() {
    this.setGameplay(false);
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
    if (mode === 'split' && this.isTouch) { alert(t('needKeyboard')); return; }
    this.showTracks(mode);
  },
  garage() { this.showGarage(0); },
  gtab(p) { this.showGarage(+p); },
  settings() { this.showSettings(); },
  help() { this.showHelp(); },
  back() { this.garage.setCar(this.save.car); this.showMain(); },
  menu() {
    if (this.cup && !this.confirmQuitCup()) return;
    this.showMain();
  },
  cups() { this.showCups(); },
  cup(id) {
    const cup = CUPS.find(c => c.id === id);
    if (!this.cupOpen(cup)) { alert(t('cupLocked')); return; }
    this.startCup(id);
  },
  cupNext() {
    this.cup.idx++;
    if (this.cup.idx >= this.cup.tracks.length) { this.showCupEnd(); return; }
    this.startRace(this.cup.tracks[this.cup.idx]);
  },
  track(id) {
    const i = TRACKS.findIndex(tr => tr.id === id);
    const def = TRACKS[i];
    if (!this.trackOpen(i)) {
      if (this.save.coins >= def.cost) {
        if (confirm(t('buyTrack', { name: trackName(def), cost: def.cost }))) {
          this.save.coins -= def.cost;
          this.save.ownedTracks.push(id);
          this.persist();
          this.audio.sfx('buy');
          this.showTracks(this.mode);
        }
      } else {
        alert(t('needTrackCoins', { cost: def.cost, have: this.save.coins, prev: trackName(TRACKS[i - 1]) }));
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
          const how = t({ gold: 'howGold', trophy: 'howTrophy', allTracks: 'howAll', cup: 'howCup' }[info.unlock.need], { n: info.unlock.n });
          alert(t('unlockBy', { name: partName(group, id, info), how }));
          return;
        }
        this.audio.sfx('win');
      } else {
        if (this.save.coins < info.cost) { alert(t('needCoins', { cost: info.cost, have: this.save.coins })); return; }
        if (!confirm(t('buyPart', { name: partName(group, id, info), cost: info.cost }))) return;
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
    if (key === 'lang') setLang(v);
    this.persist();
    this.showSettings();
  },
  reset() {
    if (!confirm(t('resetConfirm'))) return;
    localStorage.clear();
    this.save = loadSave();
    this.showMain();
  },
  again() { this.restartRace(); },
  async doubleCoins(_, e) {
    const btn = e.currentTarget;
    if (!this.lastRewards || btn.disabled) return;
    btn.disabled = true;
    this.audio.pauseAll(true);
    const ok = await portal.rewardedBreak();
    this.audio.pauseAll(false);
    if (!ok || !this.lastRewards) { btn.disabled = false; return; }
    this.save.coins += this.lastRewards;
    this.lastRewards = 0;
    this.persist();
    this.audio.sfx('buy');
    btn.textContent = t('doubled');
    const bar = this.ui.querySelector('.coinbar b');
    if (bar) bar.textContent = this.save.coins;
  },
  resume() { this.resume(); },
  restart() { this.restartRace(); },
  quit() {
    if (this.cup && !this.confirmQuitCup()) return;
    this.leaveRace();
    this.showMain();
  },
};

window.game = new Game();

const native = window.Capacitor?.isNativePlatform?.();
if (native) {
  // Android app: hide the status bar for a full-screen game
  import('@capacitor/status-bar').then(({ StatusBar }) => StatusBar.hide()).catch(() => {});
} else if (!onPortal && 'serviceWorker' in navigator && location.protocol === 'https:') {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
