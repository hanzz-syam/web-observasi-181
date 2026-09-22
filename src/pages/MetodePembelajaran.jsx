import { useRef, useState } from 'react'
import {
  BookOpen,
  CheckCircle2,
  Download,
  FileText,
  ImageIcon,
  Loader2,
  Plus,
  Trash2,
  UploadCloud,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useMetodePembelajaran } from '../hooks/useMetodePembelajaran'

const MAPEL_LIST = [
  'Pendidikan Agama & Budi Pekerti',
  'PPKn',
  'Bahasa Indonesia',
  'Matematika',
  'IPA',
  'IPS',
  'Seni Budaya & Prakarya',
  'PJOK',
  'Bahasa Jawa',
  'Bahasa Inggris',
  'Lainnya',
]

const ACCEPTED_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
]

function fileIcon(type) {
  if (!type) return <FileText className="size-4" />
  if (type.startsWith('image/')) return <ImageIcon className="size-4 text-sky-400" />
  return <FileText className="size-4 text-rose-400" />
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('id-ID', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatSize(bytes) {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

/* ─── Upload Form ─────────────────────────────────────────── */
function UploadForm({ onSave }) {
  const [judul, setJudul] = useState('')
  const [mapel, setMapel] = useState('')
  const [deskripsi, setDeskripsi] = useState('')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [err, setErr] = useState('')
  const fileRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    if (!ACCEPTED_TYPES.includes(f.type)) {
      setErr('Format file tidak didukung. Gunakan PDF, Word, atau gambar.')
      return
    }
    if (f.size > 20 * 1024 * 1024) {
      setErr('Ukuran file melebihi 20 MB.')
      return
    }
    setErr('')
    setFile(f)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files[0])
  }

  const reset = () => {
    setJudul('')
    setMapel('')
    setDeskripsi('')
    setFile(null)
    setErr('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!judul.trim()) return setErr('Judul metode wajib diisi.')
    if (!mapel) return setErr('Mata pelajaran wajib dipilih.')
    setErr('')
    setSubmitting(true)
    try {
      await onSave({ judul: judul.trim(), mapel, deskripsi: deskripsi.trim(), file })
      setSuccess(true)
      reset()
      setTimeout(() => setSuccess(false), 3000)
    } catch (e) {
      setErr(e.message || 'Gagal menyimpan data.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-slate-100 px-6 py-4">
        <div className="grid size-9 place-items-center rounded-xl bg-indigo-100">
          <UploadCloud className="size-5 text-indigo-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Upload Metode Pembelajaran</h2>
          <p className="text-xs text-slate-500">PDF, Word, atau gambar — maks. 20 MB</p>
        </div>
      </div>

      <div className="space-y-5 px-6 py-5">
        {/* Judul */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="mp-judul">
            Judul Metode <span className="text-rose-500">*</span>
          </label>
          <input
            id="mp-judul"
            type="text"
            value={judul}
            onChange={(e) => setJudul(e.target.value)}
            placeholder="cth. Metode Diskusi Kelompok"
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Mata Pelajaran */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="mp-mapel">
            Mata Pelajaran <span className="text-rose-500">*</span>
          </label>
          <select
            id="mp-mapel"
            value={mapel}
            onChange={(e) => setMapel(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          >
            <option value="">-- Pilih Mata Pelajaran --</option>
            {MAPEL_LIST.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>

        {/* Deskripsi */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700" htmlFor="mp-deskripsi">
            Deskripsi
          </label>
          <textarea
            id="mp-deskripsi"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            rows={3}
            placeholder="Jelaskan metode pembelajaran secara singkat..."
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-100"
          />
        </div>

        {/* Drop Zone File */}
        <div>
          <label className="mb-1.5 block text-sm font-semibold text-slate-700">File Pendukung</label>
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-8 transition-colors ${
              dragging
                ? 'border-indigo-400 bg-indigo-50'
                : file
                ? 'border-emerald-400 bg-emerald-50'
                : 'border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/40'
            }`}
          >
            {file ? (
              <>
                <CheckCircle2 className="size-8 text-emerald-500" />
                <p className="text-sm font-semibold text-emerald-700">{file.name}</p>
                <p className="text-xs text-emerald-500">{formatSize(file.size)}</p>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setFile(null) }}
                  className="mt-1 flex items-center gap-1 text-xs text-slate-400 hover:text-rose-500"
                >
                  <X className="size-3" /> Hapus
                </button>
              </>
            ) : (
              <>
                <UploadCloud className="size-8 text-slate-300" />
                <p className="text-sm font-medium text-slate-500">
                  Seret file ke sini atau <span className="text-indigo-600 underline">klik untuk memilih</span>
                </p>
                <p className="text-xs text-slate-400">PDF, DOC, DOCX, JPG, PNG, GIF, WEBP</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept={ACCEPTED_TYPES.join(',')}
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        </div>

        {/* Error */}
        {err && (
          <div className="rounded-lg bg-rose-50 px-4 py-2.5 text-sm font-medium text-rose-700">
            {err}
          </div>
        )}

        {/* Success */}
        {success && (
          <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-700">
            <CheckCircle2 className="size-4" /> Metode berhasil diunggah!
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting}
            id="btn-upload-metode"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="size-4 animate-spin" /> Mengunggah…
              </>
            ) : (
              <>
                <Plus className="size-4" /> Simpan Metode
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  )
}

/* ─── Row Tabel ──────────────────────────────────────────── */
function MetodeRow({ item, onDelete, onDownload }) {
  const [deleting, setDeleting] = useState(false)
  const [downloading, setDownloading] = useState(false)

  const handleDelete = async () => {
    if (!window.confirm(`Hapus metode "${item.judul}"?`)) return
    setDeleting(true)
    try {
      await onDelete(item.id)
    } finally {
      setDeleting(false)
    }
  }

  const handleDownload = async () => {
    if (!item.file_path) return
    setDownloading(true)
    try {
      await onDownload(item.file_path, item.file_name)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <tr className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50">
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-2">
          {fileIcon(item.file_type)}
          <div>
            <p className="text-sm font-semibold text-slate-900">{item.judul}</p>
            {item.deskripsi && (
              <p className="mt-0.5 line-clamp-1 max-w-xs text-xs text-slate-500">{item.deskripsi}</p>
            )}
          </div>
        </div>
      </td>
      <td className="px-4 py-3.5 text-sm text-slate-600">{item.mapel}</td>
      <td className="px-4 py-3.5 text-sm text-slate-500">{item.file_name ?? '—'}</td>
      <td className="px-4 py-3.5 text-sm text-slate-500">{formatDate(item.created_at)}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1">
          {item.file_path && (
            <button
              type="button"
              onClick={handleDownload}
              disabled={downloading}
              title="Download / Preview"
              className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-40"
            >
              {downloading ? <Loader2 className="size-4 animate-spin" /> : <Download className="size-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleting}
            title="Hapus"
            className="rounded-lg p-2 text-rose-500 transition-colors hover:bg-rose-50 disabled:opacity-40"
          >
            {deleting ? <Loader2 className="size-4 animate-spin" /> : <Trash2 className="size-4" />}
          </button>
        </div>
      </td>
    </tr>
  )
}

/* ─── Main Page ──────────────────────────────────────────── */
export default function MetodePembelajaran() {
  const { profile } = useAuth()
  const { list, loading, error, reload, add, remove, getSignedUrl } = useMetodePembelajaran({
    userId: profile?.id,
    isKepsek: false,
  })

  const handleDownload = async (filePath, fileName) => {
    try {
      const url = await getSignedUrl(filePath)
      const a = document.createElement('a')
      a.href = url
      a.target = '_blank'
      a.download = fileName || 'file'
      a.click()
    } catch (e) {
      alert('Gagal membuka file: ' + e.message)
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-start gap-4">
        <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-200">
          <BookOpen className="size-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Upload Metode Pembelajaran
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Unggah dan kelola metode pembelajaran yang Anda gunakan di kelas.
          </p>
        </div>
      </div>

      {/* Form */}
      <UploadForm onSave={add} />

      {/* Daftar Metode */}
      <div className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-base font-bold text-slate-900">
            Metode Saya
            {list.length > 0 && (
              <span className="ml-2 rounded-full bg-indigo-100 px-2 py-0.5 text-xs font-bold text-indigo-700">
                {list.length}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={reload}
            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100"
          >
            Muat Ulang
          </button>
        </div>

        {error && (
          <div className="px-6 py-4 text-sm text-rose-600">
            Gagal memuat data: {error}{' '}
            <button onClick={reload} className="font-semibold underline">
              Coba lagi
            </button>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16 text-slate-400">
            <Loader2 className="size-6 animate-spin" />
          </div>
        ) : list.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <BookOpen className="size-10 text-slate-200" />
            <p className="text-sm font-medium text-slate-400">Belum ada metode yang diunggah.</p>
            <p className="text-xs text-slate-400">Gunakan form di atas untuk menambahkan metode pertama Anda.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  <th className="px-4 py-3">Judul</th>
                  <th className="px-4 py-3">Mata Pelajaran</th>
                  <th className="px-4 py-3">File</th>
                  <th className="px-4 py-3">Tanggal</th>
                  <th className="px-4 py-3">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {list.map((item) => (
                  <MetodeRow
                    key={item.id}
                    item={item}
                    onDelete={remove}
                    onDownload={handleDownload}
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
