import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

// How fast the spiral turns. Bigger number = faster. You can change these two safely.
const WHEEL_SPEED = 0.0035 // cards moved per pixel of mouse wheel or trackpad scroll
const DRAG_SPEED = 0.006 // cards moved per pixel of mouse or finger drag
const THROW_MS = 250 // a flick keeps going for about this long (its speed × this), then lands on a card
const MAX_THROW = 2 // a flick moves at most this many extra cards
const WHEEL_SETTLE_MS = 140 // after the wheel or trackpad stops this long, snap to the next card in that direction
const WHEEL_DEADBAND = 0.05 // a wheel move smaller than this (in cards) snaps back instead
// How smoothly the cards glide to a stop is the `6` in the useFrame line of src/spiral/Spiral.tsx.

// Positive modulo, so -1 mod 10 is 9.
export const mod = (a: number, n: number) => ((a % n) + n) % n

// Shortest signed distance from `from` to `to` on a ring of n items.
export const ringDelta = (from: number, to: number, n: number) => mod(to - from + n / 2, n) - n / 2

// Drives the spiral: wheel, touch/mouse drag and arrow keys move an unbounded
// float position that wraps around the ring (endless loop). `current` is
// eased toward `target` by the scene; both live in the same unwrapped frame,
// so easing never takes the long way round. Letting go of a drag, or the wheel stopping,
// always lands on a whole card (a quick flick throws it a card or two further first).
export function useScrollProgress(count: number, enabled: boolean, el: RefObject<HTMLElement | null>) {
  const target = useRef(0)
  const current = useRef(0)
  const [index, setIndex] = useState(0)

  const move = useCallback(
    (next: number) => {
      target.current = next
      setIndex(mod(Math.round(next), count))
    },
    [count],
  )

  // Jump to a card by index, taking the shortest way round the ring.
  const goTo = useCallback(
    (i: number) => move(target.current + ringDelta(target.current, i, count)),
    [count, move],
  )

  useEffect(() => {
    const node = el.current
    if (!node || !enabled) return
    let last: { x: number; y: number } | null = null
    let samples: { t: number; p: number }[] = [] // recent drag positions, for the flick speed
    let settle = 0
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const snap = (extra = 0) => move(Math.round(target.current + extra))
    // Wheel stopped: measure from the card the scroll started on. Moved at least a little → land at least
    // one card that way (so one mouse notch, about a third of a card, never springs back); otherwise the nearest card.
    let wheelStart: number | null = null
    const settleWheel = () => {
      const start = wheelStart ?? Math.round(target.current)
      wheelStart = null
      const moved = target.current - start
      if (Math.abs(moved) < WHEEL_DEADBAND) return move(start)
      move(start + Math.sign(moved) * Math.max(1, Math.round(Math.abs(moved))))
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      if (wheelStart === null) wheelStart = Math.round(target.current)
      const unit = e.deltaMode === 1 ? 16 : 1
      move(target.current + (e.deltaY + e.deltaX) * unit * WHEEL_SPEED)
      window.clearTimeout(settle)
      settle = window.setTimeout(settleWheel, WHEEL_SETTLE_MS)
    }
    const onDown = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY }
      samples = [{ t: e.timeStamp, p: target.current }]
      window.clearTimeout(settle)
      wheelStart = null
    }
    const onMove = (e: PointerEvent) => {
      if (!last) return
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      last = { x: e.clientX, y: e.clientY }
      move(target.current - (dx + dy) * DRAG_SPEED)
      samples.push({ t: e.timeStamp, p: target.current })
      while (samples.length > 2 && e.timeStamp - samples[0].t > 80) samples.shift()
    }
    // Let go: keep the flick going a little (momentum), then land on the nearest card.
    const onUp = (e: PointerEvent) => {
      if (!last) return
      last = null
      const first = samples[0]
      const end = samples[samples.length - 1]
      const fresh = first && e.timeStamp - end.t < 80 && end.t > first.t // still moving when released
      const speed = fresh ? (end.p - first.p) / (end.t - first.t) : 0
      snap(reduced ? 0 : Math.max(-MAX_THROW, Math.min(MAX_THROW, speed * THROW_MS)))
    }
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      if (t && /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)) return
      if (e.altKey || e.ctrlKey || e.metaKey) return
      const next = Math.floor(target.current + 0.001) + 1
      const prev = Math.ceil(target.current - 0.001) - 1
      if (['ArrowDown', 'ArrowRight', 'PageDown'].includes(e.key)) {
        e.preventDefault()
        move(next)
      } else if (['ArrowUp', 'ArrowLeft', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        move(prev)
      } else if (e.key === 'Home') {
        goTo(0)
      } else if (e.key === 'End') {
        goTo(count - 1)
      }
    }

    node.addEventListener('wheel', onWheel, { passive: false })
    node.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    window.addEventListener('keydown', onKey)
    return () => {
      node.removeEventListener('wheel', onWheel)
      node.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      window.removeEventListener('keydown', onKey)
      window.clearTimeout(settle)
    }
  }, [count, el, enabled, goTo, move])

  return { target, current, index, goTo }
}

export type SpiralProgress = ReturnType<typeof useScrollProgress>
