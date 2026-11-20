// Neon Coast Cover Studio — entry program for gta6-cover-art-01.
// Node 22, standard library only. The deliverable is the static web app in
// app/ (it runs offline in a desktop browser) plus the screenshots in
// screenshots/. This program copies both into the output directory and
// writes dossier.json there with the vendored make.fun library, exactly
// as the grader expects. Run it locally with:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
// Two runs write identical bytes: the copy is a plain recursive copy and
// buildDossier is deterministic for the same input tree.

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-app.ts';

const repoRoot = fileURLToPath(new URL('.', import.meta.url));
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(outputDir, { recursive: true });
cpSync(join(repoRoot, 'app'), join(outputDir, 'app'), { recursive: true });
mkdirSync(join(outputDir, 'screenshots'), { recursive: true });
const shotsDir = join(repoRoot, 'screenshots');
if (existsSync(shotsDir)) {
  cpSync(shotsDir, join(outputDir, 'screenshots'), { recursive: true });
}

// Gate caps from the kit: the dossier text cap shapes the bytes, the rest
// refuse an entry the sealed scorer would refuse anyway.
const dossier = buildDossier(outputDir, {
  text_max_bytes: 163840,
  screenshots: { max: 4, max_bytes: 262144 },
  app_max_files: 993,
  app_max_bytes: 50331648,
  app_path_max_bytes: 1000,
});
writeFileSync(join(outputDir, 'dossier.json'), dossier);
