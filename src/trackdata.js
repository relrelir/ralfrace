import * as THREE from 'three';
import { buildPath } from './trackdefs.js';

// Dense sampled representation of a closed track: positions and an orthonormal
// frame (tangent / up / right) every STEP metres. All physics runs in track space
// (distance along track s, lateral offset x, height above road h).
export const STEP = 1;

export class TrackData {
  constructor(def) {
    this.def = def;
    this.width = def.width;
    this.laps = def.laps;
    const path = buildPath(def);
    const ctrl = path.points.map(p => new THREE.Vector3(p[0], p[1], p[2]));
    const banks = path.points.map(p => p[3]);
    const curve = new THREE.CatmullRomCurve3(ctrl, true, 'centripetal');
    this.curve = curve;
    const length = curve.getLength();
    const N = Math.round(length / STEP);
    this.N = N;
    this.length = N * STEP;

    const pos = new Float32Array(N * 3), tan = new Float32Array(N * 3);
    const up = new Float32Array(N * 3), right = new Float32Array(N * 3);
    const bank = new Float32Array(N), curv = new Float32Array(N), slope = new Float32Array(N);
    const P = [], T = [];
    const nCtrl = ctrl.length;
    for (let i = 0; i < N; i++) {
      const u = i / N;
      P.push(curve.getPointAt(u));
      T.push(curve.getTangentAt(u).normalize());
      // bank: interpolate between control points using the curve parameter t
      const t = curve.getUtoTmapping(u) * nCtrl;
      const i0 = Math.floor(t) % nCtrl, i1 = (i0 + 1) % nCtrl, f = t - Math.floor(t);
      const ff = f * f * (3 - 2 * f);
      bank[i] = banks[i0] * (1 - ff) + banks[i1] * ff;
    }

    // parallel transport of the up vector (handles loops), then fix closure twist
    const U = [];
    let u0 = new THREE.Vector3(0, 1, 0);
    u0.addScaledVector(T[0], -u0.dot(T[0])).normalize();
    U.push(u0.clone());
    // While the road is upright, relax the frame back toward world-up so the twist
    // picked up in a loop does not leak into the rest of the track.
    const worldUp = new THREE.Vector3(0, 1, 0), proj = new THREE.Vector3();
    for (let i = 1; i <= N; i++) {
      const tI = T[i % N];
      const prev = U[i - 1].clone();
      prev.addScaledVector(tI, -prev.dot(tI)).normalize();
      if (prev.y > 0.05 && Math.abs(tI.y) < 0.8) {
        proj.copy(worldUp).addScaledVector(tI, -worldUp.dot(tI)).normalize();
        prev.lerp(proj, 0.08).addScaledVector(tI, -prev.dot(tI)).normalize();
      }
      U.push(prev);
    }
    // twist between transported U[N] and U[0] around T[0]
    const end = U[N], start = U[0];
    const cr = new THREE.Vector3().crossVectors(end, start);
    const twist = Math.atan2(cr.dot(T[0]), end.dot(start));
    const q = new THREE.Quaternion();
    for (let i = 0; i < N; i++) {
      const corr = twist * (i / N) + bank[i];
      q.setFromAxisAngle(T[i], corr);
      U[i].applyQuaternion(q).normalize();
    }

    const R = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      R.crossVectors(T[i], U[i]).normalize();
      pos.set([P[i].x, P[i].y, P[i].z], i * 3);
      tan.set([T[i].x, T[i].y, T[i].z], i * 3);
      up.set([U[i].x, U[i].y, U[i].z], i * 3);
      right.set([R.x, R.y, R.z], i * 3);
      slope[i] = T[i].y;
    }
    // signed curvature around the local up axis (positive = track turns right)
    const c = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      const a = T[i], b = T[(i + 1) % N];
      c.crossVectors(a, b);
      curv[i] = -Math.atan2(c.dot(U[i]), a.dot(b)) / STEP;
    }
    // smooth curvature a little so steering assist is not jerky
    const sm = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      let acc = 0;
      for (let k = -3; k <= 3; k++) acc += curv[(i + k + N) % N];
      sm[i] = acc / 7;
    }

    Object.assign(this, { pos, tan, up, right, bank, curv: sm, slope });

    // features → distance along track
    this.features = path.features.map(f => ({ ...f, s: this.nearestS(new THREE.Vector3(...f.pos), f.idx / path.points.length * this.length) }));
    this.boosts = this.features.filter(f => f.type === 'boost').map(f => f.s);
    this.jumps = this.features.filter(f => f.type === 'jump').map(f => f.s);
    this.itemRows = this.features.filter(f => f.type === 'items').map(f => f.s);
    this.coinLines = this.features.filter(f => f.type === 'coins').map(f => ({ s: f.s, x: f.arg || 0 }));
    // checkpoints for split times (Trackmania style)
    this.checkpoints = [0.25, 0.5, 0.75].map(f => f * this.length);
  }

  nearestS(p, hint) {
    let best = 0, bd = Infinity;
    const N = this.N;
    const h = Math.round(hint / STEP);
    for (let k = -60; k <= 60; k++) {
      const i = (h + k + N * 10) % N;
      const dx = this.pos[i * 3] - p.x, dy = this.pos[i * 3 + 1] - p.y, dz = this.pos[i * 3 + 2] - p.z;
      const d = dx * dx + dy * dy + dz * dz;
      if (d < bd) { bd = d; best = i; }
    }
    return best * STEP;
  }

  wrap(s) { const L = this.length; return ((s % L) + L) % L; }

  // interpolated frame at distance s → writes into out {pos,tan,up,right} (Vector3s)
  frame(s, out) {
    s = this.wrap(s);
    const f = s / STEP;
    const i0 = Math.floor(f) % this.N, i1 = (i0 + 1) % this.N, t = f - Math.floor(f);
    lerp3(this.pos, i0, i1, t, out.pos);
    lerp3(this.tan, i0, i1, t, out.tan).normalize();
    lerp3(this.up, i0, i1, t, out.up).normalize();
    lerp3(this.right, i0, i1, t, out.right).normalize();
    return out;
  }

  sampleScalar(arr, s) {
    s = this.wrap(s);
    const f = s / STEP;
    const i0 = Math.floor(f) % this.N, i1 = (i0 + 1) % this.N, t = f - Math.floor(f);
    return arr[i0] * (1 - t) + arr[i1] * t;
  }

  // world position of a point in track space
  toWorld(s, x, h, out, frame) {
    const fr = this.frame(s, frame || tmpFrame);
    return out.copy(fr.pos).addScaledVector(fr.right, x).addScaledVector(fr.up, h);
  }
}

const tmpFrame = { pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
export function makeFrame() {
  return { pos: new THREE.Vector3(), tan: new THREE.Vector3(), up: new THREE.Vector3(), right: new THREE.Vector3() };
}

function lerp3(arr, i0, i1, t, out) {
  return out.set(
    arr[i0 * 3] * (1 - t) + arr[i1 * 3] * t,
    arr[i0 * 3 + 1] * (1 - t) + arr[i1 * 3 + 1] * t,
    arr[i0 * 3 + 2] * (1 - t) + arr[i1 * 3 + 2] * t,
  );
}
