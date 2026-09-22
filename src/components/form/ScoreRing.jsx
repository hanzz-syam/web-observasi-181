import { fmt } from '../../utils/format'

export default function ScoreRing({ value, category, className = 'size-36', valueClass = 'text-3xl' }) {
  const r = 52
  const c = 2 * Math.PI * r
  const offset = c * (1 - Math.min(value, 4) / 4)
  return (
    <div className={`relative shrink-0 ${className}`}>
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-slate-100" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className={`transition-all duration-500 ease-out ${category ? category.stroke : 'stroke-slate-200'}`}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-extrabold tabular-nums leading-none text-slate-900 ${valueClass}`}>
          {value ? fmt(value) : '-'}
        </span>
        <span className="mt-0.5 text-[11px] font-medium text-slate-400">dari 4</span>
      </div>
    </div>
  )
}
