import type { PaginatedResult } from '@/modules/movement/domain/movement-entity'
import type {
  FindAllMovementsFilters,
  MovementStore,
} from '@/modules/movement/ports/movement-store'

export class FindAllUseCase {
  constructor(private readonly movementStore: MovementStore) {}

  public async execute(
    filters: FindAllMovementsFilters,
  ): Promise<PaginatedResult> {
    return this.movementStore.findAll(filters)
  }
}
