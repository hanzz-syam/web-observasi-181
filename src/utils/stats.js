import { INDICATORS, PEMAHAMAN } from '../data/indicators'
import { CATEGORY_LIST, getCategory } from './score'

const mean = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0)
const norm = (s) => (s || '').trim().toLowerCase().replace(/\s+/g, ' ')

export const hasStudentVoice = (o) =>
  Boolean(
    o.murid &&
      (o.murid.pemahaman ||
        o.murid.disukai ||
        o.murid.kesulitan ||
        o.murid.saran ||
        (o.murid.kutipan && o.murid.kutipan.length)),
  )

export const hasTeacherReflection = (o) =>
  Boolean(o.guruRef && (o.guruRef.berhasil || o.guruRef.belum || o.guruRef.dukungan || o.guruRef.rencana))

// Kelompokkan berdasarkan kunci ternormalisasi (abaikan huruf besar/kecil & spasi ganda)
function groupBy(list, keyFn) {
  const map = new Map()
  for (const item of list) {
    const key = norm(keyFn(item))
    if (!key) continue
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  return [...map.values()]
}

export function computeStats(observations) {
  // urut kronologis (lama -> baru)
  const obs = [...observations].sort(
    (a, b) => a.tanggal.localeCompare(b.tanggal) || (a.createdAt || '').localeCompare(b.createdAt || ''),
  )
  const total = obs.length
  const avg = mean(obs.map((o) => o.avg))
  const nilai = mean(obs.map((o) => o.nilai))

  const indicatorAvgs = INDICATORS.map((_, i) => mean(obs.map((o) => o.scores[i] ?? 0).filter(Boolean)))

  const byGuru = groupBy(obs, (o) => o.guru)
    .map((items) => {
      const avgs = items.map((o) => o.avg)
      return {
        name: items[items.length - 1].guru,
        count: items.length,
        avg: mean(avgs),
        last: items[items.length - 1].tanggal,
        delta: items.length > 1 ? avgs[avgs.length - 1] - avgs[0] : null,
        indicatorAvgs: INDICATORS.map((_, i) => mean(items.map((o) => o.scores[i] ?? 0).filter(Boolean))),
      }
    })
    .sort((a, b) => b.count - a.count || b.last.localeCompare(a.last))

  const byMapel = groupBy(obs, (o) => o.mapel)
    .map((items) => ({
      name: items[items.length - 1].mapel,
      count: items.length,
      avg: mean(items.map((o) => o.avg)),
    }))
    .sort((a, b) => b.avg - a.avg)

  const ranked = indicatorAvgs
    .map((value, index) => ({ index, value }))
    .sort((a, b) => b.value - a.value)
  const strongest = total ? ranked.slice(0, 3) : []
  const weakest = total ? ranked.slice(-3).reverse() : []

  const categoryCounts = CATEGORY_LIST.map((c) => ({
    ...c,
    count: obs.filter((o) => getCategory(o.avg)?.key === c.key).length,
  }))

  const pemahaman = PEMAHAMAN.map((label) => ({
    label,
    count: obs.filter((o) => o.murid?.pemahaman === label).length,
  }))

  const trend = obs.map((o) => ({ id: o.id, tanggal: o.tanggal, avg: o.avg, guru: o.guru }))

  const quotes = obs
    .flatMap((o) =>
      (o.murid?.kutipan || []).map((k) => ({
        teks: k.teks,
        nama: k.nama,
        guru: o.guru,
        mapel: o.mapel,
        tanggal: o.tanggal,
      })),
    )
    .reverse()

  return {
    total,
    avg,
    nilai,
    indicatorAvgs,
    byGuru,
    byMapel,
    strongest,
    weakest,
    categoryCounts,
    pemahaman,
    trend,
    quotes,
    guruCount: byGuru.length,
    mostObserved: byGuru[0] ?? null,
    voiceCount: obs.filter(hasStudentVoice).length,
    reflectionCount: obs.filter(hasTeacherReflection).length,
  }
}
