// Browser smoke test: opens the built game, drives races on autopilot and saves screenshots.
//   CHROMIUM=/path/to/chrome node tools/smoke.mjs http://localhost:4173/ ./shots
// env: STEPS=race,time,split  TRACK=lollipop  AT=6,20  FINISH=1  GARAGE=1  W=1280 H=720
import { chromium } from '@playwright/test';

const url = process.argv[2] || 'http://localhost:4173/';
const out = process.argv[3] || '.';
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: +(process.env.W || 1280), height: +(process.env.H || 720) } });
const errors = [];
page.on('pageerror', e => errors.push('pageerror: ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
await page.goto(url);
await page.waitForTimeout(1500);
await page.screenshot({ path: `${out}/1-menu.png` });

const steps = (process.env.STEPS || 'race').split(',');
const track = process.env.TRACK || 'lollipop';
const shotsAt = (process.env.AT || '6,20').split(',').map(Number);
for (const mode of steps) {
  await page.evaluate(() => { window.game.save.ownedTracks = window.TRACK_IDS || ['lollipop', 'choco', 'cake', 'marsh', 'licorice', 'glacier', 'gummy', 'clouds', 'factory', 'volcano']; window.game.showMain(); });
  await page.click(`[data-act=pick][data-arg=${mode}]`);
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${out}/2-tracks-${mode}.png` });
  await page.click(`[data-act=track][data-arg=${track}]`);
  await page.evaluate(() => { window.game.autopilot = true; });
  let t = 0;
  for (const at of shotsAt) {
    await page.evaluate(s => window.game.simulate(s), at - t);
    t = at;
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${out}/3-${mode}-${track}-${at}.png` });
  }
  const st = await page.evaluate(() => {
    const r = window.game.race;
    return r && r.racers.map(x => ({ n: x.name, d: +x.kart.dist.toFixed(0), v: +x.kart.v.toFixed(1), x: +x.kart.x.toFixed(1), item: x.kart.item, coins: x.kart.coins }));
  });
  console.log(mode, JSON.stringify(st));
  if (process.env.FINISH) {
    await page.evaluate(() => window.game.simulate(200));
    await page.waitForTimeout(500);
    await page.screenshot({ path: `${out}/4-results-${mode}.png` });
    console.log('results screen:', await page.evaluate(() => document.querySelector('.results')?.innerText.replace(/\n+/g, ' | ')));
  } else {
    await page.evaluate(() => { window.game.leaveRace(); });
  }
  await page.evaluate(() => { window.game.autopilot = false; });
}
if (process.env.GARAGE) {
  await page.evaluate(() => window.game.showGarage(0));
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${out}/6-garage.png` });
}
console.log('ERRORS:', errors.length ? errors.join('\n') : 'none');
await browser.close();
