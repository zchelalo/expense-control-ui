import {
  CategoryEntity,
  type PaginatedResult,
} from '@/modules/category/domain/category-entity'
import type { CategoryStore } from '@/modules/category/ports/category-store'
import { CategoryError } from '@/modules/category/ports/errors'
import type {
  CreateResponse,
  FindAllResponse,
} from '@/modules/category/ports/responses'
import { fetchWithAuth } from '@/utils/api'
import { type ErrorResponse, parseApiError } from '@/utils/parse'

function mapToCategoryError(
  status: number,
  error: ErrorResponse | null,
): CategoryError {
  if (status === 400) {
    throw new CategoryError('category_store_error', error?.message)
  }

  if (status === 404) {
    throw new CategoryError('category_not_found_error', error?.message)
  }

  if (status === 429) {
    throw new CategoryError('too_many_requests_error', error?.message)
  }

  if (status >= 500) {
    throw new CategoryError('category_store_error', error?.message)
  }

  throw new CategoryError('unknown_error', error?.message)
}

export class CategoryRepository implements CategoryStore {
  async create(name: string): Promise<CategoryEntity> {
    try {
      const response = await fetchWithAuth('/v1/category', {
        method: 'POST',
        body: JSON.stringify({
          name,
        }),
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToCategoryError(response.status, error)
      }

      const categoryData: CreateResponse = await response.json()

      return new CategoryEntity(
        categoryData.data.category.id,
        categoryData.data.category.name,
      )
    } catch (error) {
      if (error instanceof CategoryError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new CategoryError('network_error', (error as Error).message)
    }
  }

  async findAll(
    limit: number,
    afterCursor: string | null,
    beforeCursor: string | null,
    search: string | null,
  ): Promise<PaginatedResult> {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
      })

      if (afterCursor) queryParams.append('after_cursor', afterCursor)
      if (beforeCursor) queryParams.append('before_cursor', beforeCursor)
      if (search) queryParams.append('search', search)

      const response = await fetchWithAuth(
        `/v1/category?${queryParams.toString()}`,
        {
          cache: 'no-store',
        },
      )

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToCategoryError(response.status, error)
      }

      const categoriesData: FindAllResponse = await response.json()

      return {
        items: categoriesData.data.categories.map(
          (category) => new CategoryEntity(category.id, category.name),
        ),
        nextCursor: categoriesData.data.next_cursor || null,
        prevCursor: categoriesData.data.prev_cursor || null,
      }
    } catch (error) {
      if (error instanceof CategoryError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new CategoryError('network_error', (error as Error).message)
    }
  }
}
