'use server'

import { normalizeAccountSearch } from '@/modules/account/adapters/in/query-params'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { FindAllUseCase } from '@/modules/account/application/use-cases/find-all'

type SelectOption = {
  label: string
  value: string
}

const accountRepository = new AccountRepository()
const findAllUseCase = new FindAllUseCase(accountRepository)
const SEARCH_LIMIT = 10

export async function searchAccountOptionsAction(
  search: string,
): Promise<SelectOption[]> {
  const normalizedSearch = normalizeAccountSearch(search)
  const accounts = await findAllUseCase.execute(
    SEARCH_LIMIT,
    null,
    null,
    normalizedSearch || null,
  )

  return accounts.items.map((account) => ({
    value: account.getId().getValue(),
    label: account.getName().getValue(),
  }))
}
