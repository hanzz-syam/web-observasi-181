import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { hasSupabase, supabase } from '../lib/supabase'

// Mode lokal: tidak ada login, pengguna dianggap kepala sekolah.
const LOCAL_PROFILE = { id: 'local', nama: 'Kepala Sekolah', email: '', role: 'kepsek', approved: true }

const AuthContext = createContext(null)

async function fetchProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, nama, role, approved')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw error
  return data
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [sessionReady, setSessionReady] = useState(!hasSupabase)
  const [profile, setProfile] = useState(hasSupabase ? null : LOCAL_PROFILE)
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileError, setProfileError] = useState('')

  useEffect(() => {
    if (!hasSupabase) return
    let active = true
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return
      setSession(data.session)
      setSessionReady(true)
    })
    // Callback ini tidak boleh memanggil API supabase lain secara langsung.
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s))
    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  const userId = session?.user?.id

  useEffect(() => {
    if (!hasSupabase || !sessionReady) return
    if (!userId) {
      setProfile(null)
      setProfileError('')
      return
    }
    let active = true
    setProfileLoading(true)
    fetchProfile(userId)
      .then((p) => {
        if (!active) return
        setProfile(p)
        setProfileError(p ? '' : 'Profil pengguna tidak ditemukan.')
      })
      .catch((e) => active && setProfileError(e.message))
      .finally(() => active && setProfileLoading(false))
    return () => {
      active = false
    }
  }, [userId, sessionReady])

  const refreshProfile = useCallback(async () => {
    if (!userId) return
    setProfileLoading(true)
    try {
      setProfile(await fetchProfile(userId))
      setProfileError('')
    } catch (e) {
      setProfileError(e.message)
    } finally {
      setProfileLoading(false)
    }
  }, [userId])

  const signIn = useCallback(async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (nama, email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { nama } } })
    if (error) throw error
    // session null berarti Supabase meminta konfirmasi email terlebih dahulu
    return { needsConfirmation: !data.session }
  }, [])

  const signOut = useCallback(async () => {
    try {
      if (userId) window.localStorage.removeItem(`si-observasi-181:draft:${userId}`)
    } catch {
      /* abaikan */
    }
    await supabase.auth.signOut()
  }, [userId])

  const value = useMemo(
    () => ({
      hasSupabase,
      session,
      profile,
      profileError,
      loading: !sessionReady || (hasSupabase && Boolean(userId) && profileLoading && !profile),
      isKepsek: profile?.role === 'kepsek',
      signIn,
      signUp,
      signOut,
      refreshProfile,
    }),
    [session, profile, profileError, sessionReady, userId, profileLoading, signIn, signUp, signOut, refreshProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam AuthProvider')
  return ctx
}
