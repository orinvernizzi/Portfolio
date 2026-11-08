import { useContent } from '../../lib/content'

// Illustration only: a made-up agent flow, no company data.
export function OrquestadorArt({ label }: { label: string }) {
  const t = useContent().art.orquestador
  const node = (x: number, y: number, w: number, text: string, hot = false) => (
    <g>
      <rect x={x} y={y} width={w} height={36} rx={18} fill={hot ? '#d9f24f' : '#1f1f1d'} stroke={hot ? 'none' : '#3a3a35'} />
      <text x={x + w / 2} y={y + 23} textAnchor="middle" fontSize={13} fontWeight={600} fill={hot ? '#0a0a0a' : '#e8e6df'}>
        {text}
      </text>
    </g>
  )
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label={label} className="block h-auto w-full" fontFamily="inherit">
      <rect width="400" height="240" fill="#101010" />
      <g stroke="#34342f" strokeWidth="2" fill="none" strokeLinecap="round">
        <path d="M96 120H132" />
        <path d="M222 120C246 120 244 62 268 62H288" />
        <path d="M222 120H288" />
        <path d="M222 120C246 120 244 178 268 178H288" />
        <path d="M338 80V102M338 138V160" />
      </g>
      <g fill="#d9f24f">
        <circle cx="114" cy="120" r="4" />
        <circle cx="255" cy="91" r="4" />
        <circle cx="338" cy="91" r="4" />
      </g>
      {node(16, 102, 80, t.question)}
      {node(132, 102, 90, t.planner, true)}
      {node(288, 44, 96, t.sql)}
      {node(288, 102, 96, t.analyst)}
      {node(288, 160, 96, t.report)}
      <g fill="#a8a69f" fontSize="11" fontFamily="ui-monospace, monospace">
        <text x="16" y="222">SELECT … FROM …</text>
      </g>
    </svg>
  )
}
