'use client'

import { useEffect, useState } from 'react'
import { CreateAccount } from '@/components/templates/dashboard/accounts/create-account'
import { SwipeableAccountsList } from '@/components/templates/dashboard/accounts/swipeable-accounts-list'
import type {
  AccountListItem,
  CreateAccountTranslations,
} from '@/components/templates/dashboard/accounts/types'
import { normalizeAccountSearch } from '@/modules/account/adapters/in/query-params'

type AccountsClientProps = {
  initialItems: AccountListItem[]
  emptyText: string
  deleteLabel: string
  createTranslations: CreateAccountTranslations
  limit: number
  search?: string | null
  canPrependCreatedAccount: boolean
}

function accountMatchesCurrentSearch(
  account: AccountListItem,
  search?: string | null,
): boolean {
  const normalizedSearch = normalizeAccountSearch(search).toLowerCase()

  if (!normalizedSearch) return true

  return account.name.toLowerCase().includes(normalizedSearch)
}

export function AccountsClient({
  initialItems,
  emptyText,
  deleteLabel,
  createTranslations,
  limit,
  search = null,
  canPrependCreatedAccount,
}: AccountsClientProps) {
  const [accounts, setAccounts] = useState(initialItems)

  useEffect(() => {
    setAccounts(initialItems)
  }, [initialItems])

  const handleAccountCreated = (account: AccountListItem) => {
    if (!canPrependCreatedAccount) return
    if (!accountMatchesCurrentSearch(account, search)) return

    setAccounts((currentAccounts) =>
      [
        account,
        ...currentAccounts.filter((item) => item.id !== account.id),
      ].slice(0, limit),
    )
  }

  const handleAccountDeleted = (id: string) => {
    setAccounts((currentAccounts) =>
      currentAccounts.filter((account) => account.id !== id),
    )
  }

  return (
    <>
      <CreateAccount
        translations={createTranslations}
        onAccountCreated={handleAccountCreated}
      />
      <SwipeableAccountsList
        items={accounts}
        emptyText={emptyText}
        deleteLabel={deleteLabel}
        onDeleteSuccess={handleAccountDeleted}
      />
    </>
  )
}
