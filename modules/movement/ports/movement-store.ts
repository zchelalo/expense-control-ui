import type { PaginatedResult } from '@/modules/movement/domain/movement-entity'

export type MovementFilters = {
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
  dateFrom?: string | null
  dateTo?: string | null
}

export type FindAllMovementsFilters = MovementFilters & {
  limit: number
  afterCursor?: string | null
  beforeCursor?: string | null
}

export type MovementStatsTotals = {
  count: number
  total: number
}

export type MovementStatsOverview = {
  totalMovements: number
  income: MovementStatsTotals
  expense: MovementStatsTotals
  netTotal: number
}

export type MovementStatsAccount = {
  account: {
    id: string
    name: string
  }
  movementCount: number
  incomeCount: number
  expenseCount: number
  incomeTotal: number
  expenseTotal: number
  netTotal: number
}

export type MovementStatsCategory = {
  category: {
    id: string
    name: string
    isSystem: boolean
    systemKey: string
  }
  movementCount: number
  incomeCount: number
  expenseCount: number
  incomeTotal: number
  expenseTotal: number
  netTotal: number
}

export type MovementStats = {
  overview: MovementStatsOverview
  accounts: MovementStatsAccount[]
  categories: MovementStatsCategory[]
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
  getStats(filters: MovementFilters): Promise<MovementStats>
  delete(id: string): Promise<void>
}
