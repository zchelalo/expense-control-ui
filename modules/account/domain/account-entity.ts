import { BalanceVO } from '@/modules/account/domain/balance-vo'
import { CreatedAtVO } from '@/modules/account/domain/created-at-vo'
import { IdVO } from '@/modules/account/domain/id-vo'
import { NameVO } from '@/modules/account/domain/name-vo'
import { UpdatedAtVO } from '@/modules/account/domain/updated-at-vo'

export class AccountEntity {
  private readonly id: IdVO
  private readonly name: NameVO
  private readonly balance: BalanceVO
  private readonly createdAt: CreatedAtVO
  private readonly updatedAt: UpdatedAtVO

  constructor(
    id: string,
    name: string,
    balance: number,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = new IdVO(id)
    this.name = new NameVO(name)
    this.balance = new BalanceVO(balance)
    this.createdAt = new CreatedAtVO(createdAt)
    this.updatedAt = new UpdatedAtVO(updatedAt)
  }

  getId(): string {
    return this.id.getValue()
  }

  getName(): string {
    return this.name.getValue()
  }

  getBalance(): number {
    return this.balance.getValue()
  }

  getCreatedAt(): string {
    return this.createdAt.getValue()
  }

  getUpdatedAt(): string {
    return this.updatedAt.getValue()
  }
}

export interface PaginatedResult {
  items: AccountEntity[]
  nextCursor: string | null
  prevCursor: string | null
}
