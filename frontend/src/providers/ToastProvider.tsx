import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Toast {
  id: string
  message: string
  type: 'success' | 'error' | 'info' | 'warning'
}

interface ToastContextType {
  toasts: Toast[]
  addToast: (message: string, type?: Toast['type']) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const addToast = useCallback(
    (message: string, type: Toast['type'] = 'info') => {
      const id = Math.random().toString(36).slice(2)
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), 4000)
    },
    [removeToast],
  )

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={cn(
              'flex items-start gap-3 p-4 rounded-lg shadow-lg border backdrop-blur-sm animate-in slide-in-from-right',
              toast.type === 'success' && 'bg-green-50 border-green-200 text-green-800',
              toast.type === 'error' && 'bg-red-50 border-red-200 text-red-800',
              toast.type === 'info' && 'bg-blue-50 border-blue-200 text-blue-800',
              toast.type === 'warning' && 'bg-yellow-50 border-yellow-200 text-yellow-800',
            )}
          >
            {toast.type === 'success' && <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />}
            {toast.type === 'error' && <AlertCircle className="w-5 h-5 mt-0.5 shrink-0" />}
            {toast.type === 'info' && <Info className="w-5 h-5 mt-0.5 shrink-0" />}
            {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0" />}
            <p className="text-sm flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) throw new Error('useToast must be used within ToastProvider')
  return context
}
