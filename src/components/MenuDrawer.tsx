import { useRef } from 'react'
import { useContent } from '../lib/content'
import { useFocusTrap } from '../lib/useFocusTrap'
import { usePresence } from '../lib/usePresence'
import { Icon } from './ui'

interface Props {
  open: boolean
  onClose: () => void
  onSelect: (id: string) => void
}

export function MenuDrawer({ open, onClose, onSelect }: Props) {
  const c = useContent()
  const ref = useRef<HTMLDivElement>(null)
  const { mounted, active } = usePresence(open)
  useFocusTrap(ref, mounted && open, onClose)

  if (!mounted) return null
  return (
    <div className="fixed inset-0 z-50">
      <div
        className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-label={c.ui.menu}
        tabIndex={-1}
        className={`theme-light absolute bottom-0 right-0 top-0 flex w-[min(100%,26rem)] flex-col overflow-y-auto bg-bg px-6 pb-8 pt-4 text-fg shadow-2xl transition-transform duration-300 ease-out ${active ? 'drawer-open' : 'drawer-enter'}`}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={c.ui.close}
          className="ml-auto flex min-h-11 items-center gap-3 rounded-full text-sm font-semibold"
        >
          {c.ui.close}
          <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
            <Icon name="close" />
          </span>
        </button>
        <nav aria-label={c.ui.menu} className="mt-6">
          <ul className="m-0 list-none p-0">
            {c.sections.map((s, i) => (
              <li key={s.id} className="border-b border-line">
                <button
                  type="button"
                  onClick={() => onSelect(s.id)}
                  className="group flex min-h-14 w-full items-baseline gap-4 py-3 text-left"
                >
                  <span className="font-mono text-sm text-muted">{String(i + 1).padStart(2, '0')}</span>
                  <span className="display text-3xl transition-transform group-hover:translate-x-1 sm:text-4xl">{s.title}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
        <p className="m-0 mt-auto pt-8 text-sm text-muted">{c.links.email}</p>
      </div>
    </div>
  )
}
