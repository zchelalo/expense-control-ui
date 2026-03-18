import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies'
import { cookies } from 'next/headers'
import type { LoginCredentialsEntity } from '@/modules/auth/domain/login-credentials-entity'
import type { SignUpCredentialsEntity } from '@/modules/auth/domain/signup-credentials-entity'
import type { AuthStore } from '@/modules/auth/ports/auth-store'
import { AuthError } from '@/modules/auth/ports/errors'
import { fetchWithAuth } from '@/utils/api'
import { type ErrorResponse, parseApiError } from '@/utils/parse'

function mapToAuthError(
  status: number,
  error: ErrorResponse | null,
): AuthError {
  if (status === 401) {
    throw new AuthError('invalid_credentials_error', error?.message)
  }

  if (status === 409) {
    throw new AuthError('user_already_exists_error', error?.message)
  }

  if (status === 429) {
    throw new AuthError('too_many_requests_error', error?.message)
  }

  if (status >= 500) {
    throw new AuthError('auth_store_error', error?.message)
  }

  throw new AuthError('unknown_error', error?.message)
}

/**
 * Utility to forward cookies from backend response to Next.js cookie store.
 */
async function forwardCookies(response: Response) {
  const setCookieHeaders = response.headers.getSetCookie()
  if (setCookieHeaders.length === 0) return

  const cookieStore = await cookies()

  for (const cookieStr of setCookieHeaders) {
    const parts = cookieStr.split(';').map((p) => p.trim())
    const nameValue = parts.shift()
    if (!nameValue) continue

    const equalsIndex = nameValue.indexOf('=')
    if (equalsIndex === -1) continue

    const name = nameValue.substring(0, equalsIndex)
    const value = nameValue.substring(equalsIndex + 1)

    const options: Partial<ResponseCookie> = {
      path: '/', // Always force root path for frontend access
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    }

    for (const attr of parts) {
      const [attrKey, attrValue] = attr.split('=')
      const lowerKey = attrKey.toLowerCase()

      switch (lowerKey) {
        case 'httponly':
          options.httpOnly = true
          break
        case 'secure':
          options.secure = true
          break
        case 'path':
          // Ignore the backend path and use '/'
          break
        case 'samesite': {
          const samesite = attrValue?.toLowerCase()
          if (
            samesite === 'lax' ||
            samesite === 'strict' ||
            samesite === 'none'
          ) {
            options.sameSite = samesite
          }
          break
        }
        case 'expires':
          options.expires = new Date(attrValue).getTime()
          break
        case 'max-age':
          options.maxAge = Number.parseInt(attrValue, 10)
          break
      }
    }

    cookieStore.set(name, value, options)
  }
}

export class AuthRepository implements AuthStore {
  async login(loginCredentials: LoginCredentialsEntity): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginCredentials.getEmail(),
            password: loginCredentials.getPassword(),
          }),
          credentials: 'include',
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAuthError(response.status, error)
      }

      await forwardCookies(response)
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('network_error', (error as Error).message)
    }
  }

  async signUp(signUpCredentials: SignUpCredentialsEntity): Promise<void> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: signUpCredentials.getEmail(),
            password: signUpCredentials.getPassword(),
          }),
          credentials: 'include',
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAuthError(response.status, error)
      }

      await forwardCookies(response)
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('network_error', (error as Error).message)
    }
  }

  async logout(): Promise<void> {
    try {
      const response = await fetchWithAuth('/v1/auth/logout', {
        method: 'POST',
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAuthError(response.status, error)
      }

      // Clear cookies on logout if needed
      const setCookieHeaders = response.headers.getSetCookie()
      if (setCookieHeaders.length > 0) {
        await forwardCookies(response)
      }
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('network_error', (error as Error).message)
    }
  }

  async refresh(): Promise<void> {
    try {
      const response = await fetchWithAuth('/v1/auth/refresh', {
        method: 'POST',
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAuthError(response.status, error)
      }

      await forwardCookies(response)
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('network_error', (error as Error).message)
    }
  }
}
