import type { AccountStore } from '@/modules/account/ports/account-store'

export class DeleteUseCase {
  constructor(private readonly accountStore: AccountStore) {}

  public async execute(id: string): Promise<void> {
    return this.accountStore.delete(id)
  }
}
