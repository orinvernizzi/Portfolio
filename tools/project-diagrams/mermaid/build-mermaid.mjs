// Renders tools/project-diagrams/mermaid/<id>.<lang>.mmd to public/project-pictures/<id>.<lang>.svg,
// and tools/project-diagrams/mermaid/docs/<name>.mmd to docs/<name>.svg (pictures for the guides, one language).
// Usage: node tools/project-diagrams/mermaid/build-mermaid.mjs [id...]   (no ids = every .mmd file; a docs id looks like docs/folder-map)
// Dev-time only: loads Mermaid (pinned) from a CDN inside headless Edge/Chrome, so it needs internet.
// Without a browser or internet it prints a message and leaves the existing SVGs untouched.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const MERMAID_VERSION = '11.4.1';
// Widest viewBox (SVG units) a diagram may have. The picture shows at ~320 px on a phone; with the
// 18 px font, 520 units gives 320/520*18 = 11.1 px text, our minimum readable size.
const MAX_WIDTH = 520;
// Pictures in docs/ are read on a computer, so they may be wider: 900 units shown at about 800 px keeps the text near 16 px.
const MAX_WIDTH_DOCS = 900;
// Narrower drawings are centred in a canvas this wide, so every card shows the text at a similar size.
const MIN_WIDTH = 440;
const MEASURE_FONT = "'Courier New'"; // widest common monospace: Mermaid sizes the boxes with it
// Extra room built into every box, so labels still fit when a viewer's monospace font is wider than Consolas
// (checked with Courier New + 0.06em letter-spacing). The spacing itself is not kept in the final SVG.
const MEASURE_SPACING = '0.06em';
const DISPLAY_FONT = "Consolas, Menlo, 'DejaVu Sans Mono', 'Courier New', monospace"; // what viewers get
const BG = '#0c0c0c'; // card surface
// Empty space under the drawing: the project card fades the bottom edge of the picture into the card colour.
const BOTTOM_PAD = 56;
const MAX_BYTES = 40 * 1024;
const BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', '..', '..', 'public', 'project-pictures');
const ids = process.argv.slice(2);
const docsDir = join(here, 'docs');
const isDoc = (name) => name.startsWith('docs/');
const files = [
  ...readdirSync(here).filter((f) => /\.(en|es)\.mmd$/.test(f)).map((f) => ({ name: f.replace(/\.mmd$/, ''), path: join(here, f) })),
  ...(existsSync(docsDir) ? readdirSync(docsDir).filter((f) => f.endsWith('.mmd')).map((f) => ({ name: 'docs/' + f.replace(/\.mmd$/, ''), path: join(docsDir, f) })) : []),
]
  .filter((f) => !ids.length || ids.includes(f.name.replace(/\.(en|es)$/, '')))
  .sort((a, b) => isDoc(a.name) - isDoc(b.name) || a.name.localeCompare(b.name)); // docs last: keeps the ids Mermaid puts inside the SVGs stable
if (!files.length) {
  console.error(`No .mmd files found${ids.length ? ` for: ${ids.join(', ')}` : ''}.`);
  process.exit(1);
}

const config = {
  startOnLoad: false,
  securityLevel: 'strict',
  theme: 'base',
  htmlLabels: false, // v11 reads it at top level; false = plain SVG <text>, no foreignObject
  fontFamily: MEASURE_FONT,
  themeCSS: `text, tspan { letter-spacing: ${MEASURE_SPACING}; }`, // boxes are sized for this; removed again in tidy()
  themeVariables: {
    fontFamily: MEASURE_FONT, fontSize: '18px', background: BG,
    primaryColor: '#2d2d2d', primaryBorderColor: '#4a4a4a', primaryTextColor: '#ededed',
    lineColor: '#8a8a8a', edgeLabelBackground: BG, textColor: '#ededed',
    secondaryColor: '#2d2d2d', tertiaryColor: '#2d2d2d',
    clusterBkg: '#151515', clusterBorder: '#4a4a4a', titleColor: '#b4b4b4', // boxed lists (subgraphs)
  },
  flowchart: { curve: 'basis', htmlLabels: false, padding: 6, nodeSpacing: 12, rankSpacing: 20, wrappingWidth: 400, useMaxWidth: false },
};

function renderInBrowser(sources) {
  const browser = BROWSERS.find((p) => existsSync(p));
  if (!browser) return { error: 'no Edge/Chrome found' };
  const dir = mkdtempSync(join(tmpdir(), 'mermaid-build-'));
  const page = join(dir, 'render.html');
  const payload = Buffer.from(JSON.stringify({ sources, config })).toString('base64');
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><pre id="out">pending</pre>
<script type="module">
const { sources, config } = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob("${payload}"), (c) => c.charCodeAt(0))));
const out = document.getElementById('out');
try {
  const mermaid = (await import('https://cdn.jsdelivr.net/npm/mermaid@${MERMAID_VERSION}/dist/mermaid.esm.min.mjs')).default;
  mermaid.initialize(config);
  const res = {};
  for (const [name, text] of Object.entries(sources)) {
    res[name] = (await mermaid.render('mmd-' + name.replace(/[^a-z0-9]/gi, '-'), text)).svg;
  }
  out.textContent = 'OK:' + btoa(unescape(encodeURIComponent(JSON.stringify(res))));
} catch (e) { out.textContent = 'ERR:' + e; }
</script>`);
  try {
    const dom = execFileSync(browser, [
      '--headless=new', `--user-data-dir=${join(dir, 'profile')}`,
      '--virtual-time-budget=60000', '--dump-dom', pathToFileURL(page).href,
    ], { encoding: 'utf8', timeout: 120000, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    const ok = dom.match(/<pre id="out">OK:([A-Za-z0-9+/=]+)<\/pre>/);
    if (ok) return { svgs: JSON.parse(Buffer.from(ok[1], 'base64').toString('utf8')) };
    const err = dom.match(/<pre id="out">(ERR:[^<]*)<\/pre>/);
    return { error: err ? err[1] : 'the page did not finish (no internet?)' };
  } catch (e) {
    return { error: `browser failed: ${e.message.split('\n')[0]}` };
  } finally {
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 }); } catch { /* temp dir is cleaned by the OS */ }
  }
}

// Natural size of Mermaid's output.
function sizeOf(name, raw) {
  const vb = raw.match(/viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/);
  if (!vb) throw new Error(`${name}: rendered SVG has no viewBox`);
  const w = Math.ceil(+vb[3]);
  const h = Math.ceil(+vb[4]);
  const max = isDoc(name) ? MAX_WIDTH_DOCS : MAX_WIDTH;
  if (w > max) throw new Error(`${name}: viewBox is ${w} wide, over MAX_WIDTH${isDoc(name) ? '_DOCS' : ''} ${max}. Make the diagram narrower (at most 2 nodes per row).`);
  return { w, h };
}

// Make the SVG safe and light for <img>: opaque background, plain sizes, the display font stack.
// W x H is the shared size of the id's languages (the shorter one is centred) so the <img> ratio is the same in EN and ES.
function tidy(name, raw, W, H, pad) {
  const { w, h } = sizeOf(name, raw);
  const drawH = H - pad;
  const x = -Math.round((W - w) / 2);
  const y = -Math.round((drawH - h) / 2);
  if (raw.includes('&nbsp;')) throw new Error(`${name}: contains &nbsp;, which is not valid in an SVG file`);
  if (raw.includes('<foreignObject')) throw new Error(`${name}: foreignObject found (htmlLabels must be false)`);
  const font = (s) => s.replace(/(["'])?Courier New["']?/g, DISPLAY_FONT);
  let svg = raw
    .replace(/<svg[^>]*>/, (tag) => `<svg xmlns="http://www.w3.org/2000/svg" id="${tag.match(/ id="([^"]+)"/)[1]}" viewBox="${x} ${y} ${W} ${H}" width="${W}" height="${H}" role="img">`) // keep the id: the CSS selectors use it`
    .replace(/(<svg[^>]*>)/, `$1<rect x="${x}" y="${y}" width="${W}" height="${H}" fill="${BG}"/>`)
    .replace(/\s*<!--[\s\S]*?-->/g, '');
  svg = svg.replace(new RegExp(`[^{}]*\\{\\s*letter-spacing:\\s*${MEASURE_SPACING};?\\s*\\}`, 'g'), '');
  if (svg.includes('letter-spacing')) throw new Error(`${name}: measuring letter-spacing was not removed`);
  svg = font(svg).replace(/font-family="[^"]*"/g, `font-family="${DISPLAY_FONT.replace(/'/g, '&apos;')}"`);
  if (/<script|href="http|url\(["']?https?:/i.test(svg)) throw new Error(`${name}: external reference or script in SVG`);
  const bytes = Buffer.byteLength(svg);
  if (bytes > MAX_BYTES) throw new Error(`${name}: ${bytes} bytes, over ${MAX_BYTES}`);
  return { svg: `${svg.trim()}\n`, w: W, h: H, bytes };
}

const sources = Object.fromEntries(files.map((f) => [f.name, readFileSync(f.path, 'utf8').replace(/\r\n/g, '\n')]));
const { svgs, error } = renderInBrowser(sources);
if (!svgs) {
  console.warn(`Mermaid render unavailable (${error}). Existing SVGs left untouched.`);
  process.exit(0);
}
// MERMAID_RAW_DIR=<dir> also saves Mermaid's untouched output there, for debugging.
if (process.env.MERMAID_RAW_DIR) {
  mkdirSync(process.env.MERMAID_RAW_DIR, { recursive: true });
  for (const [name, raw] of Object.entries(svgs)) writeFileSync(join(process.env.MERMAID_RAW_DIR, `${name}.raw.svg`), raw);
}
const sizes = Object.fromEntries(Object.entries(svgs).map(([name, raw]) => [name, sizeOf(name, raw)]));
const shared = {}; // id -> biggest size over its languages
for (const [name, s] of Object.entries(sizes)) {
  const id = name.replace(/\.(en|es)$/, '');
  shared[id] = { w: Math.max(shared[id]?.w ?? (isDoc(id) ? 0 : MIN_WIDTH), s.w), h: Math.max(shared[id]?.h ?? 0, s.h) };
}
const done = Object.entries(svgs).map(([name, raw]) => {
  const { w, h } = shared[name.replace(/\.(en|es)$/, '')];
  const pad = isDoc(name) ? 0 : BOTTOM_PAD;
  return [name, tidy(name, raw, w, h + pad, pad)]; // throws before anything is written
});
mkdirSync(outDir, { recursive: true });
for (const [name, r] of done) {
  writeFileSync(isDoc(name) ? join(here, '..', '..', '..', `${name}.svg`) : join(outDir, `${name}.svg`), r.svg);
  console.log(`${name}.svg  viewBox ${r.w}x${r.h}  ${(r.bytes / 1024).toFixed(1)} kB`);
}

// src/content/pictureSizes.json: { "<id>": [width, height] }, read by Projects.tsx so the <img> reserves the right space.
// Entries of ids that were not rebuilt in this run are kept.
const sizesFile = join(here, '..', '..', '..', 'src', 'content', 'pictureSizes.json');
const sizeMap = existsSync(sizesFile) ? JSON.parse(readFileSync(sizesFile, 'utf8')) : {};
for (const [id, s] of Object.entries(shared)) if (!isDoc(id)) sizeMap[id] = [s.w, s.h + BOTTOM_PAD];
const sorted = Object.fromEntries(Object.entries(sizeMap).sort(([a], [b]) => a.localeCompare(b)));
const rows = Object.entries(sorted).map(([id, s]) => `  "${id}": [${s.join(', ')}]`);
writeFileSync(sizesFile, `{\n${rows.join(',\n')}\n}\n`);
console.log(`pictureSizes.json updated (${Object.keys(sorted).length} ids)`);
