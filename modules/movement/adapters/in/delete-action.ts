'use server'

import { getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants/common'
import { mapMovementErrorToMessage } from '@/modules/movement/adapters/in/error-handler'
import { MovementRepository } from '@/modules/movement/adapters/out/movement-repository'
import { DeleteUseCase } from '@/modules/movement/application/use-cases/delete'

const movementRepository = new MovementRepository()
const deleteUseCase = new DeleteUseCase(movementRepository)

export type DeleteMovementActionResult =
  | {
      success: true
      message: string
    }
  | {
      success: false
      message: string
    }

export async function deleteMovementAction(
  id: string,
): Promise<DeleteMovementActionResult> {
  const t = await getTranslations(Namespace.Movement)

  try {
    await deleteUseCase.execute(id)

    return {
      success: true,
      message: t('delete.success'),
    }
  } catch (error) {
    return {
      success: false,
      message: mapMovementErrorToMessage(error, (key: string) => t(key)),
    }
  }
}
