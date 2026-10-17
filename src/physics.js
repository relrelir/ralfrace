// Arcade kart physics in track space. No three.js rendering here so it can run headless.

export const BODIES = {
  kart: { name: 'קארט סוכריה', maxSpeed: 46, accel: 25, handling: 2.35, cost: 0 },
  cupcake: { name: 'קאפקייק טורבו', maxSpeed: 45, accel: 30, handling: 2.65, cost: 40 },
  cookie: { name: 'עוגיית הברק', maxSpeed: 48.5, accel: 21, handling: 2.15, cost: 90 },
  icecream: { name: 'משאית גלידה', maxSpeed: 48, accel: 20, handling: 2.1, cost: 120 },
  donut: { name: 'דונאט-רייסר', maxSpeed: 45.5, accel: 26, handling: 2.75, cost: 150 },
  gummy: { name: 'דובון גומי', maxSpeed: 45, accel: 31, handling: 2.5, cost: 180 },
  choco: { name: 'חטיף שוקולד', maxSpeed: 49, accel: 20, handling: 2.1, cost: 0, unlock: { need: 'gold', n: 3 } },
  rocket: { name: 'טיל סוכריה', maxSpeed: 47.5, accel: 26, handling: 2.4, cost: 0, unlock: { need: 'trophy', n: 5 } },
};

const GRAVITY = 28;
const RAMP_LEN = 7;
const RAMP_H = 1.3;
export const KART_HALF_W = 1.1;

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

// did we pass track position s (mod L) while moving from prev to cur?
export function crossed(prev, cur, s, L) {
  return Math.floor((cur - s) / L) > Math.floor((prev - s) / L);
}

export class Kart {
  constructor(track, stats, opts = {}) {
    this.track = track;
    this.stats = stats;
    this.dist = opts.dist || 0;   // unbounded distance travelled along the track
    this.x = opts.x || 0;         // lateral offset (right positive)
    this.h = 0; this.vh = 0;      // height above road / vertical speed
    this.v = 0;                   // forward speed m/s
    this.yaw = 0;                 // heading relative to the track tangent
    this.assist = opts.assist ?? 0.4;
    this.speedMul = 1;
    this.boost = 0; this.shield = 0; this.spin = 0; this.sticky = 0;
    this.drifting = false; this.driftDir = 0; this.driftCharge = 0;
    this.frozen = true;
    this.input = { steer: 0, gas: 0, brake: 0, drift: false, item: false };
    this.events = [];
    this.item = null;
    this.coins = 0;
    this.finished = false;
    this.finishTime = 0;
    this.airTime = 0;
  }

  get s() { return this.track.wrap(this.dist); }
  get onGround() { return this.vh <= 0 && this.h <= this.groundH + 0.01; }

  rampHeight(s) {
    for (const j of this.track.jumps) {
      let d = s - (j - RAMP_LEN);
      if (d < 0) d += this.track.length;
      if (d >= 0 && d <= RAMP_LEN) return RAMP_H * (d / RAMP_LEN);
    }
    return 0;
  }

  hit() {
    if (this.shield > 0) { this.shield = 0; this.events.push({ type: 'shieldPop' }); return false; }
    this.spin = 1.1; this.v *= 0.35; this.boost = 0; this.drifting = false;
    this.events.push({ type: 'spin' });
    return true;
  }

  step(dt) {
    const T = this.track, st = this.stats, inp = this.input;
    const L = T.length;
    let gas = inp.gas, brake = inp.brake, steer = inp.steer;
    if (this.frozen) { gas = 0; brake = 0; steer = 0; }
    if (this.spin > 0) { this.spin -= dt; gas = 0; brake = 0; steer = 0; }
    if (this.shield > 0) this.shield -= dt;
    if (this.sticky > 0) this.sticky -= dt;

    const s0 = this.s;
    this.groundH = this.rampHeight(s0);
    const grounded = this.onGround;

    // ---- speed ----
    let maxV = st.maxSpeed * this.speedMul;
    if (this.sticky > 0) maxV *= 0.45;
    if (this.boost > 0) {
      this.boost -= dt;
      maxV *= 1.32;
      this.v = Math.min(this.v + 45 * dt, maxV);
    }
    if (gas > 0 && this.v < maxV) {
      const a = st.accel * gas * clamp((maxV - this.v) / 9, 0.15, 1);
      this.v = Math.min(maxV, this.v + a * dt);
    } else if (this.v > maxV) {
      this.v = Math.max(maxV, this.v - 18 * dt);
    }
    if (brake > 0) {
      if (this.v > 0.5) this.v -= 38 * brake * dt;
      else this.v = Math.max(-13, this.v - 14 * brake * dt);
    }
    if (gas === 0 && brake === 0 || this.spin > 0) {
      const drag = (3 + 0.012 * this.v * this.v) * dt;
      this.v = Math.abs(this.v) <= drag ? 0 : this.v - Math.sign(this.v) * drag;
    }
    if (grounded) this.v -= 9.8 * 0.4 * T.sampleScalar(T.slope, s0) * dt;

    // ---- drift (hold drift while steering, release for a mini turbo) ----
    if (!this.drifting && inp.drift && Math.abs(steer) > 0.3 && this.v > 14 && grounded && this.spin <= 0) {
      this.drifting = true; this.driftDir = Math.sign(steer); this.driftCharge = 0;
      this.events.push({ type: 'driftStart' });
    }
    if (this.drifting) {
      if (!inp.drift || this.v < 10 || this.spin > 0) {
        this.drifting = false;
        if (this.driftCharge > 1.5) { this.boost = Math.max(this.boost, 1.4); this.events.push({ type: 'boost', level: 2 }); }
        else if (this.driftCharge > 0.7) { this.boost = Math.max(this.boost, 0.75); this.events.push({ type: 'boost', level: 1 }); }
        this.driftCharge = 0;
      } else {
        steer = clamp(this.driftDir * 0.55 + steer * 0.6, -1, 1);
        this.driftCharge += dt * (0.7 + 0.6 * Math.abs(inp.steer));
        this.v -= 1.5 * dt;
      }
    }

    // ---- steering ----
    const speedFactor = clamp(Math.abs(this.v) / 10, 0, 1) * (this.v < 0 ? -1 : 1);
    let hs = st.handling * (1 - 0.3 * Math.min(1, Math.abs(this.v) / st.maxSpeed));
    if (this.drifting) hs *= 1.3;
    let rate = steer * hs * speedFactor;
    if (!grounded) rate *= 0.35;
    this.yaw += rate * dt;
    // the track bends away underneath us; assist cancels part of it
    const k = T.sampleScalar(T.curv, s0);
    const ds = this.v * Math.cos(this.yaw) * dt;
    this.yaw -= k * ds * (1 - this.assist);
    if (Math.abs(steer) < 0.1 && grounded) this.yaw *= 1 - Math.min(1, this.assist * 2.2 * dt);
    this.yaw = clamp(this.yaw, -1.1, 1.1);

    const prev = this.dist;
    this.dist += ds;
    this.x += this.v * Math.sin(this.yaw) * dt;

    // ---- walls ----
    const W = T.width / 2 - KART_HALF_W;
    if (Math.abs(this.x) > W) {
      const side = Math.sign(this.x);
      this.x = side * W;
      if (Math.sign(this.yaw) === side) {
        const impact = Math.abs(this.v * Math.sin(this.yaw));
        this.v *= clamp(1 - impact * 0.025, 0.55, 0.98);
        this.yaw *= 0.15;
        if (impact > 3) this.events.push({ type: 'bump', impact });
      }
    }

    // ---- vertical: ramps & air ----
    const s1 = this.s;
    const gh = this.rampHeight(s1);
    for (const j of T.jumps) {
      if (crossed(prev, this.dist, j, L) && this.h <= RAMP_H + 0.05 && this.v > 5) {
        this.vh = 7 + this.v * 0.16;
        this.h = RAMP_H;
        this.events.push({ type: 'jump' });
      }
    }
    if (this.vh > 0 || this.h > gh + 0.01) {
      this.vh -= GRAVITY * dt;
      this.h += this.vh * dt;
      this.airTime += dt;
      if (this.h <= gh) {
        if (this.vh < -6) this.events.push({ type: 'land', impact: -this.vh });
        this.h = gh; this.vh = 0; this.airTime = 0;
      }
    } else {
      this.h = gh; this.vh = 0;
    }

    // ---- boost pads ----
    if (this.h < 0.5) {
      for (const b of T.boosts) {
        if (crossed(prev, this.dist, b, L)) {
          this.boost = Math.max(this.boost, 1.6);
          this.events.push({ type: 'boost', level: 3 });
        }
      }
    }
    this.prevDist = prev;
  }
}
