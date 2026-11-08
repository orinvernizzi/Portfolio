import { useEffect, useRef, type RefObject } from 'react'

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

// Moves focus into `ref`, keeps Tab inside, closes on Escape, restores focus after.
export function useFocusTrap(ref: RefObject<HTMLElement | null>, active: boolean, onEscape: () => void) {
  const escapeRef = useRef(onEscape)
  escapeRef.current = onEscape

  useEffect(() => {
    const root = ref.current
    if (!active || !root) return
    const previous = document.activeElement as HTMLElement | null
    const items = () => Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE))
    ;(items()[0] ?? root).focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        escapeRef.current()
        return
      }
      if (e.key !== 'Tab') return
      const list = items()
      if (list.length === 0) return
      const first = list[0]
      const last = list[list.length - 1]
      const current = document.activeElement
      if (e.shiftKey && (current === first || !root.contains(current))) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && (current === last || !root.contains(current))) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('keydown', onKey)
      const now = document.activeElement
      const focusLost = !now || now === document.body || root.contains(now)
      if (focusLost && previous?.isConnected) previous.focus()
    }
  }, [active, ref])
}
