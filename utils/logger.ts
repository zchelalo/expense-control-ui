const isProduction = process.env.NODE_ENV === 'production'

function normalizeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return error
}

function writeProductionLog(level: 'error' | 'warn', message: string, data?: unknown) {
  const payload = JSON.stringify({
    level,
    message,
    data: normalizeError(data),
    ts: new Date().toISOString(),
    service: 'expense-control-ui',
  })

  if (level === 'error') {
    console.error(payload)
    return
  }

  console.warn(payload)
}

export const logger = {
  error: (message: string, error?: unknown) => {
    if (!isProduction) {
      console.error(`[ERROR] ${message}`, error)
    }

    if (isProduction) {
      writeProductionLog('error', message, error)
    }
  },
  warn: (message: string, data?: unknown) => {
    if (!isProduction) {
      console.warn(`[WARN] ${message}`, data)
      return
    }

    writeProductionLog('warn', message, data)
  },
}
