import { cookies, headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { logger } from '@/utils/logger'
import { toast } from '@/utils/toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Extracts only name=value pairs from Set-Cookie headers for use in Cookie header.
 */
function parseSetCookieToCookie(setCookieHeaders: string[]): string {
  return setCookieHeaders
    .map((cookieStr) => {
      const parts = cookieStr.split(';')
      return parts[0] // The first part is always name=value
    })
    .join('; ')
}

/**
 * Wrapper around fetch that automatically includes credentials and handles 401 responses by attempting a token refresh.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const locale = await getLocale()
  const isServer = typeof window === 'undefined'

  const mergedOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  // Inject headers in server context
  if (isServer) {
    try {
      const cookieStore = await cookies()
      const headerStore = await headers()

      // Forward ALL cookies from the incoming request
      const cookieString = cookieStore.toString()
      if (cookieString) {
        mergedOptions.headers = {
          ...mergedOptions.headers,
          Cookie: cookieString,
        }
      }

      // Forward User-Agent and other potentially relevant headers for session validation
      const userAgent = headerStore.get('user-agent')
      if (userAgent) {
        mergedOptions.headers = {
          ...mergedOptions.headers,
          'User-Agent': userAgent,
        }
      }

      // Forward X-Forwarded-For if behind a proxy
      const forwardedFor = headerStore.get('x-forwarded-for')
      if (forwardedFor) {
        mergedOptions.headers = {
          ...mergedOptions.headers,
          'X-Forwarded-For': forwardedFor,
        }
      }
    } catch (e) {
      logger.warn(
        'fetchWithAuth: No se pudieron obtener headers/cookies del servidor. Esto es normal en build time.',
        e,
      )
    }
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${url}`, mergedOptions)
  } catch (e) {
    logger.error(`fetchWithAuth: Falló la petición a ${url}`, e)
    if (!isServer) {
      toast.error('Error de conexión con el servidor')
    }
    throw e
  }

  // Handle 401: try refresh
  if (response.status === 401) {
    let refreshResponse: Response

    try {
      refreshResponse = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: mergedOptions.headers,
      })
    } catch (e) {
      logger.error('fetchWithAuth: Error durante refresh', e)

      if (!isServer) {
        toast.error('Error crítico de autenticación')
        window.location.href = '/login'
        return response
      }

      throw e
    }

    if (refreshResponse.ok) {
      // Update cookies for the retry request
      if (isServer) {
        const setCookieHeaders = refreshResponse.headers.getSetCookie()
        if (setCookieHeaders.length > 0) {
          const newCookies = parseSetCookieToCookie(setCookieHeaders)
          mergedOptions.headers = {
            ...mergedOptions.headers,
            Cookie: newCookies,
          }
        }
      }

      // Retry original request
      return await fetch(`${API_URL}${url}`, mergedOptions)
    }

    // If refresh failed: redirect / logout
    if (!isServer) {
      toast.error('Su sesión ha expirado. Por favor, inicie sesión de nuevo.')
      window.location.href = '/login'
      return response
    }

    redirect({
      href: '/login',
      locale,
    })
  }

  if (!response.ok && !isServer) {
    toast.error('Error en la petición')
  }

  return response
}
