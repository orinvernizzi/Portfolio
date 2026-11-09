import { useContent } from '../lib/content'

export function Rowing() {
  const { rowing, alt } = useContent()
  return (
    <div className="space-y-8">
      <p className="m-0 max-w-3xl text-xl font-medium leading-snug tracking-tight md:text-2xl">{rowing.lead}</p>
      <div className="grid gap-4 md:grid-cols-2">
        <img src="/img/rowing-paraguay.webp" alt={alt.paraguay} width={1600} height={900} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover" />
        <img src="/img/rowing-hocr.webp" alt={alt.hocr} width={1600} height={1067} loading="lazy" className="aspect-[4/3] w-full rounded-2xl object-cover object-[20%_60%]" />
      </div>
      <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-2">
        {rowing.medals.map((m) => (
          <li key={m} className="flex items-start gap-3 rounded-xl border border-line bg-surface p-4 text-base leading-snug">
            <span className="mt-1.5 h-3 w-3 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            {m}
          </li>
        ))}
      </ul>
    </div>
  )
}
