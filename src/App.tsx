// The whole page: holds which view is on (spiral or list), which panel is open and whether the menu drawer is open.
// Phones, no WebGL and reduced motion start in the list view. Section text: src/content. Section components: src/sections/registry.tsx.
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { TopBar, type View } from './components/TopBar'
import { MenuDrawer } from './components/MenuDrawer'
import { Panel, PANEL_EXIT_MS } from './components/Panel'
import { LandscapeLayer } from './components/LandscapeLayer'
import { ListView } from './components/ListView'
import { Preloader } from './components/Preloader'
import { SpiralBoundary } from './spiral/SpiralBoundary'
import type { PanelOrigin } from './spiral/screenRect'

const Spiral = lazy(() => import('./spiral/Spiral'))

let webglSupport: boolean | undefined

function hasWebGL() {
  if (webglSupport !== undefined) return webglSupport
  try {
    const canvas = document.createElement('canvas')
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
    gl?.getExtension('WEBGL_lose_context')?.loseContext()
    webglSupport = Boolean(gl)
  } catch {
    webglSupport = false
  }
  return webglSupport
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function App() {
  const [webgl, setWebgl] = useState(hasWebGL)
  const [view, setView] = useState<View>(() =>
    hasWebGL() && window.innerWidth >= 768 && !prefersReducedMotion() ? 'spiral' : 'list',
  )
  const [panelId, setPanelId] = useState<string | null>(null)
  const [origin, setOrigin] = useState<PanelOrigin | null>(null) // where the clicked card was, so the panel grows out of it
  const [menuOpen, setMenuOpen] = useState(false)
  const [jump, setJump] = useState<{ id: string; n: number } | null>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const jumpCount = useRef(0)

  const spiral = view === 'spiral' && webgl

  // The spiral and landscape stop under a panel or the menu, and wake up only after the closing animation (PANEL_EXIT_MS),
  // so the two don't fight for the same frames.
  // The menu alone doesn't stop the landscape, so closing it needs no wait.
  const covered = panelId !== null || menuOpen
  const [live, setLive] = useState(!covered)
  const hadPanel = useRef(false)
  useEffect(() => {
    if (panelId !== null) hadPanel.current = true
    if (covered) {
      setLive(false)
      return
    }
    const t = window.setTimeout(() => {
      hadPanel.current = false
      setLive(true)
    }, hadPanel.current ? PANEL_EXIT_MS : 0)
    return () => window.clearTimeout(t)
  }, [covered, panelId])

  useEffect(() => {
    document.documentElement.classList.toggle('no-scroll', spiral || menuOpen)
    return () => document.documentElement.classList.remove('no-scroll')
  }, [spiral, menuOpen])

  const selectFromMenu = useCallback(
    (id: string) => {
      setMenuOpen(false)
      if (spiral) {
        setJump({ id, n: ++jumpCount.current })
        setOrigin(null)
        setPanelId(id)
        return
      }
      history.replaceState(null, '', `#${id}`)
      window.setTimeout(() => {
        const section = document.getElementById(id)
        section?.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
        ;(document.getElementById(`h-${id}`) ?? section)?.focus({ preventScroll: true })
      }, 60)
    },
    [spiral],
  )

  const closePanel = useCallback(() => setPanelId(null), [])
  const openPanel = useCallback((id: string, from?: PanelOrigin) => {
    setOrigin(from ?? null)
    setPanelId(id)
  }, [])
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const failSpiral = useCallback(() => {
    setWebgl(false)
    setView('list')
  }, [])

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <Preloader />
      <TopBar
        view={spiral ? 'spiral' : 'list'}
        canSpiral={webgl}
        solid={!spiral}
        menuRef={menuRef}
        menuOpen={menuOpen}
        onView={setView}
        onMenu={() => setMenuOpen(true)}
      />
      <LandscapeLayer enabled={spiral} open={!live && !menuOpen} />
      {spiral ? (
        <div className="fixed inset-0">
          <SpiralBoundary onError={failSpiral}>
            <Suspense fallback={null}>
              <Spiral enabled={live} onOpen={openPanel} jumpTo={jump} onContextLost={failSpiral} />
            </Suspense>
          </SpiralBoundary>
        </div>
      ) : (
        <ListView />
      )}
      <Panel sectionId={panelId} origin={origin} onClose={closePanel} />
      <MenuDrawer open={menuOpen} onClose={closeMenu} onSelect={selectFromMenu} />
    </div>
  )
}
