import type {
  MovementFilters,
  MovementStats,
  MovementStore,
} from '@/modules/movement/ports/movement-store'

export class GetStatsUseCase {
  constructor(private readonly movementStore: MovementStore) {}

  public async execute(filters: MovementFilters): Promise<MovementStats> {
    return this.movementStore.getStats(filters)
  }
}
