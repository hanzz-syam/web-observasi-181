import { MAX_SCORE } from '../data/indicators'

// Kategori mengikuti pembulatan skor rata-rata ke label 1-4:
// >= 3,5 Sangat Baik | >= 2,5 Baik | >= 1,5 Cukup | di bawahnya Perlu Perbaikan
export const CATEGORIES = {
  excellent: {
    key: 'excellent',
    label: 'Sangat Baik',
    min: 3.5,
    badge: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    soft: 'bg-emerald-100 text-emerald-800',
    bar: 'bg-emerald-500',
    dot: 'bg-emerald-500',
    text: 'text-emerald-600',
    stroke: 'stroke-emerald-500',
  },
  good: {
    key: 'good',
    label: 'Baik',
    min: 2.5,
    badge: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    soft: 'bg-indigo-100 text-indigo-800',
    bar: 'bg-indigo-500',
    dot: 'bg-indigo-500',
    text: 'text-indigo-600',
    stroke: 'stroke-indigo-500',
  },
  fair: {
    key: 'fair',
    label: 'Cukup',
    min: 1.5,
    badge: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    soft: 'bg-amber-100 text-amber-800',
    bar: 'bg-amber-500',
    dot: 'bg-amber-500',
    text: 'text-amber-600',
    stroke: 'stroke-amber-500',
  },
  poor: {
    key: 'poor',
    label: 'Perlu Perbaikan',
    min: 0,
    badge: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    soft: 'bg-rose-100 text-rose-800',
    bar: 'bg-rose-500',
    dot: 'bg-rose-500',
    text: 'text-rose-600',
    stroke: 'stroke-rose-500',
  },
}

export const CATEGORY_LIST = [CATEGORIES.excellent, CATEGORIES.good, CATEGORIES.fair, CATEGORIES.poor]

export function getCategory(avg) {
  if (!avg) return null
  return CATEGORY_LIST.find((c) => avg >= c.min) ?? CATEGORIES.poor
}

// Skor 1-4 pada satu indikator -> kategori
export const LEVEL_CATEGORY = {
  4: CATEGORIES.excellent,
  3: CATEGORIES.good,
  2: CATEGORIES.fair,
  1: CATEGORIES.poor,
}

/**
 * Hitung skor dari array skor (angka 1-4 atau null bila belum diisi).
 * - avg   : rata-rata skor (1-4)
 * - nilai : nilai akhir 0-100 = total / (jumlah terisi x 4) x 100
 */
export function calcScore(scores) {
  const filled = scores.filter((s) => typeof s === 'number')
  const sum = filled.reduce((a, b) => a + b, 0)
  const avg = filled.length ? sum / filled.length : 0
  const nilai = filled.length ? Math.round((sum / (filled.length * MAX_SCORE)) * 100) : 0
  return { sum, count: filled.length, avg, nilai, category: getCategory(avg) }
}
