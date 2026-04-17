import { Auth } from '@/constants/auth'

export type AppSession = {
  accessToken: string
  refreshToken: string
  accessTokenExpiresAt: number
  refreshTokenExpiresAt: number
  backendCookies?: Record<string, string>
}

const SESSION_REFRESH_LEEWAY_MS = 5_000
const SESSION_EXPIRY_SKEW_MS = 15_000
const SESSION_COOKIE_NAME =
  process.env.NODE_ENV === 'production'
    ? '__Host-expense-control-session'
    : 'expense-control-session'
const DEV_FALLBACK_SECRET = 'dev-only-auth-session-secret'

let sessionKeyPromise: Promise<CryptoKey> | null = null

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = ''

  for (const byte of bytes) {
    binary += String.fromCharCode(byte)
  }

  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/g, '')
}

function base64UrlToBytes(base64Url: string): Uint8Array {
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
  const paddedBase64 = `${base64}${'='.repeat((4 - (base64.length % 4)) % 4)}`
  const binary = atob(paddedBase64)
  const bytes = new Uint8Array(binary.length)

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index)
  }

  return bytes
}

function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength,
  ) as ArrayBuffer
}

async function getSessionKey(): Promise<CryptoKey> {
  if (!sessionKeyPromise) {
    sessionKeyPromise = (async () => {
      const secret = process.env.AUTH_SESSION_SECRET ?? DEV_FALLBACK_SECRET

      if (
        process.env.NODE_ENV === 'production' &&
        !process.env.AUTH_SESSION_SECRET
      ) {
        throw new Error('AUTH_SESSION_SECRET is required in production')
      }

      const secretBytes = new TextEncoder().encode(secret)
      const keyMaterial = await crypto.subtle.digest('SHA-256', secretBytes)

      return crypto.subtle.importKey(
        'raw',
        keyMaterial,
        { name: 'AES-GCM' },
        false,
        ['encrypt', 'decrypt'],
      )
    })()
  }

  return sessionKeyPromise
}

function isAppSession(value: unknown): value is AppSession {
  if (!value || typeof value !== 'object') return false

  const candidate = value as Partial<AppSession>

  return (
    typeof candidate.accessToken === 'string' &&
    typeof candidate.refreshToken === 'string' &&
    typeof candidate.accessTokenExpiresAt === 'number' &&
    typeof candidate.refreshTokenExpiresAt === 'number' &&
    (candidate.backendCookies === undefined ||
      (typeof candidate.backendCookies === 'object' &&
        candidate.backendCookies !== null &&
        Object.values(candidate.backendCookies).every(
          (value) => typeof value === 'string',
        )))
  )
}

export function getSessionCookieName() {
  return SESSION_COOKIE_NAME
}

export function hasValidRefreshToken(
  session: AppSession | null,
  now = Date.now(),
): session is AppSession {
  return (
    session !== null &&
    typeof session.refreshToken === 'string' &&
    session.refreshToken.length > 0 &&
    session.refreshTokenExpiresAt > now + SESSION_EXPIRY_SKEW_MS
  )
}

export function hasValidAccessToken(
  session: AppSession | null,
  now = Date.now(),
): session is AppSession {
  return (
    session !== null &&
    typeof session.accessToken === 'string' &&
    session.accessToken.length > 0 &&
    session.accessTokenExpiresAt > now + SESSION_REFRESH_LEEWAY_MS
  )
}

export function hasRecoverableSession(
  session: AppSession | null,
  now = Date.now(),
): session is AppSession {
  return hasValidRefreshToken(session, now)
}

export function shouldRefreshAccessToken(
  session: AppSession | null,
  now = Date.now(),
) {
  return (
    hasRecoverableSession(session, now) && !hasValidAccessToken(session, now)
  )
}

export function isAuthenticatedSession(
  session: AppSession | null,
  now = Date.now(),
) {
  return (
    hasValidAccessToken(session, now) || hasRecoverableSession(session, now)
  )
}

export async function encodeSessionCookie(
  session: AppSession,
): Promise<string> {
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const key = await getSessionKey()
  const payload = new TextEncoder().encode(JSON.stringify(session))
  const ciphertext = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    payload,
  )

  return `v1.${bytesToBase64Url(iv)}.${bytesToBase64Url(new Uint8Array(ciphertext))}`
}

export async function decodeSessionCookie(
  sessionCookie: string | undefined,
): Promise<AppSession | null> {
  if (!sessionCookie) return null

  const [version, encodedIv, encodedCiphertext] = sessionCookie.split('.')
  if (version !== 'v1' || !encodedIv || !encodedCiphertext) {
    return null
  }

  try {
    const key = await getSessionKey()
    const iv = base64UrlToBytes(encodedIv)
    const ciphertext = base64UrlToBytes(encodedCiphertext)
    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: toArrayBuffer(iv),
      },
      key,
      toArrayBuffer(ciphertext),
    )
    const parsed = JSON.parse(new TextDecoder().decode(plaintext))

    return isAppSession(parsed) ? parsed : null
  } catch {
    return null
  }
}

export function buildBackendCookieHeader(session: AppSession): string {
  const cookieMap = new Map<string, string>(
    Object.entries(session.backendCookies ?? {}),
  )

  cookieMap.set(Auth.RefreshToken, session.refreshToken)
  cookieMap.set(Auth.AccessToken, session.accessToken)

  return Array.from(cookieMap.entries())
    .map(([name, value]) => `${name}=${value}`)
    .join('; ')
}
