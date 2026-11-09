import { useContent, type Block } from '../lib/content'
import { LogoChip } from './ui'

const PHOTOS = { techo1: '/img/techo-1.webp', techo2: '/img/techo-2.webp' } as const

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
            {item.photos && (
              <div
                role="group"
                aria-label={heading}
                tabIndex={0}
                className="-mb-6 mt-4 flex max-w-xl snap-x snap-mandatory gap-3 overflow-x-auto md:grid md:grid-cols-2 md:overflow-visible"
              >
                {item.photos.map((key) => (
                  <img
                    key={key}
                    src={PHOTOS[key]}
                    alt={alt[key]}
                    width={1000}
                    height={1333}
                    loading="lazy"
                    className="fade-bottom aspect-[3/4] w-[72%] shrink-0 snap-center rounded-2xl object-cover md:w-full"
                  />
                ))}
              </div>
            )}
            {item.text && <p className="relative m-0 mt-3 max-w-prose text-base leading-relaxed text-fg/85">{item.text}</p>}
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
