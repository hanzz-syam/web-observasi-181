import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight, RotateCcw, Save } from 'lucide-react'
import { Button, PageHeader } from '../components/ui'
import ConfirmDialog from '../components/ConfirmDialog'
import { useToast } from '../components/Toast'
import Stepper from '../components/form/Stepper'
import ScorePanel from '../components/form/ScorePanel'
import StepIdentity from '../components/form/StepIdentity'
import StepIndicators from '../components/form/StepIndicators'
import StepStudentVoice from '../components/form/StepStudentVoice'
import StepTeacherReflection from '../components/form/StepTeacherReflection'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { hasSupabase } from '../lib/supabase'
import { INDICATOR_COUNT } from '../data/indicators'
import { calcScore } from '../utils/score'
import { todayISO, uid } from '../utils/format'

const STEPS = [
  { key: 'identitas', label: 'Identitas' },
  { key: 'indikator', label: 'Indikator' },
  { key: 'murid', label: 'Suara murid' },
  { key: 'guru', label: 'Refleksi guru' },
]

const emptyForm = () => ({
  identitas: { guru: '', guruId: '', kelas: '', mapel: '', tanggal: todayISO(), topik: '' },
  scores: Array(INDICATOR_COUNT).fill(null),
  murid: { pemahaman: '', disukai: '', kesulitan: '', saran: '', kutipan: [] },
  guruRef: { berhasil: '', belum: '', dukungan: '', rencana: '' },
  catatan: '',
})

export default function ObservationForm({ observations, teachers = [], onSave, onNavigate }) {
  const toast = useToast()
  // draf tersimpan otomatis, jadi tidak hilang jika halaman tertutup
  const [form, setForm] = useLocalStorage('si-observasi-181:draft', emptyForm)
  const [step, setStep] = useState(0)
  const [showErrors, setShowErrors] = useState(false)
  const [confirmReset, setConfirmReset] = useState(false)

  const teacherNames = useMemo(() => [...new Set(observations.map((o) => o.guru))].sort(), [observations])

  const { identitas, scores } = form
  const errors = {
    guru: !identitas.guru.trim(),
    kelas: !identitas.kelas.trim(),
    mapel: !identitas.mapel.trim(),
    tanggal: !identitas.tanggal,
  }
  const identityValid = !Object.values(errors).some(Boolean) && (!hasSupabase || Boolean(identitas.guruId))
  const scoresDone = scores.length === INDICATOR_COUNT && scores.every((s) => s !== null)

  const canGo = (target) => {
    if (target <= 0) return true
    if (target >= 1 && !identityValid) return false
    if (target >= 2 && !scoresDone) return false
    return true
  }

  const patch = (key, value) => setForm((f) => ({ ...f, [key]: value }))
  const setIdentitas = (k, v) => setForm((f) => ({ ...f, identitas: { ...f.identitas, [k]: v } }))
  const setScore = (i, v) =>
    setForm((f) => ({ ...f, scores: f.scores.map((s, idx) => (idx === i ? v : s)) }))

  const go = (target) => {
    setStep(target)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const next = () => {
    if (step === 0 && !identityValid) {
      setShowErrors(true)
      toast('Lengkapi identitas guru, kelas, mata pelajaran, dan tanggal.', 'error')
      return
    }
    if (step === 1 && !scoresDone) {
      setShowErrors(true)
      const first = scores.findIndex((s) => s === null)
      toast(`Masih ${scores.filter((s) => s === null).length} indikator belum dinilai.`, 'error')
      document.getElementById(`indikator-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    go(step + 1)
  }

  const save = () => {
    if (!identityValid || !scoresDone) {
      setShowErrors(true)
      go(!identityValid ? 0 : 1)
      toast('Data belum lengkap. Periksa identitas dan 12 indikator.', 'error')
      return
    }
    const { sum, avg, nilai } = calcScore(scores)
    const record = {
      id: uid(),
      createdAt: new Date().toISOString(),
      guruId: identitas.guruId || null,
      tanggal: identitas.tanggal,
      guru: identitas.guru.trim(),
      kelas: identitas.kelas.trim(),
      mapel: identitas.mapel.trim(),
      topik: identitas.topik.trim(),
      scores,
      sum,
      avg: Math.round(avg * 100) / 100,
      nilai,
      murid: {
        ...form.murid,
        kutipan: form.murid.kutipan.filter((q) => q.teks.trim()).map((q) => ({ nama: q.nama.trim(), teks: q.teks.trim() })),
      },
      guruRef: form.guruRef,
      catatan: form.catatan.trim(),
    }
    onSave(record)
    setForm(emptyForm())
    setStep(0)
    setShowErrors(false)
    toast(`Observasi ${record.guru} disimpan.`)
    onNavigate('rekap')
  }

  return (
    <>
      <PageHeader
        title="Input observasi"
        subtitle="Isi per langkah. Draf tersimpan otomatis di browser dan nilai akhir dihitung langsung."
        actions={
          <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => setConfirmReset(true)}>
            Kosongkan formulir
          </Button>
        }
      />

      <div className="mb-6">
        <Stepper steps={STEPS} current={step} onGo={(i) => canGo(i) && go(i)} canGo={canGo} />
      </div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="min-w-0">
          {step === 0 && (
            <StepIdentity
              value={identitas}
              onChange={setIdentitas}
              errors={showErrors ? errors : {}}
              teacherNames={teacherNames}
              teachers={teachers}
              hasSupabase={hasSupabase}
            />
          )}
          {step === 1 && <StepIndicators scores={scores} onScore={setScore} showErrors={showErrors} />}
          {step === 2 && <StepStudentVoice value={form.murid} onChange={(v) => patch('murid', v)} />}
          {step === 3 && (
            <StepTeacherReflection
              value={form.guruRef}
              onChange={(v) => patch('guruRef', v)}
              catatan={form.catatan}
              onCatatan={(v) => patch('catatan', v)}
              scores={scores}
              identitas={identitas}
            />
          )}

          <div className="mt-6 flex items-center justify-between gap-3">
            <Button variant="secondary" icon={ChevronLeft} onClick={() => go(step - 1)} disabled={step === 0}>
              Kembali
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={next}>
                Lanjut
                <ChevronRight className="size-4" aria-hidden="true" />
              </Button>
            ) : (
              <Button variant="success" icon={Save} onClick={save}>
                Simpan observasi
              </Button>
            )}
          </div>
        </div>

        <ScorePanel scores={scores} />
      </div>

      <ConfirmDialog
        open={confirmReset}
        title="Kosongkan formulir?"
        message="Semua isian pada draf observasi ini akan dihapus. Data observasi yang sudah tersimpan tidak terpengaruh."
        confirmLabel="Kosongkan"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          setForm(emptyForm())
          setStep(0)
          setShowErrors(false)
          setConfirmReset(false)
          toast('Formulir dikosongkan.', 'info')
        }}
      />
    </>
  )
}
