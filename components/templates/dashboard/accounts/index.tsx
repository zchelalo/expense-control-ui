import { getLocale, getTranslations } from 'next-intl/server'
import { FlexBox } from '@/components/atoms/flex-box'
import { Paginator } from '@/components/molecules/paginator'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import { AccountsClient } from '@/components/templates/dashboard/accounts/accounts-client'
import { Search } from '@/components/templates/dashboard/accounts/search'
import type { AccountListItem } from '@/components/templates/dashboard/accounts/types'
import { type Language, Namespace } from '@/constants/common'
import {
  buildAccountsSearchParams,
  parseCursorStack,
  stringifyCursorStack,
} from '@/modules/account/adapters/in/query-params'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { FindAllUseCase } from '@/modules/account/application/use-cases/find-all'
import type { AccountEntity } from '@/modules/account/domain/account-entity'
import { getCurrencyFromLanguage } from '@/utils/currency'

const accountRepository = new AccountRepository()
const findAllUseCase = new FindAllUseCase(accountRepository)

function mapAccountToListItem(
  account: AccountEntity,
  locale: string,
): AccountListItem {
  return {
    id: account.getId().getValue(),
    name: account.getName().getValue(),
    balanceFormatted: account
      .getBalance()
      .toCurrency(locale, getCurrencyFromLanguage(locale as Language)),
  }
}

type AccountsProps = {
  limit?: string
  afterCursor?: string | null
  beforeCursor?: string | null
  search?: string | null
  cursorStack?: string | null
}

export async function Accounts({
  limit = '12',
  afterCursor = null,
  beforeCursor = null,
  search = null,
  cursorStack = null,
}: AccountsProps) {
  const locale = await getLocale()
  const t = await getTranslations(Namespace.Account)
  const currentCursorStack = parseCursorStack(cursorStack)
  const accounts = await findAllUseCase.execute(
    Number(limit),
    afterCursor,
    beforeCursor,
    search,
  )
  const previousCursorStack = currentCursorStack.slice(0, -1)
  const previousAfterCursor =
    previousCursorStack.length > 0
      ? previousCursorStack[previousCursorStack.length - 1]
      : null
  const previousHref =
    currentCursorStack.length > 0
      ? `/accounts?${buildAccountsSearchParams({
          limit,
          afterCursor: previousAfterCursor,
          search,
          cursorStack: stringifyCursorStack(previousCursorStack),
        }).toString()}`
      : null
  const nextCursorStack = accounts.nextCursor
    ? [...currentCursorStack, accounts.nextCursor]
    : null
  const nextHref = accounts.nextCursor
    ? `/accounts?${buildAccountsSearchParams({
        limit,
        afterCursor: accounts.nextCursor,
        search,
        cursorStack: stringifyCursorStack(nextCursorStack ?? []),
      }).toString()}`
    : null
  const accountItems = accounts.items.map((account) =>
    mapAccountToListItem(account, locale),
  )
  const canPrependCreatedAccount =
    currentCursorStack.length === 0 && !afterCursor && !beforeCursor
  const createTranslations = {
    newAccount: t('new_account'),
    nameLabel: t('form.name_label'),
    namePlaceholder: t('form.name_placeholder'),
    balanceLabel: t('form.balance_label'),
    balancePlaceholder: t('form.balance_placeholder'),
    createAccount: t('form.submit_button'),
    creatingAccount: t('form.submitting'),
  }

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='start'
      justifyContent='center'
      gap={6}
      className={styles.container}
    >
      <Search
        translations={{
          searchLabel: t('search.label'),
          searchPlaceholder: t('search.placeholder'),
          searchSubmitButton: t('search.submit_button'),
        }}
        search={search}
        limit={limit}
      />
      <AccountsClient
        initialItems={accountItems}
        emptyText={t('empty')}
        deleteLabel={t('delete.action')}
        createTranslations={createTranslations}
        limit={Number(limit)}
        search={search}
        canPrependCreatedAccount={canPrependCreatedAccount}
      />
      {accountItems.length > 0 && (
        <Paginator previousHref={previousHref} nextHref={nextHref} />
      )}
    </FlexBox>
  )
}
