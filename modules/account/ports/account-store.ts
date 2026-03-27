import type {
  AccountEntity,
  PaginatedResult,
} from '@/modules/account/domain/account-entity'

export interface AccountStore {
  create(name: string, balance: number): Promise<AccountEntity>
  findAll(
    limit: number,
    afterCursor: string | null,
    beforeCursor: string | null,
    search: string | null,
  ): Promise<PaginatedResult>
  findById(id: string): Promise<AccountEntity>
  updateName(id: string, name: string): Promise<AccountEntity>
  delete(id: string): Promise<void>
}
