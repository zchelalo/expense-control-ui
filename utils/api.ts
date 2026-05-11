import 'server-only'

import { headers } from 'next/headers'
import { getLocale } from 'next-intl/server'
import { redirect } from '@/i18n/navigation'
import { extractBackendSessionFromResponse } from '@/utils/backend-auth'
import { logger } from '@/utils/logger'
import { getApiUrl } from '@/utils/server-config'
import {
  clearAppSession,
  readAppSession,
  writeAppSession,
} from '@/utils/session/server'
import {
  type AppSession,
  buildBackendCookieHeader,
  hasRecoverableSession,
  hasValidRefreshToken,
  isAuthenticatedSession,
  shouldRefreshAccessToken,
} from '@/utils/session/shared'

type FetchWithAuthOptions = RequestInit & {
  redirectOnAuthFailure?: boolean
}

const apiUrl = getApiUrl()
const refreshRequests = new Map<string, Promise<AppSession | null>>()

async function buildServerHeaders(
  locale: string,
  optionsHeaders?: HeadersInit,
  body?: RequestInit['body'],
): Promise<Headers> {
  const mergedHeaders = new Headers(optionsHeaders)
  const isFormDataBody =
    typeof FormData !== 'undefined' && body instanceof FormData

  if (!mergedHeaders.has('Content-Type') && !isFormDataBody) {
    mergedHeaders.set('Content-Type', 'application/json')
  }

  if (locale && !mergedHeaders.has('Accept-Language')) {
    mergedHeaders.set('Accept-Language', locale)
  }

  try {
    const headerStore = await headers()
    const cookieHeader = headerStore.get('cookie')
    const userAgent = headerStore.get('user-agent')
    const forwardedFor = headerStore.get('x-forwarded-for')

    if (cookieHeader && !mergedHeaders.has('Cookie')) {
      mergedHeaders.set('Cookie', cookieHeader)
    }

    if (userAgent && !mergedHeaders.has('User-Agent')) {
      mergedHeaders.set('User-Agent', userAgent)
    }

    if (forwardedFor && !mergedHeaders.has('X-Forwarded-For')) {
      mergedHeaders.set('X-Forwarded-For', forwardedFor)
    }
  } catch (error) {
    logger.warn(
      'fetchWithAuth: Request headers were not available in this context.',
      error,
    )
  }

  return mergedHeaders
}

function withBackendAuthHeaders(headersToExtend: Headers, session: AppSession) {
  const requestHeaders = new Headers(headersToExtend)
  const cookieMap = new Map<string, string>()
  const existingCookieHeader = requestHeaders.get('Cookie')

  if (existingCookieHeader) {
    for (const cookie of existingCookieHeader.split(';')) {
      const trimmedCookie = cookie.trim()
      if (!trimmedCookie) continue

      const separatorIndex = trimmedCookie.indexOf('=')
      if (separatorIndex === -1) continue

      const name = trimmedCookie.slice(0, separatorIndex)
      const value = trimmedCookie.slice(separatorIndex + 1)
      cookieMap.set(name, value)
    }
  }

  for (const cookie of buildBackendCookieHeader(session).split(';')) {
    const trimmedCookie = cookie.trim()
    if (!trimmedCookie) continue

    const separatorIndex = trimmedCookie.indexOf('=')
    if (separatorIndex === -1) continue

    const name = trimmedCookie.slice(0, separatorIndex)
    const value = trimmedCookie.slice(separatorIndex + 1)
    cookieMap.set(name, value)
  }

  requestHeaders.set(
    'Cookie',
    Array.from(cookieMap.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join('; '),
  )

  return requestHeaders
}

async function handleAuthFailure(
  locale: string,
  redirectOnAuthFailure: boolean,
) {
  await clearAppSession()

  if (redirectOnAuthFailure) {
    redirect({
      href: '/login?clearSession=1',
      locale,
    })
  }

  return new Response(null, { status: 401 })
}

async function refreshAppSession(
  session: AppSession,
  requestHeaders: Headers,
): Promise<AppSession | null> {
  const refreshKey = session.refreshToken
  const ongoingRefresh = refreshRequests.get(refreshKey)

  if (ongoingRefresh) {
    return ongoingRefresh
  }

  const refreshPromise = (async () => {
    let response: Response

    try {
      response = await fetch(`${apiUrl}/v1/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        cache: 'no-store',
        headers: withBackendAuthHeaders(requestHeaders, session),
      })
    } catch (error) {
      logger.error('fetchWithAuth: Error during auth refresh', error)
      throw error
    }

    if (!response.ok) {
      return null
    }

    const refreshedSession = extractBackendSessionFromResponse(
      response,
      session,
    )

    if (!refreshedSession) {
      return null
    }

    return refreshedSession
  })()

  refreshRequests.set(refreshKey, refreshPromise)

  try {
    return await refreshPromise
  } finally {
    refreshRequests.delete(refreshKey)
  }
}

export async function fetchWithAuth(
  url: string,
  options: FetchWithAuthOptions = {},
) {
  const locale = await getLocale()
  const isRefreshRequest = url === '/v1/auth/refresh'
  const redirectOnAuthFailure = options.redirectOnAuthFailure ?? true
  const requestHeaders = await buildServerHeaders(
    locale,
    options.headers,
    options.body,
  )
  const session = await readAppSession()

  if (!isAuthenticatedSession(session)) {
    return handleAuthFailure(locale, redirectOnAuthFailure)
  }

  let activeSession: AppSession = session
  let didRefreshSession = false

  const baseOptions: RequestInit = {
    ...options,
    credentials: 'include',
  }

  async function refreshActiveSession() {
    if (!hasValidRefreshToken(activeSession)) {
      return null
    }

    const refreshedSession = await refreshAppSession(
      activeSession,
      requestHeaders,
    )

    if (!hasRecoverableSession(refreshedSession)) {
      return null
    }

    activeSession = refreshedSession
    didRefreshSession = true
    await writeAppSession(activeSession)

    return activeSession
  }

  async function performAuthenticatedRequest() {
    try {
      return await fetch(`${apiUrl}${url}`, {
        ...baseOptions,
        headers: withBackendAuthHeaders(requestHeaders, activeSession),
      })
    } catch (error) {
      logger.error(`fetchWithAuth: Request to ${url} failed`, error)
      throw error
    }
  }

  if (!isRefreshRequest && shouldRefreshAccessToken(activeSession)) {
    const refreshedSession = await refreshActiveSession()

    if (!refreshedSession) {
      return handleAuthFailure(locale, redirectOnAuthFailure)
    }
  }

  const response = await performAuthenticatedRequest()

  if (response.status !== 401 || isRefreshRequest) {
    return response
  }

  if (didRefreshSession) {
    return handleAuthFailure(locale, redirectOnAuthFailure)
  }

  const refreshedSession = await refreshActiveSession()

  if (!refreshedSession) {
    return handleAuthFailure(locale, redirectOnAuthFailure)
  }

  return performAuthenticatedRequest()
}
