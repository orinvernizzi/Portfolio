import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { paintCard } from './cardArt'
import { CARD_H, CARD_W } from './cardShared'
import { ringDelta, type SpiralProgress } from '../lib/useScrollProgress'

export const RADIUS = 6.2
export const STEP = 0.4
export const RISE = 1.05
const WIDTH = 2.55
const HEIGHT = (WIDTH * CARD_H) / CARD_W

// Slightly curved plane: edges bend away from the viewer.
const GEOMETRY = (() => {
  const g = new THREE.PlaneGeometry(WIDTH, HEIGHT, 20, 1)
  const pos = g.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    pos.setZ(i, -x * x * 0.1)
  }
  g.computeVertexNormals()
  return g
})()

interface Props {
  index: number
  id: string
  title: string
  total: number
  chips: string[]
  near: boolean
  progress: SpiralProgress
  reducedMotion: boolean
  onOpen: (index: number) => void
}

function useCardTexture(enabled: boolean, id: string, title: string, index: number, total: number, chips: string[]) {
  const [texture, setTexture] = useState<THREE.CanvasTexture | null>(null)

  useEffect(() => {
    if (!enabled) return
    const canvas = document.createElement('canvas')
    canvas.width = CARD_W
    canvas.height = CARD_H
    const t = new THREE.CanvasTexture(canvas)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 8
    setTexture(t)
    return () => t.dispose()
  }, [enabled])

  const chipKey = chips.join('|')
  useEffect(() => {
    if (!texture) return
    void paintCard(
      texture.image as HTMLCanvasElement,
      { id, title, index, total, chips: chipKey ? chipKey.split('|') : [] },
      () => {
        texture.needsUpdate = true
      },
    )
  }, [texture, id, title, index, total, chipKey])

  return texture
}

export function Card3D({ index, id, title, total, chips, near, progress, reducedMotion, onOpen }: Props) {
  const [seen, setSeen] = useState(near)
  if (near && !seen) setSeen(true)
  const texture = useCardTexture(seen, id, title, index, total, chips)

  const root = useRef<THREE.Group>(null)
  const inner = useRef<THREE.Group>(null)
  const material = useRef<THREE.MeshBasicMaterial>(null)
  const hover = useRef(false)
  const scale = useRef(1)
  const bob = useRef(0)

  const tilt = (index % 2 ? 1 : -1) * 0.06

  useEffect(() => () => void (document.body.style.cursor = ''), [])

  useFrame((_state, dt) => {
    // Wrapped offset from the front card, so the spiral reads as a ring.
    const o = ringDelta(progress.current.current, index, total)
    const d = Math.abs(o)
    const edge = Math.min(5.2, total / 2) // cards fade out before the seam
    if (root.current) {
      root.current.visible = d < edge
      root.current.position.set(RADIUS * Math.sin(o * STEP), -o * RISE, RADIUS * Math.cos(o * STEP))
      root.current.rotation.y = o * STEP
    }
    if (material.current) {
      material.current.color.setScalar(Math.min(1, Math.max(0.16, 1 - d * 0.24)))
      material.current.opacity = Math.min(1, Math.max(0, (edge - d) / 1.3))
    }
    bob.current += dt // own clock: R3F resets its clock when the loop resumes
    scale.current += ((hover.current ? 1.045 : 1) - scale.current) * (1 - Math.exp(-10 * dt))
    if (inner.current) {
      inner.current.scale.setScalar(scale.current)
      inner.current.position.y = reducedMotion ? 0 : Math.sin(bob.current * 0.8 + index * 1.7) * 0.07
    }
  })

  return (
    <group ref={root} visible={false}>
      <group ref={inner} rotation={[-0.05, 0, tilt]}>
        <mesh
          geometry={GEOMETRY}
          onClick={(e) => {
            if (e.delta > 8) return
            e.stopPropagation()
            onOpen(index)
          }}
          onPointerOver={(e) => {
            e.stopPropagation()
            hover.current = true
            document.body.style.cursor = 'pointer'
          }}
          onPointerOut={() => {
            hover.current = false
            document.body.style.cursor = ''
          }}
        >
          <meshBasicMaterial
            key={texture ? 'tex' : 'blank'}
            ref={material}
            map={texture}
            color={texture ? '#ffffff' : '#000000'}
            transparent
            alphaTest={0.02}
            toneMapped={false}
          />
        </mesh>
      </group>
    </group>
  )
}
