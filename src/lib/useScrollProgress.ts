import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

// How fast the spiral turns. Bigger number = faster. You can change these two safely.
const WHEEL_SPEED = 0.0035 // cards moved per pixel of mouse wheel or trackpad scroll
const DRAG_SPEED = 0.006 // cards moved per pixel of mouse or finger drag
// How smoothly the cards glide to a stop is the `6` in the useFrame line of src/spiral/Spiral.tsx.

// Positive modulo, so -1 mod 10 is 9.
export const mod = (a: number, n: number) => ((a % n) + n) % n

// Shortest signed distance from `from` to `to` on a ring of n items.
export const ringDelta = (from: number, to: number, n: number) => mod(to - from + n / 2, n) - n / 2

// Drives the spiral: wheel, touch/mouse drag and arrow keys move an unbounded
// float position that wraps around the ring (endless loop). `current` is
// eased toward `target` by the scene; both live in the same unwrapped frame,
// so easing never takes the long way round.
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

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : 1
      move(target.current + (e.deltaY + e.deltaX) * unit * WHEEL_SPEED)
    }
    const onDown = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (!last) return
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      last = { x: e.clientX, y: e.clientY }
      move(target.current - (dx + dy) * DRAG_SPEED)
    }
    const onUp = () => {
      last = null
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
    }
  }, [count, el, enabled, goTo, move])

  return { target, current, index, goTo }
}

export type SpiralProgress = ReturnType<typeof useScrollProgress>
