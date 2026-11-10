// Exports Excalidraw docs to SVG with the official @excalidraw/excalidraw exportToSvg,
// run inside headless Edge/Chrome. Dev-time tool only: it loads Excalidraw 0.18.0 from esm.sh
// (needs internet); nothing from it ships with the site. The docs are inlined in a temp page.
// Result is what excalidraw.com shows. Returns null when no browser/network is available.
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const VERSION = '0.18.0';
const BROWSERS = [
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

const FONT = 'Helvetica, Arial, sans-serif';

function tidy(svg) {
  return svg
    .replace(/<!-- svg-source:excalidraw -->/, '')
    .replace(/<metadata><\/metadata>/, '')
    .replace(/<defs><style class="style-fonts">\s*<\/style><\/defs>/, '')
    .replace(/ version="1\.1"/, '')
    .replace(/(<svg[^>]*?) width="\d+" height="\d+"/, '$1')
    .replace(/font-family="[^"]*"/g, `font-family="${FONT}"`)
    .replace(/font-size="(\d+)px"/g, 'font-size="$1"')
    .replace(/ style="white-space: pre;"/g, ' xml:space="preserve"')
    .replace(/ direction="ltr" dominant-baseline="alphabetic"/g, '')
    .trim() + '\n';
}

export function exportOfficial(docs) {
  const browser = BROWSERS.find((p) => existsSync(p));
  if (!browser) return null;
  const dir = mkdtempSync(join(tmpdir(), 'excalidraw-export-'));
  const page = join(dir, 'export.html');
  const payload = Buffer.from(JSON.stringify(docs)).toString('base64');
  writeFileSync(page, `<!doctype html><meta charset="utf-8"><pre id="out">pending</pre>
<script type="module">
const docs = JSON.parse(new TextDecoder().decode(Uint8Array.from(atob("${payload}"), (c) => c.charCodeAt(0))));
const out = document.getElementById('out');
try {
  window.EXCALIDRAW_ASSET_PATH = 'https://esm.sh/@excalidraw/excalidraw@${VERSION}/dist/prod/';
  const { exportToSvg } = await import('https://esm.sh/@excalidraw/excalidraw@${VERSION}?deps=react@18.3.1,react-dom@18.3.1');
  const res = {};
  for (const [key, doc] of Object.entries(docs)) {
    const svg = await exportToSvg({ elements: doc.elements, appState: { ...doc.appState, exportBackground: true, exportWithDarkMode: false }, files: {}, exportPadding: 0 });
    res[key] = svg.outerHTML;
  }
  out.textContent = 'OK:' + btoa(unescape(encodeURIComponent(JSON.stringify(res))));
} catch (e) { out.textContent = 'ERR:' + e; }
</script>`);
  try {
    const dom = execFileSync(browser, [
      '--headless=new', `--user-data-dir=${join(dir, 'profile')}`,
      '--virtual-time-budget=60000', '--dump-dom', pathToFileURL(page).href,
    ], { encoding: 'utf8', timeout: 120000, maxBuffer: 64 * 1024 * 1024, stdio: ['ignore', 'pipe', 'ignore'] });
    const m = dom.match(/<pre id="out">OK:([A-Za-z0-9+/=]+)<\/pre>/);
    if (!m) return null;
    const res = JSON.parse(Buffer.from(m[1], 'base64').toString('utf8'));
    return Object.fromEntries(Object.entries(res).map(([k, v]) => [k, tidy(v)]));
  } catch {
    return null;
  } finally {
    try { rmSync(dir, { recursive: true, force: true, maxRetries: 5, retryDelay: 400 }); } catch { /* browser may still hold the profile; temp dir is cleaned by the OS */ }
  }
}
