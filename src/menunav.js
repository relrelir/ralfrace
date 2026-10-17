// Gamepad / keyboard navigation for the HTML menus: a focus ring that moves to the
// nearest button in the pressed direction, A/Enter clicks, B/Esc goes back.
// It wakes up on the first key or pad press and hides again when the mouse is used.

const BACK_ACTS = ['back', 'menu', 'resume'];
const REPEAT = 0.18;

export class MenuNav {
  constructor(game) {
    this.game = game;
    this.ui = game.ui;
    this.active = false;
    this.focusEl = null;
    this.lastKey = null;
    this.hold = 0;
    this.heldDir = null;
    const off = () => this.setActive(false);
    window.addEventListener('pointerdown', off);
    window.addEventListener('mousemove', e => { if (Math.abs(e.movementX) + Math.abs(e.movementY) > 2) off(); });
  }

  items() {
    return [...this.ui.querySelectorAll('[data-act], input[type=range]')]
      .filter(el => !el.disabled && el.offsetParent !== null);
  }

  keyOf(el) { return el.id || `${el.dataset.act}:${el.dataset.arg || ''}`; }

  setActive(on) {
    if (this.active === on) return;
    this.active = on;
    document.body.classList.toggle('padnav', on);
    if (on) this.refresh(); else this.focusEl?.classList.remove('focus');
  }

  // called after every screen change
  refresh() {
    if (!this.active) return;
    const items = this.items();
    const keep = items.find(el => this.keyOf(el) === this.lastKey);
    this.setFocus(keep || items.find(el => el.classList.contains('sel') && el.closest('.gtabs')) || items[0] || null);
  }

  setFocus(el) {
    this.focusEl?.classList.remove('focus');
    this.focusEl = el;
    if (!el) return;
    el.classList.add('focus');
    this.lastKey = this.keyOf(el);
    el.scrollIntoView?.({ block: 'nearest', inline: 'nearest' });
  }

  move(dx, dy) {
    const items = this.items();
    if (!this.focusEl || !items.includes(this.focusEl)) { this.setFocus(items[0] || null); return; }
    const r0 = this.focusEl.getBoundingClientRect();
    const cx = r0.left + r0.width / 2, cy = r0.top + r0.height / 2;
    let best = null, bestScore = Infinity;
    for (const el of items) {
      if (el === this.focusEl) continue;
      const r = el.getBoundingClientRect();
      const ex = r.left + r.width / 2 - cx, ey = r.top + r.height / 2 - cy;
      const along = ex * dx + ey * dy;           // distance in the pressed direction
      if (along <= 4) continue;
      const across = Math.abs(ex * dy) + Math.abs(ey * dx);
      const score = along + across * 2.2;
      if (score < bestScore) { bestScore = score; best = el; }
    }
    if (best) { this.setFocus(best); this.game.audio.sfx('click'); }
  }

  readDir(input) {
    const k = input.pressed;
    if (k.has('ArrowUp')) return [0, -1];
    if (k.has('ArrowDown')) return [0, 1];
    if (k.has('ArrowLeft')) return [-1, 0];
    if (k.has('ArrowRight')) return [1, 0];
    for (const p of input.padPressed) {
      if (p[12]) return [0, -1];
      if (p[13]) return [0, 1];
      if (p[14]) return [-1, 0];
      if (p[15]) return [1, 0];
    }
    return null;
  }

  // analog stick with auto-repeat while held
  stickDir(input, dt) {
    const pad = input.pads?.[0];
    if (!pad) { this.heldDir = null; return null; }
    const x = pad.axes[0] || 0, y = pad.axes[1] || 0;
    let dir = null;
    if (Math.abs(x) > 0.55 || Math.abs(y) > 0.55) dir = Math.abs(x) > Math.abs(y) ? [Math.sign(x), 0] : [0, Math.sign(y)];
    if (!dir) { this.heldDir = null; return null; }
    const same = this.heldDir && this.heldDir[0] === dir[0] && this.heldDir[1] === dir[1];
    if (!same) { this.heldDir = dir; this.hold = REPEAT * 2; return dir; }
    this.hold -= dt;
    if (this.hold <= 0) { this.hold = REPEAT; return dir; }
    return null;
  }

  update(dt, input, { paused = false } = {}) {
    const typing = document.activeElement?.tagName === 'INPUT' && document.activeElement.type !== 'range';
    if (typing) return;
    const dir = this.readDir(input) || this.stickDir(input, dt);
    const padA = input.padButtonPressed(0), padB = input.padButtonPressed(1), padStart = input.padButtonPressed(9);
    const keyOk = input.wasPressed('Enter', 'NumpadEnter', 'Space');
    // while a race is paused, Esc already resumes it (see Game.frame)
    const keyBack = !paused && input.wasPressed('Escape', 'Backspace');
    if (!this.active) {
      if (dir || padA || padB || keyOk || padStart) { this.setActive(true); }
      if (padStart && !this.game.race) this.ui.querySelector('[data-act=pick][data-arg=race]')?.click();
      return;
    }
    if (padStart && !this.game.race) { this.ui.querySelector('[data-act=pick][data-arg=race]')?.click(); return; }
    const el = this.focusEl;
    if (dir) {
      if (el?.type === 'range' && dir[0]) {
        const step = +el.step || 0.05;
        el.value = Math.min(+el.max, Math.max(+el.min, +el.value + dir[0] * step * (document.documentElement.dir === 'rtl' ? -1 : 1)));
        el.dispatchEvent(new Event('input', { bubbles: true }));
      } else {
        this.move(dir[0], dir[1]);
      }
    }
    if ((padA || keyOk) && el && el.type !== 'range') el.click();
    if (padB || keyBack) {
      const back = BACK_ACTS.map(a => this.ui.querySelector(`[data-act=${a}]`)).find(Boolean);
      back?.click();
    }
  }
}
