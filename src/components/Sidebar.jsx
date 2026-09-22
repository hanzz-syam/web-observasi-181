import {
  ChartColumn,
  Database,
  LayoutDashboard,
  LogOut,
  PencilLine,
  School,
  Table2,
  Trash2,
  UsersRound,
  X,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

export function getNavItems({ isKepsek, hasSupabase }) {
  if (!isKepsek) {
    return [
      { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { key: 'rekap', label: 'Observasi Saya', icon: Table2 },
      { key: 'analisis', label: 'Analisis', icon: ChartColumn },
    ]
  }
  return [
    { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { key: 'input', label: 'Input Observasi', icon: PencilLine },
    { key: 'rekap', label: 'Rekap Data', icon: Table2 },
    { key: 'analisis', label: 'Analisis', icon: ChartColumn },
    ...(hasSupabase ? [{ key: 'pengguna', label: 'Pengguna', icon: UsersRound }] : []),
  ]
}

export default function Sidebar({ items, page, onNavigate, open, onClose, total, badges = {}, onSeed, onClear }) {
  const { hasSupabase, profile, isKepsek, signOut } = useAuth()

  return (
    <>
      {open && (
        <div className="fixed inset-0 z-40 bg-indigo-950/50 backdrop-blur-[2px] lg:hidden" onClick={onClose} aria-hidden="true" />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-indigo-950 text-indigo-100 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Navigasi utama"
      >
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <img
              src="/logo.png"
              alt="Logo"
              className="h-11 w-auto object-contain"
            />

            <div>
              <p className="text-[15px] font-extrabold leading-tight tracking-tight text-white">Cermin 181</p>
              <p className="text-xs text-indigo-300">UPT SDN 181 Gresik</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-indigo-300 hover:bg-white/10 hover:text-white lg:hidden"
            aria-label="Tutup menu"
          >
            <X className="size-5" />
          </button>
        </div>

        <nav className="mt-4 flex-1 space-y-1 px-4">
          {items.map(({ key, label, icon: Icon }) => {
            const active = page === key
            const badge = key === 'rekap' ? total : badges[key]
            return (
              <button
                key={key}
                type="button"
                onClick={() => onNavigate(key)}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition-colors duration-200 ${
                  active ? 'bg-white/10 text-white' : 'text-indigo-200 hover:bg-white/5 hover:text-white'
                }`}
              >
                {active && <span className="absolute -left-4 h-6 w-1 rounded-r-full bg-emerald-400" aria-hidden="true" />}
                <Icon className={`size-5 ${active ? 'text-emerald-300' : 'text-indigo-300 group-hover:text-emerald-300'}`} aria-hidden="true" />
                {label}
                {badge > 0 && (
                  <span
                    className={`ml-auto rounded-full px-2 py-0.5 text-xs font-bold tabular-nums ${
                      key === 'pengguna' ? 'bg-amber-400 text-amber-950' : 'bg-white/10 text-indigo-100'
                    }`}
                  >
                    {badge}
                  </span>
                )}
              </button>
            )
          })}
        </nav>

        {hasSupabase ? (
          <div className="m-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center rounded-full bg-emerald-400/15 text-sm font-bold text-emerald-300">
                {(profile?.nama || profile?.email || '?').trim().charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white">{profile?.nama || profile?.email}</p>
                <p className="text-xs text-indigo-300">{isKepsek ? 'Kepala sekolah' : 'Guru'}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={signOut}
              className="mt-3 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs font-semibold text-indigo-200 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="size-3.5" aria-hidden="true" />
              Keluar
            </button>
          </div>
        ) : (
          <div className="m-4 rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Database className="size-4 text-emerald-300" aria-hidden="true" />
              Mode lokal
            </div>
            <p className="mt-1.5 text-xs leading-relaxed text-indigo-300">
              Data hanya tersimpan di browser perangkat ini. Hubungkan Supabase agar guru dan kepala sekolah berbagi data.
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              <button
                type="button"
                onClick={onSeed}
                className="rounded-lg bg-emerald-400/15 px-3 py-2 text-left text-xs font-semibold text-emerald-300 transition-colors hover:bg-emerald-400/25"
              >
                Muat data contoh
              </button>
              <button
                type="button"
                onClick={onClear}
                disabled={total === 0}
                className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-left text-xs font-semibold text-rose-300 transition-colors hover:bg-rose-400/10 disabled:opacity-40"
              >
                <Trash2 className="size-3.5" aria-hidden="true" />
                Hapus semua data
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  )
}
