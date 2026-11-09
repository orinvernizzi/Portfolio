import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { TECH_ICONS } from '../lib/techIcons'
import { Chip } from './ui'

// One logo tile. The name tooltip shows on hover, keyboard focus and tap; Esc closes it first, wherever focus is.
function TechTile({ name }: { name: string }) {
  const icon = TECH_ICONS[name]
  const [open, setOpen] = useState(false)
  const [shift, setShift] = useState(0)
  const rootRef = useRef<HTMLLIElement>(null)
  const tipRef = useRef<HTMLSpanElement>(null)
  const touched = useRef(false)

  // Keep the tooltip inside the dialog (or viewport) edges.
  useLayoutEffect(() => {
    const tip = tipRef.current
    if (!open || !tip) return setShift(0)
    const box = rootRef.current?.closest('[role="dialog"]')?.getBoundingClientRect()
    const min = (box?.left ?? 0) + 6
    const max = (box?.right ?? document.documentElement.clientWidth) - 6
    const r = tip.getBoundingClientRect()
    setShift(r.left < min ? min - r.left : r.right > max ? max - r.right : 0)
  }, [open])

  // While open: a tap outside closes it, and Esc closes only the tooltip, not the panel.
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => !rootRef.current?.contains(e.target as Node) && setOpen(false)
    const esc = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc, true)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc, true)
    }
  }, [open])

  if (!icon) return <Chip>{name}</Chip>

  return (
    <li ref={rootRef} className="relative list-none" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        aria-label={icon.label}
        onPointerDown={(e) => (touched.current = e.pointerType === 'touch')}
        onClick={() => touched.current && setOpen((o) => !o)}
        onFocus={() => !touched.current && setOpen(true)} // a tap opens via click, so focus must not race it
        onBlur={() => {
          touched.current = false
          setOpen(false)
        }}
        className="flex h-12 w-12 items-center justify-center rounded-xl border border-line bg-black/70 transition duration-200 hover:-translate-y-0.5 hover:border-[#3d3d3d] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
      >
        <img src={`/icons/${icon.slug}.svg`} alt="" width={26} height={26} loading="lazy" className="h-[26px] w-[26px]" />
      </button>
      {open && (
        <span
          ref={tipRef}
          aria-hidden="true"
          style={{ transform: `translateX(calc(-50% + ${shift}px))` }}
          className="pointer-events-none absolute bottom-full left-1/2 z-20 mb-2 whitespace-nowrap rounded-md border border-line bg-[#111] px-2.5 py-1.5 text-xs font-medium text-fg shadow-lg"
        >
          {icon.label}
        </span>
      )}
    </li>
  )
}

export function TechGrid({ items, label }: { items: string[]; label: string }) {
  return (
    <ul className="m-0 flex flex-wrap gap-2.5 p-0" aria-label={label}>
      {items.map((item) => (
        <TechTile key={item} name={item} />
      ))}
    </ul>
  )
}
