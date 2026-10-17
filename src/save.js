const KEY = 'candyrace_save_v1';

const DEFAULT = {
  coins: 0,
  ownedTracks: ['lollipop', 'choco'],
  owned: { bodies: ['kart'], wheels: ['donut'], toppers: ['none'], patterns: ['none'], finishes: ['gloss'], trails: ['classic'] },
  car: { body: 'kart', wheels: 'donut', color: '#ff4f8b', accent: '#ffd23f', topper: 'none', pattern: 'none', finish: 'gloss', trail: 'classic' },
  car2: { body: 'cupcake', wheels: 'donut', color: '#4fa3ff', accent: '#ffffff', topper: 'none', pattern: 'none', finish: 'gloss', trail: 'classic' },
  name: '',
  medals: {},      // trackId -> 0..3 (time trial)
  trophies: {},    // trackId -> best race place (1..6)
  bestTimes: {},   // trackId -> seconds (time trial, one lap)
  settings: { difficulty: 'normal', music: 0.5, sfx: 0.8, autoGas: null, quality: 'auto', lang: null },
};

function clone(o) { return JSON.parse(JSON.stringify(o)); }

export function loadSave() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return clone(DEFAULT);
    const data = JSON.parse(raw);
    const merged = { ...clone(DEFAULT), ...data };
    merged.owned = { ...clone(DEFAULT.owned), ...data.owned };
    merged.settings = { ...clone(DEFAULT.settings), ...data.settings };
    merged.car = { ...clone(DEFAULT.car), ...data.car };
    merged.car2 = { ...clone(DEFAULT.car2), ...data.car2 };
    return merged;
  } catch {
    return clone(DEFAULT);
  }
}

export function writeSave(save) {
  try { localStorage.setItem(KEY, JSON.stringify(save)); } catch { /* storage unavailable */ }
}

export function loadGhost(trackId) {
  try { return JSON.parse(localStorage.getItem('candyrace_ghost_' + trackId)); } catch { return null; }
}

export function writeGhost(trackId, ghost) {
  try { localStorage.setItem('candyrace_ghost_' + trackId, JSON.stringify(ghost)); } catch { /* storage unavailable */ }
}
