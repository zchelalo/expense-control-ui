'use server'

import { normalizeAccountSearch } from '@/modules/account/adapters/in/query-params'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { FindAllUseCase } from '@/modules/account/application/use-cases/find-all'

type SelectOption = {
  label: string
  value: string
}

type SearchOptionsResult = {
  options: SelectOption[]
  nextCursor: string | null
}

const accountRepository = new AccountRepository()
const findAllUseCase = new FindAllUseCase(accountRepository)
const SEARCH_LIMIT = 10

export async function searchAccountOptionsAction(
  search: string,
  afterCursor: string | null = null,
): Promise<SearchOptionsResult> {
  const normalizedSearch = normalizeAccountSearch(search)
  const accounts = await findAllUseCase.execute(
    SEARCH_LIMIT,
    afterCursor,
    null,
    normalizedSearch || null,
  )

  return {
    options: accounts.items.map((account) => ({
      value: account.getId().getValue(),
      label: account.getName().getValue(),
    })),
    nextCursor: accounts.nextCursor,
  }
}
