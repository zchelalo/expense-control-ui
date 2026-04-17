import type { LoginCredentialsEntity } from '@/modules/auth/domain/login-credentials-entity'
import type { SignUpCredentialsEntity } from '@/modules/auth/domain/signup-credentials-entity'
import type { AuthStore } from '@/modules/auth/ports/auth-store'
import { AuthError } from '@/modules/auth/ports/errors'
import { fetchWithAuth } from '@/utils/api'
import { extractBackendSessionFromResponse } from '@/utils/backend-auth'
import { type ErrorResponse, parseApiError } from '@/utils/parse'
import { getApiUrl } from '@/utils/server-config'
import { clearAppSession, writeAppSession } from '@/utils/session/server'

const apiUrl = getApiUrl()

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

export class AuthRepository implements AuthStore {
  async login(loginCredentials: LoginCredentialsEntity): Promise<void> {
    try {
      const response = await fetch(`${apiUrl}/v1/auth/login`, {
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
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAuthError(response.status, error)
      }

      const session = extractBackendSessionFromResponse(response)

      if (!session || !(await writeAppSession(session))) {
        throw new AuthError(
          'auth_session_error',
          'The backend response did not produce a valid local session.',
        )
      }
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('network_error', (error as Error).message)
    }
  }

  async signUp(signUpCredentials: SignUpCredentialsEntity): Promise<void> {
    try {
      const response = await fetch(`${apiUrl}/v1/auth/register`, {
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
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToAuthError(response.status, error)
      }

      const session = extractBackendSessionFromResponse(response)

      if (!session || !(await writeAppSession(session))) {
        throw new AuthError(
          'auth_session_error',
          'The backend response did not produce a valid local session.',
        )
      }
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
        redirectOnAuthFailure: false,
      })

      if (!response.ok && response.status !== 401) {
        const error = await parseApiError(response)
        mapToAuthError(response.status, error)
      }
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('network_error', (error as Error).message)
    } finally {
      await clearAppSession()
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
    } catch (error) {
      if (error instanceof AuthError) throw error
      throw new AuthError('network_error', (error as Error).message)
    }
  }
}
