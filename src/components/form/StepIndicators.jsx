import { Check } from 'lucide-react'
import { Card } from '../ui'
import { INDICATORS, SCORE_LEVELS } from '../../data/indicators'
import { LEVEL_CATEGORY } from '../../utils/score'

const SELECTED = {
  4: 'border-emerald-500 bg-emerald-50/70 ring-4 ring-emerald-500/10',
  3: 'border-indigo-500 bg-indigo-50/70 ring-4 ring-indigo-500/10',
  2: 'border-amber-500 bg-amber-50/70 ring-4 ring-amber-500/10',
  1: 'border-rose-500 bg-rose-50/70 ring-4 ring-rose-500/10',
}

export default function StepIndicators({ scores, onScore, showErrors }) {
  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Penilaian 12 indikator</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Pilih skor 1-4 yang paling sesuai dengan yang teramati. Deskripsi rubrik ada di setiap pilihan.
        </p>
      </Card>

      {INDICATORS.map((ind, i) => {
        const current = scores[i]
        const missing = showErrors && current === null
        return (
          <Card
            key={ind.id}
            id={`indikator-${i}`}
            className={`scroll-mt-40 p-5 transition-shadow sm:p-6 lg:scroll-mt-24 ${missing ? 'ring-2 ring-rose-400' : ''}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <span
                  className={`grid size-8 shrink-0 place-items-center rounded-lg text-sm font-bold transition-colors ${
                    current ? LEVEL_CATEGORY[current].soft : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-[15px] font-bold leading-snug text-slate-900">{ind.title}</h3>
                  {missing && <p className="mt-0.5 text-xs font-medium text-rose-600">Pilih salah satu skor.</p>}
                </div>
              </div>
              {current && (
                <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${LEVEL_CATEGORY[current].soft}`}>
                  Skor {current}
                </span>
              )}
            </div>

            <div
              role="radiogroup"
              aria-label={ind.title}
              className="mt-4 grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-4"
            >
              {SCORE_LEVELS.map((lvl) => {
                const selected = current === lvl.value
                return (
                  <button
                    key={lvl.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => onScore(i, lvl.value)}
                    className={`relative flex flex-col items-stretch justify-start rounded-xl border p-3.5 text-left transition-all duration-200 ${
                      selected ? SELECTED[lvl.value] : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-2 text-sm font-bold text-slate-900">
                        <span
                          className={`grid size-6 place-items-center rounded-md text-xs ${
                            selected ? LEVEL_CATEGORY[lvl.value].bar + ' text-white' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {lvl.value}
                        </span>
                        {lvl.label}
                      </span>
                      {selected && <Check className="size-4 text-slate-700" aria-hidden="true" />}
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-slate-600">{ind.rubric[lvl.value]}</p>
                  </button>
                )
              })}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
