import { useState } from 'react'
import { Eye, EyeOff, LoaderCircle, School, ShieldCheck } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { inputCls } from '../components/form/Field'

function translateError(message = '') {
  const m = message.toLowerCase()
  if (m.includes('invalid login')) return 'Email atau kata sandi salah.'
  if (m.includes('already registered')) return 'Email ini sudah terdaftar. Silakan masuk.'
  if (m.includes('email not confirmed')) return 'Email belum dikonfirmasi. Cek kotak masuk Anda.'
  if (m.includes('password should be')) return 'Kata sandi terlalu pendek. Gunakan minimal 8 karakter.'
  if (m.includes('rate limit')) return 'Terlalu banyak percobaan. Coba lagi beberapa menit lagi.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Tidak dapat terhubung ke server. Periksa koneksi internet.'
  return message || 'Terjadi kesalahan. Coba lagi.'
}

export default function Login() {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('masuk')
  const [nama, setNama] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const register = mode === 'daftar'

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    setInfo('')
    if (register && !nama.trim()) return setError('Nama lengkap wajib diisi.')
    if (register && password.length < 8) return setError('Kata sandi minimal 8 karakter.')
    setBusy(true)
    try {
      if (register) {
        const { needsConfirmation } = await signUp(nama.trim(), email.trim(), password)
        if (needsConfirmation) {
          setInfo('Pendaftaran berhasil. Buka email Anda dan klik tautan konfirmasi, lalu masuk.')
          setMode('masuk')
        }
      } else {
        await signIn(email.trim(), password)
      }
    } catch (err) {
      setError(translateError(err.message))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.1fr]">
      <div className="hidden flex-col justify-between bg-indigo-950 p-12 text-indigo-100 lg:flex">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="Logo"
            className="h-11 w-auto object-contain"
          />
          <div>
            <p className="text-[15px] font-extrabold leading-tight text-white">Cermin 181</p>
            <p className="text-xs text-indigo-300">UPT SDN 181 Gresik</p>
          </div>
        </div>
        <div>
          <h2 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-white">
            Observasi untuk tumbuh bersama, bukan sekadar penilaian.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-indigo-300">
            Kepala sekolah mencatat observasi dan suara murid. Guru membaca hasilnya dan menulis refleksi
            pengembangan dirinya di tempat yang sama.
          </p>
        </div>
        <p className="flex items-center gap-2 text-xs text-indigo-300">
          <ShieldCheck className="size-4 text-emerald-300" aria-hidden="true" />
          Guru hanya dapat melihat data observasi miliknya sendiri.
        </p>
      </div>

      <div className="flex items-center justify-center px-5 py-10">
        <div className="w-full max-w-sm">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="grid size-10 place-items-center rounded-xl bg-indigo-950 text-emerald-300">
              <School className="size-5" aria-hidden="true" />
            </div>
            <p className="font-extrabold tracking-tight text-slate-900">SI-OBSERVASI 181</p>
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {register ? 'Buat akun' : 'Masuk'}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {register
              ? 'Akun baru perlu disetujui kepala sekolah sebelum dapat melihat data.'
              : 'Gunakan email dan kata sandi yang Anda daftarkan.'}
          </p>

          <div className="mt-6 grid grid-cols-2 rounded-xl bg-slate-100 p-1 text-sm font-semibold" role="tablist">
            {[
              ['masuk', 'Masuk'],
              ['daftar', 'Daftar'],
            ].map(([k, label]) => (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={mode === k}
                onClick={() => {
                  setMode(k)
                  setError('')
                  setInfo('')
                }}
                className={`rounded-lg py-2 transition-colors duration-200 ${
                  mode === k ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
            {register && (
              <div>
                <label htmlFor="nama" className="block text-sm font-semibold text-slate-700">
                  Nama lengkap
                </label>
                <input
                  id="nama"
                  value={nama}
                  onChange={(e) => setNama(e.target.value)}
                  placeholder="Contoh: Siti Aminah, S.Pd."
                  className={inputCls}
                  autoComplete="name"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-slate-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls}
                autoComplete="email"
                required
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700">
                Kata sandi
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputCls} pr-11`}
                  autoComplete={register ? 'new-password' : 'current-password'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-2 top-[calc(50%+3px)] -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:text-slate-600"
                  aria-label={showPw ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                >
                  {showPw ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {register && <p className="mt-1 text-xs text-slate-500">Minimal 8 karakter.</p>}
            </div>

            {error && (
              <p role="alert" className="rounded-lg bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700">
                {error}
              </p>
            )}
            {info && (
              <p role="status" className="rounded-lg bg-emerald-50 px-3.5 py-2.5 text-sm font-medium text-emerald-800">
                {info}
              </p>
            )}

            <button
              type="submit"
              disabled={busy}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm shadow-indigo-600/25 transition-colors hover:bg-indigo-700 disabled:opacity-60"
            >
              {busy && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
              {register ? 'Buat akun' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
