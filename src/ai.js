import { KART_HALF_W } from './physics.js';

function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }

export class AIDriver {
  constructor(kart, track, seed = Math.random()) {
    this.kart = kart;
    this.track = track;
    this.offset = (seed - 0.5) * 5;
    this.wobble = seed * 10;
    this.itemTimer = 0;
    this.t = 0;
    this.driftHold = 0;
  }

  // others: all karts in the race; hazards: [{dist,x}] to steer around
  update(dt, others = [], hazards = []) {
    const k = this.kart, T = this.track;
    this.t += dt;
    const W = T.width / 2 - KART_HALF_W - 0.3;

    // look ahead for curvature → take the inside line
    const look = 12 + Math.max(0, k.v) * 0.7;
    let kAhead = 0, n = 0;
    for (let d = 6; d <= look; d += 4) { kAhead += T.sampleScalar(T.curv, k.dist + d); n++; }
    kAhead /= n;
    let xt = clamp(kAhead * 260, -W * 0.75, W * 0.75) + this.offset * 0.6 + Math.sin(this.t * 0.4 + this.wobble) * 1.2;

    // avoid karts and hazards just ahead
    for (const o of others) {
      if (o === this.kart) continue;
      const ds = o.dist - k.dist;
      if (ds > 0 && ds < 14 && Math.abs(o.x - xt) < 2.6) xt += o.x > k.x ? -3 : 3;
    }
    for (const hz of hazards) {
      let ds = hz.dist - k.dist;
      ds = ((ds % T.length) + T.length) % T.length;
      if (ds < 25 && Math.abs(hz.x - xt) < 2.8) xt += hz.x > xt ? -3.5 : 3.5;
    }
    xt = clamp(xt, -W, W);

    const desiredYaw = Math.atan2(xt - k.x, Math.max(9, k.v * 0.55));
    const kc = T.sampleScalar(T.curv, k.dist + 2);
    const st = k.stats;
    const hs = st.handling * (1 - 0.3 * Math.min(1, Math.abs(k.v) / st.maxSpeed)) * clamp(Math.abs(k.v) / 10, 0.05, 1);
    const need = kc * k.v * (1 - k.assist) / hs;
    k.input.steer = clamp(need + (desiredYaw - k.yaw) * 2.6, -1, 1);
    k.input.gas = 1;
    k.input.brake = 0;
    k.input.drift = false;

    // items
    k.input.item = false;
    if (k.item) {
      this.itemTimer -= dt;
      if (this.itemTimer <= 0) {
        let use = false;
        if (k.item === 'turbo' || k.item === 'shield') use = true;
        else if (k.item === 'rocket') use = others.some(o => o !== k && o.dist - k.dist > 5 && o.dist - k.dist < 90);
        else if (k.item === 'taffy') use = others.some(o => o !== k && k.dist - o.dist > 3 && k.dist - o.dist < 35);
        if (use || this.itemTimer < -8) k.input.item = true;
      }
    } else {
      this.itemTimer = 1 + Math.random() * 3;
    }
  }
}
