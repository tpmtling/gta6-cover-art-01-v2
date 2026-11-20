// Editor for Neon Coast Cover Studio.
// Wires the controls to the cover renderer: photo upload (files stay on
// this machine), per-panel source picking, drag to reposition, a zoom
// slider, layout and grade pickers, undo/redo history and PNG export in
// the four post sizes. A ?shot= URL renders a fixed scene instead, which
// is how the entry's screenshots were taken by the app itself.

import { drawCover, defaultPanelSources, exportCoverPNG, EXPORT_SIZES } from './cover.js';
import { LAYOUTS, layoutById } from './layouts.js';
import { GRADES } from './grades.js';
import { SCENES } from './scenes.js';

const params = new URLSearchParams(location.search);
const canvas = document.getElementById('stage');
const ctx = canvas.getContext('2d');

const assets = {};
const photoIds = [];

function loadImage(key, url) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => { assets[key] = img; resolve(img); };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

const state = {
  title: 'Neon Coast',
  subtitle: 'vice nights',
  ribbon: 'Neon Coast Cover Studio — make yours',
  layout: 'poster',
  grade: 'neon-sunset',
  halftone: true,
  stars: 5,
  badge: 'VI',
  panels: [],
  selected: 0,
  showSelection: true,
};

function resetPanels() {
  state.panels = defaultPanelSources(layoutById(state.layout));
  if (state.selected >= state.panels.length) state.selected = 0;
}
resetPanels();

const undoStack = [];
const redoStack = [];
function snapshot() {
  return JSON.stringify({ ...state, showSelection: true });
}
function pushHistory() {
  undoStack.push(snapshot());
  if (undoStack.length > 60) undoStack.shift();
  redoStack.length = 0;
}
function restore(json) {
  const s = JSON.parse(json);
  Object.assign(state, s);
  syncControls();
  render();
}
function undo() {
  if (!undoStack.length) return;
  redoStack.push(snapshot());
  restore(undoStack.pop());
}
function redo() {
  if (!redoStack.length) return;
  undoStack.push(snapshot());
  restore(redoStack.pop());
}

function currentSize() {
  const sel = document.getElementById('sizePick');
  return EXPORT_SIZES.find((s) => s.id === sel.value) || EXPORT_SIZES[0];
}

function render() {
  const coverShot = shotMode === 'cover';
  const size = coverShot ? shotSize : currentSize();
  const maxW = coverShot ? innerWidth : 620;
  const scale = Math.min(maxW / size.w, (coverShot ? innerHeight : 620) / size.h);
  canvas.width = Math.round(size.w * scale);
  canvas.height = Math.round(size.h * scale);
  const off = document.createElement('canvas');
  off.width = size.w;
  off.height = size.h;
  drawCover(off.getContext('2d'), size.w, size.h, state, assets);
  ctx.drawImage(off, 0, 0, canvas.width, canvas.height);
}

function buildButtons(containerId, items, current, onPick) {
  const box = document.getElementById(containerId);
  box.innerHTML = '';
  for (const item of items) {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = item.name;
    if (item.id === current) b.classList.add('on');
    b.addEventListener('click', () => { pushHistory(); onPick(item.id); syncControls(); render(); });
    box.appendChild(b);
  }
}

function sourceOptions() {
  const opts = [];
  photoIds.forEach((id, i) => opts.push({ id, name: `Photo ${i + 1}` }));
  opts.push({ id: 'sample:pier', name: 'Sample: Pier' });
  opts.push({ id: 'sample:boulevard', name: 'Sample: Boulevard' });
  for (const s of SCENES) opts.push({ id: `scene:${s.id}`, name: `Scene: ${s.name}` });
  return opts;
}

function syncControls() {
  document.getElementById('titleInput').value = state.title;
  document.getElementById('subtitleInput').value = state.subtitle;
  document.getElementById('ribbonInput').value = state.ribbon;
  document.getElementById('halftoneToggle').checked = state.halftone;
  document.getElementById('starsRange').value = state.stars;
  document.getElementById('badgeInput').value = state.badge;
  buildButtons('layoutPick', LAYOUTS, state.layout, (id) => { state.layout = id; resetPanels(); });
  buildButtons('gradePick', GRADES, state.grade, (id) => { state.grade = id; });
  const panelBox = document.getElementById('panelPick');
  panelBox.innerHTML = '';
  state.panels.forEach((slot, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.textContent = `Panel ${i + 1}`;
    if (i === state.selected) b.classList.add('on');
    b.addEventListener('click', () => { state.selected = i; syncControls(); render(); });
    panelBox.appendChild(b);
  });
  const src = document.getElementById('sourcePick');
  src.innerHTML = '';
  for (const o of sourceOptions()) {
    const opt = document.createElement('option');
    opt.value = o.id;
    opt.textContent = o.name;
    src.appendChild(opt);
  }
  const slot = state.panels[state.selected];
  if (slot) {
    src.value = slot.src;
    document.getElementById('zoomRange').value = slot.zoom;
  }
}

function bindControls() {
  const onText = (id, key) => {
    document.getElementById(id).addEventListener('input', (e) => {
      state[key] = e.target.value;
      render();
    });
    document.getElementById(id).addEventListener('change', () => pushHistory());
  };
  onText('titleInput', 'title');
  onText('subtitleInput', 'subtitle');
  onText('ribbonInput', 'ribbon');
  onText('badgeInput', 'badge');
  document.getElementById('halftoneToggle').addEventListener('change', (e) => { pushHistory(); state.halftone = e.target.checked; render(); });
  document.getElementById('starsRange').addEventListener('input', (e) => { state.stars = Number(e.target.value); render(); });
  document.getElementById('sizePick').addEventListener('change', render);
  document.getElementById('sourcePick').addEventListener('change', (e) => {
    pushHistory();
    state.panels[state.selected].src = e.target.value;
    render();
  });
  document.getElementById('zoomRange').addEventListener('input', (e) => {
    const slot = state.panels[state.selected];
    if (slot) { slot.zoom = Number(e.target.value); render(); }
  });
  document.getElementById('undoBtn').addEventListener('click', undo);
  document.getElementById('redoBtn').addEventListener('click', redo);
  document.getElementById('photoInput').addEventListener('change', async (e) => {
    pushHistory();
    for (const file of e.target.files) {
      if (photoIds.length >= 9) break;
      const url = URL.createObjectURL(file);
      const id = `photo${photoIds.length}`;
      await loadImage(id, url);
      photoIds.push(id);
    }
    // Fill panels with the new photos in order.
    state.panels.forEach((slot, i) => { if (photoIds[i]) slot.src = photoIds[i]; });
    syncControls();
    render();
  });
  document.getElementById('exportBtn').addEventListener('click', () => download(currentSize()));
  document.getElementById('exportAllBtn').addEventListener('click', () => {
    for (const s of EXPORT_SIZES) download(s);
  });
}

function download(size) {
  const c = exportCoverPNG(state, assets, size);
  const a = document.createElement('a');
  a.download = `neon-coast-${size.id}.png`;
  a.href = c.toDataURL('image/png');
  a.click();
}

// Drag on the preview repositions the selected panel's picture.
let dragging = null;
canvas.addEventListener('pointerdown', (e) => {
  dragging = { x: e.clientX, y: e.clientY, moved: false };
  canvas.setPointerCapture(e.pointerId);
});
canvas.addEventListener('pointermove', (e) => {
  if (!dragging) return;
  const slot = state.panels[state.selected];
  if (!slot) return;
  const dx = (e.clientX - dragging.x) / canvas.width;
  const dy = (e.clientY - dragging.y) / canvas.height;
  if (Math.abs(dx) + Math.abs(dy) > 0.002) {
    if (!dragging.moved) pushHistory();
    dragging.moved = true;
    slot.dx = Math.max(-0.6, Math.min(0.6, slot.dx + dx));
    slot.dy = Math.max(-0.6, Math.min(0.6, slot.dy + dy));
    dragging.x = e.clientX;
    dragging.y = e.clientY;
    render();
  }
});
canvas.addEventListener('pointerup', (e) => {
  if (dragging && !dragging.moved) {
    // A plain click selects the panel under the pointer.
    const rect = canvas.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    const layout = layoutById(state.layout);
    layout.panels.forEach((p, i) => {
      if (nx >= p.x && nx <= p.x + p.w && ny >= p.y && ny <= p.y + p.h) state.selected = i;
    });
    syncControls();
    render();
  }
  dragging = null;
});

// ---- Screenshot scenes -------------------------------------------------
const shotMode = params.get('shot');
let shotSize = EXPORT_SIZES[0];

function applyShotParams() {
  if (params.get('layout')) { state.layout = params.get('layout'); resetPanels(); }
  if (params.get('grade')) state.grade = params.get('grade');
  if (params.get('title')) state.title = params.get('title');
  if (params.get('subtitle')) state.subtitle = params.get('subtitle');
  if (params.get('ribbon')) state.ribbon = params.get('ribbon');
  if (params.get('halftone')) state.halftone = params.get('halftone') === '1';
  if (params.get('stars')) state.stars = Number(params.get('stars'));
  if (params.get('panels')) {
    params.get('panels').split(',').forEach((src, i) => {
      if (state.panels[i]) state.panels[i].src = src;
    });
  }
  const sizeId = params.get('size') || 'square';
  shotSize = EXPORT_SIZES.find((s) => s.id === sizeId) || EXPORT_SIZES[0];
  state.showSelection = shotMode === 'editor';
}

async function boot() {
  await Promise.all([
    loadImage('sample:pier', 'samples/pier.jpg'),
    loadImage('sample:boulevard', 'samples/boulevard.jpg'),
  ]);
  // The default first panel uses the pier sample until a photo arrives.
  if (state.panels[0]) state.panels[0].src = 'sample:pier';
  if (state.panels[2]) state.panels[2].src = 'sample:boulevard';
  applyShotParams();
  if (shotMode) document.body.classList.add(shotMode === 'cover' ? 'shot-cover' : 'shot-editor');
  bindControls();
  syncControls();
  render();
  window.addEventListener('resize', render);
  if (shotMode) {
    // Re-render once the viewport has settled so shot covers fill the frame.
    setTimeout(() => {
      render();
      window.__shotReady = true;
    }, 450);
  } else {
    requestAnimationFrame(() => { window.__shotReady = true; });
  }
}

boot();
