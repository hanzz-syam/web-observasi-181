import { Award, CircleCheck, Sprout, TrendingUp } from 'lucide-react'

// Ikon kecil per kategori agar status tidak hanya dibedakan lewat warna
const MAP = { excellent: Award, good: CircleCheck, fair: TrendingUp, poor: Sprout }

export function CategoryIcon({ categoryKey, className = 'size-3.5' }) {
  const Icon = MAP[categoryKey] ?? CircleCheck
  return <Icon className={className} aria-hidden="true" />
}
