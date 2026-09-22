/** Batang bertumpuk untuk sebaran kategori. `segments`: [{ label, count, bar }] */
export default function StackedBar({ segments }) {
  const total = segments.reduce((a, s) => a + s.count, 0)
  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-100">
        {segments.map(
          (s) =>
            s.count > 0 && (
              <div
                key={s.label}
                className={`${s.bar} transition-all duration-500`}
                style={{ width: `${(s.count / total) * 100}%` }}
                title={`${s.label}: ${s.count}`}
              />
            ),
        )}
      </div>
      <ul className="mt-4 space-y-2.5">
        {segments.map((s) => (
          <li key={s.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 text-slate-600">
              <span className={`size-2.5 rounded-full ${s.bar}`} aria-hidden="true" />
              {s.label}
            </span>
            <span className="font-bold tabular-nums text-slate-800">{s.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
