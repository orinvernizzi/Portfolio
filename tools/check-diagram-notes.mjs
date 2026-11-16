// Checks that every box in every diagram has a tap note in both languages, and no note points at a box
// that does not exist. Also checks that interface.json has the same ui keys in en and es.
// Run: node tools/check-diagram-notes.mjs   (prints OK, or every problem and exits with 1)
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const root = join(import.meta.dirname, '..')
const mmdDir = join(root, 'tools/project-diagrams/mermaid')
const projects = JSON.parse(readFileSync(join(root, 'src/content/projects.json'), 'utf8'))
const ui = JSON.parse(readFileSync(join(root, 'src/content/interface.json'), 'utf8'))
const MAX_CHARS = 120

const problems = []
const warnings = []

// A box is `ID["label"]`, also when it is written inline after an arrow. Subgraph titles are skipped.
function nodeIds(text) {
  const ids = new Set()
  for (const line of text.split('\n')) {
    if (/^\s*(%%|subgraph\b|classDef\b|class\b)/.test(line)) continue
    for (const m of line.matchAll(/([A-Za-z][\w]*)\["/g)) ids.add(m[1])
  }
  return ids
}

for (const file of readdirSync(mmdDir).filter((f) => /^[\w-]+\.(en|es)\.mmd$/.test(f))) {
  const [id, lang] = file.split('.')
  const boxes = nodeIds(readFileSync(join(mmdDir, file), 'utf8'))
  const notes = projects[lang].diagramNotes?.[id] ?? {}
  for (const box of boxes) if (!notes[box]) problems.push(`${file}: box ${box} has no note in diagramNotes.${id} (${lang})`)
  for (const [box, note] of Object.entries(notes)) {
    if (!boxes.has(box)) problems.push(`diagramNotes.${id}.${box} (${lang}): no box ${box} in ${file}`)
    if (note.length > MAX_CHARS) problems.push(`diagramNotes.${id}.${box} (${lang}) is ${note.length} characters (max ${MAX_CHARS})`)
    else if (note.length > 110) warnings.push(`diagramNotes.${id}.${box} (${lang}) is ${note.length} characters`)
  }
}
// The site reads box ids from the built SVGs, so those must match the .mmd files too.
const svgDir = join(root, 'public/project-pictures')
for (const file of readdirSync(svgDir).filter((f) => /^[\w-]+\.(en|es)\.svg$/.test(f))) {
  const [id, lang] = file.split('.')
  const notes = projects[lang].diagramNotes?.[id] ?? {}
  const boxes = new Set(Array.from(readFileSync(join(svgDir, file), 'utf8').matchAll(/id="flowchart-(.+?)-\d+"/g), (m) => m[1]))
  for (const box of boxes) if (!notes[box]) problems.push(`${file}: box ${box} has no note (run npm run pictures if the .mmd changed)`)
  for (const box of Object.keys(notes)) if (!boxes.has(box)) problems.push(`${file}: no box ${box}, but diagramNotes.${id} has one (${lang})`)
}
for (const id of Object.keys(projects.en.diagramNotes ?? {})) if (!projects.es.diagramNotes?.[id]) problems.push(`diagramNotes.${id} is missing in es`)
for (const id of Object.keys(projects.es.diagramNotes ?? {})) if (!projects.en.diagramNotes?.[id]) problems.push(`diagramNotes.${id} is missing in en`)

const enUi = Object.keys(ui.en.ui)
const esUi = Object.keys(ui.es.ui)
for (const k of enUi) if (!esUi.includes(k)) problems.push(`interface.json: ui.${k} is missing in es`)
for (const k of esUi) if (!enUi.includes(k)) problems.push(`interface.json: ui.${k} is missing in en`)

warnings.forEach((w) => console.log(`note: ${w}`))
if (problems.length) {
  problems.forEach((p) => console.error(p))
  process.exit(1)
}
const count = Object.values(projects.en.diagramNotes).reduce((n, notes) => n + Object.keys(notes).length, 0)
console.log(`OK: ${count} notes per language, every box covered, en and es match.`)
