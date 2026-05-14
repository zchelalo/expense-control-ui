import type {
  CategoryEntity,
  PaginatedResult,
} from '@/modules/category/domain/category-entity'

export interface CategoryStore {
  create(name: string): Promise<CategoryEntity>
  findAll(
    limit: number,
    afterCursor: string | null,
    beforeCursor: string | null,
    search: string | null,
  ): Promise<PaginatedResult>
}
