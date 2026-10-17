// Store images for game portals: screenshots of the menu and of races in English.
//   npm run build && npx vite preview --port 4173   (in another terminal)
//   CHROMIUM=/path/to/chrome node tools/make-covers.mjs http://localhost:4173/ covers
import { chromium } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const url = process.argv[2] || 'http://localhost:4173/';
const out = process.argv[3] || 'covers';
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined, args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });

async function shoot(size, name, track, seconds) {
  const page = await browser.newPage({ viewport: size, locale: 'en-US' });
  await page.goto(url);
  await page.waitForTimeout(1500);
  if (track) {
    await page.evaluate(id => {
      const g = window.game;
      g.save.car = { body: 'rocket', wheels: 'gumball', color: '#ff4f8b', accent: '#ffd23f', topper: 'crown', pattern: 'stripes', finish: 'metal', trail: 'rainbow' };
      g.mode = 'race';
      g.startRace(id);
      g.autopilot = true;
    }, track);
    await page.waitForTimeout(500);
    await page.evaluate(s => window.game.simulate(s), seconds);
    await page.evaluate(() => { document.getElementById('hud').style.display = 'none'; document.querySelector('.pausebtn')?.remove(); });
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}/${name}.png` });
  await page.close();
}

await shoot({ width: 1920, height: 1080 }, 'menu-1920x1080', null);
await shoot({ width: 1920, height: 1080 }, 'race-marsh-1920x1080', 'marsh', 6.8);
await shoot({ width: 1920, height: 1080 }, 'race-clouds-1920x1080', 'clouds', 9);
await shoot({ width: 1920, height: 1080 }, 'race-volcano-1920x1080', 'volcano', 20);
await shoot({ width: 1080, height: 1080 }, 'square-1080', 'lollipop', 8);
await browser.close();
console.log('saved to', out);
