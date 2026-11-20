// Colour grades for Neon Coast Cover Studio.
// A grade is a canvas filter applied while a panel is drawn, plus an
// optional wash colour blended over it and an optional extra effect
// (scanlines for VHS, poster bands for the ink look).

export const GRADES = [
  { id: 'original', name: 'Original', filter: 'none', wash: null, fx: null },
  { id: 'neon-sunset', name: 'Neon Sunset', filter: 'saturate(1.45) contrast(1.12) hue-rotate(-8deg)', wash: 'rgba(255,94,122,0.16)', fx: null },
  { id: 'neon-night', name: 'Neon Night', filter: 'saturate(1.5) contrast(1.2) brightness(0.92) hue-rotate(12deg)', wash: 'rgba(55,60,220,0.20)', fx: null },
  { id: 'golden', name: 'Golden Hour', filter: 'saturate(1.3) contrast(1.05) sepia(0.35) brightness(1.06)', wash: 'rgba(255,170,60,0.18)', fx: null },
  { id: 'miami-pastel', name: 'Miami Pastel', filter: 'saturate(1.15) brightness(1.12) contrast(0.92) hue-rotate(-6deg)', wash: 'rgba(255,160,220,0.14)', fx: null },
  { id: 'ink-poster', name: 'Ink Poster', filter: 'saturate(1.7) contrast(1.45) brightness(1.02)', wash: 'rgba(20,10,60,0.10)', fx: 'poster' },
  { id: 'vhs', name: 'VHS Retro', filter: 'saturate(1.25) contrast(1.08) sepia(0.18) hue-rotate(6deg)', wash: 'rgba(60,255,220,0.08)', fx: 'scanlines' },
];

export function gradeById(id) {
  return GRADES.find((g) => g.id === id) || GRADES[0];
}
