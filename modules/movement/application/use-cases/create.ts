import type {
  CreatedMovement,
  CreateMovementInput,
  MovementStore,
} from '@/modules/movement/ports/movement-store'

export class CreateUseCase {
  constructor(private readonly movementStore: MovementStore) {}

  public async execute(input: CreateMovementInput): Promise<CreatedMovement> {
    return this.movementStore.create(input)
  }
}
