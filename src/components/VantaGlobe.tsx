import { useEffect, useRef } from 'react'
import { createGlobe, type Globe } from '../lib/vanta'

// Decorative globe behind a panel. Vanta listens on window, so the layer can ignore pointer events.
export function VantaGlobe() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let cancelled = false
    let globe: Globe | undefined
    createGlobe(el)
      .then((g) => (cancelled ? g.destroy() : (globe = g)))
      .catch(() => {}) // no WebGL: stay plain black
    return () => {
      cancelled = true
      globe?.destroy()
    }
  }, [])

  return <div ref={ref} aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 bg-black" />
}
