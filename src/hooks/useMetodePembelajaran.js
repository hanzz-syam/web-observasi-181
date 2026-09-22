import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const BUCKET = 'metode-pembelajaran'
const TABLE = 'metode_pembelajaran'

/**
 * Hook untuk manajemen Metode Pembelajaran.
 *
 * @param {object} opts
 * @param {string|null} opts.userId - ID pengguna yang sedang login (guru_id)
 * @param {boolean} opts.isKepsek  - true jika user adalah kepala sekolah
 */
export function useMetodePembelajaran({ userId, isKepsek }) {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  /* ─── FETCH ─────────────────────────────────────────────── */
  const fetch = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      let query = supabase
        .from(TABLE)
        .select(`
          id, judul, mapel, deskripsi,
          file_path, file_name, file_type,
          created_at, updated_at, guru_id,
          profiles:guru_id ( nama, email )
        `)
        .order('created_at', { ascending: false })

      // Guru hanya melihat miliknya; kepsek melihat semua (RLS handle di DB)
      if (!isKepsek) {
        query = query.eq('guru_id', userId)
      }

      const { data, error: qErr } = await query
      if (qErr) throw qErr
      setList(data ?? [])
    } catch (e) {
      setError(e.message || 'Gagal memuat data.')
    } finally {
      setLoading(false)
    }
  }, [userId, isKepsek])

  useEffect(() => {
    fetch()
  }, [fetch])

  /* ─── ADD ────────────────────────────────────────────────── */
  /**
   * Upload file ke Storage dan simpan metadata ke tabel.
   * @param {{ judul: string, mapel: string, deskripsi: string, file: File|null }} payload
   */
  const add = useCallback(
    async ({ judul, mapel, deskripsi, file }) => {
      if (!userId) throw new Error('Pengguna belum login.')

      let file_path = null
      let file_name = null
      let file_type = null

      // Upload file jika ada
      if (file) {
        const ext = file.name.split('.').pop()
        const uniqueName = `${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`
        const storagePath = `${userId}/${uniqueName}`

        const { error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(storagePath, file, { cacheControl: '3600', upsert: false })

        if (upErr) throw upErr
        file_path = storagePath
        file_name = file.name
        file_type = file.type
      }

      const { data, error: insErr } = await supabase
        .from(TABLE)
        .insert({ guru_id: userId, judul, mapel, deskripsi, file_path, file_name, file_type })
        .select()
        .single()

      if (insErr) {
        // Rollback: hapus file yang terlanjur di-upload
        if (file_path) {
          await supabase.storage.from(BUCKET).remove([file_path])
        }
        throw insErr
      }

      setList((prev) => [data, ...prev])
      return data
    },
    [userId],
  )

  /* ─── REMOVE ─────────────────────────────────────────────── */
  const remove = useCallback(async (id) => {
    const item = list.find((m) => m.id === id)
    if (!item) return

    // Hapus file dari Storage jika ada
    if (item.file_path) {
      const { error: delStorageErr } = await supabase.storage
        .from(BUCKET)
        .remove([item.file_path])
      if (delStorageErr) throw delStorageErr
    }

    const { error: delErr } = await supabase.from(TABLE).delete().eq('id', id)
    if (delErr) throw delErr

    setList((prev) => prev.filter((m) => m.id !== id))
  }, [list])

  /* ─── GET SIGNED URL ─────────────────────────────────────── */
  /**
   * Menghasilkan signed URL (1 jam) untuk download/preview file.
   * @param {string} filePath - path storage (uid/filename)
   * @returns {Promise<string>} URL yang bisa digunakan
   */
  const getSignedUrl = useCallback(async (filePath) => {
    const { data, error: urlErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(filePath, 3600) // 1 jam
    if (urlErr) throw urlErr
    return data.signedUrl
  }, [])

  return { list, loading, error, reload: fetch, add, remove, getSignedUrl }
}
