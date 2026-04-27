import type { MovementTypeEntity } from '@/modules/movement-type/domain/movement-type-entity'

export interface MovementTypeStore {
  findAll(): Promise<MovementTypeEntity[]>
}
