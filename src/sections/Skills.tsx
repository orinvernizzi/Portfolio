import { useContent } from '../lib/content'
import { ChipList, Icon } from '../components/ui'

export function Skills() {
  const { skills } = useContent()
  return (
    <div className="space-y-8">
      <div className="grid gap-8 md:grid-cols-3">
        {skills.groups.map((g) => (
          <section key={g.title}>
            <h3 className="m-0 mb-3 text-sm font-semibold uppercase tracking-widest text-muted">{g.title}</h3>
            <ChipList items={g.items} label={g.title} />
          </section>
        ))}
      </div>
      <ul className="m-0 flex flex-wrap gap-2 p-0">
        {skills.other.map((o) => (
          <li key={o} className="list-none rounded-full border border-dashed border-line px-3.5 py-1.5 text-sm text-fg/90">
            {o}
          </li>
        ))}
      </ul>
      <p className="m-0 flex items-start gap-3 text-base text-fg/90">
        <Icon name="globe" />
        <span>{skills.languages}</span>
      </p>
    </div>
  )
}
