import * as THREE from 'three';
import * as TX from './textures.js';
import { makeFrame } from './trackdata.js';

export const ITEM_INFO = {
  turbo: { icon: '🚀', name: 'טורבו' },
  shield: { icon: '🫧', name: 'מגן מסטיק' },
  taffy: { icon: '🍬', name: 'מלכודת טופי' },
  rocket: { icon: '🍭', name: 'טיל סוכריה' },
};

function wrapDelta(d, L) { d = ((d % L) + L) % L; return d > L / 2 ? d - L : d; }

// Item boxes, coins, taffy traps and candy rockets.
export class ItemManager {
  constructor(track, scene, { items = true, coins = true } = {}) {
    this.track = track;
    this.scene = scene;
    this.frame = makeFrame();
    this.boxes = []; this.coins = []; this.traps = []; this.rockets = [];
    this.events = [];
    const hw = track.width / 2;
    const tmp = new THREE.Vector3();

    if (items) {
      const boxGeo = new THREE.BoxGeometry(1.5, 1.5, 1.5);
      const boxMat = new THREE.MeshLambertMaterial({ map: TX.itemBoxTexture(), transparent: true, opacity: 0.9, emissive: '#552244' });
      for (const s of track.itemRows) {
        for (let k = 0; k < 4; k++) {
          const x = (-0.75 + k * 0.5) * hw * 0.9;
          const mesh = new THREE.Mesh(boxGeo, boxMat);
          scene.add(mesh);
          this.boxes.push({ s, x, mesh, cool: 0, base: track.toWorld(s, x, 1.3, new THREE.Vector3()) });
        }
      }
    }
    if (coins) {
      const coinGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.15, 20).rotateX(Math.PI / 2);
      const face = new THREE.MeshLambertMaterial({ map: TX.coinTexture(), emissive: '#553300' });
      const rim = new THREE.MeshLambertMaterial({ color: '#e0a000', emissive: '#553300' });
      for (const line of track.coinLines) {
        for (let k = 0; k < 6; k++) {
          const s = line.s + 4 + k * 5;
          const mesh = new THREE.Mesh(coinGeo, [rim, face, face]);
          scene.add(mesh);
          track.toWorld(s, line.x, 1.1, tmp);
          mesh.position.copy(tmp);
          this.coins.push({ s: track.wrap(s), x: line.x, mesh, cool: 0 });
        }
      }
    }
    this.trapGeo = new THREE.SphereGeometry(1.2, 14, 10).scale(1.2, 0.35, 1.2);
    this.trapMat = new THREE.MeshPhongMaterial({ color: '#c04bff', shininess: 100 });
  }

  rollItem(rank, n) {
    const f = n > 1 ? rank / (n - 1) : 0.5;
    const w = { turbo: 1 + 2 * f, rocket: 0.4 + 2 * f, shield: 1.6 - f, taffy: 2 - 1.5 * f };
    let total = 0; for (const k in w) total += w[k];
    let r = Math.random() * total;
    for (const k in w) { r -= w[k]; if (r <= 0) return k; }
    return 'turbo';
  }

  // karts must be sorted by race order for rank-based rolls
  update(dt, karts, ranking, time) {
    const L = this.track.length;
    // boxes
    for (const b of this.boxes) {
      if (b.cool > 0) { b.cool -= dt; b.mesh.visible = b.cool <= 0; }
      b.mesh.position.copy(b.base);
      b.mesh.position.y += Math.sin(time * 3 + b.x) * 0.25;
      b.mesh.rotation.set(time * 1.3, time * 1.7, 0);
      if (b.cool > 0) continue;
      for (const k of karts) {
        if (k.spin > 0 && k.isGhost) continue;
        if (Math.abs(wrapDelta(k.dist - b.s, L)) < 1.8 && Math.abs(k.x - b.x) < 1.9 && k.h < 3) {
          b.cool = 3; b.mesh.visible = false;
          if (!k.item) {
            k.item = this.rollItem(ranking.indexOf(k), karts.length);
            k.events.push({ type: 'itemGet', item: k.item });
          }
          this.events.push({ type: 'boxPop', pos: b.mesh.position.clone() });
          break;
        }
      }
    }
    // coins
    for (const c of this.coins) {
      if (c.cool > 0) { c.cool -= dt; c.mesh.visible = c.cool <= 0; continue; }
      c.mesh.rotation.y = time * 3;
      for (const k of karts) {
        if (!k.collectsCoins) continue;
        if (Math.abs(wrapDelta(k.dist - c.s, L)) < 1.6 && Math.abs(k.x - c.x) < 1.6 && k.h < 2.5) {
          c.cool = 12; c.mesh.visible = false;
          k.coins++;
          k.events.push({ type: 'coin' });
          this.events.push({ type: 'coinPop', pos: c.mesh.position.clone() });
          break;
        }
      }
    }
    // traps
    for (let i = this.traps.length - 1; i >= 0; i--) {
      const t = this.traps[i];
      t.life -= dt;
      let hit = false;
      for (const k of karts) {
        if (k === t.owner && t.age < 1) continue;
        if (Math.abs(wrapDelta(k.dist - t.dist, L)) < 1.8 && Math.abs(k.x - t.x) < 2 && k.h < 1) {
          if (k.shield > 0) { k.shield = 0; k.events.push({ type: 'shieldPop' }); }
          else { k.sticky = 1.6; k.v *= 0.55; k.events.push({ type: 'sticky' }); }
          hit = true; break;
        }
      }
      t.age += dt;
      if (hit || t.life <= 0) { this.scene.remove(t.mesh); this.traps.splice(i, 1); }
    }
    // rockets
    for (let i = this.rockets.length - 1; i >= 0; i--) {
      const r = this.rockets[i];
      r.life -= dt;
      r.dist += r.v * dt;
      const tgt = r.target;
      if (tgt) r.x += Math.max(-1, Math.min(1, (tgt.x - r.x) * 2)) * 12 * dt;
      this.track.toWorld(r.dist, r.x, 1.0, r.mesh.position, this.frame);
      const fr = this.frame;
      r.mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(fr.right, fr.up, fr.tan.clone().negate()));
      this.events.push({ type: 'trail', pos: r.mesh.position.clone() });
      let done = r.life <= 0;
      for (const k of karts) {
        if (k === r.owner || k.isGhost) continue;
        if (Math.abs(wrapDelta(k.dist - r.dist, L)) < 2 && Math.abs(k.x - r.x) < 2.2 && k.h < 3) {
          k.hit();
          this.events.push({ type: 'boom', pos: r.mesh.position.clone() });
          done = true; break;
        }
      }
      if (done) { this.scene.remove(r.mesh); this.rockets.splice(i, 1); }
    }
  }

  hazards() {
    return this.traps.map(t => ({ dist: t.dist, x: t.x }));
  }

  use(kart, karts) {
    const item = kart.item;
    if (!item) return;
    kart.item = null;
    if (item === 'turbo') {
      kart.boost = Math.max(kart.boost, 1.8);
      kart.events.push({ type: 'boost', level: 3 });
    } else if (item === 'shield') {
      kart.shield = 8;
      kart.events.push({ type: 'shieldOn' });
    } else if (item === 'taffy') {
      const mesh = new THREE.Mesh(this.trapGeo, this.trapMat);
      const dist = kart.dist - 3.5;
      this.track.toWorld(dist, kart.x, 0.25, mesh.position, this.frame);
      const fr = this.frame;
      mesh.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(fr.right, fr.up, fr.tan.clone().negate()));
      this.scene.add(mesh);
      this.traps.push({ dist, x: kart.x, mesh, life: 40, owner: kart, age: 0 });
      kart.events.push({ type: 'drop' });
    } else if (item === 'rocket') {
      // target: nearest kart ahead
      let target = null, best = Infinity;
      for (const o of karts) {
        if (o === kart || o.isGhost) continue;
        const d = o.dist - kart.dist;
        if (d > 0 && d < best) { best = d; target = o; }
      }
      const mesh = buildRocket();
      this.scene.add(mesh);
      this.rockets.push({ dist: kart.dist + 2.5, x: kart.x, v: Math.max(kart.v, 0) + 30, target, owner: kart, mesh, life: 5 });
      kart.events.push({ type: 'fire' });
    }
  }

  dispose() {
    for (const t of this.traps) this.scene.remove(t.mesh);
    for (const r of this.rockets) this.scene.remove(r.mesh);
  }
}

let rocketParts;
function buildRocket() {
  rocketParts ||= {
    body: new THREE.CylinderGeometry(0.35, 0.35, 1.6, 12).rotateX(Math.PI / 2),
    tip: new THREE.ConeGeometry(0.35, 0.7, 12).rotateX(-Math.PI / 2).translate(0, 0, -1.15),
    stick: new THREE.CylinderGeometry(0.06, 0.06, 1.2, 6).rotateX(Math.PI / 2).translate(0, 0, 1.3),
    matA: new THREE.MeshPhongMaterial({ map: TX.swirlTexture('#ff4f8b', '#ffffff') }),
    matB: new THREE.MeshPhongMaterial({ color: '#ffd23f', emissive: '#663300' }),
    matC: new THREE.MeshLambertMaterial({ color: '#ffffff' }),
  };
  const g = new THREE.Group();
  g.add(new THREE.Mesh(rocketParts.body, rocketParts.matA));
  g.add(new THREE.Mesh(rocketParts.tip, rocketParts.matB));
  g.add(new THREE.Mesh(rocketParts.stick, rocketParts.matC));
  return g;
}
