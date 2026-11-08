import { useEffect, useState } from 'react'

// Keeps a dialog mounted while its exit transition plays.
export function usePresence(open: boolean, exitMs = 260) {
  const [mounted, setMounted] = useState(open)
  const [active, setActive] = useState(false)

  useEffect(() => {
    if (open) {
      setMounted(true)
      const t = window.setTimeout(() => setActive(true), 20)
      return () => window.clearTimeout(t)
    }
    setActive(false)
    const t = window.setTimeout(() => setMounted(false), exitMs)
    return () => window.clearTimeout(t)
  }, [open, exitMs])

  return { mounted, active }
}
