// Keyboard (one or two players), gamepads and on-screen touch controls.

const P1_KEYS = { gas: ['KeyW'], brake: ['KeyS'], left: ['KeyA'], right: ['KeyD'], drift: ['ShiftLeft'], item: ['Space', 'KeyE', 'KeyQ'] };
const P2_KEYS = { gas: ['ArrowUp'], brake: ['ArrowDown'], left: ['ArrowLeft'], right: ['ArrowRight'], drift: ['ShiftRight', 'Period'], item: ['Enter', 'Slash', 'Numpad0', 'ControlRight'] };
const SOLO_KEYS = {
  gas: [...P1_KEYS.gas, ...P2_KEYS.gas], brake: [...P1_KEYS.brake, ...P2_KEYS.brake],
  left: [...P1_KEYS.left, ...P2_KEYS.left], right: [...P1_KEYS.right, ...P2_KEYS.right],
  drift: ['ShiftLeft', 'ShiftRight', 'KeyX', 'KeyC'], item: ['Space', 'Enter', 'KeyE', 'KeyZ'],
};

export class Input {
  constructor() {
    this.down = new Set();
    this.pressed = new Set();
    this.touch = { left: false, right: false, gas: false, brake: false, drift: false, item: false };
    this.touchUsed = false;
    this.prevPad = [];
    this.padPressed = [];
    window.addEventListener('keydown', e => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Backspace'].includes(e.code) && !(e.target instanceof HTMLInputElement)) e.preventDefault();
      if (!this.down.has(e.code)) this.pressed.add(e.code);
      this.down.add(e.code);
    });
    window.addEventListener('keyup', e => this.down.delete(e.code));
    window.addEventListener('blur', () => this.down.clear());
    window.addEventListener('touchstart', () => { this.touchUsed = true; }, { passive: true });
  }

  any(codes) { return codes.some(c => this.down.has(c)); }

  // call once per frame before reading
  poll() {
    const pads = navigator.getGamepads ? [...navigator.getGamepads()].filter(Boolean) : [];
    this.pads = pads;
    this.padPressed = pads.map((p, i) => {
      const prev = this.prevPad[i] || [];
      const now = p.buttons.map(b => b.pressed);
      this.prevPad[i] = now;
      return now.map((b, k) => b && !prev[k]);
    });
  }

  endFrame() { this.pressed.clear(); }

  wasPressed(...codes) { return codes.some(c => this.pressed.has(c)); }

  padButtonPressed(btn) { return this.padPressed.some(p => p[btn]); }

  // player: 0/1, split: two-player keyboard layout
  get(player, split) {
    const keys = !split ? SOLO_KEYS : player === 0 ? P1_KEYS : P2_KEYS;
    let steer = 0, gas = 0, brake = 0, drift = false, item = false;
    if (this.any(keys.left)) steer -= 1;
    if (this.any(keys.right)) steer += 1;
    if (this.any(keys.gas)) gas = 1;
    if (this.any(keys.brake)) brake = 1;
    if (this.any(keys.drift)) drift = true;
    if (keys.item.some(c => this.pressed.has(c))) item = true;

    const pad = split ? this.pads?.[player] : this.pads?.[0];
    const padIdx = split ? player : 0;
    if (pad) {
      const ax = pad.axes[0] || 0;
      if (Math.abs(ax) > 0.15) steer += ax;
      if (pad.buttons[14]?.pressed) steer -= 1;
      if (pad.buttons[15]?.pressed) steer += 1;
      const rt = pad.buttons[7]?.value || 0, lt = pad.buttons[6]?.value || 0;
      if (pad.buttons[0]?.pressed || rt > 0.2) gas = Math.max(gas, pad.buttons[0]?.pressed ? 1 : rt);
      if (pad.buttons[1]?.pressed || lt > 0.2) brake = Math.max(brake, pad.buttons[1]?.pressed ? 1 : lt);
      if (pad.buttons[5]?.pressed || pad.buttons[4]?.pressed) drift = true;
      const pp = this.padPressed[padIdx] || [];
      if (pp[2] || pp[3]) item = true;
    }

    if (player === 0) {
      const t = this.touch;
      if (t.left) steer -= 1;
      if (t.right) steer += 1;
      if (t.gas) gas = 1;
      if (t.brake) brake = 1;
      if (t.drift) drift = true;
      if (t.itemPressed) { item = true; t.itemPressed = false; }
    }
    return { steer: Math.max(-1, Math.min(1, steer)), gas, brake, drift, item };
  }

  pausePressed() { return this.wasPressed('Escape', 'KeyP') || this.padButtonPressed(9); }
  restartPressed() { return this.wasPressed('KeyR', 'Backspace', 'Delete') || this.padButtonPressed(8); }
}

// On-screen buttons. Returns the root element; state is written into input.touch.
export function createTouchControls(input, { autoGas }) {
  const root = document.createElement('div');
  root.className = 'touch';
  root.innerHTML = `
    <div class="tpad left">
      <button data-k="left" aria-label="שמאלה">◀</button>
      <button data-k="right" aria-label="ימינה">▶</button>
    </div>
    <div class="tpad right">
      <button data-k="item" class="small" aria-label="חפץ">🎁</button>
      <button data-k="drift" class="small" aria-label="דריפט">↯</button>
      <button data-k="brake" class="small" aria-label="ברקס">⏪</button>
      ${autoGas ? '' : '<button data-k="gas" aria-label="גז">⏩</button>'}
    </div>`;
  const t = input.touch;
  t.gas = !!autoGas;
  t.autoGas = !!autoGas;
  for (const b of root.querySelectorAll('button')) {
    const k = b.dataset.k;
    const on = e => {
      e.preventDefault();
      b.classList.add('on');
      if (k === 'item') t.itemPressed = true; else t[k] = true;
      if (k === 'brake' && t.autoGas) t.gas = false;
    };
    const off = e => {
      e.preventDefault();
      b.classList.remove('on');
      if (k !== 'item') t[k] = false;
      if (k === 'brake' && t.autoGas) t.gas = true;
    };
    b.addEventListener('pointerdown', on);
    b.addEventListener('pointerup', off);
    b.addEventListener('pointercancel', off);
    b.addEventListener('pointerleave', off);
    b.addEventListener('contextmenu', e => e.preventDefault());
  }
  return root;
}

export function resetTouch(input) {
  const t = input.touch;
  t.left = t.right = t.brake = t.drift = false;
  t.gas = !!t.autoGas;
  t.itemPressed = false;
}
