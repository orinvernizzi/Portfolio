import { useContent } from '../lib/content'

export function About() {
  const { about } = useContent()
  return (
    <div className="max-w-3xl">
      <p className="m-0 text-xl font-medium leading-snug tracking-tight md:text-2xl">{about.lead}</p>
      <ul className="m-0 mt-8 list-none space-y-4 p-0">
        {about.points.map((p, i) => (
          <li key={p} className="flex gap-4 text-base leading-relaxed text-fg/85 md:text-lg">
            <span className="mt-1 font-mono text-sm text-accent-text">{String(i + 1).padStart(2, '0')}</span>
            <span>{p}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
