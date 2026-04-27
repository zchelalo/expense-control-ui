'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { type Language, Namespace } from '@/constants/common'
import { mapMovementErrorToMessage } from '@/modules/movement/adapters/in/error-handler'
import { formDataToCreateMovement } from '@/modules/movement/adapters/in/form-data-mapper'
import { createMovementSchema } from '@/modules/movement/adapters/in/schemas'
import { MovementRepository } from '@/modules/movement/adapters/out/movement-repository'
import { CreateUseCase } from '@/modules/movement/application/use-cases/create'
import { getCurrencyFromLanguage } from '@/utils/currency'

const movementRepository = new MovementRepository()
const createUseCase = new CreateUseCase(movementRepository)

export type CreateMovementErrors = Partial<
  Record<
    'accountId' | 'amount' | 'description' | 'movementTypeId' | 'categoryId',
    string[]
  >
>

export type CreateMovementFormState = {
  errors: CreateMovementErrors | null
  feedback: {
    type: 'success' | 'error'
    message: string
    timestamp: number
  } | null
  createdMovement: {
    id: string
    accountId: string
    categoryId: string
    movementTypeId: string
    description: string
    amount: number
    amountFormatted: string
    createdAt: string
  } | null
  values: {
    accountId: string
    amount: string
    description: string
    movementTypeId: string
    categoryId: string
  }
}

export async function createMovementAction(
  _prev: CreateMovementFormState,
  formData: FormData,
): Promise<CreateMovementFormState> {
  const locale = await getLocale()
  const t = await getTranslations(Namespace.Movement)
  const data = formDataToCreateMovement(formData)
  const result = createMovementSchema((key: string) => t(key)).safeParse(data)

  if (!result.success) {
    const fieldErrors: CreateMovementErrors = {}

    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (
        key !== 'accountId' &&
        key !== 'amount' &&
        key !== 'description' &&
        key !== 'movementTypeId' &&
        key !== 'categoryId'
      )
        continue

      if (!fieldErrors[key]) fieldErrors[key] = [issue.message]
      else fieldErrors[key].push(issue.message)
    }

    return {
      errors: fieldErrors,
      feedback: null,
      createdMovement: null,
      values: data,
    }
  }

  try {
    const createdMovement = await createUseCase.execute(result.data)

    return {
      errors: null,
      feedback: {
        type: 'success',
        message: t('form.success'),
        timestamp: Date.now(),
      },
      createdMovement: {
        id: createdMovement.id,
        accountId: createdMovement.accountId,
        categoryId: createdMovement.categoryId,
        movementTypeId: createdMovement.movementTypeId,
        description: createdMovement.description,
        amount: createdMovement.amount,
        amountFormatted: new Intl.NumberFormat(locale, {
          style: 'currency',
          currency: getCurrencyFromLanguage(locale as Language),
        }).format(createdMovement.amount),
        createdAt: createdMovement.createdAt,
      },
      values: {
        accountId: data.accountId,
        amount: '',
        description: '',
        movementTypeId: '',
        categoryId: '',
      },
    }
  } catch (error) {
    return {
      errors: null,
      feedback: {
        type: 'error',
        message: mapMovementErrorToMessage(error, (key: string) => t(key)),
        timestamp: Date.now(),
      },
      createdMovement: null,
      values: data,
    }
  }
}
