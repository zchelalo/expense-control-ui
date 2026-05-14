'use server'

import { getLocale, getTranslations } from 'next-intl/server'
import { type Language, Namespace } from '@/constants/common'
import { mapAccountErrorToMessage } from '@/modules/account/adapters/in/error-handler'
import { formDataToCreateAccount } from '@/modules/account/adapters/in/form-data-mapper'
import { createAccountSchema } from '@/modules/account/adapters/in/schemas'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { CreateUseCase } from '@/modules/account/application/use-cases/create'
import { getCurrencyFromLanguage } from '@/utils/currency'

const accountRepository = new AccountRepository()
const createUseCase = new CreateUseCase(accountRepository)

export type CreateAccountErrors = Partial<Record<'name' | 'balance', string[]>>

export type CreateAccountFormState = {
  errors: CreateAccountErrors | null
  feedback: {
    type: 'success' | 'error'
    message: string
    timestamp: number
  } | null
  createdAccount: {
    id: string
    name: string
    balance: number
    balanceFormatted: string
  } | null
  values: {
    name: string
    balance: string
  }
}

export async function createAccountAction(
  _prev: CreateAccountFormState,
  formData: FormData,
): Promise<CreateAccountFormState> {
  const locale = await getLocale()
  const t = await getTranslations(Namespace.Account)
  const data = formDataToCreateAccount(formData)
  const result = createAccountSchema((key: string) => t(key)).safeParse(data)

  if (!result.success) {
    const fieldErrors: CreateAccountErrors = {}

    for (const issue of result.error.issues) {
      const key = issue.path[0]
      if (key !== 'name' && key !== 'balance') continue

      if (!fieldErrors[key]) fieldErrors[key] = [issue.message]
      else fieldErrors[key].push(issue.message)
    }

    return {
      errors: fieldErrors,
      feedback: null,
      createdAccount: null,
      values: data,
    }
  }

  try {
    const createdAccount = await createUseCase.execute(
      result.data.name,
      result.data.balance,
    )

    return {
      errors: null,
      feedback: {
        type: 'success',
        message: t('form.success'),
        timestamp: Date.now(),
      },
      createdAccount: {
        id: createdAccount.getId().getValue(),
        name: createdAccount.getName().getValue(),
        balance: createdAccount.getBalance().getValue(),
        balanceFormatted: createdAccount
          .getBalance()
          .toCurrency(locale, getCurrencyFromLanguage(locale as Language)),
      },
      values: {
        name: '',
        balance: '',
      },
    }
  } catch (error) {
    return {
      errors: null,
      feedback: {
        type: 'error',
        message: mapAccountErrorToMessage(error, (key: string) => t(key)),
        timestamp: Date.now(),
      },
      createdAccount: null,
      values: data,
    }
  }
}
