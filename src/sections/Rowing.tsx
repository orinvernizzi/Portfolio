import { useContent } from '../lib/content'
import { Medal } from '../components/Medal'
import { ButtonLink, Icon } from '../components/ui'

export function Rowing() {
  const { rowing, alt, ui } = useContent()
  return (
    <div className="grid gap-6">
      <p className="m-0 max-w-3xl text-xl font-medium leading-snug tracking-tight md:text-2xl">{rowing.lead}</p>
      <div>
        <ButtonLink href={rowing.rosterUrl} external>
          {rowing.rosterLabel}
          <Icon name="arrow" />
          <span className="sr-only">({ui.newTab})</span>
        </ButtonLink>
      </div>
      <div className="-mb-3 grid gap-4 md:grid-cols-2">
        <img src="/img/rowing-paraguay.webp" alt={alt.paraguay} width={1600} height={900} loading="lazy" className="fade-bottom aspect-[4/3] w-full rounded-2xl object-cover" />
        <img src="/img/rowing-hocr.webp" alt={alt.hocr} width={1600} height={1067} loading="lazy" className="fade-bottom aspect-[4/3] w-full rounded-2xl object-cover object-[20%_60%]" />
      </div>
      <ul className="relative m-0 grid list-none gap-4 p-0 md:grid-cols-2">
        {rowing.medals.map((m, i) => (
          <li
            key={`${m.event}-${m.year}`}
            style={{ animationDelay: `${i * 90}ms` }}
            className="rise group flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/25 md:p-5"
          >
            <span className="flex shrink-0 items-center transition-transform duration-300 group-hover:-rotate-3 group-hover:scale-105" aria-hidden="true">
              {m.medals.map((kind, k) => (
                <Medal key={kind} kind={kind} className={`h-16 w-12 ${k ? '-ml-4' : ''}`} />
              ))}
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-3">
                <p className="m-0 text-2xl font-semibold leading-tight tracking-tight">{m.label}</p>
                <p className="m-0 text-3xl font-semibold leading-none tracking-tight text-[#8c8c8c] tabular-nums">{m.year}</p>
              </div>
              <p className="m-0 mt-1 text-base leading-snug text-fg">{m.event}</p>
              <p className="m-0 mt-0.5 text-sm text-muted">{m.place}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
