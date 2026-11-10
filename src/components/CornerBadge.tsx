import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'
import { PHOTOS, preloadPhotos } from './badgePhotos'
import { PhotoReel } from './PhotoReel'

const CYCLE_MS = 3200
const LOOP_S = 12
const GAP = 12 // distance between the tile edge and the text baseline
const TILE_W = 280
const TILE_H = 158
const W = TILE_W + 2 * GAP
const H = TILE_H + 2 * GAP
const R = 30
const PERIMETER = 2 * (W - 2 * R) + 2 * (H - 2 * R) + 2 * Math.PI * R
// Clockwise rounded rectangle from the top edge, so the text reads upright on the outside.
const RING_PATH =
  `M ${R} 0 H ${W - R} A ${R} ${R} 0 0 1 ${W} ${R} V ${H - R} A ${R} ${R} 0 0 1 ${W - R} ${H} ` +
  `H ${R} A ${R} ${R} 0 0 1 0 ${H - R} V ${R} A ${R} ${R} 0 0 1 ${R} 0 Z`
// Text covers two loops and slides by exactly one, so the last frame equals the first.
const REPEATS = 6

interface Props {
  ringText: string
  label: string
  active: boolean
  onReel?: (open: boolean) => void
}

export function CornerBadge({ ringText, label, active, onReel }: Props) {
  const [index, setIndex] = useState(0)
  const [reach, setReach] = useState(0) // photos past this point are not fetched until the tile shows them
  const [reelOpen, setReelOpen] = useState(false)
  const trigger = useRef<HTMLButtonElement>(null)
  const reduced = useReducedMotion()
  const count = PHOTOS.length
  const cycling = count > 1 && active && !reelOpen && !reduced
  if (index > reach) setReach(index)

  useEffect(() => {
    if (!cycling) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), CYCLE_MS)
    return () => window.clearTimeout(id)
  }, [index, cycling, count])

  useEffect(() => {
    onReel?.(reelOpen)
  }, [reelOpen, onReel])

  const closeReel = () => {
    setReelOpen(false)
    trigger.current?.focus()
  }

  const face = (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        width={W}
        height={H}
        className="pointer-events-none absolute -left-3 -top-3 overflow-visible"
        aria-hidden="true"
      >
        <defs>
          <path id="badge-ring-path" d={RING_PATH} />
        </defs>
        <text fill="#fafafa" fontSize="18" fontWeight="500" style={{ letterSpacing: '-0.04em' }}>
          <textPath href="#badge-ring-path" startOffset={reduced ? 0 : -PERIMETER} textLength={2 * PERIMETER} lengthAdjust="spacing">
            {ringText.repeat(REPEATS)}
            {!reduced && (
              <animate attributeName="startOffset" from={-PERIMETER} to={0} dur={`${LOOP_S}s`} repeatCount="indefinite" />
            )}
          </textPath>
        </text>
      </svg>
      <span className="absolute inset-0 block overflow-hidden rounded-[20px] bg-neutral-800">
        {PHOTOS.map((src, i) =>
          i > reach ? null : (
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover object-right-top transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
          ),
        )}
      </span>
    </>
  )

  // The fixed point sits 30px from the corner; the tile hangs off it so the viewport crops it.
  const tile = `badge-tile pointer-events-auto absolute -left-[140px] -top-10 block h-[158px] w-[280px] rounded-[20px] p-0 border-0 bg-transparent`
  const wrap = `pointer-events-none absolute bottom-[30px] left-[30px] z-20 hidden h-0 w-0 md:block transition-opacity duration-300${active ? '' : ' invisible opacity-0'}`

  return (
    <div className={wrap}>
      {count > 0 ? (
        <button
          ref={trigger}
          type="button"
          aria-label={label}
          aria-haspopup="dialog"
          onPointerEnter={preloadPhotos}
          onFocus={preloadPhotos}
          onClick={() => {
            preloadPhotos()
            setReelOpen(true)
          }}
          className={tile}
        >
          {face}
        </button>
      ) : (
        <div className={tile} aria-hidden="true">
          {face}
        </div>
      )}
      <PhotoReel open={reelOpen} onClose={closeReel} />
    </div>
  )
}
