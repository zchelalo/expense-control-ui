import { type NextRequest, NextResponse } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { Auth, PublicPages, SharedPages } from '@/constants/auth'
import { Language } from '@/constants/common'
import { routing } from '@/i18n/routing'

const intlMiddleware = createMiddleware(routing)

export default async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Normalize pathname: Remove locale prefix and ensure it starts with /
  // Example: /es/login -> /login, /es -> /
  const locales = Object.values(Language).join('|')
  const localeRegex = new RegExp(`^\\/(?:${locales})(\\/|$)`)
  let pathnameWithoutLocale = pathname.replace(localeRegex, '$1')
  if (!pathnameWithoutLocale.startsWith('/')) {
    pathnameWithoutLocale = `/${pathnameWithoutLocale}`
  }
  // Remove trailing slash if it exists (except for the root /)
  if (pathnameWithoutLocale.length > 1 && pathnameWithoutLocale.endsWith('/')) {
    pathnameWithoutLocale = pathnameWithoutLocale.slice(0, -1)
  }

  // Check if it's a public or shared page
  const isPublicPage = Object.values(PublicPages).includes(
    pathnameWithoutLocale as PublicPages,
  )
  const isSharedPage = Object.values(SharedPages).includes(
    pathnameWithoutLocale as SharedPages,
  )
  const isAllowedWithoutAuth = isPublicPage || isSharedPage

  // Check for authentication cookie
  const hasRefreshToken = request.cookies.has(Auth.RefreshToken)
  const hasAccessToken = request.cookies.has(Auth.AccessToken)
  const isAuthenticated = hasRefreshToken || hasAccessToken

  // User is not authenticated and trying to access a private page
  if (!isAuthenticated && !isAllowedWithoutAuth) {
    const locale = pathname.split('/')[1] || Language.Es
    const loginUrl = new URL(`/${locale}/login`, request.url)
    return NextResponse.redirect(loginUrl)
  }

  // User is authenticated and trying to access login/sign-up
  if (isAuthenticated && isPublicPage) {
    const locale = pathname.split('/')[1] || Language.Es
    const dashboardUrl = new URL(`/${locale}/movements`, request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  // If everything is fine, let next-intl handle the response
  return intlMiddleware(request)
}

export const config = {
  // Matcher for all routes except static files and api
  matcher: ['/((?!api|_next|.*\\..*).*)'],
}
