import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { PublicPages, SharedPages } from '@/constants/auth'
import { Language } from '@/constants/common'
import { routing } from '@/i18n/routing'
import { extractBackendSessionFromResponse } from '@/utils/backend-auth'
import {
  type AppSession,
  buildBackendCookieHeader,
  decodeSessionCookie,
  encodeSessionCookie,
  getSessionCookieName,
  hasRecoverableSession,
  isAuthenticatedSession,
  shouldRefreshAccessToken,
} from '@/utils/session/shared'

const intlMiddleware = createMiddleware(routing)
const apiUrl = process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL
const refreshRequests = new Map<string, Promise<AppSession | null>>()

function clearSessionCookie(response: NextResponse) {
  response.cookies.delete(getSessionCookieName())
}

function redirectToLogin(request: NextRequest, locale: string) {
  const loginUrl = new URL(`/${locale}/login`, request.url)
  const redirectResponse = NextResponse.redirect(loginUrl)
  clearSessionCookie(redirectResponse)
  return redirectResponse
}

function mergeCookieHeader(
  currentCookieHeader: string | null,
  name: string,
  value: string,
) {
  const cookieMap = new Map<string, string>()

  if (currentCookieHeader) {
    for (const cookie of currentCookieHeader.split(';')) {
      const trimmedCookie = cookie.trim()
      if (!trimmedCookie) continue

      const separatorIndex = trimmedCookie.indexOf('=')
      if (separatorIndex === -1) continue

      const cookieName = trimmedCookie.slice(0, separatorIndex)
      const cookieValue = trimmedCookie.slice(separatorIndex + 1)
      cookieMap.set(cookieName, cookieValue)
    }
  }

  cookieMap.set(name, value)

  return Array.from(cookieMap.entries())
    .map(([cookieName, cookieValue]) => `${cookieName}=${cookieValue}`)
    .join('; ')
}

function applyRequestHeaderOverrides(
  response: NextResponse,
  requestHeaders: Headers,
) {
  const override = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  for (const [header, value] of override.headers.entries()) {
    if (header === 'x-middleware-override-headers') {
      response.headers.set(header, value)
      continue
    }

    if (header.startsWith('x-middleware-request-')) {
      response.headers.set(header, value)
    }
  }
}

function writeSessionCookie(
  response: NextResponse,
  encodedSession: string,
  refreshTokenExpiresAt: number,
) {
  response.cookies.set(getSessionCookieName(), encodedSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(refreshTokenExpiresAt),
  })
}

function buildRefreshHeaders(request: NextRequest, session: AppSession) {
  const headers = new Headers()
  headers.set('Cookie', buildBackendCookieHeader(session))

  const userAgent = request.headers.get('user-agent')
  if (userAgent) {
    headers.set('User-Agent', userAgent)
  }

  const forwardedFor = request.headers.get('x-forwarded-for')
  if (forwardedFor) {
    headers.set('X-Forwarded-For', forwardedFor)
  }

  return headers
}

async function refreshSessionInMiddleware(
  request: NextRequest,
  response: NextResponse,
  session: AppSession,
) {
  if (!apiUrl) {
    throw new Error('API_URL or NEXT_PUBLIC_API_URL must be configured')
  }

  const refreshKey = session.refreshToken
  const ongoingRefresh = refreshRequests.get(refreshKey)

  const refreshPromise =
    ongoingRefresh ??
    (async () => {
      const refreshResponse = await fetch(`${apiUrl}/v1/auth/refresh`, {
        method: 'POST',
        headers: buildRefreshHeaders(request, session),
        cache: 'no-store',
        credentials: 'include',
      })

      if (!refreshResponse.ok) {
        return null
      }

      const refreshedSession = extractBackendSessionFromResponse(
        refreshResponse,
        session,
      )

      if (!refreshedSession) {
        return null
      }

      return refreshedSession
    })()

  if (!ongoingRefresh) {
    refreshRequests.set(refreshKey, refreshPromise)
  }

  let refreshedSession: AppSession | null

  try {
    refreshedSession = await refreshPromise
  } finally {
    if (!ongoingRefresh) {
      refreshRequests.delete(refreshKey)
    }
  }

  if (!refreshedSession) {
    return null
  }

  const encodedSession = await encodeSessionCookie(refreshedSession)
  writeSessionCookie(
    response,
    encodedSession,
    refreshedSession.refreshTokenExpiresAt,
  )

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set(
    'cookie',
    mergeCookieHeader(
      request.headers.get('cookie'),
      getSessionCookieName(),
      encodedSession,
    ),
  )
  applyRequestHeaderOverrides(response, requestHeaders)

  return refreshedSession
}

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = pathname.split('/')[1] || Language.Es
  const shouldClearSession =
    request.nextUrl.searchParams.get('clearSession') === '1'

  const locales = Object.values(Language).join('|')
  const localeRegex = new RegExp(`^\\/(?:${locales})(\\/|$)`)
  let pathnameWithoutLocale = pathname.replace(localeRegex, '$1')

  if (!pathnameWithoutLocale.startsWith('/')) {
    pathnameWithoutLocale = `/${pathnameWithoutLocale}`
  }

  if (pathnameWithoutLocale.length > 1 && pathnameWithoutLocale.endsWith('/')) {
    pathnameWithoutLocale = pathnameWithoutLocale.slice(0, -1)
  }

  const response = intlMiddleware(request)
  const sessionCookie = request.cookies.get(getSessionCookieName())?.value
  let session = await decodeSessionCookie(sessionCookie)
  let hasSession = isAuthenticatedSession(session)
  const isPublicPage = Object.values(PublicPages).includes(
    pathnameWithoutLocale as PublicPages,
  )
  const isSharedPage = Object.values(SharedPages).includes(
    pathnameWithoutLocale as SharedPages,
  )
  const isAllowedWithoutAuth = isPublicPage || isSharedPage

  if (shouldClearSession) {
    clearSessionCookie(response)

    if (isAllowedWithoutAuth) {
      return response
    }

    return redirectToLogin(request, locale)
  }

  if (!sessionCookie) {
    return isAllowedWithoutAuth ? response : redirectToLogin(request, locale)
  }

  if (hasSession && shouldRefreshAccessToken(session)) {
    try {
      const refreshedSession = await refreshSessionInMiddleware(
        request,
        response,
        session,
      )

      if (hasRecoverableSession(refreshedSession)) {
        session = refreshedSession
        hasSession = isAuthenticatedSession(refreshedSession)
      } else {
        session = null
        hasSession = false
        clearSessionCookie(response)
      }
    } catch {
      // Allow the server-side auth fetch path to attempt recovery before
      // forcing a logout from middleware.
    }
  }

  if (!hasSession && !isAllowedWithoutAuth) {
    return redirectToLogin(request, locale)
  }

  if (hasSession && isPublicPage) {
    const dashboardUrl = new URL(`/${locale}/accounts`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  if (isAllowedWithoutAuth) {
    if (!hasSession) {
      clearSessionCookie(response)
    }

    return response
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
