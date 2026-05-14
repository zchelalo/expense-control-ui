'use client'

import { ChevronRight } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Box } from '@/components/atoms/box'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Card } from '@/components/molecules/card'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import { CreateAccount } from '@/components/templates/dashboard/accounts/create-account'
import type {
  AccountListItem,
  CreateAccountTranslations,
} from '@/components/templates/dashboard/accounts/types'
import { Link } from '@/i18n/navigation'
import { normalizeAccountSearch } from '@/modules/account/adapters/in/query-params'

type AccountsClientProps = {
  initialItems: AccountListItem[]
  emptyText: string
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

  return (
    <>
      <CreateAccount
        translations={createTranslations}
        onAccountCreated={handleAccountCreated}
      />
      <Box variant='div' className={styles.accounts}>
        {accounts.length > 0 &&
          accounts.map((account) => (
            <Link key={account.id} href={`/movements?accountId=${account.id}`}>
              <Card className={styles.account}>
                <FlexBox
                  variant='div'
                  alignItems='center'
                  justifyContent='spaceBetween'
                  gap={8}
                  className={styles.accountContent}
                >
                  <Text
                    variant='span'
                    typographySize='normal'
                    typographyTextStyle='normal'
                    typographyWeight='medium'
                  >
                    {account.name}
                  </Text>
                  <Text
                    variant='span'
                    typographySize='normal'
                    typographyTextStyle='normal'
                    typographyWeight='medium'
                  >
                    {account.balanceFormatted}
                  </Text>
                </FlexBox>
                <FlexBox
                  variant='div'
                  alignItems='center'
                  justifyContent='center'
                >
                  <ChevronRight size={18} />
                </FlexBox>
              </Card>
            </Link>
          ))}
        {accounts.length === 0 && <Text variant='p'>{emptyText}</Text>}
      </Box>
    </>
  )
}
