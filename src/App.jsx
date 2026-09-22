import { useCallback, useEffect, useMemo, useState } from 'react'
import { CircleAlert, LoaderCircle, Menu, School } from 'lucide-react'
import Sidebar, { getNavItems } from './components/Sidebar'
import ConfirmDialog from './components/ConfirmDialog'
import { useToast } from './components/Toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { useObservations } from './hooks/useObservations'
import { useProfiles } from './hooks/useProfiles'
import { hasSupabase } from './lib/supabase'
import Dashboard from './pages/Dashboard'
import ObservationForm from './pages/ObservationForm'
import Records from './pages/Records'
import Analysis from './pages/Analysis'
import Users from './pages/Users'
import Login from './pages/Login'
import Pending from './pages/Pending'

const ALL_PAGES = ['dashboard', 'input', 'rekap', 'analisis', 'pengguna']

function readHash() {
  const h = window.location.hash.replace('#/', '')
  return ALL_PAGES.includes(h) ? h : 'dashboard'
}

function FullScreenLoader() {
  return (
    <div className="grid min-h-screen place-items-center text-slate-400">
      <LoaderCircle className="size-7 animate-spin" aria-label="Memuat" />
    </div>
  )
}

function Shell() {
  const toast = useToast()
  const { isKepsek } = useAuth()
  const { observations, loading, error, reload, add, remove, clear, loadSeed, saveTeacherReflection } =
    useObservations()
  const profiles = useProfiles(hasSupabase && isKepsek)

  const navItems = useMemo(() => getNavItems({ isKepsek, hasSupabase }), [isKepsek])
  const [rawPage, setRawPage] = useState(readHash)
  const page = navItems.some((i) => i.key === rawPage) ? rawPage : 'dashboard'

  const [menuOpen, setMenuOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  useEffect(() => {
    const onHash = () => setRawPage(readHash())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const navigate = useCallback((key) => {
    window.location.hash = `#/${key}`
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [])

  const handleSeed = loadSeed
    ? () => {
        loadSeed()
        toast('10 observasi contoh ditambahkan.', 'info')
        setMenuOpen(false)
      }
    : undefined

  const handleDelete = async (id) => {
    try {
      await remove(id)
      toast('Data observasi dihapus.', 'info')
    } catch (e) {
      toast(e.message || 'Gagal menghapus data.', 'error')
    }
  }

  const teachers = useMemo(
    () => profiles.list.filter((p) => p.role === 'guru' && p.approved),
    [profiles.list],
  )

  return (
    <div className="min-h-screen">
      <Sidebar
        items={navItems}
        page={page}
        onNavigate={navigate}
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        total={observations.length}
        badges={{ pengguna: profiles.pendingCount }}
        onSeed={handleSeed}
        onClear={() => setConfirmClear(true)}
      />

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            onClick={() => setMenuOpen(true)}
            className="-ml-1 rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Buka menu"
          >
            <Menu className="size-5" />
          </button>
          <img src="/logo.png" alt="Logo" className="h-7 w-auto object-contain" />
          <span className="text-sm font-extrabold tracking-tight text-slate-900">Website Cermin 181</span>
        </header>

        {!hasSupabase && import.meta.env.PROD && (
          <div role="alert" className="flex items-start gap-3 bg-amber-100 px-4 py-3 text-sm text-amber-900">
            <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            <p>
              <b>Database belum terhubung.</b> Data hanya tersimpan di browser ini dan tidak dibagikan ke pengguna
              lain. Isi <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code>, lalu build ulang.
            </p>
          </div>
        )}

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-10">
          {error && (
            <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-800">
              <p>Gagal memuat data: {error}</p>
              <button type="button" onClick={reload} className="font-semibold underline underline-offset-2">
                Coba lagi
              </button>
            </div>
          )}

          {loading ? (
            <FullScreenLoader />
          ) : (
            <>
              {page === 'dashboard' && <Dashboard observations={observations} onNavigate={navigate} onSeed={handleSeed} />}
              {page === 'input' && (
                <ObservationForm observations={observations} teachers={teachers} onSave={add} onNavigate={navigate} />
              )}
              {page === 'rekap' && (
                <Records
                  observations={observations}
                  onDelete={handleDelete}
                  onSaveReflection={saveTeacherReflection}
                  onNavigate={navigate}
                  onSeed={handleSeed}
                />
              )}
              {page === 'analisis' && <Analysis observations={observations} onNavigate={navigate} onSeed={handleSeed} />}
              {page === 'pengguna' && <Users profiles={profiles} />}
            </>
          )}
        </main>
      </div>

      {clear && (
        <ConfirmDialog
          open={confirmClear}
          title="Hapus semua data?"
          message="Seluruh data observasi di browser ini akan dihapus permanen. Ekspor ke CSV terlebih dahulu bila data masih dibutuhkan."
          confirmLabel="Hapus semua"
          onCancel={() => setConfirmClear(false)}
          onConfirm={() => {
            clear()
            setConfirmClear(false)
            setMenuOpen(false)
            toast('Semua data observasi dihapus.', 'info')
          }}
        />
      )}
    </div>
  )
}

function Gate() {
  const { loading, session, profile } = useAuth()
  if (loading) return <FullScreenLoader />
  if (hasSupabase && !session) return <Login />
  if (hasSupabase && (!profile || !profile.approved)) return <Pending />
  return <Shell />
}

export default function App() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  )
}
