import { useContent } from '../../lib/content'

const FORECAST = [150, 138, 146, 124, 130, 108, 116, 96, 104, 84]
const ACTUAL = [152, 134, 150, 120, 134, 112, 122, 100]

// Illustration only: invented numbers.
export function ForecastArt({ label }: { label: string }) {
  const t = useContent().art.forecast
  const x = (i: number) => 36 + i * 38
  const line = FORECAST.map((y, i) => `${i ? 'L' : 'M'}${x(i)} ${y}`).join('')
  const band = `${FORECAST.map((y, i) => `${i ? 'L' : 'M'}${x(i)} ${y - 18}`).join('')}${[...FORECAST]
    .reverse()
    .map((y, i) => `L${x(FORECAST.length - 1 - i)} ${y + 18}`)
    .join('')}Z`
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label={label} className="block h-auto w-full" fontFamily="inherit">
      <rect width="400" height="240" fill="#101010" />
      <g stroke="#23231f" strokeWidth="1">
        {[60, 100, 140, 180].map((y) => (
          <path key={y} d={`M24 ${y}H384`} />
        ))}
      </g>
      <path d={band} fill="#d9f24f" opacity="0.14" />
      <path d={line} fill="none" stroke="#d9f24f" strokeWidth="3" strokeLinejoin="round" strokeLinecap="round" />
      {ACTUAL.map((y, i) => (
        <circle key={i} cx={x(i)} cy={y} r={i === 5 ? 0 : 3.5} fill="#f2f0ea" />
      ))}
      <circle cx={x(5)} cy={112} r="9" fill="none" stroke="#f2f0ea" strokeWidth="2" />
      <circle cx={x(5)} cy={112} r="4" fill="#f2f0ea" />
      <path d={`M${x(5)} 124V186`} stroke="#f2f0ea" strokeWidth="1" strokeDasharray="3 4" />
      <text x={x(5)} y="204" textAnchor="middle" fontSize="12" fontWeight="600" fill="#f2f0ea">
        {t.anomaly}
      </text>
      <g fontSize="12" fill="#a8a69f">
        <circle cx="38" cy="26" r="4" fill="#d9f24f" />
        <text x="48" y="30">{t.forecast}</text>
        <circle cx="130" cy="26" r="4" fill="#f2f0ea" />
        <text x="140" y="30">{t.actual}</text>
      </g>
    </svg>
  )
}
