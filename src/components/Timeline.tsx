import { useContent, type Block } from '../lib/content'
import { LogoChip } from './ui'

export function Timeline({ items }: { items: Block[] }) {
  const { alt } = useContent()
  return (
    <ol className="m-0 list-none space-y-10 border-l border-line p-0 pl-6 md:pl-8">
      {items.map((item, i) => {
        const heading = item.role ?? item.title
        return (
          <li key={`${heading}-${i}`} className="relative">
            <span
              className="absolute -left-[31px] top-2 h-2.5 w-2.5 rounded-full bg-accent ring-4 ring-black md:-left-[39px]"
              aria-hidden="true"
            />
            <p className="eyebrow m-0 text-accent-text">{item.period}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-2">
              <h3 className="m-0 text-xl font-semibold tracking-tight md:text-2xl">{heading}</h3>
              {item.logo && <LogoChip logo={item.logo} alt={alt[item.logo]} />}
            </div>
            {(item.org || item.place) && (
              <p className="m-0 mt-1 text-sm text-muted">{[item.org, item.place].filter(Boolean).join(' · ')}</p>
            )}
            {item.text && <p className="m-0 mt-3 max-w-prose text-base leading-relaxed text-fg/85">{item.text}</p>}
            {item.bullets && (
              <ul className="m-0 mt-3 max-w-prose list-disc space-y-2 pl-5 text-base leading-relaxed text-fg/85 marker:text-accent-text">
                {item.bullets.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            )}
          </li>
        )
      })}
    </ol>
  )
}
