// The window that opens over the spiral when you pick a section: CSS grid-floor background (GridBackdrop), title bar, the section inside.
// The section shown comes from src/sections/registry.tsx. No WebGL here, so it opens instantly; the landscape is behind the spiral.
import { useRef, useState } from 'react'
import { SECTION_VIEWS } from '../sections/registry'
import { useContent } from '../lib/content'
import { useFocusTrap } from '../lib/useFocusTrap'
import { usePresence } from '../lib/usePresence'
import { GridBackdrop } from './GridBackdrop'
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
        className={`relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-black text-fg shadow-2xl transition duration-300 ease-out md:rounded-3xl ${active ? 'dialog-open' : 'dialog-enter'}`}
      >
        <GridBackdrop />
        <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-line bg-black/70 px-4 py-2 backdrop-blur md:px-10 md:py-2">
          <div className="min-w-0">
            <p className="eyebrow m-0 !text-[11px] leading-none">
              {String(index + 1).padStart(2, '0')} / {String(c.sections.length).padStart(2, '0')}
            </p>
            <h2 id="panel-title" className="m-0 mt-0.5 text-[clamp(1.15rem,2.6vw,1.6rem)] font-semibold leading-tight tracking-tight">
              {section.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={c.ui.close}
            className="-my-1 flex min-h-10 shrink-0 items-center gap-2.5 rounded-full text-sm font-medium text-fg"
          >
            <span className="hidden sm:inline">{c.ui.close}</span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/5 transition-colors hover:bg-white/10">
              <Icon name="close" />
            </span>
          </button>
        </header>
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-10 pt-6 md:px-10 md:pb-14">
          <View />
        </div>
      </div>
    </div>
  )
}
