import { useContent } from '../lib/content'

export function Learning() {
  const { learning } = useContent()
  return (
    <div className="max-w-3xl">
      <p className="m-0 text-2xl font-semibold leading-snug tracking-tight md:text-3xl">{learning.lead}</p>
      <ul className="m-0 mt-8 list-none space-y-4 p-0">
        {learning.points.map((p) => (
          <li key={p} className="flex gap-4 text-lg leading-relaxed text-fg/90">
            <span className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-accent" aria-hidden="true" />
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
