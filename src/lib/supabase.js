import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Bila variabel belum diisi, aplikasi berjalan dalam mode lokal (localStorage, tanpa login).
export const hasSupabase = Boolean(url && key)

export const supabase = hasSupabase
  ? createClient(url, key, { auth: { persistSession: true, autoRefreshToken: true } })
  : null
