// Cover layouts for Neon Coast Cover Studio.
// A layout is a list of panels in normalised coordinates (0..1 across the
// cover). Panels may be rotated for the tilted snapshot stack. The title
// band position is part of each layout so lettering never fights the art.

export const LAYOUTS = [
  {
    id: 'grid4',
    name: 'Grid Four',
    titleAt: 'top',
    panels: [
      { x: 0.02, y: 0.16, w: 0.47, h: 0.4, r: 0 },
      { x: 0.51, y: 0.16, w: 0.47, h: 0.4, r: 0 },
      { x: 0.02, y: 0.58, w: 0.47, h: 0.4, r: 0 },
      { x: 0.51, y: 0.58, w: 0.47, h: 0.4, r: 0 },
    ],
  },
  {
    id: 'duo',
    name: 'Duo Split',
    titleAt: 'middle',
    panels: [
      { x: 0.02, y: 0.03, w: 0.47, h: 0.94, r: 0 },
      { x: 0.51, y: 0.03, w: 0.47, h: 0.94, r: 0 },
    ],
  },
  {
    id: 'nine',
    name: 'Nine Grid',
    titleAt: 'top',
    panels: [
      { x: 0.02, y: 0.17, w: 0.31, h: 0.26, r: 0 },
      { x: 0.345, y: 0.17, w: 0.31, h: 0.26, r: 0 },
      { x: 0.67, y: 0.17, w: 0.31, h: 0.26, r: 0 },
      { x: 0.02, y: 0.45, w: 0.31, h: 0.26, r: 0 },
      { x: 0.345, y: 0.45, w: 0.31, h: 0.26, r: 0 },
      { x: 0.67, y: 0.45, w: 0.31, h: 0.26, r: 0 },
      { x: 0.02, y: 0.73, w: 0.31, h: 0.25, r: 0 },
      { x: 0.345, y: 0.73, w: 0.31, h: 0.25, r: 0 },
      { x: 0.67, y: 0.73, w: 0.31, h: 0.25, r: 0 },
    ],
  },
  {
    id: 'full',
    name: 'Full Bleed',
    titleAt: 'bottom',
    panels: [{ x: 0, y: 0, w: 1, h: 1, r: 0 }],
  },
  {
    id: 'tilted',
    name: 'Tilted Snapshots',
    titleAt: 'top',
    panels: [
      { x: 0.06, y: 0.2, w: 0.52, h: 0.52, r: -0.09 },
      { x: 0.44, y: 0.3, w: 0.52, h: 0.52, r: 0.07 },
      { x: 0.2, y: 0.52, w: 0.55, h: 0.44, r: -0.03 },
    ],
  },
  {
    id: 'banner3',
    name: 'Banner Trio',
    titleAt: 'top',
    panels: [
      { x: 0.02, y: 0.17, w: 0.96, h: 0.25, r: 0 },
      { x: 0.02, y: 0.44, w: 0.96, h: 0.25, r: 0 },
      { x: 0.02, y: 0.71, w: 0.96, h: 0.27, r: 0 },
    ],
  },
  {
    id: 'poster',
    name: 'Poster Hero',
    titleAt: 'top',
    panels: [
      { x: 0.02, y: 0.17, w: 0.96, h: 0.5, r: 0 },
      { x: 0.02, y: 0.69, w: 0.31, h: 0.29, r: 0 },
      { x: 0.345, y: 0.69, w: 0.31, h: 0.29, r: 0 },
      { x: 0.67, y: 0.69, w: 0.31, h: 0.29, r: 0 },
    ],
  },
];

export function layoutById(id) {
  return LAYOUTS.find((l) => l.id === id) || LAYOUTS[0];
}
