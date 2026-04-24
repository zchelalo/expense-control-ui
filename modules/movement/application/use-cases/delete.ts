import type { MovementStore } from '@/modules/movement/ports/movement-store'

export class DeleteUseCase {
  constructor(private readonly movementStore: MovementStore) {}

  public async execute(id: string): Promise<void> {
    return this.movementStore.delete(id)
  }
}
