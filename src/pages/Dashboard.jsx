import { useMemo } from 'react'
import {
  ClipboardCheck,
  Gauge,
  Inbox,
  Lightbulb,
  MessagesSquare,
  PencilLine,
  Sparkles,
  Trophy,
  UsersRound,
} from 'lucide-react'
import { Button, Card, CardHeader, CategoryBadge, EmptyState, PageHeader } from '../components/ui'
import StatCard from '../components/StatCard'
import BarList from '../components/charts/BarList'
import StackedBar from '../components/charts/StackedBar'
import { INDICATORS } from '../data/indicators'
import { useAuth } from '../context/AuthContext'
import { computeStats, hasTeacherReflection } from '../utils/stats'
import { fmt, formatDate, formatLongToday } from '../utils/format'
import { getCategory } from '../utils/score'

export default function Dashboard({ observations, onNavigate, onSeed }) {
  const { isKepsek, profile } = useAuth()
  const stats = useMemo(() => computeStats(observations), [observations])
  const cat = getCategory(stats.avg)
  const recent = useMemo(
    () => [...observations].sort((a, b) => b.tanggal.localeCompare(a.tanggal)).slice(0, 5),
    [observations],
  )

  return (
    <>
      <PageHeader
        title={isKepsek ? 'Dashboard Kepala Sekolah' : 'Dashboard Guru'}
        subtitle={
          isKepsek
            ? `${formatLongToday()}. Ringkasan observasi kualitas pembelajaran sebagai bahan coaching, bukan sekadar penilaian.`
            : `${formatLongToday()}. Halo ${profile?.nama || 'Bapak/Ibu Guru'}, ini ringkasan observasi pembelajaran Anda.`
        }
        actions={
          isKepsek && (
            <Button icon={PencilLine} onClick={() => onNavigate('input')}>
              Observasi baru
            </Button>
          )
        }
      />

      {stats.total === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title="Belum ada observasi"
            description={
              isKepsek
                ? 'Catat observasi pembelajaran pertama' + (onSeed ? ', atau muat data contoh untuk mencoba seluruh fitur dashboard.' : '.')
                : 'Observasi yang ditautkan ke akun Anda akan muncul di sini setelah kepala sekolah menyimpannya.'
            }
          >
            {isKepsek && (
              <Button icon={PencilLine} onClick={() => onNavigate('input')}>
                Mulai observasi
              </Button>
            )}
            {isKepsek && onSeed && (
              <Button variant="secondary" icon={Sparkles} onClick={onSeed}>
                Muat data contoh
              </Button>
            )}
          </EmptyState>
        </Card>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard
              icon={ClipboardCheck}
              tone="indigo"
              label="Total observasi"
              value={stats.total}
              sub={isKepsek ? `${stats.guruCount} guru sudah diobservasi` : 'observasi pembelajaran Anda'}
            />
            <StatCard
              icon={Gauge}
              tone="emerald"
              label="Rata-rata skor sekolah"
              value={fmt(stats.avg)}
              unit="/ 4"
              sub={
                <span className="flex flex-wrap items-center gap-2">
                  Nilai {fmt(stats.nilai, 0)}
                  <CategoryBadge category={cat} />
                </span>
              }
            />
            {isKepsek ? (
              <StatCard
                icon={Trophy}
                tone="amber"
                label="Guru paling sering diobservasi"
                value={stats.mostObserved.name.split(',')[0]}
                sub={`${stats.mostObserved.count}× observasi, rata-rata ${fmt(stats.mostObserved.avg)}`}
              />
            ) : (
              <StatCard
                icon={Trophy}
                tone="amber"
                label="Refleksi belum diisi"
                value={observations.filter((o) => !hasTeacherReflection(o)).length}
                unit="observasi"
                sub="Buka Observasi Saya untuk mengisi refleksi"
              />
            )}
            <StatCard
              icon={MessagesSquare}
              tone="violet"
              label="Suara murid & refleksi guru"
              value={stats.voiceCount}
              unit="suara murid"
              sub={`${stats.reflectionCount} refleksi guru tercatat`}
            />
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title="Pencapaian per indikator"
                subtitle="Rata-rata skor dari seluruh observasi (skala 1-4)"
                action={
                  <Button variant="ghost" size="sm" onClick={() => onNavigate('analisis')}>
                    Analisis lengkap
                  </Button>
                }
              />
              <div className="px-5 pb-6 pt-5 sm:px-6">
                <BarList
                  items={INDICATORS.map((ind, i) => ({ label: ind.short, value: stats.indicatorAvgs[i] }))}
                />
              </div>
            </Card>

            <div className="space-y-6">
              <Card>
                <CardHeader title="Sebaran kategori" subtitle="Jumlah observasi per kategori" />
                <div className="px-5 pb-6 pt-5 sm:px-6">
                  <StackedBar segments={stats.categoryCounts} />
                </div>
              </Card>

              <Card>
                <CardHeader title="Fokus coaching" />
                <div className="space-y-3 px-5 pb-6 pt-4 sm:px-6">
                  <div className="flex gap-3 rounded-xl bg-emerald-50 p-3.5">
                    <Trophy className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <p className="text-sm text-emerald-900">
                      <span className="font-semibold">Terkuat:</span> {INDICATORS[stats.strongest[0].index].title} (
                      {fmt(stats.strongest[0].value)})
                    </p>
                  </div>
                  <div className="flex gap-3 rounded-xl bg-amber-50 p-3.5">
                    <Lightbulb className="mt-0.5 size-4 shrink-0 text-amber-600" aria-hidden="true" />
                    <p className="text-sm text-amber-900">
                      <span className="font-semibold">Perlu ditingkatkan:</span>{' '}
                      {INDICATORS[stats.weakest[0].index].title} ({fmt(stats.weakest[0].value)})
                    </p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <Card>
            <CardHeader
              title="Observasi terbaru"
              action={
                <Button variant="ghost" size="sm" onClick={() => onNavigate('rekap')}>
                  Lihat semua
                </Button>
              }
            />
            <ul className="mt-3 divide-y divide-slate-100 px-2 pb-3 sm:px-3">
              {recent.map((o) => (
                <li key={o.id} className="flex items-center gap-4 rounded-xl px-3 py-3 sm:px-4">
                  <div className="grid size-10 shrink-0 place-items-center rounded-full bg-indigo-50 text-sm font-bold text-indigo-600">
                    {o.guru.trim().charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-900">{o.guru}</p>
                    <p className="truncate text-xs text-slate-500">
                      {o.mapel}, {o.kelas} · {formatDate(o.tanggal)}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <span className="text-sm font-bold tabular-nums text-slate-900">{fmt(o.avg)}</span>
                    <CategoryBadge avg={o.avg} />
                  </div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}
    </>
  )
}
