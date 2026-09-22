import { Check, Lock } from 'lucide-react'

export default function Stepper({ steps, current, onGo, canGo }) {
  return (
    <ol className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:gap-2">
      {steps.map((s, i) => {
        const done = i < current
        const active = i === current
        const allowed = canGo(i)
        return (
          <li key={s.key} className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
            <button
              type="button"
              onClick={() => onGo(i)}
              disabled={!allowed && !active}
              aria-current={active ? 'step' : undefined}
              className={`flex w-full min-w-0 items-center gap-2.5 rounded-xl px-3 py-2.5 text-left transition-colors duration-200 ${
                active
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                  : done
                    ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                    : 'bg-white text-slate-500 ring-1 ring-inset ring-slate-200'
              } ${!allowed && !active ? 'cursor-not-allowed opacity-70' : ''}`}
            >
              <span
                className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold ${
                  active ? 'bg-white/20' : done ? 'bg-emerald-500 text-white' : 'bg-slate-100'
                }`}
              >
                {done ? <Check className="size-4" /> : !allowed ? <Lock className="size-3.5" /> : i + 1}
              </span>
              <span className="hidden min-w-0 truncate text-sm font-semibold sm:block">{s.label}</span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
