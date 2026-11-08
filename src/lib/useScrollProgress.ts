import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

// Drives the spiral: wheel, touch/mouse drag and arrow keys move a float
// position (0 .. count-1). `current` is eased toward `target` by the scene.
export function useScrollProgress(count: number, enabled: boolean, el: RefObject<HTMLElement | null>) {
  const target = useRef(0)
  const current = useRef(0)
  const [index, setIndex] = useState(0)

  const move = useCallback(
    (next: number) => {
      const v = Math.min(count - 1, Math.max(0, next))
      target.current = v
      setIndex(Math.round(v))
    },
    [count],
  )

  useEffect(() => {
    const node = el.current
    if (!node || !enabled) return
    let last: { x: number; y: number } | null = null

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      const unit = e.deltaMode === 1 ? 16 : 1
      move(target.current + (e.deltaY + e.deltaX) * unit * 0.0035)
    }
    const onDown = (e: PointerEvent) => {
      last = { x: e.clientX, y: e.clientY }
    }
    const onMove = (e: PointerEvent) => {
      if (!last) return
      const dx = e.clientX - last.x
      const dy = e.clientY - last.y
      last = { x: e.clientX, y: e.clientY }
      move(target.current - (dx + dy) * 0.006)
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
        move(0)
      } else if (e.key === 'End') {
        move(count - 1)
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
  }, [count, el, enabled, move])

  return { target, current, index, goTo: move }
}

export type SpiralProgress = ReturnType<typeof useScrollProgress>
