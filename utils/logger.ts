const isProduction = process.env.NODE_ENV === 'production'

export const logger = {
  error: (message: string, error?: unknown) => {
    if (!isProduction) {
      console.error(`[ERROR] ${message}`, error)
    }

    if (isProduction) {
    }
  },
  warn: (message: string, data?: unknown) => {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, data)
    }
  },
}
