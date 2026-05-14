'use server'

import { getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants/common'
import { mapCategoryErrorToMessage } from '@/modules/category/adapters/in/error-handler'
import { formDataToCreateCategory } from '@/modules/category/adapters/in/form-data-mapper'
import { createCategorySchema } from '@/modules/category/adapters/in/schemas'
import { CategoryRepository } from '@/modules/category/adapters/out/category-repository'
import { CreateUseCase } from '@/modules/category/application/use-cases/create'

const categoryRepository = new CategoryRepository()
const createUseCase = new CreateUseCase(categoryRepository)

export type CreateCategoryErrors = Partial<Record<'name', string[]>>

export type CreateCategoryFormState = {
  errors: CreateCategoryErrors | null
  feedback: {
    type: 'success' | 'error'
    message: string
    timestamp: number
  } | null
  createdCategory: {
    id: string
    name: string
  } | null
  values: {
    name: string
  }
}

export async function createCategoryAction(
  _prev: CreateCategoryFormState,
  formData: FormData,
): Promise<CreateCategoryFormState> {
  const t = await getTranslations(Namespace.Category)
  const data = formDataToCreateCategory(formData)
  const result = createCategorySchema((key: string) => t(key)).safeParse(data)

  if (!result.success) {
    const fieldErrors: CreateCategoryErrors = {}

    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (key !== 'name') continue

      if (!fieldErrors[key]) fieldErrors[key] = [issue.message]
      else fieldErrors[key].push(issue.message)
    }

    return {
      errors: fieldErrors,
      feedback: null,
      createdCategory: null,
      values: data,
    }
  }

  try {
    const createdCategory = await createUseCase.execute(result.data.name)

    return {
      errors: null,
      feedback: {
        type: 'success',
        message: t('form.success'),
        timestamp: Date.now(),
      },
      createdCategory: {
        id: createdCategory.getId(),
        name: createdCategory.getName(),
      },
      values: {
        name: '',
      },
    }
  } catch (error) {
    return {
      errors: null,
      feedback: {
        type: 'error',
        message: mapCategoryErrorToMessage(error, (key: string) => t(key)),
        timestamp: Date.now(),
      },
      createdCategory: null,
      values: data,
    }
  }
}
