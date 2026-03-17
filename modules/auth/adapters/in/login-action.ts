'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants/common'
import { makeErrorMap } from '@/errors/zod/error-map'
import { redirect } from '@/i18n/navigation'
import { mapAuthErrorToMessage } from '@/modules/auth/adapters/in/error-handler'
import { formDataToLogin } from '@/modules/auth/adapters/in/form-data-mapper'
import { loginSchema } from '@/modules/auth/adapters/in/schemas'
import { AuthRepository } from '@/modules/auth/adapters/out/auth-repository'
import { LoginUseCase } from '@/modules/auth/application/use-cases/login'

const authRepository = new AuthRepository()
const loginUseCase = new LoginUseCase(authRepository)

export type LoginErrors = Partial<Record<'email' | 'password', string[]>>

export type LoginFormState = {
  errors: LoginErrors | null
  globalError: { message: string; timestamp: number } | null
  values: {
    email: string
  }
}

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const locale = await getLocale()
  const t = await getTranslations(Namespace.Common)
  const data = formDataToLogin(formData)

  const result = loginSchema.safeParse(data, { error: makeErrorMap(t) })

  if (!result.success) {
    const fieldErrors: LoginErrors = {}

    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (key !== 'email' && key !== 'password') continue
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
    await loginUseCase.execute(data.email, data.password)
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

  redirect({
    href: '/dashboard',
    locale,
  })
  return {
    errors: null,
    globalError: null,
    values: { email: data.email ?? '' },
  }
}
