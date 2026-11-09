import { useContent, useLang, type Project } from '../lib/content'
import { ButtonLink, ChipList, Icon } from '../components/ui'

function ProjectCard({ p, lang, alt, open, viewCode }: { p: Project; lang: string; alt?: string; open: string; viewCode: string }) {
  return (
    <article aria-labelledby={`project-${p.id}`} className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      <img
        src={`/diagrams/${p.id}.${lang}.svg`}
        width={720}
        height={432}
        loading="lazy"
        decoding="async"
        alt={alt ?? ''}
        className="block h-auto w-full"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="m-0 text-xs font-medium tracking-wide text-accent-text">{p.tag}</p>
        <h4 id={`project-${p.id}`} className="m-0 text-lg font-semibold tracking-tight">
          {p.title}
        </h4>
        <p className="m-0 text-[15px] leading-relaxed text-fg/90">{p.text}</p>
        <ul className="m-0 flex list-disc flex-col gap-1.5 pl-5 text-sm leading-relaxed text-fg/80 marker:text-accent-text">
          {p.details.map((d) => (
            <li key={d}>{d}</li>
          ))}
        </ul>
        {p.note && <p className="m-0 text-xs leading-relaxed text-muted">{p.note}</p>}
        <div className="mt-auto pt-2">
          <ChipList items={p.stack} label={p.title} />
        </div>
        {(p.live || p.code) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {p.live && (
              <ButtonLink href={p.live} external primary>
                {open}
                <Icon name="arrow" />
              </ButtonLink>
            )}
            {p.code && (
              <ButtonLink href={p.code} external>
                {viewCode}
                <Icon name="arrow" />
              </ButtonLink>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export function Projects() {
  const c = useContent()
  const lang = useLang()
  return (
    <div className="flex flex-col gap-12">
      {c.projects.groups.map((g) => (
        <section key={g.id} aria-labelledby={`group-${g.id}`}>
          <h3 id={`group-${g.id}`} className="eyebrow m-0 mb-4 border-b border-line pb-3">
            {g.title}
          </h3>
          <div className="grid gap-5 md:grid-cols-2">
            {c.projects.items
              .filter((p) => p.group === g.id)
              .map((p) => (
                <ProjectCard key={p.id} p={p} lang={lang} alt={c.art[p.id]?.label} open={c.ui.open} viewCode={c.ui.viewCode} />
              ))}
          </div>
        </section>
      ))}
    </div>
  )
}
