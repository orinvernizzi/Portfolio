import { useEffect, useState } from 'react'

// Every image dropped in src/assets/badge/ shows up here, sorted by file name.
const PHOTOS = Object.entries(
  import.meta.glob<string>('../assets/badge/*.{jpg,jpeg,png,webp}', { eager: true, query: '?url', import: 'default' }),
)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, url]) => url)

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
}

function useReducedMotion() {
  const [reduced, setReduced] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setReduced(mq.matches)
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return reduced
}

export function CornerBadge({ ringText, label, active }: Props) {
  const [index, setIndex] = useState(0)
  const reduced = useReducedMotion()
  const count = PHOTOS.length
  const interactive = count > 1

  useEffect(() => {
    if (!active || !interactive || reduced) return
    const id = window.setTimeout(() => setIndex((i) => (i + 1) % count), CYCLE_MS)
    return () => window.clearTimeout(id)
  }, [index, active, interactive, reduced, count])

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
        {PHOTOS.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            draggable={false}
            decoding="async"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${i === index ? 'opacity-100' : 'opacity-0'}`}
          />
        ))}
      </span>
    </>
  )

  // The fixed point sits 30px from the corner; the tile hangs off it so the viewport crops it.
  const tile = `badge-tile pointer-events-auto absolute -left-[140px] -top-10 block h-[158px] w-[280px] rounded-[20px] p-0 border-0 bg-transparent`
  const wrap = `pointer-events-none absolute bottom-[30px] left-[30px] z-20 hidden h-0 w-0 md:block transition-opacity duration-300${active ? '' : ' invisible opacity-0'}`

  return (
    <div className={wrap}>
      {interactive ? (
        <button type="button" aria-label={label} onClick={() => setIndex((i) => (i + 1) % count)} className={tile}>
          {face}
        </button>
      ) : (
        <div className={tile} aria-hidden="true">
          {face}
        </div>
      )}
    </div>
  )
}
