import { useContent } from '../../lib/content'

const BARS = [58, 74, 52, 88, 70, 96, 80]

// Illustration only: invented KPIs.
export function DashboardArt({ label }: { label: string }) {
  const t = useContent().art.dashboard
  const kpi = (x: number, title: string, value: string, delta: string) => (
    <g>
      <rect x={x} y={16} width={112} height={62} rx={10} fill="#1a1a18" stroke="#2b2b28" />
      <text x={x + 12} y={36} fontSize="11" fill="#a8a69f">{title}</text>
      <text x={x + 12} y={62} fontSize="20" fontWeight="700" fill="#f2f0ea">{value}</text>
      <text x={x + 100} y={62} fontSize="11" fontWeight="600" textAnchor="end" fill="#d9f24f">{delta}</text>
    </g>
  )
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label={label} className="block h-auto w-full" fontFamily="inherit">
      <rect width="400" height="240" fill="#101010" />
      {kpi(16, t.transactions, '128k', '+4.2%')}
      {kpi(144, t.active, '52k', '+1.8%')}
      {kpi(272, t.trend, '0.97', '−0.3%')}
      <rect x="16" y="94" width="244" height="130" rx="10" fill="#1a1a18" stroke="#2b2b28" />
      {BARS.map((h, i) => (
        <rect key={i} x={34 + i * 32} y={208 - h} width="20" height={h} rx="4" fill={i === 5 ? '#d9f24f' : '#3a3a35'} />
      ))}
      <rect x="276" y="94" width="108" height="130" rx="10" fill="#1a1a18" stroke="#2b2b28" />
      <path
        d="M290 190L312 168L332 176L352 142L372 120"
        fill="none"
        stroke="#d9f24f"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="372" cy="120" r="4.5" fill="#d9f24f" />
    </svg>
  )
}
