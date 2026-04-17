import 'server-only'

import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'
import { logger } from '@/utils/logger'
import {
  type AppSession,
  decodeSessionCookie,
  encodeSessionCookie,
  getSessionCookieName,
  isAuthenticatedSession,
} from '@/utils/session/shared'

function buildSessionCookieOptions(
  session: AppSession,
): Partial<ResponseCookie> {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: new Date(session.refreshTokenExpiresAt),
  }
}

export async function readAppSession(): Promise<AppSession | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(getSessionCookieName())?.value

  return decodeSessionCookie(sessionCookie)
}

export async function writeAppSession(session: AppSession): Promise<boolean> {
  try {
    const cookieStore = await cookies()
    const encodedSession = await encodeSessionCookie(session)

    cookieStore.set(
      getSessionCookieName(),
      encodedSession,
      buildSessionCookieOptions(session),
    )

    return true
  } catch (error) {
    logger.warn('Auth session could not be persisted in this context', error)
    return false
  }
}

export async function clearAppSession(): Promise<void> {
  try {
    const cookieStore = await cookies()
    cookieStore.delete(getSessionCookieName())
  } catch (error) {
    logger.warn('Auth session could not be cleared in this context', error)
  }
}

export async function getAuthSessionState() {
  const session = await readAppSession()

  return {
    isAuthenticated: isAuthenticatedSession(session),
  }
}
