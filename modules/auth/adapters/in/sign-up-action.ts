'use server'

import { cookies } from 'next/headers'
import { getTranslations } from 'next-intl/server'
import { Auth } from '@/constants/auth'
import { Namespace } from '@/constants/common'
import { makeErrorMap } from '@/errors/zod/error-map'
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
      if (key !== 'email' && key !== 'password') continue
      if (!fieldErrors[key]) fieldErrors[key] = [issue.message]
      else fieldErrors[key].push(issue.message)
    }

    return {
      errors: fieldErrors,
      values: { email: data.email ?? '' },
    }
  }

  const session = await signUpUseCase.execute(
    data.email,
    data.password,
    data.confirmPassword,
  )
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
