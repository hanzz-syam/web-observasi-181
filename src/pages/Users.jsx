import { useMemo, useState } from 'react'
import { Check, LoaderCircle, UsersRound, X } from 'lucide-react'
import { Button, Card, EmptyState, PageHeader } from '../components/ui'
import { useToast } from '../components/Toast'
import { useAuth } from '../context/AuthContext'

const selectCls =
  'rounded-lg border-0 bg-white py-1.5 pl-3 pr-8 text-sm text-slate-700 shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400'

export default function Users({ profiles }) {
  const toast = useToast()
  const currentId = useAuth().profile?.id
  const [busyId, setBusyId] = useState(null)

  const rows = useMemo(
    () => [...profiles.list].sort((a, b) => Number(a.approved) - Number(b.approved)),
    [profiles.list],
  )

  const change = async (p, patch, okMessage) => {
    setBusyId(p.id)
    try {
      await profiles.update(p.id, patch)
      toast(okMessage, 'info')
    } catch (e) {
      toast(e.message || 'Gagal menyimpan perubahan.', 'error')
    } finally {
      setBusyId(null)
    }
  }

  const others = rows.filter((p) => p.id !== currentId)

  return (
    <>
      <PageHeader
        title="Pengguna"
        subtitle="Setujui guru yang mendaftar dan atur perannya. Guru hanya dapat melihat observasi yang ditautkan ke akunnya."
      />

      {profiles.error && (
        <p className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{profiles.error}</p>
      )}

      <Card className="overflow-hidden">
        {profiles.loading ? (
          <div className="grid place-items-center py-16 text-slate-400">
            <LoaderCircle className="size-6 animate-spin" aria-label="Memuat" />
          </div>
        ) : others.length === 0 ? (
          <EmptyState
            icon={UsersRound}
            title="Belum ada guru yang mendaftar"
            description="Bagikan alamat website ini kepada guru. Mereka memilih Daftar, lalu Anda menyetujuinya di sini."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-sm">
              <thead className="bg-slate-50 text-xs text-slate-500">
                <tr>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Pengguna</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Peran</th>
                  <th scope="col" className="px-4 py-3 text-left font-semibold">Status</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {others.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-slate-900">{p.nama || '(tanpa nama)'}</p>
                      <p className="text-xs text-slate-500">{p.email}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <select
                        value={p.role}
                        disabled={busyId === p.id}
                        onChange={(e) => change(p, { role: e.target.value }, `Peran ${p.nama || p.email} diubah.`)}
                        className={selectCls}
                        aria-label={`Peran ${p.nama || p.email}`}
                      >
                        <option value="guru">Guru</option>
                        <option value="kepsek">Kepala sekolah</option>
                      </select>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                          p.approved
                            ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20'
                            : 'bg-amber-50 text-amber-700 ring-amber-600/20'
                        }`}
                      >
                        {p.approved ? 'Aktif' : 'Menunggu persetujuan'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {p.approved ? (
                        <Button
                          variant="dangerSoft"
                          size="sm"
                          icon={X}
                          disabled={busyId === p.id}
                          onClick={() => change(p, { approved: false }, `Akses ${p.nama || p.email} dicabut.`)}
                        >
                          Cabut akses
                        </Button>
                      ) : (
                        <Button
                          variant="success"
                          size="sm"
                          icon={Check}
                          disabled={busyId === p.id}
                          onClick={() => change(p, { approved: true }, `${p.nama || p.email} disetujui.`)}
                        >
                          Setujui
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  )
}
