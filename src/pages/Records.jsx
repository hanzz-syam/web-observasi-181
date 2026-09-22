import { useMemo, useState } from 'react'
import { ArrowDown, ArrowUp, Download, Eye, Inbox, Search, SearchX, Sparkles, Trash2, PencilLine } from 'lucide-react'
import { Button, Card, CategoryBadge, EmptyState, PageHeader } from '../components/ui'
import ConfirmDialog from '../components/ConfirmDialog'
import ObservationDetail from '../components/ObservationDetail'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'
import { buildObservationCSV, DELIMITERS, downloadCSV } from '../utils/csv'
import { fmt, formatDate, todayISO } from '../utils/format'

const selectCls =
  'rounded-lg border-0 bg-white py-2.5 pl-3 pr-9 text-sm text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500'

const norm = (s) => (s || '').trim().toLowerCase()

function SortHeader({ k, sort, onToggle, children }) {
  return (
    <th scope="col" className="px-4 py-3 text-left font-semibold">
      <button type="button" onClick={() => onToggle(k)} className="inline-flex items-center gap-1 hover:text-slate-900">
        {children}
        {sort.key === k && (sort.dir === 'asc' ? <ArrowUp className="size-3.5" /> : <ArrowDown className="size-3.5" />)}
      </button>
    </th>
  )
}

export default function Records({ observations, onDelete, onSaveReflection, onNavigate, onSeed }) {
  const toast = useToast()
  const { isKepsek } = useAuth()
  const [query, setQuery] = useState('')
  const [guru, setGuru] = useState('')
  const [mapel, setMapel] = useState('')
  const [sort, setSort] = useState({ key: 'tanggal', dir: 'desc' })
  const [delimiter, setDelimiter] = useState(';')
  const [detailId, setDetailId] = useState(null)
  const [toDelete, setToDelete] = useState(null)

  const guruOptions = useMemo(
    () => [...new Map(observations.map((o) => [norm(o.guru), o.guru])).values()].sort((a, b) => a.localeCompare(b)),
    [observations],
  )
  const mapelOptions = useMemo(
    () => [...new Map(observations.map((o) => [norm(o.mapel), o.mapel])).values()].sort((a, b) => a.localeCompare(b)),
    [observations],
  )

  const rows = useMemo(() => {
    const q = norm(query)
    const filtered = observations.filter((o) => {
      if (guru && norm(o.guru) !== norm(guru)) return false
      if (mapel && norm(o.mapel) !== norm(mapel)) return false
      if (!q) return true
      return [o.guru, o.kelas, o.mapel, o.topik, o.catatan, formatDate(o.tanggal)].some((v) => norm(v).includes(q))
    })
    const dir = sort.dir === 'asc' ? 1 : -1
    return filtered.sort((a, b) => {
      const cmp =
        sort.key === 'avg'
          ? a.avg - b.avg
          : sort.key === 'guru'
            ? a.guru.localeCompare(b.guru)
            : a.tanggal.localeCompare(b.tanggal) || (a.createdAt || '').localeCompare(b.createdAt || '')
      return cmp * dir
    })
  }, [observations, query, guru, mapel, sort])

  const detail = observations.find((o) => o.id === detailId) ?? null
  const filtersActive = Boolean(query || guru || mapel)

  const toggleSort = (key) =>
    setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'guru' ? 'asc' : 'desc' }))

  const exportCSV = () => {
    downloadCSV(`rekap_observasi_181_${todayISO()}.csv`, buildObservationCSV(rows, delimiter))
    toast(`${rows.length} data diekspor ke CSV.`)
  }

  const clearFilters = () => {
    setQuery('')
    setGuru('')
    setMapel('')
  }

  return (
    <>
      <PageHeader
        title={isKepsek ? 'Rekap data observasi' : 'Observasi saya'}
        subtitle={
          isKepsek
            ? 'Cari, saring, lihat detail, dan ekspor riwayat observasi pembelajaran.'
            : 'Lihat hasil observasi pembelajaran Anda dan tulis refleksi pengembangan diri.'
        }
        actions={
          <>
            <label className="sr-only" htmlFor="delimiter">
              Pemisah kolom CSV
            </label>
            <select
              id="delimiter"
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value)}
              className={selectCls}
              title="Pemisah kolom CSV"
            >
              {Object.entries(DELIMITERS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v.label}
                </option>
              ))}
            </select>
            <Button variant="success" icon={Download} onClick={exportCSV} disabled={rows.length === 0}>
              Ekspor CSV
            </Button>
          </>
        }
      />

      {observations.length === 0 ? (
        <Card>
          <EmptyState
            icon={Inbox}
            title="Belum ada data observasi"
            description={
              isKepsek
                ? 'Data yang Anda simpan dari formulir observasi akan muncul di sini.'
                : 'Observasi yang ditautkan ke akun Anda akan muncul di sini.'
            }
          >
            {isKepsek && (
              <Button icon={PencilLine} onClick={() => onNavigate('input')}>
                Input observasi
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
        <Card className="overflow-hidden">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 sm:p-5 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cari guru, kelas, mapel, topik, atau catatan"
                aria-label="Cari observasi"
                className="block w-full rounded-lg border-0 bg-slate-50 py-2.5 pl-10 pr-3 text-sm text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {isKepsek && (
                <select value={guru} onChange={(e) => setGuru(e.target.value)} className={selectCls} aria-label="Filter guru">
                  <option value="">Semua guru</option>
                  {guruOptions.map((g) => (
                    <option key={g} value={g}>
                      {g}
                    </option>
                  ))}
                </select>
              )}
              <select value={mapel} onChange={(e) => setMapel(e.target.value)} className={selectCls} aria-label="Filter mata pelajaran">
                <option value="">Semua mapel</option>
                {mapelOptions.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
              {filtersActive && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  Reset
                </Button>
              )}
            </div>
          </div>

          <div className="px-5 py-2.5 text-xs text-slate-500">
            Menampilkan <span className="font-semibold text-slate-700">{rows.length}</span> dari {observations.length} observasi
            {filtersActive && rows.length > 0 && ' · ekspor CSV hanya memuat data yang tampil'}
          </div>

          {rows.length === 0 ? (
            <EmptyState
              icon={SearchX}
              title="Tidak ada hasil"
              description="Coba kata kunci lain atau hapus filter yang aktif."
            >
              <Button variant="secondary" onClick={clearFilters}>
                Reset pencarian
              </Button>
            </EmptyState>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-sm">
                <thead className="bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <SortHeader k="tanggal" sort={sort} onToggle={toggleSort}>Tanggal</SortHeader>
                    <SortHeader k="guru" sort={sort} onToggle={toggleSort}>Guru</SortHeader>
                    <th scope="col" className="hidden px-4 py-3 text-left font-semibold md:table-cell">
                      Kelas & mapel
                    </th>
                    <SortHeader k="avg" sort={sort} onToggle={toggleSort}>Skor</SortHeader>
                    <th scope="col" className="hidden px-4 py-3 text-left font-semibold sm:table-cell">
                      Kategori
                    </th>
                    <th scope="col" className="px-4 py-3 text-right font-semibold">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {rows.map((o) => (
                    <tr key={o.id} className="transition-colors hover:bg-indigo-50/40">
                      <td className="whitespace-nowrap px-4 py-3.5 text-slate-600">{formatDate(o.tanggal)}</td>
                      <td className="px-4 py-3.5">
                        <p className="font-semibold text-slate-900">{o.guru}</p>
                        <p className="text-xs text-slate-500 md:hidden">
                          {o.mapel}, {o.kelas}
                        </p>
                      </td>
                      <td className="hidden px-4 py-3.5 md:table-cell">
                        <p className="text-slate-800">{o.mapel}</p>
                        <p className="text-xs text-slate-500">{o.kelas}</p>
                      </td>
                      <td className="px-4 py-3.5 font-bold tabular-nums text-slate-900">
                        {fmt(o.avg)}
                        <span className="ml-1 text-xs font-medium text-slate-400">({o.nilai})</span>
                      </td>
                      <td className="hidden px-4 py-3.5 sm:table-cell">
                        <CategoryBadge avg={o.avg} />
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => setDetailId(o.id)}
                            className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-indigo-600 transition-colors hover:bg-indigo-50"
                            aria-label={`Lihat detail observasi ${o.guru}`}
                          >
                            <Eye className="size-4" aria-hidden="true" />
                            <span className="hidden lg:inline">Detail</span>
                          </button>
                          {isKepsek && (
                            <button
                              type="button"
                              onClick={() => setToDelete(o)}
                              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                              aria-label={`Hapus observasi ${o.guru}`}
                            >
                              <Trash2 className="size-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}

      <ObservationDetail
        observation={detail}
        onClose={() => setDetailId(null)}
        onDelete={isKepsek ? setToDelete : undefined}
        onSaveReflection={isKepsek ? undefined : onSaveReflection}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Hapus observasi ini?"
        message={
          toDelete
            ? `Observasi ${toDelete.guru} (${toDelete.mapel}, ${formatDate(toDelete.tanggal)}) akan dihapus permanen beserta suara murid dan refleksi guru.`
            : ''
        }
        onCancel={() => setToDelete(null)}
        onConfirm={() => {
          onDelete(toDelete.id)
          if (detailId === toDelete.id) setDetailId(null)
          setToDelete(null)
        }}
      />
    </>
  )
}
