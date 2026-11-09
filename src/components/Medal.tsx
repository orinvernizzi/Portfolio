import { useId } from 'react'

const TONES = {
  silver: { from: '#c9ced6', to: '#8d949e', rim: '#e8ebef', ink: '#6c727c' },
  bronze: { from: '#cd8b52', to: '#8a5a2b', rim: '#e3b184', ink: '#7a4d22' },
} as const

// Hand-made medal: ribbon, metallic disc, rim and an inner ring.
export function Medal({ kind, className = 'h-16 w-12' }: { kind: keyof typeof TONES; className?: string }) {
  const id = useId()
  const t = TONES[kind]
  return (
    <svg viewBox="0 0 48 64" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-d`} x1="0.2" y1="0" x2="0.8" y2="1">
          <stop offset="0" stopColor={t.from} />
          <stop offset="1" stopColor={t.to} />
        </linearGradient>
      </defs>
      <path d="M13 0h10l6 26h-10z" fill="#4a4e56" />
      <path d="M35 0H25l-6 26h10z" fill="#2f3238" />
      <circle cx="24" cy="42" r="19" fill={`url(#${id}-d)`} stroke={t.rim} strokeWidth="1.5" />
      <circle cx="24" cy="42" r="13.5" fill="none" stroke={t.ink} strokeOpacity="0.55" strokeWidth="1.2" />
      <path d="M17 33a10 10 0 0 1 12-4" fill="none" stroke="#fff" strokeOpacity="0.5" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}
