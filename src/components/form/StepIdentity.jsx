import { Info } from 'lucide-react'
import { Field, inputCls } from './Field'
import { Card } from '../ui'
import { KELAS_SUGGESTIONS, MAPEL_SUGGESTIONS } from '../../data/indicators'

const selectCls =
  'mt-1.5 block w-full rounded-lg border-0 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm ring-1 ring-inset ring-slate-200 transition focus:ring-2 focus:ring-inset focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-400'

export default function StepIdentity({ value, onChange, errors, teacherNames, teachers, hasSupabase }) {
  const set = (k) => (e) => onChange(k, e.target.value)

  // Mode Supabase: guru wajib dipilih dari daftar akun yang sudah disetujui,
  // supaya observasi tertaut ke akun yang benar (guru_id).
  const onSelectTeacher = (e) => {
    const id = e.target.value
    const t = teachers?.find((x) => x.id === id)
    onChange('guruId', id || '')
    onChange('guru', t ? t.nama : '')
  }

  return (
    <Card className="p-5 sm:p-6">
      <h2 className="text-lg font-bold text-slate-900">Identitas observasi</h2>
      <p className="mt-0.5 text-sm text-slate-500">Isi data guru dan pembelajaran yang diamati.</p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          {hasSupabase ? (
            <Field label="Guru" required htmlFor="guru" error={errors.guru && 'Pilih guru yang diobservasi.'}>
              <select id="guru" value={value.guruId || ''} onChange={onSelectTeacher} className={selectCls}>
                <option value="">Pilih guru...</option>
                {teachers?.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nama}
                  </option>
                ))}
              </select>
              {teachers?.length === 0 && (
                <p className="mt-1.5 flex items-center gap-1.5 text-xs text-amber-600">
                  <Info className="size-3.5 shrink-0" aria-hidden="true" />
                  Belum ada guru yang disetujui. Setujui akun guru di halaman Pengguna terlebih dahulu.
                </p>
              )}
            </Field>
          ) : (
            <Field label="Nama guru" required htmlFor="guru" error={errors.guru && 'Nama guru wajib diisi.'}>
              <input
                id="guru"
                list="daftar-guru"
                value={value.guru}
                onChange={set('guru')}
                placeholder="Contoh: Siti Aminah, S.Pd."
                className={inputCls}
                autoComplete="off"
              />
              <datalist id="daftar-guru">
                {teacherNames.map((n) => (
                  <option key={n} value={n} />
                ))}
              </datalist>
            </Field>
          )}
        </div>

        <Field label="Kelas" required htmlFor="kelas" error={errors.kelas && 'Kelas wajib diisi.'}>
          <input
            id="kelas"
            list="daftar-kelas"
            value={value.kelas}
            onChange={set('kelas')}
            placeholder="Contoh: Kelas 4"
            className={inputCls}
            autoComplete="off"
          />
          <datalist id="daftar-kelas">
            {KELAS_SUGGESTIONS.map((k) => (
              <option key={k} value={k} />
            ))}
          </datalist>
        </Field>

        <Field label="Mata pelajaran" required htmlFor="mapel" error={errors.mapel && 'Mata pelajaran wajib diisi.'}>
          <input
            id="mapel"
            list="daftar-mapel"
            value={value.mapel}
            onChange={set('mapel')}
            placeholder="Contoh: Matematika"
            className={inputCls}
            autoComplete="off"
          />
          <datalist id="daftar-mapel">
            {MAPEL_SUGGESTIONS.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </Field>

        <Field label="Tanggal observasi" required htmlFor="tanggal" error={errors.tanggal && 'Tanggal wajib diisi.'}>
          <input id="tanggal" type="date" value={value.tanggal} onChange={set('tanggal')} className={inputCls} />
        </Field>

        <Field label="Topik pembelajaran" hint="Opsional" htmlFor="topik">
          <input
            id="topik"
            value={value.topik}
            onChange={set('topik')}
            placeholder="Contoh: Pecahan senilai"
            className={inputCls}
          />
        </Field>
      </div>
    </Card>
  )
}
