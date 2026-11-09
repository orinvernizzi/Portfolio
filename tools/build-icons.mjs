// Builds public/icons/*.svg (local, no CDN) from simple-icons + devicon, plus hand-made badges.
// Run: node tools/build-icons.mjs
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import * as si from 'simple-icons'

const OUT = 'public/icons'
mkdirSync(OUT, { recursive: true })

// slug -> simple-icons export name, optional colour override (otherwise brand hex, lightened if too dark)
const FROM_SI = {
  python: ['siPython'],
  pandas: ['siPandas', 'e8d8ff'],
  numpy: ['siNumpy', '4dabcf'],
  scipy: ['siScipy'],
  duckdb: ['siDuckdb'],
  claude: ['siClaude'],
  cursor: ['siCursor', 'ffffff'],
  javascript: ['siJavascript'],
  typescript: ['siTypescript', '3d8bd9'],
  react: ['siReact'],
  html5: ['siHtml5'],
  php: ['siPhp', '8e94cc'],
  c: ['siC'],
  git: ['siGit'],
  github: ['siGithub', 'ffffff'],
  unity: ['siUnity', 'ffffff'],
  vercel: ['siVercel', 'ffffff'],
  supabase: ['siSupabase'],
  tailwind: ['siTailwindcss'],
  css: ['siCss'],
}
// Not in simple-icons under a usable name: copy the devicon "original" file.
const FROM_DEVICON = { java: 'java', cplusplus: 'cplusplus' }

const lum = (hex) => {
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
  const f = (v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4)
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b)
}
const lighten = (hex) => {
  let h = hex
  for (let i = 0; i < 12 && lum(h) < 0.12; i++) {
    h = [0, 2, 4].map((k) => Math.round(parseInt(h.slice(k, k + 2), 16) * 0.8 + 255 * 0.2).toString(16).padStart(2, '0')).join('')
  }
  return h
}

const write = (slug, svg) => writeFileSync(`${OUT}/${slug}.svg`, svg)
const missing = []

for (const [slug, [exp, override]] of Object.entries(FROM_SI)) {
  const icon = si[exp]
  if (!icon) { missing.push(`${slug} (${exp})`); continue }
  const fill = override ?? lighten(icon.hex)
  write(slug, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#${fill}"><path d="${icon.path}"/></svg>\n`)
}

for (const [slug, dir] of Object.entries(FROM_DEVICON)) {
  write(slug, readFileSync(`node_modules/devicon/icons/${dir}/${dir}-original.svg`, 'utf8'))
}

// Custom badges: 48x48 rounded square, same visual weight as the brand logos.
const badge = (bg, inner) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="4 4 40 40"><rect x="4" y="4" width="40" height="40" rx="9" fill="${bg}"/>${inner}</svg>\n`
const text = (t, size = 17, fill = '#fff') =>
  `<text x="24" y="24" text-anchor="middle" dominant-baseline="central" font-family="Inter,Segoe UI,Arial,sans-serif" font-weight="700" font-size="${size}" fill="${fill}">${t}</text>`
const stroke = (d, color = '#fff') =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"/>`

write('pep9', badge('#2f3b52', text('Pep9', 15)))
write('sql', badge('#336791', text('SQL', 16)))
write('dbt', badge('#ff694b', text('dbt', 17)))
write('excel', badge('#217346', stroke('M16 15l16 18M32 15L16 33')))
write('jsonschema', badge('#3a3f4b', stroke('M20 14c-3 0-4 1-4 4v3c0 2-1 3-3 3 2 0 3 1 3 3v3c0 3 1 4 4 4M28 14c3 0 4 1 4 4v3c0 2 1 3 3 3-2 0-3 1-3 3v3c0 3-1 4-4 4')))
write('athena', badge('#8c4fff', `<circle cx="22" cy="22" r="8" fill="none" stroke="#fff" stroke-width="3.2"/>${stroke('M28 28l8 8')}`))

console.log(missing.length ? `Missing: ${missing.join(', ')}` : 'All icons written to ' + OUT)
