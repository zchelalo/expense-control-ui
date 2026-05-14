import type { AccountEntity } from '@/modules/account/domain/account-entity'
import type { AccountStore } from '@/modules/account/ports/account-store'

export class CreateUseCase {
  constructor(private readonly accountStore: AccountStore) {}

  public async execute(name: string, balance: number): Promise<AccountEntity> {
    return this.accountStore.create(name, balance)
  }
}
