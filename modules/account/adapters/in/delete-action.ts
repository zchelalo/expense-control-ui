'use server'

import { getTranslations } from 'next-intl/server'
import { Namespace } from '@/constants/common'
import { mapAccountErrorToMessage } from '@/modules/account/adapters/in/error-handler'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { DeleteUseCase } from '@/modules/account/application/use-cases/delete'

const accountRepository = new AccountRepository()
const deleteUseCase = new DeleteUseCase(accountRepository)

export type DeleteAccountActionResult =
  | {
      success: true
      message: string
    }
  | {
      success: false
      message: string
    }

export async function deleteAccountAction(
  id: string,
): Promise<DeleteAccountActionResult> {
  const t = await getTranslations(Namespace.Account)

  try {
    await deleteUseCase.execute(id)

    return {
      success: true,
      message: t('delete.success'),
    }
  } catch (error) {
    return {
      success: false,
      message: mapAccountErrorToMessage(error, (key: string) => t(key)),
    }
  }
}
