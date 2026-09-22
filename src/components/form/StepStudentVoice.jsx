import { MessageSquareQuote, Plus, Trash2 } from 'lucide-react'
import { Field, inputCls } from './Field'
import { Button, Card } from '../ui'
import { PEMAHAMAN } from '../../data/indicators'

const CHIP_ACTIVE = {
  'Sudah sangat paham': 'bg-emerald-600 text-white ring-emerald-600',
  'Sudah paham': 'bg-indigo-600 text-white ring-indigo-600',
  'Masih sebagian': 'bg-amber-500 text-white ring-amber-500',
  'Belum paham': 'bg-rose-600 text-white ring-rose-600',
}

export default function StepStudentVoice({ value, onChange }) {
  const setField = (k) => (e) => onChange({ ...value, [k]: e.target.value })

  const setQuote = (idx, patch) =>
    onChange({ ...value, kutipan: value.kutipan.map((q, i) => (i === idx ? { ...q, ...patch } : q)) })
  const addQuote = () => onChange({ ...value, kutipan: [...value.kutipan, { nama: '', teks: '' }] })
  const removeQuote = (idx) => onChange({ ...value, kutipan: value.kutipan.filter((_, i) => i !== idx) })

  return (
    <div className="space-y-4">
      <Card className="p-5 sm:p-6">
        <h2 className="text-lg font-bold text-slate-900">Suara & refleksi murid</h2>
        <p className="mt-0.5 text-sm text-slate-500">
          Catat respons murid setelah pembelajaran. Bagian ini opsional, tetapi sangat membantu untuk coaching.
        </p>

        <div className="mt-6">
          <p className="text-sm font-semibold text-slate-700">Saya memahami pembelajaran hari ini</p>
          <div className="mt-2 flex flex-wrap gap-2" role="radiogroup" aria-label="Tingkat pemahaman murid">
            {PEMAHAMAN.map((p) => {
              const active = value.pemahaman === p
              return (
                <button
                  key={p}
                  type="button"
                  role="radio"
                  aria-checked={active}
                  onClick={() => onChange({ ...value, pemahaman: active ? '' : p })}
                  className={`rounded-full px-4 py-2 text-sm font-semibold ring-1 ring-inset transition-colors duration-200 ${
                    active ? CHIP_ACTIVE[p] : 'bg-white text-slate-600 ring-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {p}
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Field label="Bagian yang paling disukai" htmlFor="disukai">
            <textarea id="disukai" rows={3} value={value.disukai} onChange={setField('disukai')} className={inputCls} />
          </Field>
          <Field label="Kesulitan yang dialami" htmlFor="kesulitan">
            <textarea id="kesulitan" rows={3} value={value.kesulitan} onChange={setField('kesulitan')} className={inputCls} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Saran untuk pembelajaran berikutnya" htmlFor="saran">
              <textarea id="saran" rows={2} value={value.saran} onChange={setField('saran')} className={inputCls} />
            </Field>
          </div>
        </div>
      </Card>

      <Card className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-slate-900">Kutipan langsung murid</h3>
            <p className="mt-0.5 text-sm text-slate-500">Tulis kata-kata murid apa adanya. Nama boleh berupa inisial.</p>
          </div>
          <Button variant="secondary" size="sm" icon={Plus} onClick={addQuote}>
            Tambah kutipan
          </Button>
        </div>

        {value.kutipan.length === 0 ? (
          <div className="mt-5 flex flex-col items-center rounded-xl border border-dashed border-slate-200 px-4 py-8 text-center">
            <MessageSquareQuote className="size-6 text-slate-300" aria-hidden="true" />
            <p className="mt-2 text-sm text-slate-500">Belum ada kutipan. Tambahkan minimal satu ucapan murid.</p>
          </div>
        ) : (
          <ul className="mt-5 space-y-3">
            {value.kutipan.map((q, i) => (
              <li key={i} className="rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-200/70">
                <div className="flex gap-3">
                  <div className="grid gap-3 sm:flex-1 sm:grid-cols-[160px_1fr]">
                    <input
                      value={q.nama}
                      onChange={(e) => setQuote(i, { nama: e.target.value })}
                      placeholder="Nama / inisial"
                      aria-label={`Nama murid kutipan ${i + 1}`}
                      className="block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    />
                    <textarea
                      value={q.teks}
                      onChange={(e) => setQuote(i, { teks: e.target.value })}
                      rows={2}
                      placeholder="Apa kata murid? Contoh: “Aku suka karena boleh mencoba sendiri.”"
                      aria-label={`Kutipan murid ${i + 1}`}
                      className="block w-full rounded-lg border-0 bg-white px-3 py-2 text-sm shadow-sm ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeQuote(i)}
                    className="h-9 self-start rounded-lg p-2 text-slate-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
                    aria-label={`Hapus kutipan ${i + 1}`}
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}
