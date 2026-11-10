import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { TopBar, type View } from './components/TopBar'
import { MenuDrawer } from './components/MenuDrawer'
import { Panel } from './components/Panel'
import { ListView } from './components/ListView'
import { SpiralBoundary } from './spiral/SpiralBoundary'

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
  const [menuOpen, setMenuOpen] = useState(false)
  const [jump, setJump] = useState<{ id: string; n: number } | null>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const jumpCount = useRef(0)

  const spiral = view === 'spiral' && webgl

  useEffect(() => {
    document.documentElement.classList.toggle('no-scroll', spiral || menuOpen)
    return () => document.documentElement.classList.remove('no-scroll')
  }, [spiral, menuOpen])

  const selectFromMenu = useCallback(
    (id: string) => {
      setMenuOpen(false)
      if (spiral) {
        setJump({ id, n: ++jumpCount.current })
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
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  const failSpiral = useCallback(() => {
    setWebgl(false)
    setView('list')
  }, [])

  return (
    <div className="min-h-dvh bg-bg text-fg">
      <TopBar
        view={spiral ? 'spiral' : 'list'}
        canSpiral={webgl}
        solid={!spiral}
        menuRef={menuRef}
        menuOpen={menuOpen}
        onView={setView}
        onMenu={() => setMenuOpen(true)}
      />
      {spiral ? (
        <div className="fixed inset-0">
          <SpiralBoundary onError={failSpiral}>
            <Suspense fallback={null}>
              <Spiral enabled={panelId === null && !menuOpen} onOpen={setPanelId} jumpTo={jump} onContextLost={failSpiral} />
            </Suspense>
          </SpiralBoundary>
        </div>
      ) : (
        <ListView />
      )}
      <Panel sectionId={panelId} onClose={closePanel} />
      <MenuDrawer open={menuOpen} onClose={closeMenu} onSelect={selectFromMenu} />
    </div>
  )
}
