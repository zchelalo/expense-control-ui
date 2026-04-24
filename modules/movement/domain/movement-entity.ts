import { AmountVO } from '@/modules/movement/domain/amount-vo'
import type { CategoryRef } from '@/modules/movement/domain/category-ref'
import { CreatedAtVO } from '@/modules/movement/domain/created-at-vo'
import { DescriptionVO } from '@/modules/movement/domain/description-vo'
import { IdVO } from '@/modules/movement/domain/id-vo'
import type { MovementTypeRef } from '@/modules/movement/domain/movement-type-ref'
import { UpdatedAtVO } from '@/modules/movement/domain/updated-at-vo'

export class MovementEntity {
  private readonly id: IdVO
  private readonly amount: AmountVO
  private readonly description: DescriptionVO
  private readonly movementType: MovementTypeRef
  private readonly category: CategoryRef
  private readonly accountId: IdVO
  private readonly userId: IdVO
  private readonly createdAt: CreatedAtVO
  private readonly updatedAt: UpdatedAtVO

  constructor(
    id: string,
    amount: number,
    description: string,
    movementType: MovementTypeRef,
    category: CategoryRef,
    accountId: string,
    userId: string,
    createdAt: string,
    updatedAt: string,
  ) {
    this.id = new IdVO(id)
    this.amount = new AmountVO(amount)
    this.description = new DescriptionVO(description)
    this.movementType = movementType
    this.category = category
    this.accountId = new IdVO(accountId)
    this.userId = new IdVO(userId)
    this.createdAt = new CreatedAtVO(createdAt)
    this.updatedAt = new UpdatedAtVO(updatedAt)
  }

  getId(): IdVO {
    return this.id
  }

  getAmount(): AmountVO {
    return this.amount
  }

  getDescription(): DescriptionVO {
    return this.description
  }

  getMovementType(): MovementTypeRef {
    return this.movementType
  }

  getCategory(): CategoryRef {
    return this.category
  }

  getAccountId(): IdVO {
    return this.accountId
  }

  getUserId(): IdVO {
    return this.userId
  }

  getCreatedAt(): CreatedAtVO {
    return this.createdAt
  }

  getUpdatedAt(): UpdatedAtVO {
    return this.updatedAt
  }
}

export interface PaginatedResult {
  items: MovementEntity[]
  nextCursor: string | null
  prevCursor: string | null
}
