import { CornerBadge } from './CornerBadge'

interface Props {
  sections: { id: string; title: string }[]
  index: number
  hint: string
  menuLabel: string
  badgeRing: string
  badgeLabel: string
  active: boolean
  onJump: (i: number) => void
  onOpen: (i: number) => void
}

export function SpiralHud({ sections, index, hint, menuLabel, badgeRing, badgeLabel, active, onJump, onOpen }: Props) {
  const n = sections.length
  const pct = n > 1 ? (index / (n - 1)) * 100 : 0

  return (
    <>
      <nav aria-label={menuLabel}>
        <ul className="m-0 list-none p-0">
          {sections.map((s, i) => (
            <li key={s.id}>
              <button
                type="button"
                onFocus={() => onJump(i)}
                onClick={() => onOpen(i)}
                className="sr-only focus:not-sr-only focus:fixed focus:bottom-28 focus:left-1/2 focus:z-30 focus:-translate-x-1/2 focus:rounded-full focus:bg-accent focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-ink"
              >
                {s.title}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 flex items-end justify-between px-4 pb-6 md:px-8">
        <p className="m-0 min-w-0 text-sm md:ml-[232px]">
          <span className="font-mono text-white">{String(index + 1).padStart(2, '0')}</span>
          <span className="text-accent-text"> / {String(n).padStart(2, '0')}</span>
          <span className="ml-3 hidden text-fg sm:inline">{sections[index]?.title}</span>
          <span className="sr-only sm:hidden">{sections[index]?.title}</span>
        </p>
        <div
          className={`flex flex-col items-center gap-2 text-xs uppercase tracking-widest text-accent-text transition-opacity duration-500 ${index > 0 ? 'opacity-0' : 'opacity-100'}`}
        >
          <span>{hint}</span>
          <span className="hint-line block h-8 w-px bg-accent" aria-hidden="true" />
        </div>
        <div className="w-[88px] sm:w-[120px] md:w-[352px]" aria-hidden="true" />
      </div>

      <CornerBadge ringText={badgeRing} label={badgeLabel} active={active} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-0.5 bg-white/10 md:hidden" aria-hidden="true">
        <div className="h-full bg-accent transition-[width] duration-300" style={{ width: `${pct}%` }} />
      </div>

      <nav
        className="absolute right-3 top-1/2 z-10 hidden -translate-y-1/2 flex-col md:flex"
        aria-hidden="true"
      >
        {sections.map((s, i) => (
          <button
            key={s.id}
            type="button"
            tabIndex={-1}
            aria-label={s.title}
            aria-current={i === index}
            onClick={() => onJump(i)}
            className="group flex h-6 w-11 items-center justify-end"
          >
            <span
              className={`block h-0.5 rounded-full transition-all duration-300 ${i === index ? 'w-7 bg-accent' : 'w-3 bg-white/30 group-hover:w-5 group-hover:bg-white/60'}`}
            />
          </button>
        ))}
      </nav>
    </>
  )
}
