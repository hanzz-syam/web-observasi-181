import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocalStorage } from './useLocalStorage'
import { createSeedData } from '../data/seed'
import { hasSupabase, supabase } from '../lib/supabase'
import { fromRow, toRow } from '../lib/mappers'

const STORAGE_KEY = 'si-observasi-181:v1'

/** Mode lokal: data di localStorage perangkat ini. */
function useLocalObservations() {
  const [raw, setRaw] = useLocalStorage(STORAGE_KEY, [])
  const observations = useMemo(() => (Array.isArray(raw) ? raw : []), [raw])

  const add = useCallback(async (record) => setRaw((prev) => [record, ...(Array.isArray(prev) ? prev : [])]), [setRaw])
  const remove = useCallback(
    async (id) => setRaw((prev) => (Array.isArray(prev) ? prev : []).filter((o) => o.id !== id)),
    [setRaw],
  )
  const clear = useCallback(() => setRaw([]), [setRaw])
  const loadSeed = useCallback(
    () => setRaw((prev) => [...createSeedData(), ...(Array.isArray(prev) ? prev : [])]),
    [setRaw],
  )
  const saveTeacherReflection = useCallback(
    async (id, guruRef) => setRaw((prev) => prev.map((o) => (o.id === id ? { ...o, guruRef } : o))),
    [setRaw],
  )

  return { observations, loading: false, error: '', reload: async () => {}, add, remove, clear, loadSeed, saveTeacherReflection }
}

/** Mode Supabase: data di database bersama. Hak akses diatur oleh Row Level Security. */
function useRemoteObservations() {
  const [observations, setObservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('observations')
      .select('*')
      .order('tanggal', { ascending: false })
      .order('created_at', { ascending: false })
    if (err) {
      setError(err.message)
      return
    }
    setObservations(data.map(fromRow))
    setError('')
  }, [])

  useEffect(() => {
    setLoading(true)
    reload().finally(() => setLoading(false))
  }, [reload])

  // Muat ulang saat tab kembali dibuka, agar data terbaru dari pengguna lain ikut tampil
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && reload()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [reload])

  const add = useCallback(async (record) => {
    const { data, error: err } = await supabase.from('observations').insert(toRow(record)).select().single()
    if (err) throw err
    setObservations((prev) => [fromRow(data), ...prev])
  }, [])

  const remove = useCallback(async (id) => {
    const { data, error: err } = await supabase.from('observations').delete().eq('id', id).select('id')
    if (err) throw err
    if (!data?.length) throw new Error('Data tidak dapat dihapus (tidak ada izin atau sudah terhapus).')
    setObservations((prev) => prev.filter((o) => o.id !== id))
  }, [])

  const saveTeacherReflection = useCallback(async (id, guruRef) => {
    const { error: err } = await supabase.rpc('simpan_refleksi_guru', { p_id: id, p_ref: guruRef })
    if (err) throw err
    setObservations((prev) => prev.map((o) => (o.id === id ? { ...o, guruRef } : o)))
  }, [])

  return { observations, loading, error, reload, add, remove, clear: undefined, loadSeed: undefined, saveTeacherReflection }
}

// hasSupabase bernilai tetap selama aplikasi berjalan, sehingga urutan hook aman.
export const useObservations = hasSupabase ? useRemoteObservations : useLocalObservations
