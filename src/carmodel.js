import * as THREE from 'three';
import * as TX from './textures.js';

// Candy kart models built from primitives. Front of the kart points to -Z, right is +X.
// Items with `unlock` are earned by achievements instead of (or as well as) coins.

export const WHEELS = {
  donut: { name: 'דונאט', cost: 0 },
  cookie: { name: 'עוגייה', cost: 30 },
  mint: { name: 'מנטה', cost: 50 },
  gumball: { name: 'מסטיק כדור', cost: 60 },
  licorice: { name: 'ליקריץ', cost: 80 },
  jelly: { name: "ג'לי שקוף", cost: 100 },
  lolli: { name: 'לוליפופ', cost: 0, unlock: { need: 'gold', n: 1 } },
};

export const TOPPERS = {
  none: { name: 'בלי', cost: 0 },
  cherry: { name: 'דובדבן', cost: 20 },
  star: { name: 'כוכב', cost: 35 },
  bow: { name: 'פפיון', cost: 35 },
  candle: { name: 'נר יום הולדת', cost: 40 },
  antenna: { name: 'אנטנת סוכריה', cost: 50 },
  chef: { name: 'כובע שף', cost: 60 },
  propeller: { name: 'מדחף', cost: 80 },
  horn: { name: 'קרן חד-קרן', cost: 120 },
  crown: { name: 'כתר', cost: 0, unlock: { need: 'trophy', n: 3 } },
  trophy: { name: 'גביע זהב', cost: 0, unlock: { need: 'cup', n: 1 } },
};

export const PATTERNS = {
  none: { name: 'חלק', cost: 0 },
  stripes: { name: 'פסים', cost: 30 },
  dots: { name: 'נקודות', cost: 30 },
  sprinkles: { name: 'סוכריות', cost: 50 },
  checker: { name: 'משבצות', cost: 50 },
  hearts: { name: 'לבבות', cost: 60 },
  flames: { name: 'להבות', cost: 0, unlock: { need: 'trophy', n: 1 } },
};

export const FINISHES = {
  gloss: { name: 'מבריק', cost: 0 },
  matte: { name: 'מט', cost: 40 },
  metal: { name: 'מטאלי', cost: 80 },
  sparkle: { name: 'נצנצים', cost: 0, unlock: { need: 'gold', n: 5 } },
};

// boost flame colours
export const TRAILS = {
  classic: { name: 'אש', cost: 0, colors: ['#ff6a00', '#ffd23f'] },
  rainbow: { name: 'קשת', cost: 80, colors: ['#ff4f6d', '#ffd23f', '#7cf08a', '#4fa3ff', '#9b6bff'] },
  hearts: { name: 'לבבות', cost: 60, colors: ['#ff4f8b', '#ff9ad5', '#ffffff'] },
  stars: { name: 'כוכבים', cost: 60, colors: ['#fff36b', '#ffffff', '#ffd23f'] },
  snow: { name: 'שלג', cost: 0, colors: ['#ffffff', '#bfe8ff', '#7cc8ff'], unlock: { need: 'allTracks' } },
};

export const COLORS = [
  '#ff4f8b', '#ff8a3b', '#ffd23f', '#7cf08a', '#2ec4b6', '#4fa3ff', '#9b6bff', '#ff7ad9', '#ffffff', '#5a3a2a', '#222233', '#e8143c',
  '#b5f2ff', '#ffe0b3', '#c6ff5c', '#ff5cd6', '#8a5cff', '#00b894',
];

const FINISH_PARAMS = {
  gloss: { shininess: 80, specular: 0x444444 },
  matte: { shininess: 4, specular: 0x111111 },
  metal: { shininess: 140, specular: 0xaaaaaa, reflectivity: 1 },
  sparkle: { shininess: 220, specular: 0xffffff, emissiveIntensity: 0.25 },
};

let cookieTex, mintTex, lolliTex;

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
  } else if (type === 'gumball') {
    mesh = new THREE.Mesh(new THREE.SphereGeometry(0.46, 16, 12), mat(accent, { shininess: 140 }));
    mesh.scale.x = 0.75;
  } else if (type === 'licorice') {
    mesh = new THREE.Mesh(new THREE.TorusGeometry(0.34, 0.14, 8, 18), mat('#1b1b1b', { shininess: 120 }));
    mesh.rotation.y = Math.PI / 2;
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 0.3, 10), mat('#e8143c'));
    hub.rotation.z = Math.PI / 2;
    g.add(hub);
  } else if (type === 'jelly') {
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.46, 0.46, 0.36, 18), mat(accent, { transparent: true, opacity: 0.65, shininess: 160 }));
    mesh.rotation.z = Math.PI / 2;
  } else if (type === 'lolli') {
    lolliTex ||= TX.swirlTexture('#ff7ad9', '#fff36b');
    const side = mat('#ffffff', { map: lolliTex });
    mesh = new THREE.Mesh(new THREE.CylinderGeometry(0.47, 0.47, 0.22, 20), [mat('#ff7ad9'), side, side]);
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
  if (type === 'crown') {
    const g = new THREE.Group();
    const gold = mat('#ffd23f', { shininess: 160, specular: 0xffffff, emissive: '#553300' });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.18, 16, 1, true), gold);
    band.material.side = THREE.DoubleSide;
    g.add(band);
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2;
      const spike = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 6), gold);
      spike.position.set(Math.cos(a) * 0.28, 0.2, Math.sin(a) * 0.28);
      g.add(spike);
      const gem = new THREE.Mesh(new THREE.SphereGeometry(0.04, 6, 4), mat(i % 2 ? '#e8143c' : '#4fa3ff'));
      gem.position.set(Math.cos(a) * 0.3, 0.02, Math.sin(a) * 0.3);
      g.add(gem);
    }
    g.position.y = 0.05;
    return g;
  }
  if (type === 'trophy') {
    const g = new THREE.Group();
    const gold = mat('#ffd23f', { shininess: 180, specular: 0xffffff, emissive: '#553300' });
    const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.12, 0.34, 16, 1, true), gold);
    cup.material.side = THREE.DoubleSide;
    cup.position.y = 0.36;
    const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.16, 8), gold);
    stem.position.y = 0.12;
    const base = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.18, 0.06, 14), gold);
    base.position.y = 0.03;
    g.add(cup, stem, base);
    for (const s of [-1, 1]) {
      const handle = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.025, 6, 12, Math.PI), gold);
      handle.position.set(s * 0.27, 0.38, 0); handle.rotation.z = -s * Math.PI / 2;
      g.add(handle);
    }
    return g;
  }
  if (type === 'candle') {
    const g = new THREE.Group();
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.5, 8), mat('#7cc8ff'));
    c.position.y = 0.25;
    const flame = new THREE.Mesh(new THREE.ConeGeometry(0.08, 0.2, 8), new THREE.MeshBasicMaterial({ color: '#ffb23f' }));
    flame.position.y = 0.6;
    g.add(c, flame);
    return g;
  }
  if (type === 'antenna') {
    const g = new THREE.Group();
    const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.9, 5), mat('#ffffff'));
    stick.position.y = 0.45;
    const ball = new THREE.Mesh(new THREE.SphereGeometry(0.15, 12, 8), mat('#ff4f8b', { map: TX.swirlTexture('#ff4f8b', '#ffffff') }));
    ball.position.y = 0.95;
    g.add(stick, ball);
    return g;
  }
  if (type === 'chef') {
    const g = new THREE.Group();
    const white = mat('#ffffff', { shininess: 10 });
    const band = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 0.2, 14), white);
    band.position.y = 0.0;
    const puff = new THREE.Mesh(new THREE.SphereGeometry(0.36, 14, 10), white);
    puff.scale.y = 0.8; puff.position.y = 0.32;
    g.add(band, puff);
    return g;
  }
  if (type === 'propeller') {
    const g = new THREE.Group();
    const cap = new THREE.Mesh(new THREE.SphereGeometry(0.2, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), mat('#4fa3ff'));
    const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.2, 5), mat('#ffffff'));
    pole.position.y = 0.25;
    const blades = new THREE.Group();
    blades.position.y = 0.36;
    for (const c of ['#ff4f8b', '#ffd23f']) {
      const b = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.03, 0.12), mat(c));
      b.rotation.y = c === '#ffd23f' ? Math.PI / 2 : 0;
      blades.add(b);
    }
    g.add(cap, pole, blades);
    g.userData.spin = blades;
    return g;
  }
  if (type === 'horn') {
    const g = new THREE.Group();
    const horn = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.6, 12), mat('#fff36b', { map: TX.swirlTexture('#fff36b', '#ff9ad5'), emissive: '#332200' }));
    horn.position.set(0, 0.25, -0.15); horn.rotation.x = -0.35;
    g.add(horn);
    return g;
  }
  return null;
}

// body builders return where the driver sits and how high the topper goes
function bodyKart(chassis, bodyMat, accentMat) {
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
  return { driverY: 0.75, driverZ: 0.35, topY: 2.0 };
}

function bodyCupcake(chassis, bodyMat, accentMat, accent) {
  const wrap = new THREE.Mesh(new THREE.CylinderGeometry(1.15, 0.9, 0.9, 20, 1, true), bodyMat);
  wrap.material.side = THREE.DoubleSide;
  wrap.scale.z = 1.35; wrap.position.y = 0.75;
  chassis.add(wrap);
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
  frost2.rotation.x = Math.PI / 2; frost2.position.set(0, 1.45, 0.75);
  frost2.scale.set(0.6, 0.6, 0.8);
  chassis.add(frost2);
  return { driverY: 0.6, driverZ: 0.0, topY: 2.05 };
}

function bodyCookie(chassis, bodyMat, accentMat) {
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
  return { driverY: 0.85, driverZ: 0.2, topY: 2.15 };
}

function bodyIcecream(chassis, bodyMat, accentMat) {
  const base = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.9, 3.2), bodyMat);
  base.position.set(0, 0.9, 0.1);
  chassis.add(base);
  const hood = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.9), bodyMat);
  hood.position.set(0, 0.7, -1.75);
  chassis.add(hood);
  const awning = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.12, 1.2), accentMat);
  awning.position.set(0, 1.45, 0.9);
  chassis.add(awning);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(1.92, 0.4, 1.0), mat('#2a2a44', { shininess: 140 }));
  glass.position.set(0, 1.05, 0.8);
  chassis.add(glass);
  // the giant cone on the roof
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.45, 1.1, 14), mat('#e0a35c'));
  cone.rotation.x = Math.PI; cone.position.set(0, 2.0, 0.9);
  const scoop = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 10), accentMat);
  scoop.position.set(0, 2.75, 0.9);
  const cherry = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 6), mat('#e8143c'));
  cherry.position.set(0, 3.32, 0.9);
  chassis.add(cone, scoop, cherry);
  return { driverY: 0.75, driverZ: -0.85, topY: 1.95 };
}

function bodyDonut(chassis, bodyMat, accentMat) {
  const dough = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.48, 14, 28), mat('#d9a066'));
  dough.rotation.x = Math.PI / 2; dough.scale.set(1, 1.3, 1); dough.position.y = 0.62;
  chassis.add(dough);
  const icing = new THREE.Mesh(new THREE.TorusGeometry(1.05, 0.42, 12, 28, Math.PI * 2), bodyMat);
  icing.rotation.x = Math.PI / 2; icing.scale.set(1, 1.3, 0.6); icing.position.y = 0.82;
  chassis.add(icing);
  for (let i = 0; i < 26; i++) {
    const a = (i / 26) * Math.PI * 2, r = 0.85 + (i % 3) * 0.18;
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.06, 0.06), i % 2 ? accentMat : mat('#ffffff'));
    sp.position.set(Math.cos(a) * r, 1.06, Math.sin(a) * r * 1.3);
    sp.rotation.y = a * 3;
    chassis.add(sp);
  }
  return { driverY: 0.35, driverZ: 0.0, topY: 1.85 };
}

function bodyGummy(chassis, bodyMat, accentMat) {
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.85, 1.4, 6, 14), bodyMat);
  body.rotation.x = Math.PI / 2; body.position.set(0, 0.85, 0.2);
  chassis.add(body);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.75, 16, 12), bodyMat);
  head.position.set(0, 1.25, -1.35);
  chassis.add(head);
  for (const s of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), bodyMat);
    ear.position.set(s * 0.5, 1.85, -1.4);
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 6), mat('#1b1b1b'));
    eye.position.set(s * 0.28, 1.4, -2.02);
    chassis.add(ear, eye);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.16, 8, 6), accentMat);
  nose.position.set(0, 1.15, -2.08);
  chassis.add(nose);
  return { driverY: 1.05, driverZ: 0.5, topY: 2.35 };
}

function bodyChoco(chassis, bodyMat, accentMat) {
  const choc = mat('#5a3324', { shininess: 60 });
  const bar = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.45, 3.4), choc);
  bar.position.y = 0.6;
  chassis.add(bar);
  for (let x = 0; x < 3; x++) for (let z = 0; z < 4; z++) {
    if (z === 2 && x === 1) continue; // seat gap
    const block = new THREE.Mesh(new THREE.BoxGeometry(0.52, 0.16, 0.7), choc);
    block.position.set(-0.6 + x * 0.6, 0.9, -1.25 + z * 0.8);
    chassis.add(block);
  }
  // paper wrapper on the back half
  const wrap = new THREE.Mesh(new THREE.BoxGeometry(1.86, 0.62, 1.3), bodyMat);
  wrap.position.set(0, 0.68, 1.15);
  chassis.add(wrap);
  const foil = new THREE.Mesh(new THREE.BoxGeometry(1.88, 0.1, 1.32), mat('#d8d8e8', { shininess: 160, specular: 0xffffff }));
  foil.position.set(0, 1.0, 1.15);
  chassis.add(foil);
  const label = new THREE.Mesh(new THREE.BoxGeometry(1.9, 0.25, 0.5), accentMat);
  label.position.set(0, 0.7, 1.15);
  chassis.add(label);
  return { driverY: 0.8, driverZ: 0.3, topY: 2.05 };
}

function bodyRocket(chassis, bodyMat, accentMat) {
  const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.75, 2.6, 18), bodyMat);
  tube.rotation.x = Math.PI / 2; tube.position.set(0, 0.85, 0.2);
  chassis.add(tube);
  const nose = new THREE.Mesh(new THREE.ConeGeometry(0.75, 1.2, 18), accentMat);
  nose.rotation.x = -Math.PI / 2; nose.position.set(0, 0.85, -1.7);
  chassis.add(nose);
  for (const z of [-0.6, 0.6]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.77, 0.07, 6, 18), accentMat);
    ring.position.set(0, 0.85, z);
    chassis.add(ring);
  }
  for (let i = 0; i < 3; i++) {
    const a = (i / 3) * Math.PI * 2 + Math.PI / 2;
    const fin = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.8, 0.8), accentMat);
    fin.position.set(Math.cos(a) * 0.9, 0.85 + Math.sin(a) * 0.9, 1.25);
    fin.rotation.z = a - Math.PI / 2;
    chassis.add(fin);
  }
  const nozzle = new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.6, 0.4, 14), mat('#888899', { shininess: 140 }));
  nozzle.rotation.x = Math.PI / 2; nozzle.position.set(0, 0.85, 1.65);
  chassis.add(nozzle);
  return { driverY: 1.1, driverZ: -0.2, topY: 2.4 };
}

const BODY_BUILDERS = { kart: bodyKart, cupcake: bodyCupcake, cookie: bodyCookie, icecream: bodyIcecream, donut: bodyDonut, gummy: bodyGummy, choco: bodyChoco, rocket: bodyRocket };

export function buildCar(cfg) {
  const { body = 'kart', wheels = 'donut', color = '#ff4f8b', accent = '#ffd23f', topper = 'none', pattern = 'none', finish = 'gloss' } = cfg;
  const root = new THREE.Group();
  const chassis = new THREE.Group(); // tilts/rolls, wheels stay on root
  root.add(chassis);
  const fin = FINISH_PARAMS[finish] || FINISH_PARAMS.gloss;
  const paint = pattern !== 'none' ? { color: '#ffffff', map: TX.patternTexture(pattern, color, accent) } : { color };
  const bodyMat = new THREE.MeshPhongMaterial({ ...paint, ...fin, emissive: finish === 'sparkle' ? color : '#000000' });
  if (body === 'gummy') { bodyMat.transparent = true; bodyMat.opacity = 0.88; }
  const accentMat = new THREE.MeshPhongMaterial({ color: accent, ...fin });

  const { driverY, driverZ, topY } = (BODY_BUILDERS[body] || bodyKart)(chassis, bodyMat, accentMat, accent);

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

  root.userData = { chassis, wheels: wheelObjs, front, shield, exhausts, spinner: top?.userData?.spin || null };
  return root;
}

export function makeGhost(model) {
  const ghostMat = new THREE.MeshBasicMaterial({ color: '#9fe8ff', transparent: true, opacity: 0.35, depthWrite: false });
  model.traverse(o => { if (o.isMesh) o.material = ghostMat; });
  model.userData.shield.visible = false;
  return model;
}
