import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useContent, useLang } from '../lib/content'
import { highlight, nodeIdOf, readDiagram, type DiagramGraph } from '../lib/diagramGraph'
import { useFocusTrap } from '../lib/useFocusTrap'
import { usePresence } from '../lib/usePresence'

// A project picture opened big, with zoom. Diagrams (.svg) are also explorable: tap a box to light it
// up with its arrows and read its note. Notes: diagramNotes in src/content/projects.json.
// Labels (zoom, hint): ui.zoom* and ui.diagram* in src/content/interface.json. Highlight look: .dv-* in effects.css.

// ---- Knobs ----
const MIN_TEXT_PX = 14 // diagram text never shrinks below this at the starting zoom (it scrolls instead)
const DIAGRAM_TEXT_PX = 18 // font size the diagrams are drawn with (build-mermaid.mjs)
const ZOOM_STEP = 1.25
const MAX_ZOOM = 3
const PAD = 12 // space around the picture inside the scroll area

const svgCache = new Map<string, Promise<string>>()
function loadSvg(url: string) {
  if (!svgCache.has(url)) {
    const p = fetch(url).then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
    p.catch(() => svgCache.delete(url))
    svgCache.set(url, p)
  }
  return svgCache.get(url)!
}

interface Props {
  open: boolean
  onClose: () => void
  id: string
  title: string
  alt: string
  photo: boolean
  width: number
  height: number
}

export function DiagramViewer(props: Props) {
  const { mounted, active } = usePresence(props.open)
  if (!mounted) return null
  return createPortal(<Viewer {...props} active={active} />, document.body)
}

function Viewer({ open, onClose, id, title, alt, photo, width, height, active }: Props & { active: boolean }) {
  const { ui, diagramNotes } = useContent()
  const lang = useLang()
  const ref = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const host = useRef<HTMLDivElement>(null)
  const graph = useRef<DiagramGraph | null>(null)
  const pin = useRef<string | null>(null)
  const hover = useRef<string | null>(null)
  const fromPointer = useRef(false)
  const center = useRef<[number, number] | null>(null)
  const [svgReady, setSvgReady] = useState(false)
  const [box, setBox] = useState({ w: 0, h: 0 })
  const [zoom, setZoom] = useState(1)
  const [shown, setShown] = useState<string | null>(null)
  const src = `/project-pictures/${id}.${lang}.${photo ? 'webp' : 'svg'}`
  useFocusTrap(ref, open, onClose)

  useEffect(() => {
    const html = document.documentElement
    const before = html.style.overflow
    html.style.overflow = 'hidden'
    return () => {
      html.style.overflow = before
    }
  }, [])

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(() => setBox({ w: el.clientWidth, h: el.clientHeight }))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // Inject the diagram once; React never renders children into `host`, so it leaves it alone.
  useEffect(() => {
    if (photo) return
    let live = true
    loadSvg(src)
      .then((text) => {
        const el = host.current
        if (!live || !el) return
        el.innerHTML = text
        const svg = el.querySelector('svg')
        if (!svg) return
        svg.removeAttribute('width')
        svg.removeAttribute('height')
        svg.setAttribute('role', 'group')
        svg.setAttribute('aria-label', alt)
        svg.classList.add('dv-svg')
        svg.style.cssText = 'display:block;width:100%;height:auto'
        const g = readDiagram(svg)
        g.nodes.forEach((node, nodeId) => {
          node.setAttribute('tabindex', '0')
          node.setAttribute('role', 'button')
          node.setAttribute('aria-label', g.labels.get(nodeId) ?? nodeId)
        })
        graph.current = g
        setSvgReady(true)
      })
      .catch(() => live && setSvgReady(false))
    return () => {
      live = false
    }
  }, [src, alt, photo])

  const show = () => {
    const next = hover.current ?? pin.current
    if (graph.current) highlight(graph.current, next)
    setShown(next)
  }
  const nodeAt = (target: EventTarget) => {
    const el = (target as Element).closest?.('.node')
    return el ? nodeIdOf(el) ?? null : null
  }
  const toggle = (nodeId: string | null) => {
    pin.current = nodeId !== null && pin.current !== nodeId ? nodeId : null
    show()
  }

  // Fit the picture to the window, but keep diagram text readable; zoom multiplies that.
  const ratio = width / height
  const fitW = Math.max(0, Math.min(box.w - PAD * 2, (box.h - PAD * 2) * ratio))
  const baseW = photo ? fitW : Math.max(fitW, (width * MIN_TEXT_PX) / DIAGRAM_TEXT_PX)
  const minZoom = Math.min(1, fitW / baseW)
  const contentW = Math.round(baseW * zoom)

  const zoomTo = (next: number) => {
    const el = scroller.current
    if (el) center.current = [(el.scrollLeft + el.clientWidth / 2) / el.scrollWidth, (el.scrollTop + el.clientHeight / 2) / el.scrollHeight]
    setZoom(Math.min(MAX_ZOOM, Math.max(minZoom, next)))
  }
  // Keep the same spot in the middle after a zoom.
  useLayoutEffect(() => {
    const el = scroller.current
    const c = center.current
    if (!el || !c) return
    center.current = null
    el.scrollLeft = c[0] * el.scrollWidth - el.clientWidth / 2
    el.scrollTop = c[1] * el.scrollHeight - el.clientHeight / 2
  }, [contentW])

  const note = shown ? diagramNotes[id]?.[shown] : undefined
  const label = shown ? graph.current?.labels.get(shown) : undefined
  const roundButton = 'reel-btn flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/20 bg-black/50 text-white transition-colors hover:bg-white/15 aria-disabled:opacity-40 aria-disabled:hover:bg-black/50'

  return (
    <div
      ref={ref}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      tabIndex={-1}
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 transition-opacity duration-300 sm:p-6 ${active ? 'opacity-100' : 'opacity-0'}`}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} aria-hidden="true" />
      <div className={`relative flex h-full max-h-[960px] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-line bg-black shadow-[0_30px_80px_rgba(0,0,0,0.75)] transition duration-300 ease-out ${active ? 'dialog-open' : 'dialog-enter'}`}>
        <header className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-4 py-2 md:px-6">
          <h2 className="m-0 min-w-0 truncate text-base font-semibold tracking-tight md:text-lg">{title}</h2>
          <button type="button" onClick={onClose} aria-label={ui.close} className={roundButton}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </header>

        <div
          ref={scroller}
          className="flex min-h-0 flex-1 overflow-auto overscroll-contain bg-[#0c0c0c] [touch-action:pan-x_pan-y_pinch-zoom]"
          onPointerDown={() => (fromPointer.current = true)}
          onPointerOver={(e) => {
            if (e.pointerType !== 'mouse') return
            hover.current = nodeAt(e.target)
            show()
          }}
          onPointerLeave={(e) => {
            if (e.pointerType !== 'mouse') return
            hover.current = null
            show()
          }}
          onClick={(e) => {
            fromPointer.current = false
            toggle(nodeAt(e.target))
          }}
          onFocus={(e) => {
            const nodeId = nodeAt(e.target)
            if (nodeId && !fromPointer.current) {
              pin.current = nodeId
              show()
            }
            fromPointer.current = false
          }}
          onKeyDown={(e) => {
            const nodeId = nodeAt(e.target)
            if (!nodeId || (e.key !== 'Enter' && e.key !== ' ')) return
            e.preventDefault()
            toggle(nodeId)
          }}
        >
          <div className="relative m-auto shrink-0" style={{ padding: PAD, width: contentW ? contentW + PAD * 2 : undefined }}>
            {(photo || !svgReady) && <img src={src} alt={alt} width={width} height={height} draggable={false} className="block h-auto w-full select-none" />}
            {!photo && <div ref={host} hidden={!svgReady} />}
          </div>
        </div>

        <footer className="flex shrink-0 flex-col gap-3 border-t border-line px-4 py-3 sm:flex-row sm:items-center md:px-6">
          {!photo && (
            <p aria-live="polite" className="m-0 min-h-[2.75rem] flex-1 text-[15px] leading-snug text-fg/90">
              {shown ? (
                <>
                  <strong className="font-semibold text-fg">{label}</strong>
                  {note && <span className="text-fg/85"> · {note}</span>}
                </>
              ) : (
                <span className="text-muted">{svgReady ? ui.diagramHint : ''}</span>
              )}
            </p>
          )}
          <div className="flex items-center gap-2 sm:ml-auto">
            <button type="button" onClick={() => zoomTo(zoom / ZOOM_STEP)} aria-disabled={zoom <= minZoom + 0.001} aria-label={ui.zoomOut} className={roundButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14" />
              </svg>
            </button>
            <button type="button" onClick={() => zoomTo(1)} aria-disabled={zoom === 1} className="reel-btn h-11 shrink-0 rounded-full border border-white/20 bg-black/50 px-4 text-sm font-medium text-white transition-colors hover:bg-white/15 aria-disabled:opacity-40 aria-disabled:hover:bg-black/50">
              {ui.zoomReset}
            </button>
            <button type="button" onClick={() => zoomTo(zoom * ZOOM_STEP)} aria-disabled={zoom >= MAX_ZOOM} aria-label={ui.zoomIn} className={roundButton}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
                <path d="M5 12h14M12 5v14" />
              </svg>
            </button>
          </div>
        </footer>
      </div>
    </div>
  )
}
