// Procedural hand-drawn scenes for Neon Coast Cover Studio.
// Each scene paints a complete picture into a rectangle, so a scene can fill
// any cover panel at any size with no image file and no network request.

function skyGradient(ctx, x, y, w, h, stops) {
  const g = ctx.createLinearGradient(0, y, 0, y + h);
  for (const [at, color] of stops) g.addColorStop(at, color);
  ctx.fillStyle = g;
  ctx.fillRect(x, y, w, h);
}

function sunDisc(ctx, cx, cy, r, top, bottom) {
  const g = ctx.createLinearGradient(0, cy - r, 0, cy + r);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

function palmTree(ctx, px, py, s, lean, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = Math.max(2, s * 0.09);
  ctx.beginPath();
  ctx.moveTo(px, py);
  ctx.quadraticCurveTo(px + lean * s * 0.4, py - s * 0.6, px + lean * s, py - s);
  ctx.stroke();
  const tx = px + lean * s;
  const ty = py - s;
  for (let i = 0; i < 7; i++) {
    const a = Math.PI * (0.08 + i * 0.15);
    ctx.lineWidth = Math.max(1.5, s * 0.05);
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.quadraticCurveTo(
      tx + Math.cos(a) * s * 0.55,
      ty - Math.sin(a) * s * 0.4 - s * 0.08,
      tx + Math.cos(a) * s * 0.8,
      ty - Math.sin(a) * s * 0.28 + s * 0.16,
    );
    ctx.stroke();
  }
}

function buildingRow(ctx, x, y, w, h, base, lit, seed) {
  let bx = x;
  let n = 0;
  while (bx < x + w) {
    const bw = w * (0.08 + ((seed * (n + 3)) % 10) / 90);
    const bh = h * (0.35 + ((seed * (n + 7)) % 10) / 16);
    ctx.fillStyle = base;
    ctx.fillRect(bx, y + h - bh, bw, bh);
    ctx.fillStyle = lit;
    const cols = Math.max(1, Math.floor(bw / 14));
    const rows = Math.max(1, Math.floor(bh / 18));
    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows; r++) {
        if ((c * 7 + r * 13 + seed + n) % 3 !== 0) {
          ctx.fillRect(bx + 4 + c * 13, y + h - bh + 6 + r * 17, 5, 7);
        }
      }
    }
    bx += bw + 3;
    n++;
  }
}

function seaSparkle(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  for (let i = 0; i < 46; i++) {
    const sx = x + ((i * 53) % 97) / 97 * w;
    const sy = y + ((i * 29) % 89) / 89 * h;
    ctx.globalAlpha = 0.25 + ((i * 7) % 10) / 18;
    ctx.fillRect(sx, sy, 6 + (i % 4) * 5, 2);
  }
  ctx.globalAlpha = 1;
}

export function drawSunsetBay(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [[0, '#2b1055'], [0.45, '#ff5e7a'], [0.72, '#ffb347'], [1, '#ffe29a']]);
  sunDisc(ctx, x + w * 0.5, y + h * 0.62, Math.min(w, h) * 0.2, '#fff3b0', '#ff7b54');
  ctx.fillStyle = '#123a5e';
  ctx.fillRect(x, y + h * 0.68, w, h * 0.32);
  seaSparkle(ctx, x, y + h * 0.7, w, h * 0.28, '#ffd98a');
  ctx.fillStyle = '#0b2239';
  ctx.beginPath();
  ctx.moveTo(x, y + h);
  ctx.lineTo(x, y + h * 0.82);
  ctx.lineTo(x + w * 0.3, y + h * 0.9);
  ctx.lineTo(x + w * 0.34, y + h);
  ctx.closePath();
  ctx.fill();
  palmTree(ctx, x + w * 0.1, y + h * 0.92, h * 0.42, 1, '#081c30');
  palmTree(ctx, x + w * 0.92, y + h * 0.95, h * 0.5, -1, '#081c30');
}

export function drawNeonStreet(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [[0, '#070b2a'], [0.7, '#1b0f3a'], [1, '#2d1150']]);
  buildingRow(ctx, x, y + h * 0.08, w * 0.4, h * 0.6, '#272e66', '#37f4e4', 5);
  buildingRow(ctx, x + w * 0.62, y + h * 0.05, w * 0.38, h * 0.62, '#272e66', '#ff5ec4', 9);
  ctx.fillStyle = 'rgba(55,244,228,0.20)';
  ctx.fillRect(x + w * 0.06, y + h * 0.2, w * 0.2, h * 0.13);
  ctx.fillStyle = 'rgba(255,94,196,0.20)';
  ctx.fillRect(x + w * 0.72, y + h * 0.26, w * 0.2, h * 0.11);
  ctx.fillStyle = '#11142e';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.34, y + h);
  ctx.lineTo(x + w * 0.46, y + h * 0.42);
  ctx.lineTo(x + w * 0.6, y + h * 0.42);
  ctx.lineTo(x + w * 0.78, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#37f4e4';
  ctx.lineWidth = Math.max(2, h * 0.008);
  ctx.shadowColor = '#37f4e4';
  ctx.shadowBlur = 14;
  ctx.strokeRect(x + w * 0.06, y + h * 0.2, w * 0.2, h * 0.13);
  ctx.strokeStyle = '#ff5ec4';
  ctx.shadowColor = '#ff5ec4';
  ctx.strokeRect(x + w * 0.72, y + h * 0.26, w * 0.2, h * 0.11);
  ctx.shadowBlur = 0;
  ctx.fillStyle = 'rgba(80,220,255,0.20)';
  ctx.fillRect(x, y + h * 0.8, w, h * 0.2);
  seaSparkle(ctx, x, y + h * 0.82, w, h * 0.16, '#7ef0ff');
}

export function drawSkylineDusk(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [[0, '#1c2a6b'], [0.55, '#7a3b8f'], [0.82, '#ff8c5a'], [1, '#ffc46b']]);
  sunDisc(ctx, x + w * 0.78, y + h * 0.4, Math.min(w, h) * 0.13, '#ffe9a8', '#ff8c5a');
  buildingRow(ctx, x, y + h * 0.18, w, h * 0.64, '#141b3d', '#ffd98a', 3);
  buildingRow(ctx, x, y + h * 0.3, w, h * 0.62, '#0a0f26', '#9be7ff', 11);
  ctx.fillStyle = '#060a1c';
  ctx.fillRect(x, y + h * 0.9, w, h * 0.1);
  ctx.fillStyle = '#ff5ec4';
  ctx.fillRect(x, y + h * 0.9, w, 3);
}

export function drawYachtParty(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h * 0.62, [[0, '#8fe8ff'], [0.7, '#c9f7ff'], [1, '#ffe9c9']]);
  ctx.fillStyle = '#0e7fa8';
  ctx.fillRect(x, y + h * 0.6, w, h * 0.4);
  seaSparkle(ctx, x, y + h * 0.64, w, h * 0.32, '#bffcff');
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.16, y + h * 0.68);
  ctx.lineTo(x + w * 0.84, y + h * 0.68);
  ctx.lineTo(x + w * 0.74, y + h * 0.8);
  ctx.lineTo(x + w * 0.28, y + h * 0.8);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#f2f6ff';
  ctx.fillRect(x + w * 0.34, y + h * 0.56, w * 0.32, h * 0.12);
  ctx.fillStyle = '#123a5e';
  ctx.fillRect(x + w * 0.38, y + h * 0.6, w * 0.24, h * 0.045);
  ctx.strokeStyle = '#123a5e';
  ctx.lineWidth = Math.max(2, h * 0.008);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.56);
  ctx.lineTo(x + w * 0.5, y + h * 0.34);
  ctx.stroke();
  ctx.fillStyle = '#ff5e7a';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.34);
  ctx.lineTo(x + w * 0.66, y + h * 0.4);
  ctx.lineTo(x + w * 0.5, y + h * 0.45);
  ctx.closePath();
  ctx.fill();
  palmTree(ctx, x + w * 0.06, y + h * 0.62, h * 0.3, 1, '#0b5e46');
}

export function drawPalmBoulevard(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [[0, '#ffd98a'], [0.5, '#ff9e6b'], [0.8, '#ff6b9d'], [1, '#7a3b8f']]);
  sunDisc(ctx, x + w * 0.5, y + h * 0.52, Math.min(w, h) * 0.16, '#fff3b0', '#ff8c5a');
  ctx.fillStyle = '#3a2b4f';
  ctx.beginPath();
  ctx.moveTo(x + w * 0.3, y + h);
  ctx.lineTo(x + w * 0.46, y + h * 0.55);
  ctx.lineTo(x + w * 0.54, y + h * 0.55);
  ctx.lineTo(x + w * 0.7, y + h);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#ffe29a';
  ctx.lineWidth = Math.max(2, h * 0.007);
  ctx.setLineDash([h * 0.05, h * 0.045]);
  ctx.beginPath();
  ctx.moveTo(x + w * 0.5, y + h * 0.58);
  ctx.lineTo(x + w * 0.5, y + h);
  ctx.stroke();
  ctx.setLineDash([]);
  for (let i = 0; i < 3; i++) {
    palmTree(ctx, x + w * (0.1 + i * 0.06), y + h * (0.7 + i * 0.1), h * (0.16 + i * 0.05), 1, '#241536');
    palmTree(ctx, x + w * (0.9 - i * 0.06), y + h * (0.7 + i * 0.1), h * (0.16 + i * 0.05), -1, '#241536');
  }
  ctx.fillStyle = '#c2263f';
  ctx.fillRect(x + w * 0.42, y + h * 0.86, w * 0.16, h * 0.05);
  ctx.fillStyle = '#7d1226';
  ctx.fillRect(x + w * 0.45, y + h * 0.815, w * 0.1, h * 0.045);
}

export function drawRooftopDusk(ctx, x, y, w, h) {
  skyGradient(ctx, x, y, w, h, [[0, '#25124d'], [0.6, '#8f2d6e'], [1, '#ff7b54']]);
  buildingRow(ctx, x, y + h * 0.22, w, h * 0.5, '#160b31', '#ffb3d9', 7);
  ctx.fillStyle = '#0d0722';
  ctx.fillRect(x, y + h * 0.74, w, h * 0.26);
  ctx.fillStyle = '#1d1140';
  ctx.fillRect(x + w * 0.08, y + h * 0.66, w * 0.2, h * 0.09);
  ctx.fillRect(x + w * 0.68, y + h * 0.64, w * 0.24, h * 0.11);
  ctx.fillStyle = '#37f4e4';
  ctx.fillRect(x + w * 0.08, y + h * 0.66, w * 0.2, 3);
  ctx.fillRect(x + w * 0.68, y + h * 0.64, w * 0.24, 3);
  seaSparkle(ctx, x, y + h * 0.8, w, h * 0.16, '#ff9ecf');
}

export const SCENES = [
  { id: 'sunset', name: 'Sunset Bay', draw: drawSunsetBay },
  { id: 'neon', name: 'Neon Street', draw: drawNeonStreet },
  { id: 'skyline', name: 'Skyline Dusk', draw: drawSkylineDusk },
  { id: 'yacht', name: 'Yacht Party', draw: drawYachtParty },
  { id: 'boulevard', name: 'Palm Boulevard', draw: drawPalmBoulevard },
  { id: 'rooftop', name: 'Rooftop Dusk', draw: drawRooftopDusk },
];
