import type { PaginatedResult } from '@/modules/category/domain/category-entity'
import type { CategoryStore } from '@/modules/category/ports/category-store'

export class FindAllUseCase {
  constructor(private readonly categoryStore: CategoryStore) {}

  public async execute(
    limit: number,
    afterCursor: string | null,
    beforeCursor: string | null,
    search: string | null,
  ): Promise<PaginatedResult> {
    return this.categoryStore.findAll(limit, afterCursor, beforeCursor, search)
  }
}
