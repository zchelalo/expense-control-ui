'use server'

import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { Auth } from '@/constants/auth'
import { Namespace } from '@/constants/common'
import { makeErrorMap } from '@/errors/zod/error-map'
import { formDataToLogin } from '@/modules/auth/adapters/in/form-data-mapper'
import { loginSchema } from '@/modules/auth/adapters/in/schemas'
import { AuthRepository } from '@/modules/auth/adapters/out/auth-repository'
import { LoginUseCase } from '@/modules/auth/application/use-cases/login'

const authRepository = new AuthRepository()
const loginUseCase = new LoginUseCase(authRepository)

export type LoginErrors = Partial<Record<'email' | 'password', string[]>>

export type LoginFormState = {
  errors: LoginErrors | null
  values: {
    email: string
  }
}

export async function loginAction(
  _prev: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const t = await getTranslations(Namespace.Common)
  const data = formDataToLogin(formData)

  console.log(t('errors.zod.too.small', { minimum: 8 }))

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
      values: { email: data.email ?? '' },
    }
  }

  const session = await loginUseCase.execute(data.email, data.password)
  const cookieStore = await cookies()
  cookieStore.set(Auth.AccessToken, session.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: session.accessExpiresAt,
  })

  return {
    errors: null,
    values: { email: data.email ?? '' },
  }
}
