import type { LoginCredentialsEntity } from '@/modules/auth/domain/login-credentials-entity'
import type { SignUpCredentialsEntity } from '@/modules/auth/domain/signup-credentials-entity'

export interface AuthStore {
  login(loginCredentials: LoginCredentialsEntity): Promise<void>
  signUp(signUpCredentials: SignUpCredentialsEntity): Promise<void>
  logout(): Promise<void>
  refresh(): Promise<void>
}
