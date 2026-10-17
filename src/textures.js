import * as THREE from 'three';

// All textures are drawn procedurally on canvases – no image assets needed.

function canvas(w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  return [c, c.getContext('2d')];
}

function tex(c, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  if (repeat) { t.wrapS = t.wrapT = THREE.RepeatWrapping; }
  t.anisotropy = 4;
  return t;
}

const SPRINKLE_COLORS = ['#ff4f8b', '#ffe14f', '#4fd6ff', '#7cff6b', '#ffffff', '#b06bff', '#ff8c3b'];

export function roadTexture(base, base2) {
  const [c, g] = canvas(256, 256);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  // soft bands
  g.fillStyle = base2;
  g.fillRect(0, 0, 256, 128);
  // sprinkles
  for (let i = 0; i < 140; i++) {
    g.save();
    g.translate(Math.random() * 256, Math.random() * 256);
    g.rotate(Math.random() * Math.PI);
    g.fillStyle = SPRINKLE_COLORS[i % SPRINKLE_COLORS.length];
    g.globalAlpha = 0.55;
    g.fillRect(-4, -1.2, 8, 2.4);
    g.restore();
  }
  // centre dashes
  g.globalAlpha = 0.85;
  g.fillStyle = '#ffffff';
  g.fillRect(124, 20, 8, 90);
  g.fillRect(124, 148, 8, 90);
  // edge lines
  g.fillRect(6, 0, 6, 256);
  g.fillRect(244, 0, 6, 256);
  return tex(c);
}

export function stripeTexture(a, b) {
  const [c, g] = canvas(128, 32);
  g.fillStyle = a; g.fillRect(0, 0, 128, 32);
  g.fillStyle = b;
  for (let i = -2; i < 6; i++) {
    g.beginPath();
    g.moveTo(i * 32, 32); g.lineTo(i * 32 + 16, 32); g.lineTo(i * 32 + 32, 0); g.lineTo(i * 32 + 16, 0);
    g.fill();
  }
  return tex(c);
}

export function checkerTexture() {
  const [c, g] = canvas(128, 32);
  for (let y = 0; y < 2; y++) for (let x = 0; x < 8; x++) {
    g.fillStyle = (x + y) % 2 ? '#111' : '#fff';
    g.fillRect(x * 16, y * 16, 16, 16);
  }
  return tex(c);
}

export function boostTexture() {
  const [c, g] = canvas(128, 128);
  const grd = g.createLinearGradient(0, 0, 0, 128);
  grd.addColorStop(0, '#ffe14f'); grd.addColorStop(1, '#ff6a00');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  g.fillStyle = '#ffffff';
  for (let i = 0; i < 2; i++) {
    const y = 20 + i * 56;
    g.beginPath();
    g.moveTo(24, y + 40); g.lineTo(64, y); g.lineTo(104, y + 40); g.lineTo(84, y + 40); g.lineTo(64, y + 20); g.lineTo(44, y + 40);
    g.fill();
  }
  return tex(c, false);
}

export function swirlTexture(a, b) {
  const [c, g] = canvas(128, 128);
  g.fillStyle = a; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = b; g.lineWidth = 10;
  g.beginPath();
  for (let t = 0; t < 30; t += 0.05) {
    const r = t * 2.1;
    const x = 64 + Math.cos(t) * r, y = 64 + Math.sin(t) * r;
    if (t === 0) g.moveTo(x, y); else g.lineTo(x, y);
  }
  g.stroke();
  return tex(c, false);
}

export function itemBoxTexture() {
  const [c, g] = canvas(128, 128);
  const grd = g.createLinearGradient(0, 0, 128, 128);
  grd.addColorStop(0, '#ff7ad9'); grd.addColorStop(0.5, '#ffd36b'); grd.addColorStop(1, '#6bd8ff');
  g.fillStyle = grd; g.fillRect(0, 0, 128, 128);
  g.strokeStyle = '#fff'; g.lineWidth = 8; g.strokeRect(4, 4, 120, 120);
  g.fillStyle = '#fff';
  g.font = 'bold 90px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('?', 64, 70);
  return tex(c, false);
}

export function coinTexture() {
  const [c, g] = canvas(64, 64);
  g.fillStyle = '#ffcf33'; g.beginPath(); g.arc(32, 32, 30, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#ffe98a'; g.beginPath(); g.arc(32, 32, 22, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#e09a00'; g.font = 'bold 30px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText('★', 32, 34);
  return tex(c, false);
}

export function groundTexture(base) {
  const [c, g] = canvas(256, 256);
  g.fillStyle = base; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 400; i++) {
    g.globalAlpha = 0.08 + Math.random() * 0.1;
    g.fillStyle = Math.random() < 0.5 ? '#ffffff' : '#000000';
    const r = 2 + Math.random() * 10;
    g.beginPath(); g.arc(Math.random() * 256, Math.random() * 256, r, 0, Math.PI * 2); g.fill();
  }
  g.globalAlpha = 0.5;
  for (let i = 0; i < 60; i++) {
    g.save();
    g.translate(Math.random() * 256, Math.random() * 256);
    g.rotate(Math.random() * Math.PI);
    g.fillStyle = SPRINKLE_COLORS[i % SPRINKLE_COLORS.length];
    g.fillRect(-4, -1.5, 8, 3);
    g.restore();
  }
  return tex(c);
}

export function skyTexture(top, bottom) {
  const [c, g] = canvas(4, 256);
  const grd = g.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, top); grd.addColorStop(0.65, bottom); grd.addColorStop(1, bottom);
  g.fillStyle = grd; g.fillRect(0, 0, 4, 256);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function cookieTexture() {
  const [c, g] = canvas(64, 64);
  g.fillStyle = '#d9a066'; g.fillRect(0, 0, 64, 64);
  g.fillStyle = '#4a2a14';
  for (let i = 0; i < 9; i++) { g.beginPath(); g.arc(Math.random() * 64, Math.random() * 64, 3 + Math.random() * 2, 0, Math.PI * 2); g.fill(); }
  return tex(c, false);
}

export function sparkTexture() {
  const [c, g] = canvas(64, 64);
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  grd.addColorStop(0, 'rgba(255,255,255,1)');
  grd.addColorStop(0.35, 'rgba(255,255,255,0.8)');
  grd.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return tex(c, false);
}

export function shadowTexture() {
  const [c, g] = canvas(64, 64);
  const grd = g.createRadialGradient(32, 32, 4, 32, 32, 32);
  grd.addColorStop(0, 'rgba(0,0,0,0.55)');
  grd.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = grd; g.fillRect(0, 0, 64, 64);
  return tex(c, false);
}

export function bannerTexture(text) {
  const [c, g] = canvas(512, 96);
  g.fillStyle = '#ff4f8b'; g.fillRect(0, 0, 512, 96);
  g.fillStyle = '#fff';
  g.font = 'bold 56px Rubik, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text, 256, 52);
  return tex(c, false);
}
