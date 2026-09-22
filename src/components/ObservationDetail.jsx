import { useState } from 'react'
import { CalendarDays, CircleCheck, LoaderCircle, Lightbulb, MessageSquareQuote, NotebookPen, Trash2, Users } from 'lucide-react'
import Modal from './Modal'
import { Button, CategoryBadge } from './ui'
import { Field, inputCls } from './form/Field'
import { useToast } from './Toast'
import { INDICATORS, SCORE_LEVELS } from '../data/indicators'
import { LEVEL_CATEGORY, getCategory } from '../utils/score'
import { fmt, formatDate } from '../utils/format'

function Block({ icon: Icon, title, children }) {
  return (
    <section className="mt-6">
      <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
        <Icon className="size-4 text-indigo-500" aria-hidden="true" />
        {title}
      </h3>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function TextRow({ label, text }) {
  if (!text) return null
  return (
    <div className="rounded-xl bg-slate-50 px-4 py-3">
      <p className="text-xs font-semibold text-slate-500">{label}</p>
      <p className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-800">{text}</p>
    </div>
  )
}

const REFLECTION_FIELDS = [
  ['berhasil', 'Apa yang berhasil?'],
  ['belum', 'Apa yang belum optimal?'],
  ['dukungan', 'Murid yang membutuhkan dukungan'],
  ['rencana', 'Rencana perbaikan pembelajaran berikutnya'],
]

/** Form isian refleksi guru, dipakai saat guru membuka observasinya sendiri. */
function TeacherReflectionForm({ observation, onSave }) {
  const toast = useToast()
  const [draft, setDraft] = useState({
    berhasil: '',
    belum: '',
    dukungan: '',
    rencana: '',
    ...observation.guruRef,
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const set = (k) => (e) => {
    setDraft((d) => ({ ...d, [k]: e.target.value }))
    setSaved(false)
  }

  const save = async () => {
    setSaving(true)
    try {
      await onSave(observation.id, draft)
      setSaved(true)
      toast('Refleksi tersimpan.')
    } catch (e) {
      toast(e.message || 'Gagal menyimpan refleksi.', 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {REFLECTION_FIELDS.map(([key, label]) => (
          <Field key={key} label={label} htmlFor={`ref-${key}`}>
            <textarea id={`ref-${key}`} rows={3} value={draft[key]} onChange={set(key)} className={inputCls} />
          </Field>
        ))}
      </div>
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="flex items-center gap-1.5 text-sm font-medium text-emerald-600">
            <CircleCheck className="size-4" aria-hidden="true" />
            Tersimpan
          </span>
        )}
        <Button disabled={saving} onClick={save}>
          {saving && <LoaderCircle className="mr-1.5 size-4 animate-spin" aria-hidden="true" />}
          Simpan refleksi
        </Button>
      </div>
    </div>
  )
}

export default function ObservationDetail({ observation: o, onClose, onDelete, onSaveReflection }) {
  if (!o) return null
  const cat = getCategory(o.avg)
  const murid = o.murid || {}
  const ref = o.guruRef || {}
  const hasMurid = murid.pemahaman || murid.disukai || murid.kesulitan || murid.saran || murid.kutipan?.length
  const hasRef = ref.berhasil || ref.belum || ref.dukungan || ref.rencana
  const canEditReflection = Boolean(onSaveReflection)

  return (
    <Modal
      open
      onClose={onClose}
      size="xl"
      title={o.guru}
      subtitle={`${o.mapel}, ${o.kelas}${o.topik ? ` · ${o.topik}` : ''}`}
      footer={
        <>
          {onDelete && (
            <Button variant="dangerSoft" icon={Trash2} onClick={() => onDelete(o)} className="mr-auto">
              Hapus
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            Tutup
          </Button>
        </>
      }
    >
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-4">
          <p className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
            <CalendarDays className="size-3.5" aria-hidden="true" /> Tanggal
          </p>
          <p className="mt-1 text-sm font-bold text-slate-900">{formatDate(o.tanggal)}</p>
        </div>
        <div className="rounded-xl bg-indigo-50 p-4">
          <p className="text-xs font-medium text-indigo-600">Rata-rata skor</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-indigo-900">
            {fmt(o.avg)}
            <span className="ml-1 text-sm font-semibold text-indigo-400">/ 4</span>
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-xs font-medium text-emerald-600">Nilai akhir</p>
          <p className="mt-1 text-2xl font-extrabold tabular-nums text-emerald-900">
            {o.nilai}
            <span className="ml-1 text-sm font-semibold text-emerald-400">/ 100</span>
          </p>
        </div>
        <div className="flex flex-col justify-center rounded-xl bg-slate-50 p-4">
          <p className="mb-1.5 text-xs font-medium text-slate-500">Kategori</p>
          <div>
            <CategoryBadge category={cat} />
          </div>
        </div>
      </div>

      <Block icon={NotebookPen} title="Skor 12 indikator">
        <ul className="space-y-2">
          {INDICATORS.map((ind, i) => {
            const s = o.scores[i]
            const lvl = LEVEL_CATEGORY[s]
            return (
              <li key={ind.id} className="rounded-xl border border-slate-100 p-3.5">
                <div className="flex items-center gap-3">
                  <span className={`grid size-7 shrink-0 place-items-center rounded-md text-xs font-bold ${lvl.soft}`}>
                    {s}
                  </span>
                  <p className="min-w-0 flex-1 text-sm font-semibold text-slate-900">
                    {i + 1}. {ind.title}
                  </p>
                  <span className="hidden text-xs font-medium text-slate-500 sm:block">
                    {SCORE_LEVELS[s - 1].label}
                  </span>
                </div>
                <div className="mt-2.5 flex items-center gap-3 pl-10">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${lvl.bar}`} style={{ width: `${(s / 4) * 100}%` }} />
                  </div>
                </div>
                <p className="mt-2 pl-10 text-xs leading-relaxed text-slate-500">{ind.rubric[s]}</p>
              </li>
            )
          })}
        </ul>
      </Block>

      {hasMurid && (
        <Block icon={Users} title="Suara & refleksi murid">
          <div className="space-y-2">
            {murid.pemahaman && (
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs font-semibold text-slate-500">Pemahaman murid</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">{murid.pemahaman}</p>
              </div>
            )}
            <TextRow label="Bagian yang paling disukai" text={murid.disukai} />
            <TextRow label="Kesulitan yang dialami" text={murid.kesulitan} />
            <TextRow label="Saran murid" text={murid.saran} />
            {murid.kutipan?.length > 0 && (
              <ul className="space-y-2 pt-1">
                {murid.kutipan.map((k, i) => (
                  <li key={i} className="flex gap-3 rounded-xl border-l-4 border-emerald-400 bg-emerald-50/60 px-4 py-3">
                    <MessageSquareQuote className="mt-0.5 size-4 shrink-0 text-emerald-600" aria-hidden="true" />
                    <div>
                      <p className="text-sm italic leading-relaxed text-slate-800">"{k.teks}"</p>
                      {k.nama && <p className="mt-1 text-xs font-semibold text-emerald-700">{k.nama}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </Block>
      )}

      <Block icon={Lightbulb} title="Refleksi guru">
        {canEditReflection ? (
          <TeacherReflectionForm observation={o} onSave={onSaveReflection} />
        ) : hasRef ? (
          <div className="space-y-2">
            <TextRow label="Yang berhasil" text={ref.berhasil} />
            <TextRow label="Yang belum optimal" text={ref.belum} />
            <TextRow label="Murid yang membutuhkan dukungan" text={ref.dukungan} />
            <TextRow label="Rencana perbaikan" text={ref.rencana} />
          </div>
        ) : (
          <p className="text-sm text-slate-500">Guru belum mengisi refleksi untuk observasi ini.</p>
        )}
      </Block>

      {o.catatan && (
        <Block icon={NotebookPen} title="Catatan observer">
          <TextRow label="Catatan" text={o.catatan} />
        </Block>
      )}
    </Modal>
  )
}
