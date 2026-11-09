import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Card3D, RADIUS } from './Card3D'
import { SpiralHud } from './SpiralHud'
import { useContent } from '../lib/content'
import { mod, ringDelta, useScrollProgress, type SpiralProgress } from '../lib/useScrollProgress'

interface Props {
  enabled: boolean
  onOpen: (id: string) => void
  jumpTo: { id: string; n: number } | null
  onContextLost: () => void
}

const BG = '#000000'
const CAMERA_Z = 14.5
// Distance needed to fit the front card (plus margin) in a narrow viewport.
const FIT_WIDTH_FACTOR = 4.77

function Scene({ progress, onOpen }: { progress: SpiralProgress; onOpen: (index: number) => void }) {
  const c = useContent()
  const reduced = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, [])
  const chips = useMemo(() => c.skills.groups.flatMap((g) => g.items), [c])
  const total = c.sections.length

  useFrame((state, dt) => {
    const p = progress
    p.current.current += (p.target.current - p.current.current) * (1 - Math.exp(-6 * dt))
    const cam = state.camera
    const aspect = state.size.width / state.size.height
    cam.position.z = aspect < 0.6 ? Math.max(CAMERA_Z, RADIUS + FIT_WIDTH_FACTOR / aspect) : CAMERA_Z
    cam.position.x += (state.pointer.x * 0.45 - cam.position.x) * 0.04
    cam.position.y += (1.1 + state.pointer.y * 0.2 - cam.position.y) * 0.04
    cam.lookAt(0, -0.35, 0)
  })

  return (
    <>
      <color attach="background" args={[BG]} />
      <fog attach="fog" args={[BG, 13, 30]} />
      <gridHelper args={[80, 80, '#262626', '#111111']} position={[0, -4.6, 0]} />
      <group rotation={[0, 0, 0.07]}>
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
              onOpen={onOpen}
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
  const progress = useScrollProgress(c.sections.length, enabled, root)
  const { goTo, index } = progress

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

  const open = (i: number) => {
    goTo(i)
    onOpen(c.sections[i].id)
  }

  useEffect(() => {
    if (!enabled) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && document.activeElement === document.body) open(mod(Math.round(progress.target.current), c.sections.length))
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [enabled, c])

  return (
    <main ref={root} className="absolute inset-0 touch-none select-none">
      <h1 className="sr-only">{c.meta.name}</h1>
      <Canvas
        flat
        frameloop={enabled ? 'always' : 'never'} // idle while a panel or the menu covers the spiral
        dpr={[1, 2]}
        camera={{ fov: 36, position: [0, 1.1, CAMERA_Z], near: 0.1, far: 80 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        aria-hidden="true"
        onCreated={({ gl }) =>
          gl.domElement.addEventListener('webglcontextlost', () => mounted.current && onContextLost())
        }
      >
        <Scene progress={progress} onOpen={open} />
      </Canvas>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.55))]" />
      <SpiralHud sections={c.sections} index={index} hint={c.ui.scrollHint} menuLabel={c.ui.menu} onJump={goTo} onOpen={open} />
    </main>
  )
}
