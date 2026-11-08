import type { RefObject } from 'react'
import { setLanguage } from '../i18n'
import { useContent, useLang } from '../lib/content'

export type View = 'spiral' | 'list'

interface Props {
  view: View
  canSpiral: boolean
  solid: boolean
  menuRef: RefObject<HTMLButtonElement | null>
  menuOpen: boolean
  onView: (v: View) => void
  onMenu: () => void
}

export function TopBar({ view, canSpiral, solid, menuRef, menuOpen, onView, onMenu }: Props) {
  const c = useContent()
  const lang = useLang()
  const seg = (v: View, text: string) => (
    <button
      type="button"
      aria-pressed={view === v}
      onClick={() => onView(v)}
      className={`min-h-11 rounded-full px-4 text-sm font-semibold transition-colors ${view === v ? 'bg-white text-ink' : 'text-fg hover:bg-white/10'}`}
    >
      {text}
    </button>
  )

  return (
    <header
      className={`fixed inset-x-0 top-0 z-30 flex items-center justify-between gap-2 px-4 py-3 md:px-8 md:py-5 ${solid ? 'bg-bg/80 backdrop-blur-md' : ''}`}
    >
      <a href="#intro" onClick={(e) => view === 'spiral' && e.preventDefault()} className="hidden text-sm font-bold tracking-tight text-fg no-underline md:block">
        {c.meta.name}
      </a>
      {canSpiral ? (
        <div
          role="group"
          aria-label={`${c.ui.spiral} / ${c.ui.list}`}
          className="flex rounded-full border border-white/15 bg-black/40 p-0.5 backdrop-blur md:absolute md:left-1/2 md:-translate-x-1/2"
        >
          {seg('spiral', c.ui.spiral)}
          {seg('list', c.ui.list)}
        </div>
      ) : (
        <span />
      )}
      <div className="flex items-center gap-2">
        <button
          type="button"
          lang={lang === 'en' ? 'es' : 'en'}
          aria-label={lang === 'en' ? 'Cambiar a español' : 'Switch to English'}
          onClick={() => setLanguage(lang === 'en' ? 'es' : 'en')}
          className="flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-sm font-bold text-fg backdrop-blur transition-colors hover:bg-white/10"
        >
          {c.ui.lang}
        </button>
        <button
          ref={menuRef}
          type="button"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
          onClick={onMenu}
          className="min-h-11 rounded-full bg-white px-5 text-sm font-bold text-ink transition-colors hover:bg-accent"
        >
          {c.ui.menu}
        </button>
      </div>
    </header>
  )
}
