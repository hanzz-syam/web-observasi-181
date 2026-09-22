import { INDICATORS } from '../data/indicators'
import { getCategory } from './score'

// Excel berbahasa Indonesia biasanya memakai titik koma sebagai pemisah kolom
// dan koma sebagai pemisah desimal, sehingga keduanya dapat dipilih.
export const DELIMITERS = {
  ';': { label: 'Titik koma (Excel Indonesia)', decimal: ',' },
  ',': { label: 'Koma (standar / Google Sheets)', decimal: '.' },
}

function cell(value, delimiter) {
  let s = value === null || value === undefined ? '' : String(value)
  s = s.replace(/\s*\r?\n\s*/g, ' / ')
  // cegah "CSV injection": sel yang diawali rumus tidak boleh dieksekusi Excel
  if (/^[=+\-@\t\r]/.test(s) && Number.isNaN(Number(s.replace(',', '.')))) s = `'${s}`
  const needsQuote = s.includes('"') || s.includes(delimiter) || /[\r\n]/.test(s)
  return needsQuote ? `"${s.replace(/"/g, '""')}"` : s
}

export function buildObservationCSV(observations, delimiter = ';') {
  const decimal = DELIMITERS[delimiter]?.decimal ?? '.'
  const num = (n, d) => n.toFixed(d).replace('.', decimal)

  const header = [
    'No',
    'Tanggal',
    'Guru',
    'Kelas',
    'Mata Pelajaran',
    'Topik',
    ...INDICATORS.map((ind, i) => `I${i + 1} ${ind.title}`),
    'Total Skor (maks 48)',
    'Rata-rata Skor (1-4)',
    'Nilai Akhir (0-100)',
    'Kategori',
    'Pemahaman Murid',
    'Bagian Paling Disukai Murid',
    'Kesulitan Murid',
    'Saran Murid',
    'Kutipan Murid',
    'Refleksi Guru: Yang Berhasil',
    'Refleksi Guru: Belum Optimal',
    'Refleksi Guru: Murid Perlu Dukungan',
    'Refleksi Guru: Rencana Perbaikan',
    'Catatan Observer',
  ]

  const rows = observations.map((o, idx) => [
    idx + 1,
    o.tanggal,
    o.guru,
    o.kelas,
    o.mapel,
    o.topik,
    ...INDICATORS.map((_, i) => o.scores[i] ?? ''),
    o.sum,
    num(o.avg, 2),
    o.nilai,
    getCategory(o.avg)?.label ?? '',
    o.murid?.pemahaman,
    o.murid?.disukai,
    o.murid?.kesulitan,
    o.murid?.saran,
    (o.murid?.kutipan || []).map((k) => (k.nama ? `${k.nama}: "${k.teks}"` : `"${k.teks}"`)).join(' | '),
    o.guruRef?.berhasil,
    o.guruRef?.belum,
    o.guruRef?.dukungan,
    o.guruRef?.rencana,
    o.catatan,
  ])

  // BOM (\uFEFF) agar Excel membaca UTF-8 dengan benar; CRLF sebagai pemisah baris
  return '\uFEFF' + [header, ...rows].map((r) => r.map((c) => cell(c, delimiter)).join(delimiter)).join('\r\n')
}

export function downloadCSV(filename, content) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
