// Geometry sanity checks for every track: closure, adjustable lengths, min radius, overlaps, banking.
import { TRACKS, buildPath } from '../src/trackdefs.js';
import { TrackData } from '../src/trackdata.js';

let bad = 0;
for (const def of TRACKS) {
  const p = buildPath(def);
  const adj = p.cmds.filter(c => c[3] === 'adj').map(c => +c[1].toFixed(0));
  const t = new TrackData(def);
  const N = t.N;
  const d = (i, j) => Math.hypot(t.pos[i * 3] - t.pos[j * 3], t.pos[i * 3 + 1] - t.pos[j * 3 + 1], t.pos[i * 3 + 2] - t.pos[j * 3 + 2]);
  let maxc = 0;
  for (let i = 0; i < N; i++) if (t.up[i * 3 + 1] > 0.8) maxc = Math.max(maxc, Math.abs(t.curv[i]));
  let minD = 1e9, where = null;
  for (let i = 0; i < N; i += 2) for (let j = i + 40; j < N && j < N - 40 + i; j += 2) { const dd = d(i, j); if (dd < minD) { minD = dd; where = [i, j]; } }
  let tilted = 0;
  for (let i = 0; i < N; i++) if (t.up[i * 3 + 1] > 0.3 && Math.abs(t.right[i * 3 + 1]) > 0.4) tilted++;
  const problems = [];
  if (p.gap > 0.01) problems.push('gap');
  if (adj.some(a => a < 10)) problems.push('adj<10');
  if (1 / maxc < 22) problems.push('radius');
  if (minD < 10.5) problems.push('overlap');
  if (problems.length) bad++;
  console.log(`${def.id.padEnd(9)} L=${t.length} adj=${adj.join(',')} minR=${(1 / maxc).toFixed(1)} closest=${minD.toFixed(1)}@${where} tilted=${tilted} ${problems.length ? '❌ ' + problems.join(',') : '✓'}`);
}
process.exit(bad ? 1 : 0);
