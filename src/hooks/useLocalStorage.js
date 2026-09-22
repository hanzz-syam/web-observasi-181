import { useEffect, useRef, useState } from 'react'

function read(key, initial) {
  const fallback = typeof initial === 'function' ? initial() : initial
  try {
    const raw = window.localStorage.getItem(key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

/**
 * useState yang otomatis tersimpan di localStorage
 * dan ikut ter-update bila tab lain mengubah data yang sama.
 */
export function useLocalStorage(key, initial) {
  const [value, setValue] = useState(() => read(key, initial))
  const initialRef = useRef(initial)
  initialRef.current = initial

  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      console.warn('Gagal menyimpan ke localStorage:', err)
    }
  }, [key, value])

  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === key) setValue(read(key, initialRef.current))
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [key])

  return [value, setValue]
}
