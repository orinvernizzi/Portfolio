// The mountain landscape behind the spiral: one fixed full-screen canvas under the spiral's (transparent) canvas.
// It loads as soon as the spiral view is on and is freed when the view goes away (list view, WebGL failure).
// While a panel is open it is covered, so it stops drawing. If it can't load or WebGL fails, the background stays plain black.
// Whatever happens, the preloader is told once (src/lib/landscapeReady.ts): first frame, failure, or "won't load".
import { Component, lazy, Suspense, useEffect, type ComponentType, type ReactNode } from 'react'
import { signalLandscapeReady } from '../lib/landscapeReady'

// three.js is shared with the spiral; this chunk is only the landscape itself. If it fails to load, we fall back to black.
const Landscape = lazy<ComponentType<{ paused: boolean }>>(() =>
  import('./Landscape').then((m) => ({ default: m.Landscape })).catch(() => ({ default: Failed })),
)

function Failed() {
  useEffect(signalLandscapeReady, [])
  return null
}

class LandscapeBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    signalLandscapeReady()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

export function LandscapeLayer({ enabled, open }: { enabled: boolean; open: boolean }) {
  // Not going to load (list view, no WebGL): nothing to wait for. A timer covers a first frame that never comes.
  useEffect(() => {
    if (!enabled) return signalLandscapeReady()
    const id = setTimeout(signalLandscapeReady, 10000)
    return () => clearTimeout(id)
  }, [enabled])

  if (!enabled) return null
  return (
    <div className="pointer-events-none fixed inset-0 bg-black" aria-hidden="true">
      <LandscapeBoundary>
        <Suspense fallback={null}>
          <Landscape paused={open} />
        </Suspense>
      </LandscapeBoundary>
    </div>
  )
}
