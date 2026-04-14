import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { Auth, PublicPages, SharedPages } from '@/constants/auth'
import { Language } from '@/constants/common'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)
const API_URL = process.env.NEXT_PUBLIC_API_URL

function applyResponseCookies(
  response: NextResponse,
  setCookieHeaders: string[],
): Record<string, string> {
  const updatedCookies: Record<string, string> = {}

  for (const cookieStr of setCookieHeaders) {
    const parts = cookieStr.split(';').map((part) => part.trim())
    const nameValue = parts.shift()
    if (!nameValue) continue

    const separatorIndex = nameValue.indexOf('=')
    if (separatorIndex === -1) continue

    const name = nameValue.slice(0, separatorIndex)
    const value = nameValue.slice(separatorIndex + 1)
    updatedCookies[name] = value

    const options: Parameters<typeof response.cookies.set>[2] = {
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

    response.cookies.set(name, value, options)
  }

  return updatedCookies
}

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
        const updatedCookies = applyResponseCookies(
          response,
          refreshResponse.headers.getSetCookie(),
        )
        accessToken = updatedCookies[Auth.AccessToken] ?? accessToken
        refreshToken = updatedCookies[Auth.RefreshToken] ?? refreshToken
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
