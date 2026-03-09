import type { LoginCredentialsEntity } from '@/modules/auth/domain/login-credentials-entity'
import type { SignUpCredentialsEntity } from '@/modules/auth/domain/signup-credentials-entity'
import type { AuthSession } from '@/modules/auth/ports/auth-session'

export interface AuthStore {
  login(loginCredentials: LoginCredentialsEntity): Promise<AuthSession>
  signUp(signUpCredentials: SignUpCredentialsEntity): Promise<AuthSession>
  logout(): Promise<void>
}
