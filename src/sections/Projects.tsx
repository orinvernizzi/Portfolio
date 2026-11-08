import { useContent, type Project } from '../lib/content'
import { ButtonLink, ChipList, Icon } from '../components/ui'
import { OrquestadorArt } from '../components/illustrations/OrquestadorArt'
import { ForecastArt } from '../components/illustrations/ForecastArt'
import { DashboardArt } from '../components/illustrations/DashboardArt'

const ART: Record<string, (props: { label: string }) => React.JSX.Element> = {
  orquestador: OrquestadorArt,
  forecast: ForecastArt,
  dashboard: DashboardArt,
}

function ProjectCard({ p, open, viewCode }: { p: Project; open: string; viewCode: string }) {
  const Art = ART[p.id]
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-line bg-surface">
      {Art ? <Art label={p.title} /> : <div className="h-1.5 bg-accent" aria-hidden="true" />}
      <div className="flex flex-1 flex-col gap-3 p-5">
        <p className="m-0 text-xs font-semibold uppercase tracking-widest text-accent-text">{p.tag}</p>
        <h3 className="m-0 text-xl font-bold tracking-tight">{p.title}</h3>
        <p className="m-0 text-base leading-relaxed text-fg/85">{p.text}</p>
        <div className="mt-auto pt-2">
          <ChipList items={p.stack} label={p.title} />
        </div>
        {(p.live || p.code) && (
          <div className="flex flex-wrap gap-2 pt-2">
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
  return (
    <div className="grid gap-5 md:grid-cols-2">
      {c.projects.map((p) => (
        <ProjectCard key={p.id} p={p} open={c.ui.open} viewCode={c.ui.viewCode} />
      ))}
    </div>
  )
}
