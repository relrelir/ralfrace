import * as THREE from 'three';
import { STEP } from './trackdata.js';
import * as TX from './textures.js';
import { t } from './i18n.js';

// Builds every visual for a track: road slab, walls, start gate, pads, ramps,
// support pillars, ground, sky and instanced candy decorations.

const V = () => new THREE.Vector3();

function rng(seed) {
  let s = seed >>> 0;
  return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
}

function hashStr(str) { let h = 2166136261; for (const ch of str) { h ^= ch.charCodeAt(0); h = Math.imul(h, 16777619); } return h >>> 0; }

// strip between two point generators along the track (i = sample index, wraps)
function strip(track, i0, i1, ptA, ptB, { vScale = 16, uAlong = false, step = 1 } = {}) {
  const pos = [], uv = [], idx = [];
  let row = 0;
  const a = V(), b = V();
  for (let i = i0; i <= i1; i += step) {
    const ii = ((i % track.N) + track.N) % track.N;
    ptA(ii, a, i); ptB(ii, b, i);
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
    const along = (i * STEP) / vScale;
    if (uAlong) uv.push(along, 0, along, 1); else uv.push(0, along, 1, along);
    if (row > 0) {
      const r = row * 2;
      idx.push(r - 2, r - 1, r, r - 1, r + 1, r);
    }
    row++;
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
}

function get(track, arr, i, out) { return out.set(arr[i * 3], arr[i * 3 + 1], arr[i * 3 + 2]); }

function trackPoint(track, i, x, h, out) {
  const p = get(track, track.pos, i, out);
  const r = get(track, track.right, i, tmpA);
  const u = get(track, track.up, i, tmpB);
  return p.addScaledVector(r, x).addScaledVector(u, h);
}
const tmpA = V(), tmpB = V();

export function buildTrackScene(track) {
  const def = track.def, th = def.theme;
  const group = new THREE.Group();
  const N = track.N, hw = track.width / 2;
  const rand = rng(hashStr(def.id));

  // ---------- road ----------
  const roadMat = new THREE.MeshLambertMaterial({ map: TX.roadTexture(th.road, th.road2) });
  const roadTop = strip(track, 0, N, (i, o) => trackPoint(track, i, -hw, 0.02, o), (i, o) => trackPoint(track, i, hw, 0.02, o), { vScale: 14 });
  group.add(new THREE.Mesh(roadTop, roadMat));
  const underMat = new THREE.MeshLambertMaterial({ color: new THREE.Color(th.road2).multiplyScalar(0.55), side: THREE.DoubleSide });
  const T = 0.9;
  const under = strip(track, 0, N, (i, o) => trackPoint(track, i, hw + 0.3, -T, o), (i, o) => trackPoint(track, i, -hw - 0.3, -T, o));
  group.add(new THREE.Mesh(under, underMat));

  // ---------- walls (candy cane stripes) ----------
  const wallTex = TX.stripeTexture(th.wall1, th.wall2);
  const wallMat = new THREE.MeshLambertMaterial({ map: wallTex, side: THREE.DoubleSide });
  for (const side of [-1, 1]) {
    const inner = strip(track, 0, N, (i, o) => trackPoint(track, i, side * (hw + 0.05), -T, o), (i, o) => trackPoint(track, i, side * (hw + 0.05), 1.1, o), { uAlong: true, vScale: 4 });
    group.add(new THREE.Mesh(inner, wallMat));
    const top = strip(track, 0, N, (i, o) => trackPoint(track, i, side * (hw + 0.05), 1.1, o), (i, o) => trackPoint(track, i, side * (hw + 0.4), 1.1, o), { uAlong: true, vScale: 4 });
    group.add(new THREE.Mesh(top, wallMat));
    const outer = strip(track, 0, N, (i, o) => trackPoint(track, i, side * (hw + 0.4), 1.1, o), (i, o) => trackPoint(track, i, side * (hw + 0.4), -T, o), { uAlong: true, vScale: 4 });
    group.add(new THREE.Mesh(outer, wallMat));
  }

  // ---------- start line + gate ----------
  const checker = new THREE.MeshBasicMaterial({ map: TX.checkerTexture() });
  const startStrip = strip(track, -2, 2, (i, o) => trackPoint(track, i, -hw, 0.05, o), (i, o) => trackPoint(track, i, hw, 0.05, o), { uAlong: true, vScale: 4 });
  group.add(new THREE.Mesh(startStrip, checker));
  group.add(buildGate(track, 0, hw));

  // ---------- boost pads ----------
  const boostMat = new THREE.MeshBasicMaterial({ map: TX.boostTexture(), transparent: true, opacity: 0.95 });
  for (const s of track.boosts) {
    const i0 = Math.round(s / STEP) - 3;
    const g = strip(track, i0, i0 + 6, (i, o) => trackPoint(track, i, -hw + 1.5, 0.06, o), (i, o) => trackPoint(track, i, hw - 1.5, 0.06, o), { vScale: 6 });
    const uv = g.attributes.uv; // single texture copy over the pad
    for (let k = 0; k < uv.count; k++) uv.setY(k, 1 - Math.floor(k / 2) / 6);
    group.add(new THREE.Mesh(g, boostMat));
  }

  // ---------- jump ramps ----------
  const rampMat = new THREE.MeshLambertMaterial({ map: TX.stripeTexture('#ffe14f', '#ff4f8b') });
  for (const s of track.jumps) {
    const iEnd = Math.round(s / STEP), iStart = iEnd - 7;
    const hAt = i => 1.3 * (i - iStart) / 7;
    const top = strip(track, iStart, iEnd, (i, o, raw) => trackPoint(track, i, -hw + 0.2, hAt(raw) + 0.03, o), (i, o, raw) => trackPoint(track, i, hw - 0.2, hAt(raw) + 0.03, o), { uAlong: true, vScale: 2 });
    group.add(new THREE.Mesh(top, rampMat));
    const front = new THREE.BufferGeometry();
    const a = trackPoint(track, iEnd % N, -hw + 0.2, 0, V()), b = trackPoint(track, iEnd % N, hw - 0.2, 0, V());
    const c = trackPoint(track, iEnd % N, hw - 0.2, 1.33, V()), d = trackPoint(track, iEnd % N, -hw + 0.2, 1.33, V());
    front.setAttribute('position', new THREE.Float32BufferAttribute([a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z, d.x, d.y, d.z], 3));
    front.setIndex([0, 1, 2, 0, 2, 3]);
    front.computeVertexNormals();
    group.add(new THREE.Mesh(front, new THREE.MeshLambertMaterial({ color: '#ff4f8b', side: THREE.DoubleSide })));
  }

  // ---------- ground ----------
  let minY = Infinity, cx = 0, cz = 0;
  for (let i = 0; i < N; i++) { minY = Math.min(minY, track.pos[i * 3 + 1]); cx += track.pos[i * 3]; cz += track.pos[i * 3 + 2]; }
  cx /= N; cz /= N;
  const groundY = minY - 1.2 - (th.groundDrop || 0);
  track.groundY = groundY;
  track.center = new THREE.Vector3(cx, groundY, cz);
  const gTex = TX.groundTexture(th.ground);
  gTex.repeat.set(120, 120);
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshLambertMaterial({ map: gTex }));
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(cx, groundY, cz);
  group.add(ground);

  // ---------- pillars under raised road ----------
  const pillarPos = [];
  for (let i = 0; i < N; i += 22) {
    const y = track.pos[i * 3 + 1];
    if (y - groundY < 4 || track.up[i * 3 + 1] < 0.7) continue;
    const px = track.pos[i * 3], pz = track.pos[i * 3 + 2];
    let blocked = false;
    for (let j = 0; j < N; j += 3) {
      const dy = track.pos[j * 3 + 1];
      if (dy > y - 3) continue;
      if (Math.hypot(track.pos[j * 3] - px, track.pos[j * 3 + 2] - pz) < hw + 2.5) { blocked = true; break; }
    }
    if (!blocked) pillarPos.push([px, groundY, pz, y - T - groundY]);
  }
  if (pillarPos.length) {
    const pg = new THREE.CylinderGeometry(1, 1, 1, 10);
    pg.translate(0, 0.5, 0);
    const pm = new THREE.MeshLambertMaterial({ map: TX.stripeTexture('#ffffff', th.wall2) });
    const inst = new THREE.InstancedMesh(pg, pm, pillarPos.length);
    const m = new THREE.Matrix4();
    pillarPos.forEach((p, k) => {
      m.compose(new THREE.Vector3(p[0], p[1], p[2]), new THREE.Quaternion(), new THREE.Vector3(1.3, p[3], 1.3));
      inst.setMatrixAt(k, m);
    });
    group.add(inst);
  }

  // ---------- sky ----------
  group.add(buildSky(th));

  // ---------- decorations ----------
  group.add(buildDecor(track, rand, groundY));
  return group;
}

function buildGate(track, s, hw) {
  const g = new THREE.Group();
  const fr = { pos: V(), tan: V(), up: V(), right: V() };
  track.frame(s, fr);
  const m = new THREE.Matrix4().makeBasis(fr.right, fr.up, fr.tan.clone().negate());
  g.quaternion.setFromRotationMatrix(m);
  g.position.copy(fr.pos);
  const poleMat = new THREE.MeshLambertMaterial({ map: TX.stripeTexture('#ffffff', '#ff4f8b') });
  for (const side of [-1, 1]) {
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 8, 12), poleMat);
    pole.position.set(side * (hw + 1.2), 4, 0);
    g.add(pole);
    const ball = new THREE.Mesh(new THREE.SphereGeometry(1.1, 16, 12), new THREE.MeshLambertMaterial({ color: '#ffe14f' }));
    ball.position.set(side * (hw + 1.2), 8.4, 0);
    g.add(ball);
  }
  const banner = new THREE.Mesh(new THREE.BoxGeometry(hw * 2 + 2.4, 1.8, 0.4), [
    new THREE.MeshLambertMaterial({ color: '#ff4f8b' }), new THREE.MeshLambertMaterial({ color: '#ff4f8b' }),
    new THREE.MeshLambertMaterial({ color: '#ff4f8b' }), new THREE.MeshLambertMaterial({ color: '#ff4f8b' }),
    new THREE.MeshBasicMaterial({ map: TX.bannerTexture(t('start')) }), new THREE.MeshBasicMaterial({ map: TX.bannerTexture(t('start')) }),
  ]);
  banner.position.set(0, 7.2, 0);
  g.add(banner);
  return g;
}

function buildSky(th) {
  const geo = new THREE.SphereGeometry(2500, 32, 16);
  const top = new THREE.Color(th.sky1), bot = new THREE.Color(th.sky2);
  const cols = [];
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) {
    const t = Math.max(0, Math.min(1, p.getY(i) / 2500 * 1.6 + 0.15));
    const c = bot.clone().lerp(top, t);
    cols.push(c.r, c.g, c.b);
  }
  geo.setAttribute('color', new THREE.Float32BufferAttribute(cols, 3));
  const sky = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ vertexColors: true, side: THREE.BackSide, fog: false, depthWrite: false }));
  sky.renderOrder = -10;
  sky.userData.followCamera = true;
  return sky;
}

// ------------------------------------------------------------------ decor
const PALETTE = ['#ff6fb5', '#ffd54f', '#6fd6ff', '#9b7bff', '#7cf08a', '#ff8a5c', '#ffffff', '#ff4f6d'];

function decorKinds() {
  const white = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const tinted = new THREE.MeshLambertMaterial({ color: '#ffffff' });
  const stick = new THREE.CylinderGeometry(0.18, 0.18, 6, 6).translate(0, 3, 0);
  const swirlMat = new THREE.MeshLambertMaterial({ map: TX.swirlTexture('#ff4f8b', '#ffffff') });
  const disc = new THREE.CylinderGeometry(2.3, 2.3, 0.5, 24).rotateX(Math.PI / 2).translate(0, 7.8, 0);
  const swirlMat2 = new THREE.MeshLambertMaterial({ map: TX.swirlTexture('#6fd6ff', '#fff36b') });
  const gum = new THREE.SphereGeometry(1.6, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2);
  const wrapper = new THREE.CylinderGeometry(1.7, 1.2, 1.8, 16).translate(0, 0.9, 0);
  const frosting = new THREE.SphereGeometry(1.8, 16, 12).scale(1, 0.75, 1).translate(0, 2.1, 0);
  const cherry = new THREE.SphereGeometry(0.45, 10, 8).translate(0, 3.5, 0);
  const red = new THREE.MeshLambertMaterial({ color: '#e8143c' });
  const donut = new THREE.TorusGeometry(2, 0.9, 12, 24).translate(0, 2.9, 0);
  const cone = new THREE.ConeGeometry(1.1, 3.2, 14).rotateX(Math.PI).translate(0, 1.6, 0);
  const coneMat = new THREE.MeshLambertMaterial({ color: '#e0a35c' });
  const scoop = new THREE.SphereGeometry(1.25, 14, 10).translate(0, 3.6, 0);
  const scoop2 = new THREE.SphereGeometry(1.05, 14, 10).translate(0, 5.1, 0);
  const trunk = new THREE.CylinderGeometry(0.35, 0.45, 4, 8).translate(0, 2, 0);
  const brown = new THREE.MeshLambertMaterial({ color: '#8a5a3c' });
  const puff = new THREE.IcosahedronGeometry(3, 1).translate(0, 6, 0);
  const caneCurve = new THREE.CatmullRomCurve3([V().set(0, 0, 0), V().set(0, 5, 0), V().set(0, 7, 0), V().set(1, 7.9, 0), V().set(2, 7.4, 0), V().set(2.3, 6.4, 0)]);
  const cane = new THREE.TubeGeometry(caneCurve, 24, 0.4, 8, false);
  const caneMat = new THREE.MeshLambertMaterial({ map: TX.stripeTexture('#ffffff', '#e8143c') });
  caneMat.map.repeat.set(6, 1);

  // world 2 props
  const ice = new THREE.MeshPhongMaterial({ color: '#dff4ff', shininess: 120, transparent: true, opacity: 0.85 });
  const iceTree = new THREE.ConeGeometry(2.2, 7, 7).translate(0, 3.5, 0);
  const iceTree2 = new THREE.ConeGeometry(1.5, 4, 7).translate(0, 6.5, 0);
  const bearBody = new THREE.SphereGeometry(1.6, 16, 12).scale(1, 1.25, 0.9).translate(0, 2, 0);
  const bearHead = new THREE.SphereGeometry(1.15, 16, 12).translate(0, 4.4, 0);
  const bearLimbs = mergeSpheres([[-0.8, 5.3, 0, 0.45], [0.8, 5.3, 0, 0.45], [-1.4, 2.7, 0.3, 0.55], [1.4, 2.7, 0.3, 0.55], [-0.8, 0.4, 0.2, 0.6], [0.8, 0.4, 0.2, 0.6]]);
  const gummyMat = new THREE.MeshPhongMaterial({ color: '#ffffff', shininess: 110, transparent: true, opacity: 0.82 });
  const cloud = mergeSpheres([[0, 1.5, 0, 2.2], [2, 1.2, 0.5, 1.7], [-2, 1.1, -0.3, 1.6], [0.8, 2.8, 0, 1.5]]);
  const cloudMat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#ffd6ef', emissiveIntensity: 0.3 });
  const chimney = new THREE.CylinderGeometry(1.2, 1.5, 12, 12).translate(0, 6, 0);
  const chimneyBand = new THREE.CylinderGeometry(1.32, 1.32, 1.2, 12).translate(0, 10, 0);
  const gray = new THREE.MeshLambertMaterial({ color: '#8a8f9e' });
  const volcano = new THREE.ConeGeometry(9, 14, 12, 1, true).translate(0, 7, 0);
  const volcanoTop = new THREE.CylinderGeometry(2.6, 2.6, 0.6, 12).translate(0, 13.6, 0);
  const lava = new THREE.MeshBasicMaterial({ color: '#ff7a1a' });
  const rock = new THREE.MeshLambertMaterial({ color: '#4a2c22', side: THREE.DoubleSide });

  return [
    { key: 'lolli', w: 3, parts: [{ g: stick, m: white }, { g: disc, m: swirlMat }] },
    { key: 'lolli2', w: 2, parts: [{ g: stick, m: white }, { g: disc, m: swirlMat2 }] },
    { key: 'gum', w: 4, parts: [{ g: gum, m: tinted, color: true }] },
    { key: 'cupcake', w: 3, parts: [{ g: wrapper, m: tinted, color: true }, { g: frosting, m: white }, { g: cherry, m: red }] },
    { key: 'donut', w: 2, parts: [{ g: donut, m: tinted, color: true }] },
    { key: 'cone', w: 2, parts: [{ g: cone, m: coneMat }, { g: scoop, m: tinted, color: true }, { g: scoop2, m: tinted, color: true }] },
    { key: 'tree', w: 3, parts: [{ g: trunk, m: brown }, { g: puff, m: tinted, color: true }] },
    { key: 'cane', w: 2, parts: [{ g: cane, m: caneMat }] },
    { key: 'icetree', w: 4, parts: [{ g: iceTree, m: ice }, { g: iceTree2, m: ice }] },
    { key: 'bear', w: 4, parts: [{ g: bearBody, m: gummyMat, color: true }, { g: bearHead, m: gummyMat, color: true }, { g: bearLimbs, m: gummyMat, color: true }] },
    { key: 'cloud', w: 4, parts: [{ g: cloud, m: cloudMat }] },
    { key: 'chimney', w: 3, clear: 6, parts: [{ g: chimney, m: gray }, { g: chimneyBand, m: red }] },
    { key: 'volcano', w: 2, clear: 18, parts: [{ g: volcano, m: rock }, { g: volcanoTop, m: lava }] },
  ];
}

// several spheres in one geometry (one instanced draw call)
function mergeSpheres(list) {
  const geos = list.map(([x, y, z, r]) => new THREE.SphereGeometry(r, 12, 9).translate(x, y, z).toNonIndexed());
  let count = 0;
  for (const g of geos) count += g.attributes.position.count;
  const pos = new Float32Array(count * 3), nor = new Float32Array(count * 3);
  let o = 0;
  for (const g of geos) {
    pos.set(g.attributes.position.array, o * 3);
    nor.set(g.attributes.normal.array, o * 3);
    o += g.attributes.position.count;
  }
  const out = new THREE.BufferGeometry();
  out.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  out.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
  return out;
}

function buildDecor(track, rand, groundY) {
  const group = new THREE.Group();
  const all = decorKinds();
  const wanted = track.def.theme.decor;
  // a theme can pick its own props (repeat a key to make it more common)
  const kinds = wanted ? wanted.map(k => ({ ...all.find(d => d.key === k) })) : all.filter(d => ['lolli', 'lolli2', 'gum', 'cupcake', 'donut', 'cone', 'tree', 'cane'].includes(d.key));
  const totalW = kinds.reduce((a, k) => a + k.w, 0);
  const pick = () => { let r = rand() * totalW; for (const k of kinds) { r -= k.w; if (r <= 0) return k; } return kinds[0]; };
  const placed = kinds.map(() => []);
  const N = track.N, hw = track.width / 2;
  const drop = track.def.theme.groundDrop || 0;

  const clear = (x, z, r) => {
    for (let j = 0; j < N; j += 3) {
      const dx = track.pos[j * 3] - x, dz = track.pos[j * 3 + 2] - z;
      if (dx * dx + dz * dz < (hw + r) * (hw + r)) return false;
    }
    return true;
  };

  for (let i = 0; i < N; i += 9) {
    for (const side of [-1, 1]) {
      if (rand() < 0.25) continue;
      const d = hw + 5 + rand() * rand() * 45;
      const px = track.pos[i * 3] + track.right[i * 3] * side * d;
      const pz = track.pos[i * 3 + 2] + track.right[i * 3 + 2] * side * d;
      const kind = pick();
      if (!clear(px, pz, kind.clear || 4)) continue;
      // on a sky track, clouds float just below the road instead of sitting on the far ground
      const y = kind.key === 'cloud' && drop ? track.pos[i * 3 + 1] - 6 - rand() * 18 : groundY;
      placed[kinds.indexOf(kind)].push({ x: px, y, z: pz, s: 0.8 + rand() * 0.9, r: rand() * Math.PI * 2, c: PALETTE[Math.floor(rand() * PALETTE.length)] });
    }
  }
  // scattered far field
  for (let n = 0; n < 160; n++) {
    const a = rand() * Math.PI * 2, d = 80 + rand() * 380;
    const px = track.center.x + Math.cos(a) * d, pz = track.center.z + Math.sin(a) * d;
    const kind = pick();
    if (!clear(px, pz, (kind.clear || 4) + 2)) continue;
    const y = kind.key === 'cloud' && drop ? groundY + rand() * drop : groundY;
    placed[kinds.indexOf(kind)].push({ x: px, y, z: pz, s: 1.2 + rand() * 1.6, r: rand() * Math.PI * 2, c: PALETTE[Math.floor(rand() * PALETTE.length)] });
  }

  const m = new THREE.Matrix4(), q = new THREE.Quaternion(), col = new THREE.Color();
  kinds.forEach((kind, ki) => {
    const list = placed[ki];
    if (!list.length) return;
    for (const part of kind.parts) {
      const inst = new THREE.InstancedMesh(part.g, part.m, list.length);
      list.forEach((p, k) => {
        q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), p.r);
        m.compose(new THREE.Vector3(p.x, p.y, p.z), q, new THREE.Vector3(p.s, p.s, p.s));
        inst.setMatrixAt(k, m);
        if (part.color) inst.setColorAt(k, col.set(p.c));
      });
      group.add(inst);
    }
  });

  // distant layered cake mountains
  const cakeLayers = [];
  for (let n = 0; n < 14; n++) {
    const a = (n / 14) * Math.PI * 2 + rand() * 0.3, d = 650 + rand() * 250;
    cakeLayers.push({ x: track.center.x + Math.cos(a) * d, z: track.center.z + Math.sin(a) * d, r: 60 + rand() * 60, h: 40 + rand() * 50, c: PALETTE[n % PALETTE.length] });
  }
  for (const c of cakeLayers) {
    let y = groundY, r = c.r;
    for (let l = 0; l < 3; l++) {
      const h = c.h * (0.5 - l * 0.1);
      const layer = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, 24), new THREE.MeshLambertMaterial({ color: l % 2 ? '#fff4e0' : c.c }));
      layer.position.set(c.x, y + h / 2, c.z);
      group.add(layer);
      y += h; r *= 0.7;
    }
    const cherry = new THREE.Mesh(new THREE.SphereGeometry(r * 0.5, 16, 12), new THREE.MeshLambertMaterial({ color: '#e8143c' }));
    cherry.position.set(c.x, y + r * 0.4, c.z);
    group.add(cherry);
  }

  // cotton candy clouds
  const cloudGeo = new THREE.IcosahedronGeometry(1, 1);
  const cloudMat = new THREE.MeshLambertMaterial({ color: '#ffffff', emissive: '#ffd6ef', emissiveIntensity: 0.35 });
  const puffs = [];
  for (let n = 0; n < 22; n++) {
    const a = rand() * Math.PI * 2, d = 200 + rand() * 700, y = groundY + 120 + rand() * 120;
    const cx = track.center.x + Math.cos(a) * d, cz = track.center.z + Math.sin(a) * d;
    for (let p = 0; p < 5; p++) puffs.push([cx + (rand() - 0.5) * 60, y + (rand() - 0.5) * 10, cz + (rand() - 0.5) * 30, 12 + rand() * 14]);
  }
  const clouds = new THREE.InstancedMesh(cloudGeo, cloudMat, puffs.length);
  puffs.forEach((p, k) => { m.compose(new THREE.Vector3(p[0], p[1], p[2]), q.identity(), new THREE.Vector3(p[3], p[3] * 0.6, p[3])); clouds.setMatrixAt(k, m); });
  group.add(clouds);
  return group;
}
