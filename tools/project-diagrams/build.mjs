// Usage: node tools/project-diagrams/build.mjs [id...] [--own]   (or: npm run pictures)
//        node tools/project-diagrams/build.mjs --folder-map [--own]   (or: npm run folder-map)
// The folder map for START-HERE.md goes to docs/ instead (docs/folder-map.excalidraw and .svg).
// Writes tools/project-diagrams/sources/<id>.<lang>.excalidraw (editable) and public/project-pictures/<id>.<lang>.svg (exported).
// SVG comes from the official Excalidraw exporter (headless browser + internet);
// --own, or no browser/network, falls back to the offline converter in svg.mjs.
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { exportOfficial } from './export-official.mjs';
import { validate } from './lib.mjs';
import { toSvg } from './svg.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, '..', '..');
const srcDir = join(here, 'sources');
const args = process.argv.slice(2);
const folderMap = args.includes('--folder-map');
const svgDir = folderMap ? join(root, 'docs') : join(root, 'public', 'project-pictures');
const outSrcDir = folderMap ? svgDir : srcDir;
mkdirSync(outSrcDir, { recursive: true });
mkdirSync(svgDir, { recursive: true });

// Every .mjs file here except the helpers is a diagram.
const helpers = new Set(['lib.mjs', 'svg.mjs', 'build.mjs', 'export-official.mjs', 'folder-map.mjs']);
const all = readdirSync(here).filter((f) => f.endsWith('.mjs') && !helpers.has(f)).map((f) => f.replace('.mjs', ''));
const forceOwn = args.includes('--own');
const ids = args.filter((a) => !a.startsWith('--'));
const todo = folderMap ? ['folder-map'] : ids.length ? ids : all;

const jobs = []; // { name, doc, size }
for (const id of todo) {
  if (!folderMap && !all.includes(id)) throw new Error(`unknown diagram "${id}" (have: ${all.join(', ')})`);
  const mod = await import(`./${id}.mjs`);
  for (const lang of Object.keys(mod.strings)) {
    const doc = mod.build(mod.strings[lang]);
    const errors = validate(doc);
    if (errors.length) throw new Error(`${id}.${lang}: ${errors.join('; ')}`);
    jobs.push({ name: folderMap ? id : `${id}.${lang}`, doc, size: mod.size });
  }
}

let official = null;
if (!forceOwn) {
  official = exportOfficial(Object.fromEntries(jobs.map((j) => [j.name, j.doc])));
  if (!official) console.warn('Official exporter unavailable (no browser or no internet): using the offline converter.');
}

for (const { name, doc, size } of jobs) {
  writeFileSync(join(outSrcDir, `${name}.excalidraw`), JSON.stringify(doc, null, 2) + '\n');
  const svg = official ? official[name] : toSvg(doc, size);
  writeFileSync(join(svgDir, `${name}.svg`), svg);
  console.log(`${name}: ${doc.elements.length} elements, svg ${(svg.length / 1024).toFixed(1)} kB (${official ? 'official' : 'own'})`);
}
