import { getCategory } from '../../utils/score'
import { fmt } from '../../utils/format'

/**
 * Daftar batang horizontal. `items`: [{ label, value, sub }]
 * Warna batang mengikuti kategori skor (skala 1-4).
 */
export default function BarList({ items, max = 4, digits = 2, showCategoryColor = true, labelWidth = 'sm:w-44' }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => {
        const cat = getCategory(item.value)
        const color = showCategoryColor && cat ? cat.bar : 'bg-indigo-500'
        const pct = Math.max(0, Math.min(100, (item.value / max) * 100))
        return (
          <li key={item.label} className="flex flex-col gap-1.5 sm:flex-row sm:items-center sm:gap-3">
            <div className={`shrink-0 text-sm text-slate-600 ${labelWidth}`}>
              <span className="font-medium text-slate-700">{item.label}</span>
              {item.sub && <span className="ml-1.5 text-xs text-slate-400">{item.sub}</span>}
            </div>
            <div className="flex flex-1 items-center gap-3">
              <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`bar-origin-left h-full animate-bar rounded-full ${color}`}
                  style={{ width: `${pct}%`, animationDelay: `${i * 40}ms` }}
                />
              </div>
              <span className="w-10 text-right text-sm font-bold tabular-nums text-slate-800">
                {fmt(item.value, digits)}
              </span>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
