import type { PaginatedResult } from '@/modules/movement/domain/movement-entity'

export type FindAllMovementsFilters = {
  limit: number
  afterCursor?: string | null
  beforeCursor?: string | null
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
}

export interface MovementStore {
  findAll(filters: FindAllMovementsFilters): Promise<PaginatedResult>
  delete(id: string): Promise<void>
}
