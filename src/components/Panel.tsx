// The window that opens over the spiral when you pick a section: CSS grid-floor background (GridBackdrop), title bar, the section inside.
// No backdrop-blur here on purpose (see .dialog-panel in effects.css).
// The section shown comes from src/sections/registry.tsx. No WebGL here, so it opens instantly; the landscape is behind the spiral.
// Opened from a spiral card, it grows out of that card and shrinks back into the front card (.dialog-* in src/styles/effects.css).
import { useLayoutEffect, useRef, useState } from 'react'
import { SECTION_VIEWS } from '../sections/registry'
import { useContent } from '../lib/content'
import { useFocusTrap } from '../lib/useFocusTrap'
import { usePresence } from '../lib/usePresence'
import { useReducedMotion } from '../lib/useReducedMotion'
import type { PanelOrigin, ScreenRect } from '../spiral/screenRect'
import { GridBackdrop } from './GridBackdrop'
import { Icon } from './ui'
// How long the closing animation runs before the panel unmounts: just above --dur-close (300ms) in theme.css.
export const PANEL_EXIT_MS = 320

interface Props {
  sectionId: string | null
  origin: PanelOrigin | null
  onClose: () => void
}

// The transform that puts the panel (resting box: offset*, which ignore transforms) over a card's spot on screen.
function fromRect(el: HTMLElement, r: ScreenRect) {
  const dx = r.x + r.width / 2 - (el.offsetLeft + el.offsetWidth / 2)
  const dy = r.y + r.height / 2 - (el.offsetTop + el.offsetHeight / 2)
  return `translate(${dx}px, ${dy}px) scale(${Math.min(1, r.width / el.offsetWidth)})`
}

export function Panel({ sectionId, origin, onClose }: Props) {
  const c = useContent()
  const ref = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(sectionId)
  if (sectionId && sectionId !== shown) setShown(sectionId)

  const open = sectionId !== null
  const { mounted, active } = usePresence(open, PANEL_EXIT_MS)
  const reduced = useReducedMotion()
  useFocusTrap(ref, mounted && open, onClose)

  // FLIP: start (or end) the panel over the card. On open the start spot is set with transitions off,
  // so the panel jumps there unseen and then animates to its resting place when `active` turns on.
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const spot = origin && !reduced ? (open ? origin.from : origin.back) : null
    if (!spot) {
      el.style.removeProperty('--panel-from')
      return
    }
    if (open) el.style.transition = 'none'
    el.style.setProperty('--panel-from', fromRect(el, spot))
    if (open) {
      void el.offsetWidth // apply the start spot before transitions come back
      el.style.transition = ''
    }
  }, [mounted, open, origin, reduced])

  if (!mounted || !shown) return null
  const index = c.sections.findIndex((s) => s.id === shown)
  const section = c.sections[index]
  const View = SECTION_VIEWS[shown]
  if (!section || !View) return null

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-4 md:p-8">
      <div
        className={`dialog-scrim absolute inset-0 bg-black/85 ${active ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="panel-title"
        tabIndex={-1}
        className={`dialog-panel relative flex max-h-full w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-line bg-black text-fg shadow-2xl md:rounded-3xl ${active ? 'dialog-open' : 'dialog-enter'}`}
      >
        <GridBackdrop />
        <header className="dialog-content relative z-10 flex shrink-0 items-center justify-between gap-3 border-b border-line bg-black/85 px-4 py-2 md:px-10 md:py-2">
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
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-line bg-white/5 transition hover:bg-white/10 active:scale-[0.92]">
              <Icon name="close" />
            </span>
          </button>
        </header>
        <div className="dialog-content relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-10 pt-6 md:px-10 md:pb-14">
          <View />
        </div>
      </div>
    </div>
  )
}
