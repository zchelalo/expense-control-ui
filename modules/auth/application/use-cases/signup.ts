import { SignUpCredentialsEntity } from '@/modules/auth/domain/signup-credentials-entity'
import type { AuthSession } from '@/modules/auth/ports/auth-session'
import type { AuthStore } from '@/modules/auth/ports/auth-store'

export class SignUpUseCase {
  constructor(private readonly authStore: AuthStore) {}

  public async execute(
    email: string,
    password: string,
    confirmPassword: string,
  ): Promise<AuthSession> {
    const signUpCredentials = new SignUpCredentialsEntity(
      email,
      password,
      confirmPassword,
    )
    return this.authStore.signUp(signUpCredentials)
  }
}
