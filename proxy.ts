import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { Auth, PublicPages, SharedPages } from '@/constants/auth'
import { Language } from '@/constants/common'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)
const API_URL = process.env.NEXT_PUBLIC_API_URL

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const locale = pathname.split('/')[1] || Language.Es

  // Normalize pathname
  const locales = Object.values(Language).join('|')
  const localeRegex = new RegExp(`^\\/(?:${locales})(\\/|$)`)
  let pathnameWithoutLocale = pathname.replace(localeRegex, '$1')
  if (!pathnameWithoutLocale.startsWith('/'))
    pathnameWithoutLocale = `/${pathnameWithoutLocale}`
  if (pathnameWithoutLocale.length > 1 && pathnameWithoutLocale.endsWith('/')) {
    pathnameWithoutLocale = pathnameWithoutLocale.slice(0, -1)
  }

  // Initial state
  const response = intlMiddleware(request)
  let hasRefreshToken = request.cookies.has(Auth.RefreshToken)
  let hasAccessToken = request.cookies.has(Auth.AccessToken)

  // Silent Refresh: If we have refresh but no access, try to get a new one
  if (hasRefreshToken && !hasAccessToken) {
    const refreshToken = request.cookies.get(Auth.RefreshToken)?.value
    try {
      const refreshResponse = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          Cookie: `${Auth.RefreshToken}=${refreshToken}`,
          'User-Agent': request.headers.get('user-agent') || '',
        },
      })

      if (refreshResponse.ok) {
        const setCookieHeaders = refreshResponse.headers.getSetCookie()
        for (const cookieStr of setCookieHeaders) {
          const parts = cookieStr.split(';').map((p) => p.trim())
          const [nameValue] = parts
          const [name, value] = nameValue.split('=')
          response.cookies.set(name, value, {
            path: '/',
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
          })
          // Update local state for subsequent checks in THIS execution
          if (name === Auth.AccessToken) hasAccessToken = true
          if (name === Auth.RefreshToken) hasRefreshToken = true
        }
      } else if (
        refreshResponse.status === 401 ||
        refreshResponse.status === 400
      ) {
        // Token is definitively dead, clear it to avoid loops
        response.cookies.delete(Auth.RefreshToken)
        response.cookies.delete(Auth.AccessToken)
        hasRefreshToken = false
        hasAccessToken = false
      }
    } catch (error) {
      console.error('Middleware Refresh Error:', error)
    }
  }

  // Final Auth Check
  const isAuthenticated = hasRefreshToken || hasAccessToken
  const isPublicPage = Object.values(PublicPages).includes(
    pathnameWithoutLocale as PublicPages,
  )
  const isSharedPage = Object.values(SharedPages).includes(
    pathnameWithoutLocale as SharedPages,
  )
  const isAllowedWithoutAuth = isPublicPage || isSharedPage

  // Redirect to login if private and not auth
  if (!isAuthenticated && !isAllowedWithoutAuth) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if public and auth
  if (isAuthenticated && isPublicPage) {
    const dashboardUrl = new URL(`/${locale}/accounts`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
