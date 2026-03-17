'use server'

import { getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants/common'
import { makeErrorMap } from '@/errors/zod/error-map'
import { mapAuthErrorToMessage } from '@/modules/auth/adapters/in/error-handler'
import { formDataToSignUp } from '@/modules/auth/adapters/in/form-data-mapper'
import { signUpSchema } from '@/modules/auth/adapters/in/schemas'
import { AuthRepository } from '@/modules/auth/adapters/out/auth-repository'
import { SignUpUseCase } from '@/modules/auth/application/use-cases/sign-up'

const authRepository = new AuthRepository()
const signUpUseCase = new SignUpUseCase(authRepository)

export type SignUpErrors = Partial<
  Record<'email' | 'password' | 'confirmPassword', string[]>
>

export type SignUpFormState = {
  errors: SignUpErrors | null
  globalError: { message: string; timestamp: number } | null
  values: {
    email: string
  }
}

export async function signUpAction(
  _prev: SignUpFormState,
  formData: FormData,
): Promise<SignUpFormState> {
  const t = await getTranslations(Namespace.Common)
  const data = formDataToSignUp(formData)

  const result = signUpSchema.safeParse(data, { error: makeErrorMap(t) })

  if (!result.success) {
    const fieldErrors: SignUpErrors = {}

    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (key !== 'email' && key !== 'password' && key !== 'confirmPassword')
        continue
      if (!fieldErrors[key]) fieldErrors[key] = [issue.message]
      else fieldErrors[key].push(issue.message)
    }

    return {
      errors: fieldErrors,
      globalError: null,
      values: { email: data.email ?? '' },
    }
  }

  try {
    await signUpUseCase.execute(data.email, data.password, data.confirmPassword)

    return {
      errors: null,
      globalError: null,
      values: { email: data.email ?? '' },
    }
  } catch (error) {
    return {
      errors: null,
      globalError: {
        message: mapAuthErrorToMessage(error, (key: string) => t(key)),
        timestamp: Date.now(),
      },
      values: { email: data.email ?? '' },
    }
  }
}
