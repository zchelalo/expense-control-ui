import type { PaginatedResult } from '@/modules/account/domain/account-entity'
import type { AccountStore } from '@/modules/account/ports/account-store'

export class FindAllUseCase {
  constructor(private readonly accountStore: AccountStore) {}

  public async execute(
    limit: number,
    afterCursor: string | null,
    beforeCursor: string | null,
    search: string | null,
  ): Promise<PaginatedResult> {
    return this.accountStore.findAll(limit, afterCursor, beforeCursor, search)
  }
}
