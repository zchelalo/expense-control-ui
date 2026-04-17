import { Auth } from '@/constants/auth'
import { parseSetCookieHeaders } from '@/utils/cookies'
import type { AppSession } from '@/utils/session/shared'

type BackendTokenUpdate = Partial<AppSession>

function decodeJwtExpirationTimestamp(token: string) {
  const [, payload] = token.split('.')

  if (!payload) return null

  try {
    const normalizedPayload = payload.replace(/-/g, '+').replace(/_/g, '/')
    const paddedPayload = `${normalizedPayload}${'='.repeat((4 - (normalizedPayload.length % 4)) % 4)}`
    const decodedPayload = JSON.parse(atob(paddedPayload)) as {
      exp?: number
    }

    return typeof decodedPayload.exp === 'number'
      ? decodedPayload.exp * 1000
      : null
  } catch {
    return null
  }
}

function resolveCookieExpiryTimestamp(
  token: string,
  maxAge: number | undefined,
  expires: Date | undefined,
) {
  if (typeof maxAge === 'number') {
    return Date.now() + maxAge * 1000
  }

  if (expires) {
    return expires.getTime()
  }

  return decodeJwtExpirationTimestamp(token)
}

function mergeBackendCookies(
  currentSession: AppSession | null,
  parsedCookies: ReturnType<typeof parseSetCookieHeaders>,
) {
  const cookieJar = new Map<string, string>(
    Object.entries(currentSession?.backendCookies ?? {}).filter(
      ([name]) => name !== Auth.AccessToken && name !== Auth.RefreshToken,
    ),
  )

  for (const cookie of parsedCookies) {
    if (cookie.name === Auth.AccessToken || cookie.name === Auth.RefreshToken) {
      continue
    }

    const isExpired =
      cookie.maxAge === 0 ||
      (cookie.expires !== undefined && cookie.expires.getTime() <= Date.now())

    if (isExpired) {
      cookieJar.delete(cookie.name)
      continue
    }

    cookieJar.set(cookie.name, cookie.value)
  }

  return Object.fromEntries(cookieJar.entries())
}

export function extractBackendSessionFromResponse(
  response: Response,
  currentSession: AppSession | null = null,
): AppSession | null {
  const parsedCookies = parseSetCookieHeaders(response.headers.getSetCookie())
  const update: BackendTokenUpdate = {}
  const backendCookies = mergeBackendCookies(currentSession, parsedCookies)

  for (const cookie of parsedCookies) {
    const expiresAt = resolveCookieExpiryTimestamp(
      cookie.value,
      cookie.maxAge,
      cookie.expires,
    )

    if (cookie.name === Auth.AccessToken) {
      update.accessToken = cookie.value
      if (expiresAt !== null) {
        update.accessTokenExpiresAt = expiresAt
      }
    }

    if (cookie.name === Auth.RefreshToken) {
      update.refreshToken = cookie.value
      if (expiresAt !== null) {
        update.refreshTokenExpiresAt = expiresAt
      }
    }
  }

  if (!currentSession) {
    if (
      typeof update.accessToken !== 'string' ||
      typeof update.refreshToken !== 'string' ||
      typeof update.accessTokenExpiresAt !== 'number' ||
      typeof update.refreshTokenExpiresAt !== 'number'
    ) {
      return null
    }

    return {
      ...(update as AppSession),
      backendCookies,
    }
  }

  const mergedSession: AppSession = {
    accessToken: update.accessToken ?? currentSession.accessToken,
    refreshToken: update.refreshToken ?? currentSession.refreshToken,
    accessTokenExpiresAt:
      update.accessTokenExpiresAt ?? currentSession.accessTokenExpiresAt,
    refreshTokenExpiresAt:
      update.refreshTokenExpiresAt ?? currentSession.refreshTokenExpiresAt,
    backendCookies,
  }

  return mergedSession
}
