// Headless check: AI karts drive every track; reports lap times, wall hits and stuck karts.
// Used to tune tracks and medal times.  Run: npm run sim
import { TRACKS } from '../src/trackdefs.js';
import { TrackData } from '../src/trackdata.js';
import { Kart, BODIES } from '../src/physics.js';
import { AIDriver } from '../src/ai.js';

const dt = 1 / 60;
for (const def of TRACKS) {
  const track = new TrackData(def);
  const out = [];
  for (const [bodyId, body] of Object.entries(BODIES)) {
    for (const assist of [0.6, 0.0]) {
      const k = new Kart(track, body, { dist: 0, x: 0, assist });
      k.frozen = false;
      const ai = new AIDriver(k, track, 0.5);
      let t = 0, bumps = 0, minV = 1e9, laps = [], lastLap = 0;
      while (t < 200 && laps.length < 2) {
        ai.update(dt, [k], []);
        k.step(dt);
        for (const e of k.events) if (e.type === 'bump') bumps++;
        k.events.length = 0;
        if (t > 3) minV = Math.min(minV, k.v);
        t += dt;
        if (k.dist >= (laps.length + 1) * track.length) { laps.push(t - lastLap); lastLap = t; }
      }
      out.push(`${bodyId}/a${assist}: lap ${laps.map(l => l.toFixed(1)).join(' ')} bumps ${bumps} minV ${minV.toFixed(1)}`);
    }
  }
  console.log(`${def.id} (L=${track.length}m)\n  ` + out.join('\n  '));
}
