import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useContent } from '../lib/content'
import { useFocusTrap } from '../lib/useFocusTrap'
import { usePresence } from '../lib/usePresence'
import { useReducedMotion } from '../lib/useReducedMotion'
import { PHOTOS, getRatio, loadPhoto } from './badgePhotos'

// The photo reel that opens when you press the corner badge. Photos come from src/spiral/reel-photos/.
// The labels (title, previous, next, pause) are ui.reel* in src/content/interface.json.
// The slow zoom on each photo and the fade-in are in src/styles/effects.css (.reel-*), but the
// timings below win: they are set on each element from here.

// ---- Knobs: change these numbers ----
const SECONDS_PER_PHOTO = 1.7 // how long one photo stays, from its start to the next one's start
const FADE_SECONDS = 0.5 // crossfade time between two photos
const SWIPE_PX = 48 // how far a finger must drag sideways to count as a swipe
const FALLBACK_RATIO = 3 / 2 // shape used for a photo until its real width and height are known

const SLIDE_MS = SECONDS_PER_PHOTO * 1000
const FADE_MS = FADE_SECONDS * 1000

interface Layer {
  i: number
  id: number
}

interface Props {
  open: boolean
  onClose: () => void
}

// Photos of Nico play through like a short reel, in a dialog over the spiral.
export function PhotoReel({ open, onClose }: Props) {
  const { mounted, active } = usePresence(open)
  if (!mounted) return null
  return createPortal(<Reel open={open} active={active} onClose={onClose} />, document.body)
}

function Reel({ open, active, onClose }: { open: boolean; active: boolean; onClose: () => void }) {
  const { ui } = useContent()
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const count = PHOTOS.length
  const [ratios, setRatios] = useState<(number | undefined)[]>(() => PHOTOS.map(getRatio))
  const [paused, setPaused] = useState(false)
  const [cur, setCur] = useState<Layer>({ i: 0, id: 0 })
  const [out, setOut] = useState<Layer | null>(null)
  const swipe = useRef<{ x: number; y: number; done: boolean } | null>(null)
  useFocusTrap(ref, open, onClose)

  useEffect(() => {
    let live = true
    PHOTOS.forEach((url, i) =>
      loadPhoto(url).then((r) => live && setRatios((prev) => (prev[i] === r ? prev : prev.map((v, k) => (k === i ? r : v)))))
    )
    return () => {
      live = false
    }
  }, [])

  // The old photo stays underneath until the new one is fully opaque.
  useEffect(() => {
    if (!out) return
    const t = window.setTimeout(() => setOut(null), FADE_MS + 60)
    return () => window.clearTimeout(t)
  }, [out])

  const go = (step: number) => {
    if (count < 2) return
    setOut(reduced ? null : cur)
    setCur({ i: (cur.i + step + count) % count, id: cur.id + 1 })
  }

  const goRef = useRef(go)
  goRef.current = go
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return
      e.preventDefault()
      goRef.current(e.key === 'ArrowRight' ? 1 : -1)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const ratio = ratios[cur.i] ?? FALLBACK_RATIO
  const side = `min(88vw, 1100px, 82dvh * ${ratio})`
  const running = ratios[0] !== undefined && active && !paused && !reduced && count > 1
  const playState = running ? 'running' : 'paused'
  const counter = ui.reelCounter.replace('{n}', String(cur.i + 1)).replace('{total}', String(count))

  const onPointerDown = (e: React.PointerEvent) => {
    swipe.current = { x: e.clientX, y: e.clientY, done: false }
  }
  const onPointerUp = (e: React.PointerEvent) => {
    const s = swipe.current
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.abs(dx) > SWIPE_PX && Math.abs(dx) > Math.abs(dy) * 1.5) {
      s.done = true
      go(dx < 0 ? 1 : -1)
    }
  }
  const onToggle = () => {
    if (swipe.current?.done) {
      swipe.current = null
      return
    }
    if (reduced) go(1)
    else setPaused((p) => !p)
  }

  const navButton = 'reel-btn absolute top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:bg-black/75'

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={ui.reelTitle}
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-300 ${active ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      <div className={`relative transition duration-300 ease-out ${active ? 'dialog-open' : 'dialog-enter'}`}>
        <div
          className="relative isolate overflow-hidden rounded-[20px] bg-black shadow-[0_30px_80px_rgba(0,0,0,0.75)] ring-1 ring-white/10 transition-[width,height] duration-500 ease-out"
          style={{ width: `calc(${side})`, height: `calc((${side}) / ${ratio})` }}
        >
          {[out, cur].map(
            (layer) =>
              layer && (
                <div key={layer.id} className={`absolute inset-0 ${layer === cur && !reduced ? 'reel-in' : ''}`} style={{ animationDuration: `${FADE_MS}ms` }}>
                  <img
                    src={PHOTOS[layer.i]}
                    alt={layer === cur ? counter : ''}
                    draggable={false}
                    decoding="async"
                    className={`h-full w-full select-none object-contain ${reduced || count < 2 ? '' : layer.i % 2 ? 'reel-zoom-out' : 'reel-zoom-in'}`}
                    style={{ animationDuration: `${SLIDE_MS + FADE_MS}ms`, animationPlayState: playState }}
                  />
                </div>
              ),
          )}

          {count > 1 && (
            <>
              <button
                type="button"
                onClick={onToggle}
                onPointerDown={onPointerDown}
                onPointerUp={onPointerUp}
                aria-label={paused ? ui.reelPlay : ui.reelPause}
                className="absolute inset-0 z-10 block cursor-pointer touch-none border-0 bg-transparent p-0 focus-visible:[outline-offset:-3px]"
              />
              <div
                className={`pointer-events-none absolute left-1/2 top-1/2 z-10 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm transition-opacity duration-200 ${paused && !reduced ? 'opacity-100' : 'opacity-0'}`}
                aria-hidden="true"
              >
                <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4.5" width="4.2" height="15" rx="1.2" />
                  <rect x="13.8" y="4.5" width="4.2" height="15" rx="1.2" />
                </svg>
              </div>

              <div className="pointer-events-none absolute inset-x-0 top-0 z-20 h-16 bg-gradient-to-b from-black/55 to-transparent" aria-hidden="true" />
              <div className="pointer-events-none absolute inset-x-3 top-3 z-20 flex gap-1.5" aria-hidden="true">
                {PHOTOS.map((url, i) => (
                  <span key={url} className="block h-[3px] flex-1 overflow-hidden rounded-full bg-white/30">
                    {i < cur.i || (i === cur.i && reduced) ? (
                      <span className="block h-full w-full bg-white" />
                    ) : i === cur.i ? (
                      <span
                        key={cur.id}
                        className="reel-fill block h-full w-full bg-white"
                        style={{ animationDuration: `${SLIDE_MS}ms`, animationPlayState: playState }}
                        onAnimationEnd={() => go(1)}
                      />
                    ) : null}
                  </span>
                ))}
              </div>

              <button type="button" onClick={() => go(-1)} aria-label={ui.reelPrev} className={`${navButton} left-3`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 5-7 7 7 7" />
                </svg>
              </button>
              <button type="button" onClick={() => go(1)} aria-label={ui.reelNext} className={`${navButton} right-3`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 5 7 7-7 7" />
                </svg>
              </button>
            </>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onClose}
        aria-label={ui.close}
        className="reel-btn absolute right-3 top-3 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white backdrop-blur transition-colors hover:bg-white/15 sm:right-5 sm:top-5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
          <path d="M6 6l12 12M18 6 6 18" />
        </svg>
      </button>
    </div>
  )
}
