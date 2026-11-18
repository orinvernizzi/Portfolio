// Panel background in plain CSS (no WebGL, so a panel opens instantly): black, a perspective grid floor that
// fades into the dark at the horizon, and a soft vignette. Same look the spiral used to have.
// Knobs: LINE / MAJOR (grid colours), CELL (grid size in px), ANCHOR (where the horizon sits), tilt in `rotateX`.
const LINE = '#1a1a1a'
const MAJOR = '#2e2e2e'
const CELL = 40
const ANCHOR = 48 // % from the top where the tilted plane's centre sits; the horizon is a little above it

const grid = (color: string, width: number) =>
  `linear-gradient(to right, ${color} ${width}px, transparent ${width}px), linear-gradient(to bottom, ${color} ${width}px, transparent ${width}px)`

export function GridBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden bg-black" aria-hidden="true">
      <div className="absolute inset-0" style={{ perspective: '420px', perspectiveOrigin: `50% ${ANCHOR}%` }}>
        <div
          className="absolute left-1/2 h-[6000px] w-[6000px] -translate-x-1/2"
          style={{
            top: `${ANCHOR}%`,
            marginTop: -3000,
            transform: 'rotateX(72deg)',
            backgroundImage: `${grid(MAJOR, 2)}, ${grid(LINE, 2)}`,
            backgroundSize: `${CELL * 4}px ${CELL * 4}px, ${CELL}px ${CELL}px`,
            backgroundPosition: 'center',
          }}
        />
      </div>
      {/* fog: the far floor melts into black */}
      <div
        className="absolute inset-0"
        style={{ backgroundImage: `linear-gradient(to bottom, #000 10%, rgb(0 0 0 / 0.8) 20%, transparent 58%)` }}
      />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.7))]" />
    </div>
  )
}
