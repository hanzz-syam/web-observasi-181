import { Card, CategoryBadge } from '../ui'
import ScoreRing from './ScoreRing'
import { INDICATORS, INDICATOR_COUNT } from '../../data/indicators'
import { calcScore, LEVEL_CATEGORY } from '../../utils/score'

/** Panel kalkulasi nilai akhir real-time; menempel di atas (mobile) atau di samping (desktop). */
export default function ScorePanel({ scores }) {
  const { avg, nilai, count, sum, category } = calcScore(scores)
  const complete = count === INDICATOR_COUNT

  return (
    <aside className="sticky top-14 z-20 order-first -mx-4 bg-slate-50 px-4 pb-1 pt-2 sm:-mx-6 sm:px-6 lg:static lg:z-auto lg:order-last lg:mx-0 lg:bg-transparent lg:p-0">
      <div className="lg:sticky lg:top-8">
        <Card className="p-4 lg:p-6">
          <div className="flex items-center gap-4 lg:flex-col lg:gap-5 lg:text-center">
            <ScoreRing
              value={avg}
              category={category}
              className="size-20 lg:size-36"
              valueClass="text-xl lg:text-3xl"
            />
            <div className="min-w-0 flex-1 lg:w-full">
              <p className="text-xs font-medium text-slate-500">Nilai akhir (real-time)</p>
              <p className="mt-0.5 flex items-baseline gap-1.5 lg:justify-center">
                <span className="text-2xl font-extrabold tabular-nums text-slate-900 lg:text-4xl">
                  {count ? nilai : '-'}
                </span>
                <span className="text-sm font-semibold text-slate-400">/ 100</span>
              </p>
              <div className="mt-2 lg:flex lg:justify-center">
                {category ? (
                  <CategoryBadge category={category} />
                ) : (
                  <span className="text-xs text-slate-400">Belum ada skor</span>
                )}
              </div>
            </div>
          </div>

          <div className="mt-4 lg:mt-6">
            <div className="flex items-center justify-between text-xs font-medium text-slate-500">
              <span>
                {count} dari {INDICATOR_COUNT} indikator dinilai
              </span>
              {complete && <span className="text-emerald-600">Lengkap</span>}
            </div>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                style={{ width: `${(count / INDICATOR_COUNT) * 100}%` }}
              />
            </div>
          </div>

          <div className="mt-5 hidden lg:block">
            <p className="mb-2 text-xs font-semibold text-slate-500">
              Total skor {sum} dari {INDICATOR_COUNT * 4}
            </p>
            <div className="grid grid-cols-6 gap-1.5">
              {INDICATORS.map((ind, i) => {
                const s = scores[i]
                return (
                  <a
                    key={ind.id}
                    href={`#indikator-${i}`}
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(`indikator-${i}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }}
                    title={`${i + 1}. ${ind.title}${s ? ` (skor ${s})` : ' (belum dinilai)'}`}
                    className={`grid h-8 place-items-center rounded-md text-xs font-bold transition-colors ${
                      s ? `${LEVEL_CATEGORY[s].soft}` : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {s ?? i + 1}
                  </a>
                )
              })}
            </div>
          </div>
        </Card>
      </div>
    </aside>
  )
}
