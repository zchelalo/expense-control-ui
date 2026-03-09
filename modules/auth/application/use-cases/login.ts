import { LoginCredentialsEntity } from '@/modules/auth/domain/login-credentials-entity'
import type { AuthSession } from '@/modules/auth/ports/auth-session'
import type { AuthStore } from '@/modules/auth/ports/auth-store'

export class LoginUseCase {
  constructor(private readonly authStore: AuthStore) {}

  public async execute(email: string, password: string): Promise<AuthSession> {
    const loginCredentials = new LoginCredentialsEntity(email, password)
    return this.authStore.login(loginCredentials)
  }
}
