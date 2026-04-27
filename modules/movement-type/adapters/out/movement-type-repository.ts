import { MovementTypeEntity } from '@/modules/movement-type/domain/movement-type-entity'
import { MovementTypeError } from '@/modules/movement-type/ports/errors'
import type { FindAllResponse } from '@/modules/movement-type/ports/responses'
import { fetchWithAuth } from '@/utils/api'
import { type ErrorResponse, parseApiError } from '@/utils/parse'

function mapToMovementTypeError(
  status: number,
  error: ErrorResponse | null,
): MovementTypeError {
  if (status === 400) {
    throw new MovementTypeError('movement_type_store_error', error?.message)
  }

  if (status === 429) {
    throw new MovementTypeError('too_many_requests_error', error?.message)
  }

  if (status >= 500) {
    throw new MovementTypeError('movement_type_store_error', error?.message)
  }

  throw new MovementTypeError('unknown_error', error?.message)
}

export class MovementTypeRepository {
  async findAll(): Promise<MovementTypeEntity[]> {
    try {
      const response = await fetchWithAuth('/v1/movement-type', {
        cache: 'no-store',
      })

      if (!response.ok) {
        const error = await parseApiError(response)
        mapToMovementTypeError(response.status, error)
      }

      const movementTypesData: FindAllResponse = await response.json()

      return movementTypesData.data.movement_types.map(
        (movementType) =>
          new MovementTypeEntity(
            movementType.id,
            movementType.key,
            movementType.name,
            movementType.description ?? null,
          ),
      )
    } catch (error) {
      if (error instanceof MovementTypeError) throw error
      if (error instanceof Error && error.message === 'NEXT_REDIRECT')
        throw error
      throw new MovementTypeError('network_error', (error as Error).message)
    }
  }
}
