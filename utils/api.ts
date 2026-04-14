import 'server-only'

import { cookies, headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { logger } from '@/utils/logger'

const API_URL = process.env.NEXT_PUBLIC_API_URL

function mergeCookieHeaders(
  currentCookieHeader: string | null,
  setCookieHeaders: string[],
): string | null {
  const cookieMap = new Map<string, string>()

  if (currentCookieHeader) {
    for (const cookie of currentCookieHeader.split(';')) {
      const trimmedCookie = cookie.trim()
      if (!trimmedCookie) continue

      const separatorIndex = trimmedCookie.indexOf('=')
      if (separatorIndex === -1) continue

      const name = trimmedCookie.slice(0, separatorIndex)
      const value = trimmedCookie.slice(separatorIndex + 1)
      cookieMap.set(name, value)
    }
  }

  for (const setCookie of setCookieHeaders) {
    const [nameValue] = setCookie.split(';')
    if (!nameValue) continue

    const separatorIndex = nameValue.indexOf('=')
    if (separatorIndex === -1) continue

    const name = nameValue.slice(0, separatorIndex)
    const value = nameValue.slice(separatorIndex + 1)
    cookieMap.set(name, value)
  }

  if (cookieMap.size === 0) return null

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}

async function buildServerHeaders(
  optionsHeaders?: HeadersInit,
  body?: RequestInit['body'],
): Promise<Headers> {
  const mergedHeaders = new Headers(optionsHeaders)

  const isFormDataBody =
    typeof FormData !== 'undefined' && body instanceof FormData

  if (!mergedHeaders.has('Content-Type') && !isFormDataBody) {
    mergedHeaders.set('Content-Type', 'application/json')
  }

  try {
    const cookieStore = await cookies()
    const headerStore = await headers()
    const cookieString = cookieStore.toString()

    if (cookieString && !mergedHeaders.has('Cookie')) {
      mergedHeaders.set('Cookie', cookieString)
    }

    const userAgent = headerStore.get('user-agent')
    if (userAgent && !mergedHeaders.has('User-Agent')) {
      mergedHeaders.set('User-Agent', userAgent)
    }

    const forwardedFor = headerStore.get('x-forwarded-for')
    if (forwardedFor && !mergedHeaders.has('X-Forwarded-For')) {
      mergedHeaders.set('X-Forwarded-For', forwardedFor)
    }
  } catch (error) {
    logger.warn(
      'fetchWithAuth: No se pudieron obtener headers/cookies del servidor. Esto es normal en build time.',
      error,
    )
  }

  return mergedHeaders
}

async function persistResponseCookies(response: Response) {
  const setCookieHeaders = response.headers.getSetCookie()

  if (setCookieHeaders.length === 0) {
    return null
  }

  const retryCookieHeader = mergeCookieHeaders(
    (await cookies()).toString(),
    setCookieHeaders,
  )

  try {
    const cookieStore = await cookies()

    for (const cookieStr of setCookieHeaders) {
      const parts = cookieStr.split(';').map((part) => part.trim())
      const nameValue = parts.shift()
      if (!nameValue) continue

      const separatorIndex = nameValue.indexOf('=')
      if (separatorIndex === -1) continue

      const name = nameValue.slice(0, separatorIndex)
      const value = nameValue.slice(separatorIndex + 1)

      const options: Parameters<typeof cookieStore.set>[2] = {
        path: '/',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
      }

      for (const attr of parts) {
        const attrSeparatorIndex = attr.indexOf('=')
        const attrKey =
          attrSeparatorIndex === -1 ? attr : attr.slice(0, attrSeparatorIndex)
        const attrValue =
          attrSeparatorIndex === -1 ? '' : attr.slice(attrSeparatorIndex + 1)

        switch (attrKey.toLowerCase()) {
          case 'httponly':
            options.httpOnly = true
            break
          case 'secure':
            options.secure = true
            break
          case 'samesite': {
            const sameSite = attrValue.toLowerCase()
            if (
              sameSite === 'lax' ||
              sameSite === 'strict' ||
              sameSite === 'none'
            ) {
              options.sameSite = sameSite
            }
            break
          }
          case 'expires':
            options.expires = new Date(attrValue)
            break
          case 'max-age':
            options.maxAge = Number.parseInt(attrValue, 10)
            break
        }
      }

      cookieStore.set(name, value, options)
    }
  } catch (error) {
    logger.warn(
      'fetchWithAuth: No se pudieron persistir cookies del refresh en este contexto. Se usaran solo para el reintento actual.',
      error,
    )
  }

  return retryCookieHeader
}

async function refreshAuthSession(requestHeaders: Headers): Promise<{
  ok: boolean
  retryCookieHeader: string | null
}> {
  let response: Response

  try {
    response = await fetch(`${API_URL}/v1/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
      cache: 'no-store',
      headers: requestHeaders,
    })
  } catch (error) {
    logger.error('fetchWithAuth: Error durante refresh', error)
    throw error
  }

  if (!response.ok) {
    return {
      ok: false,
      retryCookieHeader: null,
    }
  }

  return {
    ok: true,
    retryCookieHeader: await persistResponseCookies(response),
  }
}

/**
 * Server-side fetch that forwards auth cookies, retries once after refresh,
 * and redirects to login only when the session cannot be recovered.
 */
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const locale = await getLocale()
  const requestHeaders = await buildServerHeaders(options.headers, options.body)
  const mergedOptions: RequestInit = {
    ...options,
    credentials: 'include',
    headers: requestHeaders,
  }

  let response: Response

  try {
    response = await fetch(`${API_URL}${url}`, mergedOptions)
  } catch (error) {
    logger.error(`fetchWithAuth: Falló la petición a ${url}`, error)
    throw error
  }

  const shouldRefresh = response.status === 401 && url !== '/v1/auth/refresh'

  if (shouldRefresh) {
    const refreshResult = await refreshAuthSession(requestHeaders)

    if (refreshResult.ok) {
      const retryHeaders = new Headers(requestHeaders)
      if (refreshResult.retryCookieHeader) {
        retryHeaders.set('Cookie', refreshResult.retryCookieHeader)
      }

      return fetch(`${API_URL}${url}`, {
        ...mergedOptions,
        headers: retryHeaders,
      })
    }

    redirect({
      href: '/login',
      locale,
    })
  }

  return response
}
