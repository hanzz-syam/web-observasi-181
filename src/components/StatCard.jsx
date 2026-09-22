import { Card } from './ui'

const TONES = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  violet: 'bg-violet-50 text-violet-600',
}

export default function StatCard({ icon: Icon, label, value, unit, sub, tone = 'indigo', className = '' }) {
  return (
    <Card className={`p-5 transition-shadow duration-300 hover:shadow-lg ${className}`}>
      <div className="flex items-center gap-3">
        <div className={`grid size-10 place-items-center rounded-xl ${TONES[tone]}`}>
          <Icon className="size-5" aria-hidden="true" />
        </div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
      </div>
      <p className="mt-4 flex items-baseline gap-1.5 text-3xl font-extrabold tracking-tight text-slate-900">
        <span className="truncate">{value}</span>
        {unit && <span className="text-base font-semibold text-slate-400">{unit}</span>}
      </p>
      {sub && <div className="mt-1.5 text-sm text-slate-500">{sub}</div>}
    </Card>
  )
}
