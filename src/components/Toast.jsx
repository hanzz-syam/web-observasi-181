import { createContext, useCallback, useContext, useState } from 'react'
import { CircleCheck, Info, TriangleAlert, X } from 'lucide-react'

const ToastContext = createContext(() => {})

const STYLES = {
  success: { icon: CircleCheck, cls: 'text-emerald-500' },
  info: { icon: Info, cls: 'text-indigo-500' },
  error: { icon: TriangleAlert, cls: 'text-rose-500' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const dismiss = useCallback((id) => setToasts((t) => t.filter((x) => x.id !== id)), [])

  const toast = useCallback(
    (message, type = 'success') => {
      const id = Date.now() + Math.random()
      setToasts((t) => [...t, { id, message, type }])
      setTimeout(() => dismiss(id), 3800)
    },
    [dismiss],
  )

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div
        className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-center gap-2 px-4 sm:items-end sm:pr-6"
        aria-live="polite"
      >
        {toasts.map((t) => {
          const { icon: Icon, cls } = STYLES[t.type] ?? STYLES.info
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm animate-toast items-start gap-3 rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-xl"
              role="status"
            >
              <Icon className={`mt-0.5 size-5 shrink-0 ${cls}`} aria-hidden="true" />
              <p className="flex-1 leading-snug">{t.message}</p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="rounded p-0.5 text-slate-400 transition-colors hover:text-white"
                aria-label="Tutup notifikasi"
              >
                <X className="size-4" />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
