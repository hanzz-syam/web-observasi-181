import { Field, inputCls } from './Field'
import { Card } from '../ui'
import ScoreRing from './ScoreRing'
import { CategoryBadge } from '../ui'
import { calcScore } from '../../utils/score'
import { fmt } from '../../utils/format'

export default function StepTeacherReflection({ value, onChange, catatan, onCatatan, scores, identitas }) {
  const set = (k) => (e) => onChange({ ...value, [k]: e.target.value })
  const { avg, nilai, category } = calcScore(scores)

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Refleksi guru</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Catatan pengembangan diri hasil diskusi antara kepala sekolah dan guru.
        </p>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Apa yang berhasil?" htmlFor="berhasil">
            <textarea id="berhasil" rows={3} value={value.berhasil} onChange={set('berhasil')} className={inputCls} />
          </Field>
          <Field label="Apa yang belum optimal?" htmlFor="belum">
            <textarea id="belum" rows={3} value={value.belum} onChange={set('belum')} className={inputCls} />
          </Field>
          <Field label="Murid yang membutuhkan dukungan" htmlFor="dukungan">
            <textarea id="dukungan" rows={3} value={value.dukungan} onChange={set('dukungan')} className={inputCls} />
          </Field>
          <Field label="Rencana perbaikan pembelajaran berikutnya" htmlFor="rencana">
            <textarea id="rencana" rows={3} value={value.rencana} onChange={set('rencana')} className={inputCls} />
          </Field>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <Field
          label="Catatan observer"
          hint="Kesepakatan coaching, praktik baik, atau tindak lanjut yang perlu dipantau."
          htmlFor="catatan"
        >
          <textarea
            id="catatan"
            rows={4}
            value={catatan}
            onChange={(e) => onCatatan(e.target.value)}
            className={inputCls}
          />
        </Field>
      </Card>

      <Card className="flex items-center gap-5 bg-gradient-to-br from-indigo-50 to-emerald-50 p-5 sm:p-6">
        <ScoreRing value={avg} category={category} className="size-24" valueClass="text-2xl" />
        <div className="min-w-0">
          <p className="text-sm text-slate-500">Ringkasan sebelum disimpan</p>
          <p className="truncate text-base font-bold text-slate-900">{identitas.guru || 'Guru belum diisi'}</p>
          <p className="truncate text-sm text-slate-600">
            {identitas.mapel || '-'}, {identitas.kelas || '-'}
          </p>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-slate-700">
              Skor {fmt(avg)} · Nilai {nilai}
            </span>
            <CategoryBadge category={category} />
          </div>
        </div>
      </Card>
    </div>
  )
}
