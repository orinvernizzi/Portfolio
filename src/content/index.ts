// Gathers the one-file-per-section JSON files into the two objects the app reads: en and es (see src/i18n.ts).
// Each JSON file holds both languages side by side: { "en": {...}, "es": {...} }.
// You edit the text in the .json files, not here. What each file holds: src/content/README.md.
// Adding a new section: make its .json file, import it at the top, add one line in build() below
// (for example: pets: pets[lang]), and add the matching field to the `Content` type in src/lib/content.ts.
// The full checklist is in START-HERE.md.
import about from './about.json'
import contact from './contact.json'
import education from './education.json'
import experience from './experience.json'
import interfaceText from './interface.json'
import leadership from './leadership.json'
import learning from './learning.json'
import projectsFile from './projects.json'
import rowing from './rowing.json'
import site from './site.json'
import skills from './skills.json'

function build(lang: 'en' | 'es') {
  const { art, ...projects } = projectsFile[lang]
  return {
    ui: interfaceText[lang].ui,
    alt: interfaceText[lang].alt,
    art,
    meta: site[lang].meta,
    links: site[lang].links,
    sections: interfaceText[lang].sections,
    about: about[lang],
    experience: experience[lang],
    skills: skills[lang],
    education: education[lang],
    projects,
    rowing: rowing[lang],
    learning: learning[lang],
    leadership: leadership[lang],
    contact: contact[lang],
  }
}

export const en = build('en')
export const es = build('es')
