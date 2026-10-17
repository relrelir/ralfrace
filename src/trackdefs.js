// Track definitions built with a small "turtle" language.
// Heading 0 = -Z, positive angles turn right (clockwise when seen from above).
//
// Commands:
//   ['S', length, dy]            straight (dy = height change, eased)
//   ['T', degrees, radius, dy]   arc turn, banked automatically
//   ['L', radius, sideShift]     vertical loop-the-loop
//   ['boost'] ['jump'] ['items'] ['coins', x] ['coinsArc']   features placed at the current point

const DEG = Math.PI / 180;

function smooth(t) { return t * t * (3 - 2 * t); }

// Two straights marked with 'adj' get their lengths solved so the loop closes in X/Z.
export function buildPath(def) {
  const cmds = def.cmds.map(c => c.slice());
  const first = runTurtle(def, cmds);
  const adj = first.adjustable;
  if (adj.length >= 2) {
    const [a, b] = adj;
    const g = first.rawGap; // vector that still needs to be travelled
    // solve a.dir * da + b.dir * db = g  (2x2 in x/z)
    const det = a.dir[0] * b.dir[1] - a.dir[1] * b.dir[0];
    if (Math.abs(det) > 1e-6) {
      const da = (g[0] * b.dir[1] - g[1] * b.dir[0]) / det;
      const db = (a.dir[0] * g[1] - a.dir[1] * g[0]) / det;
      cmds[a.ci][1] += da;
      cmds[b.ci][1] += db;
    }
  }
  const res = runTurtle(def, cmds);
  res.cmds = cmds;
  return res;
}

function runTurtle(def, cmds) {
  let x = 0, y = 0, z = 0, h = (def.heading || 0) * DEG;
  const pts = [];
  const features = [];
  const push = (bank = 0) => pts.push([x, y, z, bank]);
  push();

  const adjustable = [];
  for (let ci = 0; ci < cmds.length; ci++) {
    const c = cmds[ci];
    const op = c[0];
    if (op === 'S') {
      const [, len, dy = 0, mark] = c;
      if (mark === 'adj') adjustable.push({ ci, dir: [Math.sin(h), -Math.cos(h)] });
      const n = Math.max(1, Math.round(len / 10));
      const y0 = y;
      const sx = Math.sin(h), sz = -Math.cos(h);
      const x0 = x, z0 = z;
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        x = x0 + sx * len * t; z = z0 + sz * len * t; y = y0 + dy * smooth(t);
        push();
      }
    } else if (op === 'T') {
      const [, deg, r, dy = 0, bankScale = 1] = c;
      const ang = deg * DEG;
      const arc = Math.abs(ang) * r;
      const n = Math.max(2, Math.round(arc / 8));
      const sgn = Math.sign(ang);
      // centre of the turn is to the right (sgn>0) or left of the car
      const cx = x + Math.cos(h) * r * sgn, cz = z + Math.sin(h) * r * sgn;
      const h0 = h, y0 = y;
      // bank grows with curvature, eases in and out
      const bankMax = Math.min(0.35, 9 / r) * sgn * bankScale;
      for (let i = 1; i <= n; i++) {
        const t = i / n;
        h = h0 + ang * t;
        x = cx - Math.cos(h) * r * sgn; z = cz - Math.sin(h) * r * sgn;
        y = y0 + dy * smooth(t);
        const bank = bankMax * Math.sin(Math.PI * t);
        push(bank);
      }
    } else if (op === 'L') {
      const [, r, shift = 16] = c;
      const n = 16;
      const fx = Math.sin(h), fz = -Math.cos(h);
      const rx = Math.cos(h), rz = Math.sin(h);
      const x0 = x, y0 = y, z0 = z;
      for (let i = 1; i <= n; i++) {
        const a = (i / n) * Math.PI * 2;
        const fwd = Math.sin(a) * r;
        const up = (1 - Math.cos(a)) * r;
        const side = shift * smooth(i / n);
        x = x0 + fx * fwd + rx * side;
        z = z0 + fz * fwd + rz * side;
        y = y0 + up;
        push();
      }
    } else {
      features.push({ type: op, arg: c[1], pos: [x, y, z], idx: pts.length - 1 });
    }
  }

  // close the loop: distribute the remaining gap over all points
  const last = pts[pts.length - 1];
  const gap = [pts[0][0] - last[0], pts[0][1] - last[1], pts[0][2] - last[2]];
  const rawGap = [gap[0], gap[2]];
  const n = pts.length - 1;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    pts[i][0] += gap[0] * t; pts[i][1] += gap[1] * t; pts[i][2] += gap[2] * t;
  }
  for (const f of features) {
    const t = f.idx / n;
    f.pos = [f.pos[0] + gap[0] * t, f.pos[1] + gap[1] * t, f.pos[2] + gap[2] * t];
  }
  pts.pop(); // last == first
  return { points: pts, features, gap: Math.hypot(...gap), rawGap, adjustable };
}

export const TRACKS = [
  {
    id: 'lollipop',
    name: 'שביל הסוכריות',
    desc: 'מסלול ראשון ונעים – מושלם להתחלה',
    cost: 0,
    width: 16,
    laps: 3,
    theme: { road: '#b98bd9', road2: '#a173c8', ground: '#8fe0a2', sky1: '#7fd3ff', sky2: '#ffd1f0', fog: '#ffe3f6', wall1: '#ffffff', wall2: '#ff4f8b' },
    cmds: [
      ['S', 60], ['coins', 0], ['S', 50], ['T', 90, 45], ['items'], ['S', 60, 0, 'adj'], ['T', -60, 40], ['T', 60, 40], ['boost'], ['S', 40],
      ['T', 90, 45], ['S', 40], ['coins', -4], ['S', 100, 0, 'adj'], ['T', 90, 50], ['items'], ['S', 40], ['T', 45, 35], ['coins', 3], ['T', -45, 35], ['S', 30], ['T', 90, 45], ['S', 30],
    ],
  },
  {
    id: 'choco',
    name: 'עמק השוקולד',
    desc: 'גבעות, קפיצה ונהר שוקולד',
    cost: 0,
    width: 15,
    laps: 3,
    theme: { road: '#c98a5a', road2: '#b6784a', ground: '#7a4a2b', sky1: '#ffb36b', sky2: '#ffe9c9', fog: '#ffe2c4', wall1: '#fff3d6', wall2: '#6b3a1f' },
    cmds: [
      ['S', 70, 0, 'adj'], ['coins', 0], ['S', 60, 9], ['T', 120, 42], ['items'], ['S', 50, -9], ['jump'], ['S', 70], ['T', 60, 32], ['coins', 0], ['T', -90, 36], ['T', 90, 32],
      ['S', 55, 7], ['T', 90, 42], ['S', 45, -7], ['boost'], ['S', 40, 0, 'adj'], ['items'], ['S', 30], ['T', 90, 48], ['coins', 3], ['S', 30],
    ],
  },
  {
    id: 'cake',
    name: 'הר העוגה',
    desc: 'שמונה ענקית עם גשר מעל העוגה',
    cost: 60,
    width: 15,
    laps: 3,
    heading: 45,
    theme: { road: '#f4a6c8', road2: '#ea8fb8', ground: '#fff0c9', sky1: '#9fd8ff', sky2: '#fff6d6', fog: '#fff4e6', wall1: '#ffffff', wall2: '#7bd3ff' },
    cmds: [
      ['coins', 0], ['S', 62, 11], ['T', 270, 62], ['items'], ['S', 62], ['boost'], ['S', 62, -11], ['coins', -3], ['T', -270, 62], ['items'], ['S', 62],
    ],
  },
  {
    id: 'marsh',
    name: 'לופ המרשמלו',
    desc: 'לופ ענק! צריך הרבה מהירות',
    cost: 120,
    width: 15,
    laps: 3,
    theme: { road: '#8fb7ff', road2: '#789fe8', ground: '#e6f3ff', sky1: '#6aa8ff', sky2: '#e9d9ff', fog: '#efe8ff', wall1: '#ffffff', wall2: '#ffb3d9' },
    cmds: [
      ['S', 50, 0, 'adj'], ['coins', 0], ['S', 40], ['boost'], ['S', 40], ['L', 16, 17], ['S', 50], ['T', 90, 45], ['items'], ['S', 60, 0, 'adj'], ['T', 90, 40], ['coins', 0],
      ['S', 40, 8], ['jump'], ['S', 50, -8], ['T', -70, 38], ['T', 70, 38], ['S', 30], ['T', 90, 40], ['items'], ['S', 90], ['T', 90, 45], ['S', 30],
    ],
  },
  {
    id: 'licorice',
    name: 'טורנדו הליקריץ',
    desc: 'המסלול הכי מטורף – לופ, קפיצות ושמונה',
    cost: 250,
    width: 14,
    laps: 3,
    theme: { road: '#5a4a7a', road2: '#4a3b68', ground: '#3b2f55', sky1: '#2a1b55', sky2: '#ff7ac8', fog: '#7a4f9a', wall1: '#ff3b3b', wall2: '#1b1b1b' },
    cmds: [
      ['S', 60, 0, 'adj'], ['coins', 0], ['S', 40], ['boost'], ['S', 40], ['L', 17, -17], ['S', 50], ['items'], ['T', 180, 42], ['S', 50, 10], ['coins', 0], ['jump'], ['S', 60, -10],
      ['T', -90, 30], ['T', 90, 30], ['boost'], ['S', 70], ['items'], ['T', 120, 45], ['S', 40, 0, 'adj'], ['T', 60, 40], ['coins', -3], ['S', 30],
    ],
  },
];
