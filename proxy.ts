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
  let accessToken = request.cookies.get(Auth.AccessToken)?.value
  let refreshToken = request.cookies.get(Auth.RefreshToken)?.value

  // Auth Check
  let isAuthenticated = !!accessToken || !!refreshToken
  const isPublicPage = Object.values(PublicPages).includes(
    pathnameWithoutLocale as PublicPages,
  )
  const isSharedPage = Object.values(SharedPages).includes(
    pathnameWithoutLocale as SharedPages,
  )
  const isAllowedWithoutAuth = isPublicPage || isSharedPage

  // Silent Refresh / Session Verification:
  if (refreshToken && (!accessToken || isPublicPage)) {
    try {
      const refreshResponse = await fetch(`${API_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          Cookie: `${Auth.RefreshToken}=${refreshToken}; ${Auth.AccessToken}=${accessToken}`,
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
          if (name === Auth.AccessToken) accessToken = value
          if (name === Auth.RefreshToken) refreshToken = value
        }
        isAuthenticated = !!accessToken || !!refreshToken
      } else {
        // Token is definitively dead, clear it and STAY on the public page; If we were going to a private page, the logic below will redirect to login.
        const loginUrl = new URL(`/${locale}/login`, request.url)
        const redirectResponse = NextResponse.redirect(loginUrl)
        redirectResponse.cookies.delete(Auth.RefreshToken)
        redirectResponse.cookies.delete(Auth.AccessToken)

        // Only redirect if we were attempting to access a PRIVATE page
        if (!isAllowedWithoutAuth) {
          return redirectResponse
        }

        // If already on a public page, just clear cookies in the current response and stay here
        response.cookies.delete(Auth.RefreshToken)
        response.cookies.delete(Auth.AccessToken)
        isAuthenticated = false
      }
    } catch (error) {
      console.error('Middleware Refresh Error:', error)
    }
  }

  // Redirect to login if private and not auth
  if (!isAuthenticated && !isAllowedWithoutAuth) {
    const loginUrl = new URL(`/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect to dashboard if public and authenticated
  if (isAuthenticated && isPublicPage) {
    const dashboardUrl = new URL(`/${locale}/accounts`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return response
}

export const config = {
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
