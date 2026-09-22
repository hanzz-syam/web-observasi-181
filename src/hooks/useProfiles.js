import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

/** Daftar pengguna (hanya untuk kepala sekolah). Aktifkan dengan enabled = true. */
export function useProfiles(enabled) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState('')

  const reload = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('profiles')
      .select('id, email, nama, role, approved, created_at')
      .order('created_at', { ascending: true })
    if (err) {
      setError(err.message)
      return
    }
    setList(data)
    setError('')
  }, [])

  useEffect(() => {
    if (!enabled) return
    setLoading(true)
    reload().finally(() => setLoading(false))
  }, [enabled, reload])

  const update = useCallback(async (id, patch) => {
    const { data, error: err } = await supabase.from('profiles').update(patch).eq('id', id).select('id')
    if (err) throw err
    if (!data?.length) throw new Error('Perubahan ditolak oleh server.')
    setList((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }, [])

  return { list, loading, error, reload, update, pendingCount: list.filter((p) => !p.approved).length }
}
