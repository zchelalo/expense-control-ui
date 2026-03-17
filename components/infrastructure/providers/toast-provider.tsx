'use client'

import { clsx } from 'clsx'
import { CircleAlert, CircleCheck, Info, TriangleAlert, X } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import styles from '@/components/infrastructure/providers/toast-provider.module.css'
import type { ToastEvent } from '@/utils/toast'

interface ToastItem extends ToastEvent {
  id: number
}

export function ToastProvider() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  useEffect(() => {
    const handleToast = (event: Event) => {
      const customEvent = event as CustomEvent<ToastEvent>
      const newToast: ToastItem = {
        ...customEvent.detail,
        id: Date.now(),
      }

      setToasts((prev) => [...prev, newToast])

      setTimeout(() => {
        removeToast(newToast.id)
      }, newToast.duration || 5000)
    }

    window.addEventListener('app-toast', handleToast)
    return () => window.removeEventListener('app-toast', handleToast)
  }, [removeToast])

  return (
    <div className={styles.container}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={clsx(styles.toast, styles[toast.type])}
          role='alert'
        >
          <div className={styles.icon}>
            {toast.type === 'success' && <CircleCheck size={20} />}
            {toast.type === 'error' && <CircleAlert size={20} />}
            {toast.type === 'warning' && <TriangleAlert size={20} />}
            {toast.type === 'info' && <Info size={20} />}
          </div>
          <div className={styles.message}>{toast.message}</div>
          <button
            type='button'
            onClick={() => removeToast(toast.id)}
            style={{
              marginLeft: 'auto',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              opacity: 0.6,
            }}
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  )
}
