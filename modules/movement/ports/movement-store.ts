import type { PaginatedResult } from '@/modules/movement/domain/movement-entity'

export type FindAllMovementsFilters = {
  limit: number
  afterCursor?: string | null
  beforeCursor?: string | null
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
}

export type CreateMovementInput = {
  accountId: string
  amount: number
  description: string
  movementTypeId: string
  categoryId: string
}

export type CreatedMovement = {
  id: string
  amount: number
  description: string
  movementTypeId: string
  categoryId: string
  accountId: string
  userId: string
  createdAt: string
  updatedAt: string
}

export interface MovementStore {
  create(input: CreateMovementInput): Promise<CreatedMovement>
  findAll(filters: FindAllMovementsFilters): Promise<PaginatedResult>
  delete(id: string): Promise<void>
}
