type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastEvent {
  message: string
  type: ToastType
  duration?: number
}

export const toast = {
  success: (message: string) => dispatchToast(message, 'success'),
  error: (message: string) => dispatchToast(message, 'error'),
  warning: (message: string) => dispatchToast(message, 'warning'),
  info: (message: string) => dispatchToast(message, 'info'),
}

function dispatchToast(message: string, type: ToastType) {
  if (typeof window === 'undefined') return

  const event = new CustomEvent<ToastEvent>('app-toast', {
    detail: { message, type, duration: 5000 },
  })
  window.dispatchEvent(event)
}
