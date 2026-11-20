// Cover renderer for Neon Coast Cover Studio.
// drawCover paints a complete cover onto any 2D context at any size, from
// the plain state object the editor keeps. The same function drives the
// live preview, the exported PNGs and the ?shot= screenshot scenes, so a
// screenshot is always a cover the app itself drew.

import { SCENES } from './scenes.js';
import { layoutById } from './layouts.js';
import { gradeById } from './grades.js';

let grainCanvas = null;

function makeGrain() {
  const c = document.createElement('canvas');
  c.width = 180;
  c.height = 180;
  const g = c.getContext('2d');
  const img = g.createImageData(180, 180);
  let seed = 1234567;
  for (let i = 0; i < img.data.length; i += 4) {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    const v = 110 + (seed % 120);
    img.data[i] = v;
    img.data[i + 1] = v;
    img.data[i + 2] = v;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  return c;
}

export function defaultPanelSources(layout) {
  const order = ['photo0', 'scene:sunset', 'sample:pier', 'scene:neon', 'sample:boulevard', 'scene:yacht', 'scene:skyline', 'scene:boulevard', 'scene:rooftop'];
  return layout.panels.map((_, i) => ({ src: order[i % order.length], dx: 0, dy: 0, zoom: 1 }));
}

function drawPanelImage(ctx, panel, slot, assets, grade) {
  const { x, y, w, h } = panel;
  ctx.save();
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.clip();
  ctx.filter = grade.filter === 'none' ? 'none' : grade.filter;
  if (slot.src.startsWith('scene:')) {
    const scene = SCENES.find((s) => s.id === slot.src.slice(6)) || SCENES[0];
    const zw = w * slot.zoom;
    const zh = h * slot.zoom;
    ctx.save();
    ctx.translate(x + (w - zw) / 2 + slot.dx * w, y + (h - zh) / 2 + slot.dy * h);
    ctx.beginPath();
    ctx.rect(0, 0, zw, zh);
    ctx.clip();
    scene.draw(ctx, 0, 0, zw, zh);
    ctx.restore();
  } else {
    const img = assets[slot.src];
    if (img) {
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight) * slot.zoom;
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      ctx.drawImage(img, x + (w - dw) / 2 + slot.dx * w, y + (h - dh) / 2 + slot.dy * h, dw, dh);
    } else {
      const scene = SCENES[0];
      scene.draw(ctx, x, y, w, h);
    }
  }
  ctx.filter = 'none';
  if (grade.wash) {
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = grade.wash;
    ctx.fillRect(x, y, w, h);
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = grade.wash;
    ctx.globalAlpha = 0.35;
    ctx.fillRect(x, y, w, h);
    ctx.globalAlpha = 1;
  }
  if (grade.fx === 'scanlines') {
    ctx.fillStyle = 'rgba(0,0,0,0.16)';
    for (let sy = y; sy < y + h; sy += 5) ctx.fillRect(x, sy, w, 2);
  }
  if (grade.fx === 'poster') {
    ctx.fillStyle = 'rgba(10,6,40,0.12)';
    ctx.fillRect(x, y + h * 0.66, w, h * 0.34);
    ctx.fillStyle = 'rgba(255,240,190,0.10)';
    ctx.fillRect(x, y, w, h * 0.2);
  }
  ctx.restore();
}

function halftoneDots(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  const step = Math.max(9, w / 42);
  for (let row = 0; row * step < h; row++) {
    for (let col = 0; col * step < w; col++) {
      const r = (step * 0.3) * (1 - (row * step) / h) + 0.6;
      ctx.beginPath();
      ctx.arc(x + col * step + (row % 2 ? step / 2 : 0), y + row * step, r, 0, Math.PI * 2);
      ctx.fill();
    }
  }
}

function drawStars(ctx, cx, cy, size, count) {
  ctx.save();
  ctx.fillStyle = '#ffd23e';
  ctx.strokeStyle = '#7a4b00';
  ctx.lineWidth = size * 0.08;
  for (let i = 0; i < 5; i++) {
    const sx = cx + i * size * 1.25;
    ctx.globalAlpha = i < count ? 1 : 0.28;
    ctx.beginPath();
    for (let p = 0; p < 10; p++) {
      const a = -Math.PI / 2 + p * Math.PI / 5;
      const r = p % 2 ? size * 0.45 : size;
      const px = sx + Math.cos(a) * r;
      const py = cy + Math.sin(a) * r;
      if (p === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }
  ctx.restore();
}

function drawBadge(ctx, cx, cy, r, text) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fillStyle = '#ff2e88';
  ctx.fill();
  ctx.lineWidth = r * 0.1;
  ctx.strokeStyle = '#ffffff';
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.78, 0, Math.PI * 2);
  ctx.strokeStyle = 'rgba(255,255,255,0.75)';
  ctx.lineWidth = r * 0.05;
  ctx.stroke();
  ctx.fillStyle = '#ffffff';
  ctx.font = `900 ${r * 0.42}px "Arial Black", Impact, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, cx, cy + r * 0.02);
  ctx.restore();
}

function drawTitleBlock(ctx, W, H, state, layout) {
  const title = (state.title || 'NEON COAST').toUpperCase();
  const at = layout.titleAt;
  let bandY = H * 0.015;
  if (at === 'bottom') bandY = H * 0.78;
  if (at === 'middle') bandY = H * 0.44;
  const fontSize = Math.min(W * 0.115, H * 0.13);
  ctx.save();
  if (state.halftone) {
    ctx.globalAlpha = 0.5;
    halftoneDots(ctx, 0, bandY, W, fontSize * 1.5, 'rgba(255,46,136,0.55)');
    ctx.globalAlpha = 1;
  }
  ctx.font = `900 ${fontSize}px "Arial Black", Impact, "Franklin Gothic Heavy", sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  const grad = ctx.createLinearGradient(0, bandY, 0, bandY + fontSize * 1.15);
  grad.addColorStop(0, '#fff7ae');
  grad.addColorStop(0.45, '#ffb347');
  grad.addColorStop(0.75, '#ff5e7a');
  grad.addColorStop(1, '#ff2e88');
  ctx.lineWidth = fontSize * 0.16;
  ctx.strokeStyle = '#160a2e';
  ctx.lineJoin = 'round';
  ctx.strokeText(title, W / 2, bandY);
  ctx.fillStyle = grad;
  ctx.fillText(title, W / 2, bandY);
  if (state.subtitle) {
    ctx.font = `italic 700 ${fontSize * 0.42}px "Segoe Script", "Brush Script MT", cursive`;
    ctx.shadowColor = '#37f4e4';
    ctx.shadowBlur = fontSize * 0.22;
    ctx.lineWidth = fontSize * 0.07;
    ctx.strokeStyle = 'rgba(10,4,32,0.85)';
    ctx.strokeText(state.subtitle, W / 2, bandY + fontSize * 1.12);
    ctx.fillStyle = '#37f4e4';
    ctx.fillText(state.subtitle, W / 2, bandY + fontSize * 1.12);
    ctx.shadowBlur = 0;
  }
  ctx.restore();
  return bandY;
}

export function drawCover(ctx, W, H, state, assets) {
  const layout = layoutById(state.layout);
  const grade = gradeById(state.grade);
  ctx.save();
  ctx.fillStyle = '#0b0620';
  ctx.fillRect(0, 0, W, H);
  layout.panels.forEach((p, i) => {
    const slot = state.panels[i] || { src: 'scene:sunset', dx: 0, dy: 0, zoom: 1 };
    const px = p.x * W;
    const py = p.y * H;
    const pw = p.w * W;
    const ph = p.h * H;
    ctx.save();
    if (p.r) {
      ctx.translate(px + pw / 2, py + ph / 2);
      ctx.rotate(p.r);
      ctx.translate(-pw / 2, -ph / 2);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-pw * 0.03, -ph * 0.03, pw * 1.06, ph * 1.1);
      drawPanelImage(ctx, { x: 0, y: 0, w: pw, h: ph }, slot, assets, grade);
      ctx.strokeStyle = '#160a2e';
      ctx.lineWidth = Math.max(2, W * 0.004);
      ctx.strokeRect(0, 0, pw, ph);
    } else {
      drawPanelImage(ctx, { x: px, y: py, w: pw, h: ph }, slot, assets, grade);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = Math.max(2, W * 0.006);
      ctx.strokeRect(px, py, pw, ph);
      ctx.strokeStyle = '#160a2e';
      ctx.lineWidth = Math.max(1, W * 0.002);
      ctx.strokeRect(px - W * 0.004, py - W * 0.004, pw + W * 0.008, ph + W * 0.008);
    }
    ctx.restore();
    if (state.selected === i && state.showSelection) {
      ctx.strokeStyle = '#37f4e4';
      ctx.lineWidth = Math.max(3, W * 0.008);
      ctx.strokeRect(px + 3, py + 3, pw - 6, ph - 6);
    }
  });
  drawTitleBlock(ctx, W, H, state, layout);
  // Bottom ribbon with caption line.
  ctx.save();
  ctx.fillStyle = '#160a2e';
  ctx.fillRect(0, H * 0.945, W, H * 0.055);
  ctx.fillStyle = '#ff2e88';
  ctx.fillRect(0, H * 0.945, W, Math.max(2, H * 0.006));
  ctx.font = `700 ${H * 0.026}px "Arial Narrow", Arial, sans-serif`;
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText((state.ribbon || 'NEON COAST COVER STUDIO').toUpperCase(), W / 2, H * 0.973);
  ctx.restore();
  drawStars(ctx, W * 0.035, H * 0.05, H * 0.02, state.stars ?? 5);
  drawBadge(ctx, W * 0.93, H * 0.075, Math.min(W, H) * 0.052, state.badge || 'VI');
  // Vignette and film grain finish every cover.
  const vg = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.42, W / 2, H / 2, Math.max(W, H) * 0.78);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(5,2,18,0.42)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, 0, W, H);
  if (!grainCanvas) grainCanvas = makeGrain();
  ctx.globalAlpha = 0.07;
  const pat = ctx.createPattern(grainCanvas, 'repeat');
  ctx.fillStyle = pat;
  ctx.fillRect(0, 0, W, H);
  ctx.globalAlpha = 1;
  ctx.restore();
}

export const EXPORT_SIZES = [
  { id: 'square', name: 'Square 1080×1080', w: 1080, h: 1080 },
  { id: 'portrait', name: 'Portrait 1080×1350', w: 1080, h: 1350 },
  { id: 'wide', name: 'Wide 1920×1080', w: 1920, h: 1080 },
  { id: 'story', name: 'Story 1080×1920', w: 1080, h: 1920 },
];

export function exportCoverPNG(state, assets, size) {
  const c = document.createElement('canvas');
  c.width = size.w;
  c.height = size.h;
  const clean = { ...state, showSelection: false };
  drawCover(c.getContext('2d'), size.w, size.h, clean, assets);
  return c;
}
