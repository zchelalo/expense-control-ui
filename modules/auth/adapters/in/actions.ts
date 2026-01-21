// modules/auth/adapters/in/actions.ts
'use server'

import { formDataToLogin } from '@/modules/auth/adapters/in/form-data-mapper'
import { loginSchema } from '@/modules/auth/adapters/in/schemas'

export type LoginErrors = Partial<Record<'email' | 'password', string>>

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
  const data = formDataToLogin(formData)

  const result = loginSchema.safeParse(data)

  if (!result.success) {
    const fieldErrors: LoginErrors = {}

    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (key !== 'email' && key !== 'password') continue
      if (!fieldErrors[key]) fieldErrors[key] = issue.message
    }

    return {
      errors: fieldErrors,
      values: { email: data.email ?? '' },
    }
  }

  // Perform login logic here (e.g., check credentials, create session, etc.)
  return {
    errors: null,
    values: { email: data.email ?? '' },
  }
}
