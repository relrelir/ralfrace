import * as THREE from 'three';
import * as TX from './textures.js';

// Candy kart models built from primitives. Front of the kart points to -Z, right is +X.

export const WHEELS = {
  donut: { name: 'גלגלי דונאט', cost: 0 },
  cookie: { name: 'גלגלי עוגייה', cost: 30 },
  mint: { name: 'גלגלי מנטה', cost: 50 },
};

export const TOPPERS = {
  none: { name: 'בלי', cost: 0 },
  cherry: { name: 'דובדבן', cost: 20 },
  star: { name: 'כוכב', cost: 35 },
  bow: { name: 'פפיון', cost: 35 },
};

export const COLORS = ['#ff4f8b', '#ff8a3b', '#ffd23f', '#7cf08a', '#2ec4b6', '#4fa3ff', '#9b6bff', '#ff7ad9', '#ffffff', '#5a3a2a', '#222233', '#e8143c'];

let cookieTex, mintTex;

function mat(color, opts = {}) {
  return new THREE.MeshPhongMaterial({ color, shininess: 80, specular: 0x444444, ...opts });
}

function buildWheel(type, accent) {
  const g = new THREE.Group();
  let mesh;
  if (type === 'donut') {
    mesh = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.17, 10, 18), mat(accent));
    mesh.rotation.y = Math.PI / 2;
    const dough = new THREE.Mesh(new THREE.TorusGeometry(0.33, 0.12, 8, 18), mat('#d9a066'));
    dough.rotation.y = Math.PI / 2; dough.position.x = 0.06;
    g.add(dough);
  } else if (type === 'cookie') {
    cookieTex ||= TX.cookieTexture();
    const side = mat('#c48a52', { map: cookieTex });
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.34, 18), [mat('#b8814a'), side, side]);
    mesh.rotation.z = Math.PI / 2;
  } else {
    mintTex ||= TX.swirlTexture('#ffffff', '#e8143c');
    const side = mat('#ffffff', { map: mintTex });
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.32, 18), [mat('#ffffff'), side, side]);
    mesh.rotation.z = Math.PI / 2;
  }
  g.add(mesh);
  return g;
}

function buildDriver(color, accent) {
  const g = new THREE.Group();
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.35, 4, 10), mat(accent));
  torso.position.y = 0.35;
  g.add(torso);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.34, 16, 12), mat('#ffd8b5'));
  head.position.y = 0.95;
  g.add(head);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.38, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.55), mat(color));
  helmet.position.y = 1.0;
  g.add(helmet);
  const visor = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.14, 0.1), mat('#222244', { shininess: 120 }));
  visor.position.set(0, 0.98, -0.32);
  g.add(visor);
  return g;
}

function buildTopper(type) {
  if (type === 'cherry') {
    const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.SphereGeometry(0.22, 12, 10), mat('#e8143c'));
    const st = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.35, 5), mat('#3a7a2a'));
    st.position.y = 0.28; st.rotation.z = 0.3;
    g.add(c, st);
    return g;
  }
  if (type === 'star') {
    const shape = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const r = i % 2 ? 0.14 : 0.34, a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) shape.moveTo(Math.cos(a) * r, Math.sin(a) * r); else shape.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth: 0.1, bevelEnabled: false }), mat('#ffd23f', { emissive: '#664400' }));
    m.position.y = 0.2;
    return m;
  }
  if (type === 'bow') {
    const g = new THREE.Group();
    const m = mat('#ff4f8b');
    for (const s of [-1, 1]) {
      const lobe = new THREE.Mesh(new THREE.ConeGeometry(0.2, 0.4, 10), m);
      lobe.rotation.z = s * Math.PI / 2; lobe.position.x = s * 0.2;
      g.add(lobe);
    }
    g.add(new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), m));
    g.position.y = 0.12;
    return g;
  }
  return null;
}

export function buildCar(cfg) {
  const { body = 'kart', wheels = 'donut', color = '#ff4f8b', accent = '#ffd23f', topper = 'none' } = cfg;
  const root = new THREE.Group();
  const chassis = new THREE.Group(); // tilts/rolls, wheels stay on root
  root.add(chassis);
  const bodyMat = mat(color);
  const accentMat = mat(accent);
  let driverY = 0.55, driverZ = 0.25, topY = 1.85;

  if (body === 'kart') {
    const base = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.4, 3.0), bodyMat);
    base.position.y = 0.55;
    chassis.add(base);
    const noseCap = new THREE.Mesh(new THREE.SphereGeometry(0.5, 16, 10), accentMat);
    noseCap.scale.set(1.4, 0.6, 1); noseCap.position.set(0, 0.7, -1.35);
    chassis.add(noseCap);
    const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.42, 3.02), accentMat);
    stripe.position.y = 0.56;
    chassis.add(stripe);
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.7, 0.3), accentMat);
    seat.position.set(0, 1.0, 0.75);
    chassis.add(seat);
    const wingPost = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.15), bodyMat);
    wingPost.position.set(0, 1.0, 1.35);
    const wing = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.12, 0.5), accentMat);
    wing.position.set(0, 1.3, 1.4);
    chassis.add(wingPost, wing);
    driverY = 0.75; driverZ = 0.35; topY = 2.0;
  } else if (body === 'cupcake') {
    const wrap = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.9, 0.9, 20, 1, true), bodyMat);
    wrap.material.side = THREE.DoubleSide;
    wrap.scale.z = 1.35; wrap.position.y = 0.75;
    chassis.add(wrap);
    // pleats
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      const rib = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.08), accentMat);
      rib.position.set(Math.cos(a) * 1.03, 0.75, Math.sin(a) * 1.03 * 1.35);
      chassis.add(rib);
    }
    const floor = new THREE.Mesh(new THREE.CylinderGeometry(0.9, 0.9, 0.1, 20), bodyMat);
    floor.scale.z = 1.35; floor.position.y = 0.32;
    chassis.add(floor);
    const frost = new THREE.Mesh(new THREE.TorusGeometry(1.0, 0.32, 10, 24), mat('#fff4fb'));
    frost.rotation.x = Math.PI / 2; frost.scale.y = 1.35; frost.position.y = 1.25;
    chassis.add(frost);
    const frost2 = new THREE.Mesh(new THREE.TorusGeometry(0.75, 0.25, 10, 20), mat(accent));
    frost2.rotation.x = Math.PI / 2; frost2.scale.y = 1.3; frost2.position.set(0, 1.45, 0.75);
    frost2.scale.set(0.6, 0.6, 0.8);
    chassis.add(frost2);
    driverY = 0.6; driverZ = 0.0; topY = 2.05;
  } else {
    cookieTex ||= TX.cookieTexture();
    const cookieMat = mat('#d9a066', { map: cookieTex });
    const disc = new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.35, 0.42, 28), [mat('#c48a52'), cookieMat, mat('#c48a52')]);
    disc.scale.z = 1.25; disc.position.y = 0.55;
    chassis.add(disc);
    const cream = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.3, 0.14, 28), bodyMat);
    cream.scale.z = 1.25; cream.position.y = 0.83;
    chassis.add(cream);
    const wafer = new THREE.Mesh(new THREE.BoxGeometry(1.4, 0.5, 0.12), accentMat);
    wafer.position.set(0, 1.15, -0.75); wafer.rotation.x = -0.4;
    chassis.add(wafer);
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.7, 0.7), accentMat);
    fin.position.set(0, 1.2, 1.35);
    chassis.add(fin);
    driverY = 0.85; driverZ = 0.2; topY = 2.15;
  }

  const driver = buildDriver(color, accent);
  driver.position.set(0, driverY, driverZ);
  chassis.add(driver);
  const top = buildTopper(topper);
  if (top) { top.position.add(new THREE.Vector3(0, topY, driverZ)); chassis.add(top); }

  // exhaust pipes
  const pipeMat = mat('#c0c0d0', { shininess: 120 });
  const exhausts = [];
  for (const s of [-1, 1]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.5, 8), pipeMat);
    pipe.rotation.x = Math.PI / 2; pipe.position.set(s * 0.45, 0.55, 1.6);
    chassis.add(pipe);
    exhausts.push(new THREE.Vector3(s * 0.45, 0.55, 1.9));
  }

  const wheelObjs = [], front = [];
  const wx = 1.05, wz = 1.05, wy = 0.45;
  for (const [x, z] of [[-wx, -wz], [wx, -wz], [-wx, wz], [wx, wz]]) {
    const pivot = new THREE.Group();
    pivot.position.set(x, wy, z);
    const w = buildWheel(wheels, accent);
    pivot.add(w);
    root.add(pivot);
    wheelObjs.push(w);
    if (z < 0) front.push(pivot);
  }

  // bubble-gum shield
  const shield = new THREE.Mesh(new THREE.SphereGeometry(2.3, 20, 14), new THREE.MeshPhongMaterial({ color: '#ff8ad8', transparent: true, opacity: 0.35, shininess: 120, depthWrite: false }));
  shield.position.y = 0.9; shield.scale.set(1, 0.8, 1.2);
  shield.visible = false;
  root.add(shield);

  root.userData = { chassis, wheels: wheelObjs, front, shield, exhausts };
  return root;
}

export function makeGhost(model) {
  const ghostMat = new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.35, depthWrite: false });
  model.traverse(o => { if (o.isMesh) o.material = ghostMat; });
  model.userData.shield.visible = false;
  return model;
}
