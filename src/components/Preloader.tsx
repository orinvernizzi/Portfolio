// First-visit loading screen: black, a big white counter that jumps 0 > 33 > 55 > 75 > 100 and climbs the left side,
// a thin white bar growing up the right edge, then the name takes the counter's place and the screen lifts away.
// Modelled on the stepped-counter loader seen on other portfolios; the code and styles (/* preloader */ in effects.css) are ours.
// Each step waits for something real: fonts, the portrait, the background landscape (src/lib/landscapeReady.ts), the page load.
// Timing knobs are the constants below. Shown once per browser session; reduced motion gets a short fade with the name only.
import { useEffect, useState, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { useContent } from '../lib/content'

const FLAG = 'preloader-seen'
const LABELS = [0, 33, 55, 75, 100]
const PROGRESS = [0, 1 / 3, 0.55, 0.75, 1] // counter height and bar length, same as the reference
const FIRST_MS = 500 // earliest the first step shows
const GAP_MS = 433 // earliest gap between steps (counter hits 100 no sooner than ~1.8 s)
const STEP_MIN_MS = 300 // a step stays on screen at least this long, even if everything is ready
const MAX_MS = 6000 // never block longer than this

const sleep = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms))

function seen() {
  try {
    return sessionStorage.getItem(FLAG) === '1'
  } catch {
    return false
  }
}

function gates(): Promise<unknown>[] {
  const fonts = Promise.all([document.fonts.load('700 1em "Inter Variable"'), document.fonts.ready]).catch(() => {})
  const img = new Image()
  img.src = '/photos/portrait.webp'
  const portrait = img.decode().catch(() => {})
  const landscape = new Promise<void>((r) => {
    if ((window as unknown as { __landscapeReady?: boolean }).__landscapeReady) return r()
    window.addEventListener('landscape:ready', () => r(), { once: true })
  })
  const loaded = new Promise<void>((r) => {
    if (document.readyState === 'complete') return r()
    window.addEventListener('load', () => r(), { once: true })
  })
  return [fonts, portrait, landscape, loaded]
}

export function Preloader() {
  const c = useContent()
  const [active] = useState(() => !seen())
  const [step, setStep] = useState(0)
  const [fontOk, setFontOk] = useState(false)
  const [nameIn, setNameIn] = useState(false)
  const [nameOut, setNameOut] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [done, setDone] = useState(false)
  const [reduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)

  useEffect(() => {
    if (!active) return
    try {
      sessionStorage.setItem(FLAG, '1')
    } catch {
      /* private mode: it just shows again next time */
    }
    const root = document.getElementById('root')
    root?.setAttribute('inert', '')
    // Scroll is blocked with events (not overflow:hidden) so the scrollbar never appears or vanishes and nothing shifts.
    const stop = (e: Event) => e.preventDefault()
    const keys = (e: KeyboardEvent) => {
      if ([' ', 'PageUp', 'PageDown', 'Home', 'End', 'ArrowUp', 'ArrowDown'].includes(e.key)) e.preventDefault()
    }
    window.addEventListener('wheel', stop, { passive: false })
    window.addEventListener('touchmove', stop, { passive: false })
    window.addEventListener('keydown', keys)
    const release = () => {
      root?.removeAttribute('inert')
      window.removeEventListener('wheel', stop)
      window.removeEventListener('touchmove', stop)
      window.removeEventListener('keydown', keys)
    }

    let cancelled = false
    const t0 = performance.now()
    const g = gates()
    g[0].then(() => !cancelled && setFontOk(true))
    let capped = false
    const cap = sleep(MAX_MS).then(() => {
      capped = true
    })
    const wait = async (ms: number) => {
      await sleep(ms)
      return !cancelled
    }

    const exit = async () => {
      if (reduced) {
        setNameIn(true)
        await Promise.race([Promise.all(g), sleep(2500)])
        if (!(await wait(Math.max(0, t0 + 800 - performance.now())))) return
        setExiting(true)
        if (!(await wait(350))) return
      } else {
        if (!(await wait(450))) return
        setNameIn(true) // counter slides up, name slides in and is read on black
        if (!(await wait(800))) return
        setExiting(true) // bar shrinks to the top, black fades
        if (!(await wait(100))) return
        setNameOut(true) // name leaves before the page's own header shows through
        if (!(await wait(350))) return
        release() // page is visible now: unlock it
        if (!(await wait(900))) return
      }
      release()
      setDone(true)
    }

    let lastShown = t0
    const run = async () => {
      if (reduced) return exit()
      for (let i = 0; i < 4; i++) {
        await Promise.race([g[i], cap])
        if (capped) break
        await Promise.race([sleep(Math.max(0, t0 + FIRST_MS + i * GAP_MS - performance.now(), lastShown + STEP_MIN_MS - performance.now())), cap])
        if (cancelled) return
        if (capped) break
        lastShown = performance.now()
        setStep(i + 1)
      }
      if (cancelled) return
      setStep(4)
      exit()
    }
    run()

    return () => {
      cancelled = true
      release()
    }
  }, [active, reduced])

  if (!active || done) return null

  return createPortal(
    <div
      className={`preloader${reduced ? ' is-reduced' : ''}`}
      data-phase={exiting ? 'exit' : 'load'}
      data-name={nameIn ? (nameOut ? 'out' : 'in') : 'wait'}
      role="status"
      aria-live="polite"
    >
      <span className="sr-only">{c.ui.loading}</span>
      <div className="preloader-bg" aria-hidden="true" />
      {!reduced && (
        <>
          <div className={`preloader-no${fontOk ? ' is-on' : ''}`} style={{ '--p': PROGRESS[step] } as CSSProperties} aria-hidden="true">
            <span className="preloader-no-in">{LABELS[step]}</span>
          </div>
          <div className="preloader-line" style={{ '--p': PROGRESS[step] } as CSSProperties} aria-hidden="true" />
        </>
      )}
      <div className="preloader-name" aria-hidden="true">
        <span className="preloader-name-in">
          <span>NICOLAS</span> <span>INVERNIZZI</span>
        </span>
      </div>
    </div>,
    document.body,
  )
}
