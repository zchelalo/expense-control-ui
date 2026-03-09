import type { AuthStore } from '@/modules/auth/ports/auth-store'

export class LogoutUseCase {
  constructor(private readonly authStore: AuthStore) {}

  public async execute(): Promise<void> {
    return this.authStore.logout()
  }
}
