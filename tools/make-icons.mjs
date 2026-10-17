// Renders tools/icon.html into PNG icons (needs Playwright + Chromium).
import { chromium } from '@playwright/test';
import { fileURLToPath } from 'node:url';
const root = new URL('..', import.meta.url);
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM || undefined });
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
await page.goto(new URL('tools/icon.html', root).href);
for (const [size, out] of [[1024, 'assets/icon-only.png'], [512, 'public/icons/icon-512.png'], [192, 'public/icons/icon-192.png']]) {
  await page.setViewportSize({ width: 1024, height: 1024 });
  const buf = await page.locator('#c').screenshot();
  if (size === 1024) { await import('node:fs').then(fs => fs.writeFileSync(fileURLToPath(new URL(out, root)), buf)); continue; }
  const p2 = await browser.newPage({ viewport: { width: size, height: size } });
  await p2.setContent(`<body style="margin:0"><img src="data:image/png;base64,${buf.toString('base64')}" width="${size}" height="${size}"></body>`);
  await p2.screenshot({ path: fileURLToPath(new URL(out, root)) });
  await p2.close();
}
await browser.close();
