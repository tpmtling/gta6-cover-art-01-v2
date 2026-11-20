// Screenshot driver for Neon Coast Cover Studio.
// Starts serve.ts, then uses the system Chromium in headless mode to load
// each scene listed in shots.json (the app renders the scene itself via
// its ?shot= mode) and saves the capture as a JPEG in screenshots/ sized
// to the gate limits. Run: node tools/shoot.mjs
import { execFileSync, spawn } from 'node:child_process';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const shots = JSON.parse(readFileSync(join(root, 'shots.json'), 'utf8'));
const port = 8199;

const server = spawn('node', ['serve.ts'], {
  cwd: root,
  env: { ...process.env, PORT: String(port) },
  stdio: 'ignore',
});

function wait(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

try {
  await wait(900);
  for (const shot of shots) {
    const png = join(root, 'screenshots', shot.name.replace(/\.jpg$/, '.png'));
    const url = `http://localhost:${port}/${shot.query}`;
    execFileSync(process.env.CHROME_BIN || `${process.env.HOME}/.cache/puppeteer/chrome/linux-157.0.8103.78/chrome-linux64/chrome`, [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      `--window-size=${shot.w},${shot.h}`,
      '--virtual-time-budget=9000',
      `--screenshot=${png}`,
      url,
    ], { stdio: 'inherit' });
    execFileSync('python3', ['-c', `
from PIL import Image
import sys
im = Image.open(sys.argv[1]).convert('RGB')
im.save(sys.argv[2], quality=84)
`, png, join(root, 'screenshots', shot.name)], { stdio: 'inherit' });
    execFileSync('rm', [png]);
    console.log('shot', shot.name);
  }
} finally {
  server.kill();
}
