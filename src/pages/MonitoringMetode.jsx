import { useMemo, useState } from 'react'
import {
  BookOpen,
  ClipboardList,
  Download,
  ExternalLink,
  FileText,
  ImageIcon,
  Loader2,
  Search,
  Users,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMetodePembelajaran } from '../hooks/useMetodePembelajaran'

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function fileIcon(type) {
  if (!type) return <FileText className="size-4 text-slate-400" />
  if (type.startsWith('image/')) return <ImageIcon className="size-4 text-sky-400" />
  return <FileText className="size-4 text-rose-400" />
}

function guruInitial(item) {
  const nama = item.profiles?.nama || item.profiles?.email || '?'
  return nama.trim().charAt(0).toUpperCase()
}

function guruName(item) {
  return item.profiles?.nama || item.profiles?.email || 'Tidak diketahui'
}

/* ─── Stat Card ──────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
      <div className={`grid size-11 shrink-0 place-items-center rounded-xl ${color}`}>
        <Icon className="size-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900">{value}</p>
        <p className="text-xs font-medium text-slate-500">{label}</p>
      </div>
    </div>
  )
}

/* ─── Row Tabel ──────────────────────────────────────────── */
function MetodeRow({ item, onDownload, onPreview }) {
  const [downloading, setDownloading] = useState(false)
  const [previewing, setPreviewing] = useState(false)

  const handleDownload = async () => {
    if (!item.file_path) return
    setDownloading(true)
    try {
      await onDownload(item.file_path, item.file_name)
    } finally {
      setDownloading(false)
    }
  }

  const handlePreview = async () => {
    if (!item.file_path) return
    setPreviewing(true)
    try {
      await onPreview(item.file_path)
    } finally {
      setPreviewing(false)
    }
  }

  return (
    <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50/70">
      {/* Guru */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2.5">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
            {guruInitial(item)}
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{guruName(item)}</p>
            <p className="text-xs text-slate-400">{item.profiles?.email}</p>
          </div>
        </div>
      </td>

      {/* Judul + Deskripsi */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          {fileIcon(item.file_type)}
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.judul}</p>
            {item.deskripsi && (
              <p className="mt-0.5 line-clamp-1 max-w-[220px] text-xs text-slate-500">{item.deskripsi}</p>
            )}
          </div>
        </div>
      </td>

      {/* Mapel */}
      <td className="px-4 py-3.5">
        <span className="inline-block rounded-full bg-violet-50 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
          {item.mapel}
        </span>
      </td>

      {/* File */}
      <td className="px-4 py-3.5 text-xs text-slate-500">{item.file_name ?? '—'}</td>

      {/* Tanggal */}
      <td className="px-4 py-3.5 text-sm text-slate-500">{formatDate(item.created_at)}</td>

      {/* Aksi */}
      <td className="px-4 py-3.5">
        {item.file_path ? (
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePreview}
              disabled={previewing}
              title="Buka Preview"
              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-900 disabled:opacity-40"
            >
              {previewing ? <Loader2 className="size-4 animate-spin" /> : <ExternalLink className="size-4" />}
            </button>
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              title="Download"
              className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-40"
            >
              {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </button>
          </div>
        ) : (
          <span className="text-xs text-slate-400">Tanpa file</span>
        )}
      </td>
    </tr>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function MonitoringMetode() {
  const { profile } = useAuth()
  const { list, loading, error, reload, getSignedUrl } = useMetodePembelajaran({
    userId: profile?.id,
    isKepsek: true,
  })

  const [search, setSearch] = useState('')
  const [filterGuru, setFilterGuru] = useState('')

  // Daftar guru unik dari data
  const guruOptions = useMemo(() => {
    const seen = new Map()
    list.forEach((item) => {
      if (!seen.has(item.guru_id)) {
        seen.set(item.guru_id, guruName(item))
      }
    })
    return [...seen.entries()].map(([id, nama]) => ({ id, nama }))
  }, [list])

  // Filtered list
  const filtered = useMemo(() => {
    let result = list
    if (filterGuru) result = result.filter((m) => m.guru_id === filterGuru)
    if (search.trim()) {
      const q = search.toLowerCase()
      result = result.filter(
        (m) =>
          m.judul.toLowerCase().includes(q) ||
          m.mapel.toLowerCase().includes(q) ||
          guruName(m).toLowerCase().includes(q),
      )
    }
    return result
  }, [list, filterGuru, search])

  // Stats
  const totalMetode = list.length
  const totalGuru = new Set(list.map((m) => m.guru_id)).size

  const handlePreview = async (filePath) => {
    try {
      const url = await getSignedUrl(filePath)
      window.open(url, '_blank', 'noopener')
    } catch (e) {
      alert('Gagal membuka file: ' + e.message)
    }
  }

  const handleDownload = async (filePath, fileName) => {
    try {
      const url = await getSignedUrl(filePath)
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.download = fileName || 'file'
      a.click()
    } catch (e) {
      alert('Gagal mendownload file: ' + e.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 shadow-lg shadow-violet-200">
          <ClipboardList className="size-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Monitoring Metode Pembelajaran
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau seluruh metode pembelajaran yang diunggah oleh para guru.
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          icon={BookOpen}
          label="Total Metode Diunggah"
          value={totalMetode}
          color="bg-gradient-to-br from-indigo-500 to-violet-600"
        />
        <StatCard
          icon={Users}
          label="Jumlah Guru Aktif"
          value={totalGuru}
          color="bg-gradient-to-br from-emerald-500 to-teal-600"
        />
        <StatCard
          icon={ClipboardList}
          label="Ditampilkan"
          value={filtered.length}
          color="bg-gradient-to-br from-amber-500 to-orange-600"
        />
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
          <input
            id="mp-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari judul, mapel, atau nama guru…"
            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <select
          id="mp-filter-guru"
          value={filterGuru}
          onChange={(e) => setFilterGuru(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100"
        >
          <option value="">Semua Guru</option>
          {guruOptions.map(({ id, nama }) => (
            <option key={id} value={id}>
              {nama}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={reload}
          className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50"
        >
          Muat Ulang
        </button>
      </div>

      {/* Tabel */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        {error && (
          <div className="px-6 py-4 text-sm text-rose-600">
            Gagal memuat data: {error}{' '}
            <button onClick={reload} className="font-semibold underline">
              Coba lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
            <ClipboardList className="size-10 text-slate-200" />
            <p className="text-sm font-medium text-slate-400">
              {list.length === 0
                ? 'Belum ada guru yang mengunggah metode pembelajaran.'
                : 'Tidak ada metode yang sesuai filter.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Guru</th>
                  <th className="px-4 py-3">Judul Metode</th>
                  <th className="px-4 py-3">Mata Pelajaran</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Tanggal Upload</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <MetodeRow
                    key={item.id}
                    item={item}
                    onDownload={handleDownload}
                    onPreview={handlePreview}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
