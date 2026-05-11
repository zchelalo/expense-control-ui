import { AccountRef } from '@/modules/movement/domain/account-ref'
import { CategoryRef } from '@/modules/movement/domain/category-ref'
import {
  MovementEntity,
  type PaginatedResult,
} from '@/modules/movement/domain/movement-entity'
import { MovementTypeRef } from '@/modules/movement/domain/movement-type-ref'
import { MovementError } from '@/modules/movement/ports/errors'
import type {
  CreateMovementInput,
  FindAllMovementsFilters,
  MovementFilters,
  MovementStats,
  MovementStore,
} from '@/modules/movement/ports/movement-store'
import type {
  CreateResponse,
  DeleteResponse,
  FindAllResponse,
  StatsByAccountResponse,
  StatsByCategoryResponse,
  StatsOverviewResponse,
} from '@/modules/movement/ports/responses'
import { fetchWithAuth } from '@/utils/api'
import { type ErrorResponse, parseApiError } from '@/utils/parse'

function mapToMovementError(
  status: number,
  error: ErrorResponse | null,
): MovementError {
  if (status === 400) {
    throw new MovementError('movement_store_error', error?.message)
  }

  if (status === 404) {
    throw new MovementError('movement_not_found_error', error?.message)
  }

  if (status === 409 && error?.code === 'insufficient_account_balance') {
    throw new MovementError(
      'insufficient_account_balance_error',
      error?.message,
    )
  }

  if (status === 429) {
    throw new MovementError('too_many_requests_error', error?.message)
  }

  if (status >= 500) {
    throw new MovementError('movement_store_error', error?.message)
  }

  throw new MovementError('unknown_error', error?.message)
}

function appendMovementFilters(
  queryParams: URLSearchParams,
  { accountId, categoryId, movementTypeId, dateFrom, dateTo }: MovementFilters,
) {
  if (accountId) queryParams.append('account_id', accountId)
  if (categoryId) queryParams.append('category_id', categoryId)
  if (movementTypeId) queryParams.append('movement_type_id', movementTypeId)
  if (dateFrom) queryParams.append('date_from', dateFrom)
  if (dateTo) queryParams.append('date_to', dateTo)
}

export class MovementRepository implements MovementStore {
  async create({
    accountId,
    amount,
    description,
    movementTypeId,
    categoryId,
  }: CreateMovementInput) {
    try {
      const response = await fetchWithAuth(`/v1/movement/${accountId}`, {
        method: 'POST',
        body: JSON.stringify({
          amount,
          description,
          movement_type_id: movementTypeId,
          category_id: categoryId,
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToMovementError(response.status, error)
      }

      const movementData: CreateResponse = await response.json()

      return {
        id: movementData.data.movement.id,
        amount: movementData.data.movement.amount,
        description: movementData.data.movement.description,
        movementTypeId: movementData.data.movement.movement_type.id,
        categoryId: movementData.data.movement.category.id,
        accountId: movementData.data.movement.account.id,
        userId: movementData.data.movement.user_id,
        createdAt: movementData.data.movement.created_at,
        updatedAt: movementData.data.movement.updated_at,
      }
    } catch (error) {
      if (error instanceof MovementError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new MovementError('network_error', (error as Error).message)
    }
  }

  async findAll({
    limit,
    afterCursor,
    beforeCursor,
    accountId,
    categoryId,
    movementTypeId,
    dateFrom,
    dateTo,
  }: FindAllMovementsFilters): Promise<PaginatedResult> {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
      })

      if (afterCursor) queryParams.append('after_cursor', afterCursor)
      if (beforeCursor) queryParams.append('before_cursor', beforeCursor)
      appendMovementFilters(queryParams, {
        accountId,
        categoryId,
        movementTypeId,
        dateFrom,
        dateTo,
      })

      const response = await fetchWithAuth(
        `/v1/movement?${queryParams.toString()}`,
        {
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToMovementError(response.status, error)
      }

      const movementsData: FindAllResponse = await response.json()
      return {
        items: movementsData.data.movements.map(
          (movement) =>
            new MovementEntity(
              movement.id,
              movement.amount,
              movement.description,
              new MovementTypeRef(
                movement.movement_type.id,
                movement.movement_type.key,
                movement.movement_type.name,
              ),
              new CategoryRef(movement.category.id, movement.category.name),
              new AccountRef(movement.account.id, movement.account.name),
              movement.user_id,
              movement.created_at,
              movement.updated_at,
            ),
        ),
        nextCursor: movementsData.data.next_cursor || null,
        prevCursor: movementsData.data.prev_cursor || null,
      }
    } catch (error) {
      if (error instanceof MovementError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new MovementError('network_error', (error as Error).message)
    }
  }

  async getStats({
    accountId,
    categoryId,
    movementTypeId,
    dateFrom,
    dateTo,
  }: MovementFilters): Promise<MovementStats> {
    try {
      const queryParams = new URLSearchParams()
      appendMovementFilters(queryParams, {
        accountId,
        categoryId,
        movementTypeId,
        dateFrom,
        dateTo,
      })

      const queryString =
        queryParams.size > 0 ? `?${queryParams.toString()}` : ''

      const [overviewResponse, byAccountResponse, byCategoryResponse] =
        await Promise.all([
          fetchWithAuth(`/v1/movement/stats/overview${queryString}`, {
            cache: 'no-store',
          }),
          fetchWithAuth(`/v1/movement/stats/by-account${queryString}`, {
            cache: 'no-store',
          }),
          fetchWithAuth(`/v1/movement/stats/by-category${queryString}`, {
            cache: 'no-store',
          }),
        ])

      if (!overviewResponse.ok) {
        const error = await parseApiError(overviewResponse)
        mapToMovementError(overviewResponse.status, error)
      }

      if (!byAccountResponse.ok) {
        const error = await parseApiError(byAccountResponse)
        mapToMovementError(byAccountResponse.status, error)
      }

      if (!byCategoryResponse.ok) {
        const error = await parseApiError(byCategoryResponse)
        mapToMovementError(byCategoryResponse.status, error)
      }

      const overviewData: StatsOverviewResponse = await overviewResponse.json()
      const byAccountData: StatsByAccountResponse =
        await byAccountResponse.json()
      const byCategoryData: StatsByCategoryResponse =
        await byCategoryResponse.json()

      return {
        overview: {
          totalMovements: overviewData.data.overview.total_movements,
          income: {
            count: overviewData.data.overview.income.count,
            total: overviewData.data.overview.income.total,
          },
          expense: {
            count: overviewData.data.overview.expense.count,
            total: overviewData.data.overview.expense.total,
          },
          netTotal: overviewData.data.overview.net_total,
        },
        accounts: byAccountData.data.accounts.map((item) => ({
          account: {
            id: item.account.id,
            name: item.account.name,
          },
          movementCount: item.movement_count,
          incomeCount: item.income_count,
          expenseCount: item.expense_count,
          incomeTotal: item.income_total,
          expenseTotal: item.expense_total,
          netTotal: item.net_total,
        })),
        categories: byCategoryData.data.categories.map((item) => ({
          category: {
            id: item.category.id,
            name: item.category.name,
            isSystem: item.category.is_system,
            systemKey: item.category.system_key,
          },
          movementCount: item.movement_count,
          incomeCount: item.income_count,
          expenseCount: item.expense_count,
          incomeTotal: item.income_total,
          expenseTotal: item.expense_total,
          netTotal: item.net_total,
        })),
      }
    } catch (error) {
      if (error instanceof MovementError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new MovementError('network_error', (error as Error).message)
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const response = await fetchWithAuth(`/v1/movement/${id}`, {
        method: 'DELETE',
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToMovementError(response.status, error)
      }

      const movementData: DeleteResponse = await response.json()

      if (!movementData.data.success) {
        throw new MovementError(
          'movement_delete_error',
          'Failed to delete movement',
        )
      }
    } catch (error) {
      if (error instanceof MovementError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new MovementError('network_error', (error as Error).message)
    }
  }
}
