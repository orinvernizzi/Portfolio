import { useEffect, useRef, useState } from 'react'
import { useReducedMotion } from '../lib/useReducedMotion'
import { PHOTOS, preloadPhotos } from './badgePhotos'
import { PhotoReel } from './PhotoReel'

// The small photo tile in the bottom-left corner of the spiral, with text running around it.
// Photos come from src/spiral/reel-photos/ (see badgePhotos.ts). The ring text is ui.badgeRing in
// src/content/interface.json. The tilt (-15deg) and the hover wobble are in src/styles/effects.css (.badge-tile).

// ---- Knobs: change these numbers ----
const SECONDS_PER_PHOTO = 3.2 // how long the tile shows one photo before fading to the next
const RING_SECONDS_PER_TURN = 12 // time for the ring text to travel once around (smaller = faster)
const RING_FONT_SIZE = 18 // size of the ring text, in px
const TILE_W = 280 // size of the photo tile, in px (the tile is about 16:9)
const TILE_H = 158
const TILE_TOP = 40 // how far the tile sticks up above the fixed corner point, in px
const GAP = 12 // space between the tile edge and the ring text
const R = 30 // corner roundness of the ring path

// ---- Derived from the knobs above, no need to edit ----
const W = TILE_W + 2 * GAP
const H = TILE_H + 2 * GAP
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
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), SECONDS_PER_PHOTO * 1000)
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
        className="pointer-events-none absolute overflow-visible"
        style={{ left: -GAP, top: -GAP }}
        aria-hidden="true"
      >
        <defs>
          <path id="badge-ring-path" d={RING_PATH} />
        </defs>
        <text fill="#fafafa" fontSize={RING_FONT_SIZE} fontWeight="500" style={{ letterSpacing: '-0.04em' }}>
          <textPath href="#badge-ring-path" startOffset={reduced ? 0 : -PERIMETER} textLength={2 * PERIMETER} lengthAdjust="spacing">
            {ringText.repeat(REPEATS)}
            {!reduced && (
              <animate attributeName="startOffset" from={-PERIMETER} to={0} dur={`${RING_SECONDS_PER_TURN}s`} repeatCount="indefinite" />
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
  const tile = `badge-tile pointer-events-auto absolute block rounded-[20px] p-0 border-0 bg-transparent`
  const tileBox = { left: -TILE_W / 2, top: -TILE_TOP, width: TILE_W, height: TILE_H }
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
          style={tileBox}
        >
          {face}
        </button>
      ) : (
        <div className={tile} style={tileBox} aria-hidden="true">
          {face}
        </div>
      )}
      <PhotoReel open={reelOpen} onClose={closeReel} />
    </div>
  )
}
