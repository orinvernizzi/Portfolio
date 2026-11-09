import type { ReactNode } from 'react'

export function Chip({ children, accent = false }: { children: ReactNode; accent?: boolean }) {
  return (
    <li
      className={`list-none rounded-full border px-3.5 py-1.5 text-sm ${accent ? 'border-accent bg-accent text-ink' : 'border-line bg-chip text-fg'}`}
    >
      {children}
    </li>
  )
}

export function ChipList({ items, label }: { items: string[]; label?: string }) {
  return (
    <ul className="m-0 flex flex-wrap gap-2 p-0" aria-label={label}>
      {items.map((item) => (
        <Chip key={item}>{item}</Chip>
      ))}
    </ul>
  )
}

interface ButtonLinkProps {
  href: string
  children: ReactNode
  primary?: boolean
  download?: boolean
  external?: boolean
}

export function ButtonLink({ href, children, primary = false, download = false, external = false }: ButtonLinkProps) {
  return (
    <a
      href={href}
      download={download || undefined}
      target={external ? '_blank' : undefined}
      rel={external ? 'noopener noreferrer' : undefined}
      className={`inline-flex min-h-11 items-center gap-2 rounded-full px-5 text-sm font-medium no-underline transition-colors ${primary ? 'bg-accent text-ink hover:bg-white/85' : 'border border-line text-fg hover:bg-white/5'}`}
    >
      {children}
    </a>
  )
}

export function Icon({ name }: { name: 'download' | 'arrow' | 'pin' | 'globe' | 'close' }) {
  const paths: Record<string, string> = {
    download: 'M12 3v12m0 0-4-4m4 4 4-4M5 20h14',
    arrow: 'M7 17 17 7M9 7h8v8',
    pin: 'M12 21s-7-6.2-7-11a7 7 0 1 1 14 0c0 4.8-7 11-7 11Zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-9-9h18M12 3c2.5 2.7 3.8 5.7 3.8 9s-1.3 6.3-3.8 9c-2.5-2.7-3.8-5.7-3.8-9S9.500 5.700 12 3Z',
    close: 'M6 6l12 12M18 6 6 18',
  }
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      <path d={paths[name]} />
    </svg>
  )
}

// Original-colour logos on transparent backgrounds. `h` is the image height.
export const LOGOS = {
  itti: { src: '/img/logos/itti.svg', h: 'h-8' },
  marietta: { src: '/img/logos/marietta.svg', h: 'h-10' },
  cambridge: { src: '/img/logos/cambridge.png', h: 'h-8' },
  cristorey: { src: '/img/logos/cristorey.png', h: 'h-10' },
  techo: { src: '/img/logos/techo.png', h: 'h-8' },
} as const

export function LogoChip({ logo, alt }: { logo: keyof typeof LOGOS; alt: string }) {
  const l = LOGOS[logo]
  // Soft light plate so dark and blue logos stay readable on the black site.
  return (
    <span className="inline-flex rounded-[10px] bg-[#f4f4f5] p-1.5">
      <img src={l.src} alt={alt} className={`block ${l.h} w-auto max-w-[200px] object-contain`} loading="lazy" />
    </span>
  )
}
