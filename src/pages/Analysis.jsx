import { useMemo } from 'react'
import { Inbox, MessageSquareQuote, PencilLine, Sparkles, TrendingDown, TrendingUp, Minus } from 'lucide-react'
import { Button, Card, CardHeader, CategoryBadge, EmptyState, PageHeader } from '../components/ui'
import BarList from '../components/charts/BarList'
import LineChart from '../components/charts/LineChart'
import StackedBar from '../components/charts/StackedBar'
import { INDICATORS } from '../data/indicators'
import { computeStats } from '../utils/stats'
import { getCategory } from '../utils/score'
import { fmt, formatDate } from '../utils/format'

const PEMAHAMAN_BAR = {
  'Sudah sangat paham': 'bg-emerald-500',
  'Sudah paham': 'bg-indigo-500',
  'Masih sebagian': 'bg-amber-500',
  'Belum paham': 'bg-rose-500',
}

function Trend({ delta }) {
  if (delta === null) return <span className="text-xs text-slate-400">Baru 1 kali</span>
  if (Math.abs(delta) < 0.05)
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500">
        <Minus className="size-3.5" aria-hidden="true" /> Stabil
      </span>
    )
  const up = delta > 0
  const Icon = up ? TrendingUp : TrendingDown
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${up ? 'text-emerald-600' : 'text-rose-600'}`}>
      <Icon className="size-3.5" aria-hidden="true" />
      {up ? '+' : ''}
      {fmt(delta)}
    </span>
  )
}

export default function Analysis({ observations, onNavigate, onSeed }) {
  const stats = useMemo(() => computeStats(observations), [observations])

  if (stats.total === 0) {
    return (
      <>
        <PageHeader title="Analisis" subtitle="Tren, kekuatan, dan area coaching dari seluruh observasi." />
        <Card>
          <EmptyState
            icon={Inbox}
            title="Belum ada data untuk dianalisis"
            description="Analisis muncul setelah ada observasi. Anda dapat mencoba dengan data contoh."
          >
            <Button icon={PencilLine} onClick={() => onNavigate('input')}>
              Input observasi
            </Button>
            <Button variant="secondary" icon={Sparkles} onClick={onSeed}>
              Muat data contoh
            </Button>
          </EmptyState>
        </Card>
      </>
    )
  }

  const pemahamanTotal = stats.pemahaman.reduce((a, p) => a + p.count, 0)

  return (
    <>
      <PageHeader
        title="Analisis"
        subtitle="Lihat tren skor, indikator yang sudah kuat, dan indikator yang perlu didampingi lebih lanjut."
      />

      <div className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader title="Tren skor observasi" subtitle="Rata-rata skor tiap observasi dari waktu ke waktu" />
            <div className="px-3 pb-5 pt-4 sm:px-5">
              <LineChart points={stats.trend} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Kekuatan & area coaching" subtitle="Berdasarkan rata-rata indikator" />
            <div className="space-y-5 px-5 pb-6 pt-4 sm:px-6">
              <div>
                <p className="mb-2 text-xs font-semibold text-emerald-700">Paling kuat</p>
                <ul className="space-y-2">
                  {stats.strongest.map((s) => (
                    <li key={s.index} className="flex items-center justify-between gap-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm">
                      <span className="text-emerald-950">{INDICATORS[s.index].title}</span>
                      <span className="font-bold tabular-nums text-emerald-700">{fmt(s.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <p className="mb-2 text-xs font-semibold text-amber-700">Perlu didampingi</p>
                <ul className="space-y-2">
                  {stats.weakest.map((s) => (
                    <li key={s.index} className="flex items-center justify-between gap-3 rounded-lg bg-amber-50 px-3 py-2 text-sm">
                      <span className="text-amber-950">{INDICATORS[s.index].title}</span>
                      <span className="font-bold tabular-nums text-amber-700">{fmt(s.value)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card>
            <CardHeader title="Sebaran kategori" />
            <div className="px-5 pb-6 pt-5 sm:px-6">
              <StackedBar segments={stats.categoryCounts} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Pemahaman murid" subtitle="Dari bagian suara murid" />
            <div className="px-5 pb-6 pt-5 sm:px-6">
              {pemahamanTotal === 0 ? (
                <p className="text-sm text-slate-500">Belum ada respons pemahaman murid.</p>
              ) : (
                <StackedBar
                  segments={stats.pemahaman.map((p) => ({ ...p, bar: PEMAHAMAN_BAR[p.label] }))}
                />
              )}
            </div>
          </Card>

          <Card>
            <CardHeader title="Per mata pelajaran" subtitle="Rata-rata skor" />
            <div className="px-5 pb-6 pt-5 sm:px-6">
              <BarList
                labelWidth="sm:w-32"
                items={stats.byMapel.map((m) => ({ label: m.name, value: m.avg, sub: `${m.count}×` }))}
              />
            </div>
          </Card>
        </div>

        <Card>
          <CardHeader
            title="Peta indikator per guru"
            subtitle="Rata-rata skor tiap indikator. Warna mengikuti kategori; arahkan kursor pada kolom untuk melihat nama indikator."
          />
          <div className="mt-4 overflow-x-auto px-5 pb-6 sm:px-6">
            <table className="w-full min-w-[820px] border-separate border-spacing-1 text-sm">
              <thead>
                <tr className="text-xs text-slate-500">
                  <th scope="col" className="min-w-40 px-2 py-1 text-left font-semibold">
                    Guru
                  </th>
                  {INDICATORS.map((ind, i) => (
                    <th key={ind.id} scope="col" title={ind.title} className="w-11 px-1 py-1 text-center font-semibold">
                      I{i + 1}
                    </th>
                  ))}
                  <th scope="col" className="px-2 py-1 text-center font-semibold">
                    Rata-rata
                  </th>
                  <th scope="col" className="px-2 py-1 text-center font-semibold">
                    Obs.
                  </th>
                  <th scope="col" className="px-2 py-1 text-left font-semibold">
                    Perkembangan
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.byGuru.map((g) => (
                  <tr key={g.name}>
                    <th scope="row" className="px-2 py-1 text-left">
                      <p className="whitespace-nowrap font-semibold text-slate-900">{g.name}</p>
                      <p className="text-xs font-normal text-slate-400">Terakhir {formatDate(g.last)}</p>
                    </th>
                    {g.indicatorAvgs.map((v, i) => (
                      <td
                        key={i}
                        title={`${INDICATORS[i].title}: ${fmt(v)}`}
                        className={`rounded-md py-2 text-center text-xs font-bold tabular-nums ${getCategory(v)?.soft ?? 'bg-slate-100 text-slate-400'}`}
                      >
                        {fmt(v, 1)}
                      </td>
                    ))}
                    <td className="px-2 text-center">
                      <CategoryBadge avg={g.avg} className="tabular-nums" />
                    </td>
                    <td className="px-2 text-center font-semibold tabular-nums text-slate-700">{g.count}</td>
                    <td className="px-2">
                      <Trend delta={g.delta} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card>
          <CardHeader title="Suara murid terbaru" subtitle="Kutipan langsung dari respons murid" />
          {stats.quotes.length === 0 ? (
            <p className="px-6 pb-6 pt-4 text-sm text-slate-500">Belum ada kutipan murid yang tercatat.</p>
          ) : (
            <ul className="grid gap-3 px-5 pb-6 pt-5 sm:grid-cols-2 sm:px-6">
              {stats.quotes.slice(0, 6).map((q, i) => (
                <li key={i} className="flex gap-3 rounded-xl border-l-4 border-emerald-400 bg-emerald-50/60 p-4">
                  <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                  <div>
                    <p className="text-sm italic leading-relaxed text-slate-800">“{q.teks}”</p>
                    <p className="mt-2 text-xs text-slate-500">
                      <span className="font-semibold text-emerald-700">{q.nama || 'Murid'}</span> · {q.mapel} · guru{' '}
                      {q.guru.split(',')[0]}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </>
  )
}
