import type { PaginatedResult } from '@/modules/category/domain/category-entity'

export interface CategoryStore {
  findAll(
    limit: number,
    afterCursor: string | null,
    beforeCursor: string | null,
    search: string | null,
  ): Promise<PaginatedResult>
}
