import { cookies } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { logger } from '@/utils/logger'
import { toast } from '@/utils/toast'

const API_URL = process.env.NEXT_PUBLIC_API_URL

/**
 * Wrapper around fetch that automatically includes credentials and handles 401 responses by attempting a token refresh.
 *
 * @param url - Relative URL of the API endpoint (e.g. '/v1/auth/refresh')
 * @param options - Fetch options (method, headers, body, etc.)
 * @returns - A Promise resolving to the Response object
 * @example
 * ```ts
 * const response = await fetchWithAuth('/v1/protected/resource', {
 *   method: 'GET',
 * })
 * const data = await response.json()
 * ```
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

  // Inject cookies in server context
  if (isServer) {
    try {
      const cookieStore = await cookies()
      mergedOptions.headers = {
        ...mergedOptions.headers,
        Cookie: cookieStore.toString(),
      }
    } catch (e) {
      logger.warn(
        'fetchWithAuth: No se pudieron obtener cookies del servidor. Esto es normal en build time.',
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
      // Update cookies in server context
      if (isServer) {
        const setCookie = refreshResponse.headers.get('set-cookie')
        if (setCookie) {
          mergedOptions.headers = {
            ...mergedOptions.headers,
            Cookie: setCookie,
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
