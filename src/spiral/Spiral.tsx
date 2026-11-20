// The 3D spiral menu: cards on a ring, drawn on a transparent canvas over the landscape (src/components/LandscapeLayer.tsx).
// The dark vignette div near the bottom keeps the edges calm; fog (BG) darkens far cards. See docs/flowcharts/spiral.md.
import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import type * as THREE from 'three'
import { Card3D, HEIGHT, RADIUS, WIDTH } from './Card3D'
import { screenRect, type PanelOrigin, type ScreenRect } from './screenRect'
import { SpiralHud } from './SpiralHud'
import { useContent } from '../lib/content'
import { mod, ringDelta, useScrollProgress, type SpiralProgress } from '../lib/useScrollProgress'

interface Props {
  enabled: boolean
  onOpen: (id: string, origin?: PanelOrigin) => void
  jumpTo: { id: string; n: number } | null
  onContextLost: () => void
}

const BG = '#000000'
const CAMERA_Z = 14.5
// Distance needed to fit the front card (plus margin) in a narrow viewport.
const FIT_WIDTH_FACTOR = 4.77
// How long the spiral keeps drawing after it's covered: the glide below (exp(-6t)) is ~99% there by then.
const GLIDE_MS = 750

function Scene({ progress, onOpen }: { progress: SpiralProgress; onOpen: (index: number, origin?: PanelOrigin) => void }) {
  const c = useContent()
  const { camera, gl } = useThree()
  const front = useRef<THREE.Group>(null) // an empty stand-in at the front card's spot, so the panel can close back into it
  const openFrom = (i: number, from: ScreenRect) =>
    onOpen(i, front.current ? { from, back: screenRect(front.current, WIDTH, HEIGHT, camera, gl.domElement) } : undefined)
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const chips = useMemo(() => c.skills.groups.flatMap((g) => g.items), [c])
  const total = c.sections.length

  useFrame((state, dt) => {
    const p = progress
    p.current.current += (p.target.current - p.current.current) * (1 - Math.exp(-6 * dt))
    const cam = state.camera
    const aspect = state.size.width / state.size.height
    cam.position.z = aspect < 0.6 ? Math.max(CAMERA_Z, RADIUS + FIT_WIDTH_FACTOR / aspect) : CAMERA_Z
    const follow = 1 - Math.exp(-2.5 * dt) // same feel at 60, 120 or 144 fps
    cam.position.x += (state.pointer.x * 0.45 - cam.position.x) * follow
    cam.position.y += (1.1 + state.pointer.y * 0.2 - cam.position.y) * follow
    cam.lookAt(0, -0.35, 0)
  })

  return (
    <>
      <fog attach="fog" args={[BG, 13, 30]} />
      <group rotation={[0, 0, 0.07]}>
        <group ref={front} position={[0, 0, RADIUS]} />
        <group>
          {c.sections.map((s, i) => (
            <Card3D
              key={s.id}
              index={i}
              id={s.id}
              title={s.title}
              total={total}
              chips={s.id === 'skills' ? chips : []}
              near={Math.abs(ringDelta(i, progress.index, total)) <= 4}
              progress={progress}
              reducedMotion={reduced}
              onOpen={openFrom}
            />
          ))}
        </group>
      </group>
    </>
  )
}

export default function Spiral({ enabled, onOpen, jumpTo, onContextLost }: Props) {
  const c = useContent()
  const root = useRef<HTMLElement>(null)
  const [reelOpen, setReelOpen] = useState(false)
  const live = enabled && !reelOpen // the photo reel locks the spiral like a panel does
  const progress = useScrollProgress(c.sections.length, live, root)
  const { goTo, index } = progress

  // Keep drawing a moment after the spiral is covered, so a card picked from the side finishes
  // gliding to the front instead of freezing halfway (and lurching when the panel closes).
  const [drawing, setDrawing] = useState(live)
  useEffect(() => {
    if (live) {
      setDrawing(true)
      return
    }
    const t = window.setTimeout(() => setDrawing(false), GLIDE_MS)
    return () => window.clearTimeout(t)
  }, [live])

  // Unmounting the canvas also fires webglcontextlost; only a loss while mounted is a failure.
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
    }
  }, [])

  useEffect(() => {
    if (!jumpTo) return
    const i = c.sections.findIndex((s) => s.id === jumpTo.id)
    if (i >= 0) goTo(i)
  }, [jumpTo])

  const open = (i: number, origin?: PanelOrigin) => {
    goTo(i)
    onOpen(c.sections[i].id, origin)
  }

  useEffect(() => {
    if (!live) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement === document.body) open(mod(Math.round(progress.target.current), c.sections.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [live, c])

  return (
    <main ref={root} className="absolute inset-0 touch-none select-none">
      <h1 className="sr-only">{c.meta.name}</h1>
      <Canvas
        flat
        frameloop={drawing ? 'always' : 'never'} // idle while a panel, the menu or the reel covers the spiral
        dpr={[1, 1.5]} // same cap as the landscape: two full-screen canvases at 2x is a lot of pixels
        camera={{ fov: 36, position: [0, 1.1, CAMERA_Z], near: 0.1, far: 80 }}
        gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }} // transparent: the landscape canvas shows through
        aria-hidden="true"
        onCreated={({ gl }) =>
          gl.domElement.addEventListener('webglcontextlost', () => mounted.current && onContextLost())
        }
      >
        <Scene progress={progress} onOpen={open} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />
      <SpiralHud sections={c.sections} index={index} hint={c.ui.scrollHint} menuLabel={c.ui.menu} badgeRing={c.ui.badgeRing} badgeLabel={c.ui.badgeLabel} active={enabled} onReel={setReelOpen} onJump={goTo} onOpen={open} />
    </main>
  )
}
