// The "Things I work with" panel: logo grids per group, soft skills, languages.
// Text: src/content/skills.json. A name only gets a logo if it is in src/lib/techIcons.ts, otherwise it shows as a text tag.
import { useContent } from '../lib/content'
import { Icon } from '../components/ui'
import { TechGrid } from '../components/TechGrid'

export function Skills() {
  const { skills } = useContent()
  return (
    <div className="flex flex-col gap-8">
      <div className="grid gap-8 md:grid-cols-3">
        {skills.groups.map((g) => (
          <section key={g.title}>
            <h3 className="eyebrow m-0 mb-4">{g.title}</h3>
            <TechGrid items={g.items} label={g.title} />
          </section>
        ))}
      </div>
      <ul className="m-0 flex flex-wrap gap-2 p-0">
        {skills.other.map((o) => (
          <li key={o} className="list-none rounded-full border border-dashed border-[#333] bg-black/50 px-3.5 py-1.5 text-sm text-fg/85">
            {o}
          </li>
        ))}
      </ul>
      <p className="m-0 flex items-start gap-3 text-base text-fg/85">
        <Icon name="globe" />
        <span>{skills.languages}</span>
      </p>
    </div>
  )
}
