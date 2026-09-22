import { fmt, formatDateShort } from '../../utils/format'

/** Grafik garis tren skor (skala 1-4). `points`: [{ tanggal, avg, guru }] */
export default function LineChart({ points }) {
  const W = 640
  const H = 240
  const pad = { top: 16, right: 20, bottom: 32, left: 32 }
  const innerW = W - pad.left - pad.right
  const innerH = H - pad.top - pad.bottom

  const x = (i) => pad.left + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW)
  const y = (v) => pad.top + innerH - ((v - 1) / 3) * innerH

  const line = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${x(i).toFixed(1)},${y(p.avg).toFixed(1)}`).join(' ')
  const area = `${line} L${x(points.length - 1).toFixed(1)},${pad.top + innerH} L${x(0).toFixed(1)},${pad.top + innerH} Z`

  const labelEvery = Math.max(1, Math.ceil(points.length / 6))

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label="Grafik tren skor observasi">
      <defs>
        <linearGradient id="trend-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.22" />
          <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
        </linearGradient>
      </defs>

      {[1, 2, 3, 4].map((v) => (
        <g key={v}>
          <line x1={pad.left} x2={W - pad.right} y1={y(v)} y2={y(v)} stroke="#e2e8f0" strokeDasharray={v === 1 ? '' : '3 4'} />
          <text x={pad.left - 10} y={y(v) + 4} textAnchor="end" className="fill-slate-400 text-[11px]">
            {v}
          </text>
        </g>
      ))}

      {points.length > 1 && <path d={area} fill="url(#trend-fill)" />}
      {points.length > 1 && (
        <path d={line} fill="none" stroke="#6366f1" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      )}

      {points.map((p, i) => (
        <g key={p.id ?? i}>
          <circle cx={x(i)} cy={y(p.avg)} r="5" className="fill-white stroke-indigo-500" strokeWidth="2.5">
            <title>{`${p.guru} · ${formatDateShort(p.tanggal)} · skor ${fmt(p.avg)}`}</title>
          </circle>
          {(i % labelEvery === 0 || i === points.length - 1) && (
            <text x={x(i)} y={H - 10} textAnchor="middle" className="fill-slate-400 text-[11px]">
              {formatDateShort(p.tanggal)}
            </text>
          )}
        </g>
      ))}
    </svg>
  )
}
