import type { MovementTypeEntity } from '@/modules/movement-type/domain/movement-type-entity'
import type { MovementTypeStore } from '@/modules/movement-type/ports/movement-type-store'

export class FindAllUseCase {
  constructor(private readonly movementTypeStore: MovementTypeStore) {}

  public async execute(): Promise<MovementTypeEntity[]> {
    return this.movementTypeStore.findAll()
  }
}
