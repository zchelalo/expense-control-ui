import type { CategoryEntity } from '@/modules/category/domain/category-entity'
import type { CategoryStore } from '@/modules/category/ports/category-store'

export class CreateUseCase {
  constructor(private readonly categoryStore: CategoryStore) {}

  public async execute(name: string): Promise<CategoryEntity> {
    return this.categoryStore.create(name)
  }
}
