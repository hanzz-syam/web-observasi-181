import { CircleAlert, Clock, LogOut, RefreshCw } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui'

export default function Pending() {
  const { profile, profileError, refreshProfile, signOut } = useAuth()
  const failed = Boolean(profileError) || !profile

  return (
    <div className="grid min-h-screen place-items-center px-5">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-[0_8px_30px_-12px_rgba(30,27,75,0.2)] ring-1 ring-slate-900/[0.04]">
        <div
          className={`mx-auto grid size-14 place-items-center rounded-2xl ${
            failed ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
          }`}
        >
          {failed ? <CircleAlert className="size-7" aria-hidden="true" /> : <Clock className="size-7" aria-hidden="true" />}
        </div>

        {failed ? (
          <>
            <h1 className="mt-5 text-xl font-extrabold text-slate-900">Profil tidak dapat dimuat</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              {profileError || 'Profil pengguna tidak ditemukan.'} Pastikan file <code>supabase/schema.sql</code> sudah
              dijalankan di proyek Supabase.
            </p>
          </>
        ) : (
          <>
            <h1 className="mt-5 text-xl font-extrabold text-slate-900">Menunggu persetujuan</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-500">
              Halo {profile.nama || profile.email}. Akun Anda sudah terdaftar, tetapi belum disetujui kepala sekolah.
              Setelah disetujui, muat ulang halaman ini.
            </p>
          </>
        )}

        <div className="mt-6 flex justify-center gap-2">
          <Button icon={RefreshCw} onClick={refreshProfile}>
            Cek lagi
          </Button>
          <Button variant="secondary" icon={LogOut} onClick={signOut}>
            Keluar
          </Button>
        </div>
      </div>
    </div>
  )
}
