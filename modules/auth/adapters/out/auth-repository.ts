import type { LoginCredentialsEntity } from '@/modules/auth/domain/login-credentials-entity'
import type { SignUpCredentialsEntity } from '@/modules/auth/domain/signup-credentials-entity'
import type { AuthSession } from '@/modules/auth/ports/auth-session'
import type { AuthStore } from '@/modules/auth/ports/auth-store'
import { AuthError } from '@/modules/auth/ports/errors'
import { type ErrorResponse, parseApiError } from '@/utils/parse'

type AuthResponse = {
  data: {
    subject_id: string
    access_token: string
    access_expires_at: string
  }
  request_id: string
}

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
  async login(loginCredentials: LoginCredentialsEntity): Promise<AuthSession> {
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

    const responseData: AuthResponse = await response.json()

    return {
      accessToken: responseData.data.access_token,
      accessExpiresAt: new Date(responseData.data.access_expires_at),
    }
  }

  async signUp(
    signUpCredentials: SignUpCredentialsEntity,
  ): Promise<AuthSession> {
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

    const responseData: AuthResponse = await response.json()

    return {
      accessToken: responseData.data.access_token,
      accessExpiresAt: new Date(responseData.data.access_expires_at),
    }
  }

  async logout(): Promise<void> {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/v1/auth/logout`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        cache: 'no-store',
      },
    )

    if (!response.ok) {
      const error = await parseApiError(response)
      mapToAuthError(response.status, error)
    }
  }
}
