import { useRef, useState } from 'react'
import { SECTION_VIEWS } from '../sections/registry'
import { useContent } from '../lib/content'
import { useFocusTrap } from '../lib/useFocusTrap'
import { usePresence } from '../lib/usePresence'
import { Icon } from './ui'

interface Props {
  sectionId: string | null
  onClose: () => void
}

export function Panel({ sectionId, onClose }: Props) {
  const c = useContent()
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(sectionId)
  if (sectionId && sectionId !== shown) setShown(sectionId)

  const open = sectionId !== null
  const { mounted, active } = usePresence(open)
  useFocusTrap(ref, mounted && open, onClose)

  if (!mounted || !shown) return null
  const index = c.sections.findIndex((s) => s.id === shown)
  const section = c.sections[index]
  const View = SECTION_VIEWS[shown]
  if (!section || !View) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div
        className={`absolute inset-0 bg-black/70 backdrop-blur-sm transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        tabIndex={-1}
        className={`theme-light relative max-h-full w-full max-w-6xl overflow-y-auto overscroll-contain rounded-[24px] bg-bg text-fg shadow-2xl transition duration-300 ease-out md:rounded-[32px] ${active ? 'dialog-open' : 'dialog-enter'}`}
      >
        <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-bg/95 px-5 py-4 backdrop-blur md:px-10 md:py-5">
          <h2 id="panel-title" className="display m-0 min-w-0 text-[clamp(1.6rem,4.5vw,3rem)]">
            <span className="mr-3 align-middle font-mono text-sm font-medium tracking-normal text-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            {section.title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={c.ui.close}
            className="flex min-h-11 shrink-0 items-center gap-3 rounded-full text-sm font-semibold"
          >
            <span className="hidden sm:inline">{c.ui.close}</span>
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-white">
              <Icon name="close" />
            </span>
          </button>
        </header>
        <div className="px-5 pb-10 pt-4 md:px-10 md:pb-14">
          <View />
        </div>
      </div>
    </div>
  )
}
