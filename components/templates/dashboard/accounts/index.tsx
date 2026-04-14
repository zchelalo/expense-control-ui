import { ChevronRight } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { Box } from '@/components/atoms/box'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Card } from '@/components/molecules/card'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import { Search } from '@/components/templates/dashboard/accounts/search'
import { type Language, Namespace } from '@/constants/common'
import { Link } from '@/i18n/navigation'
import { buildAccountsSearchParams } from '@/modules/account/adapters/in/query-params'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { FindAllUseCase } from '@/modules/account/application/use-cases/find-all'
import { getCurrencyFromLanguage } from '@/utils/currency'

const accountRepository = new AccountRepository()
const findAllUseCase = new FindAllUseCase(accountRepository)

type AccountsProps = {
  limit?: string
  afterCursor?: string | null
  beforeCursor?: string | null
  search?: string | null
}

export async function Accounts({
  limit = '3',
  afterCursor = null,
  beforeCursor = null,
  search = null,
}: AccountsProps) {
  const locale = await getLocale()
  const t = await getTranslations(Namespace.Account)
  const accounts = await findAllUseCase.execute(
    Number(limit),
    afterCursor,
    beforeCursor,
    search,
  )
  const previousHref = accounts.prevCursor
    ? `/accounts?${buildAccountsSearchParams({
        limit,
        beforeCursor: accounts.prevCursor,
        search,
      }).toString()}`
    : null
  const nextHref = accounts.nextCursor
    ? `/accounts?${buildAccountsSearchParams({
        limit,
        afterCursor: accounts.nextCursor,
        search,
      }).toString()}`
    : null

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
      <Box variant='div' className={styles.accounts}>
        {accounts.items.length > 0 &&
          accounts.items.map((account) => (
            <Link
              key={account.getId().getValue()}
              href={`/movements?accountId=${account.getId().getValue()}`}
            >
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
                    {account.getName().getValue()}
                  </Text>
                  <Text
                    variant='span'
                    typographySize='normal'
                    typographyTextStyle='normal'
                    typographyWeight='medium'
                  >
                    {account
                      .getBalance()
                      .toCurrency(
                        locale,
                        getCurrencyFromLanguage(locale as Language),
                      )}
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
        {accounts.items.length === 0 && <Text variant='p'>{t('empty')}</Text>}
      </Box>
      <FlexBox
        variant='div'
        alignItems='center'
        justifyContent='spaceBetween'
        className={styles.pagination}
      >
        {previousHref ? (
          <Link href={previousHref} className={styles.paginationLink}>
            {t('pagination.previous')}
          </Link>
        ) : (
          <Text variant='span' className={styles.paginationLinkDisabled}>
            {t('pagination.previous')}
          </Text>
        )}
        {nextHref ? (
          <Link href={nextHref} className={styles.paginationLink}>
            {t('pagination.next')}
          </Link>
        ) : (
          <Text variant='span' className={styles.paginationLinkDisabled}>
            {t('pagination.next')}
          </Text>
        )}
      </FlexBox>
    </FlexBox>
  )
}
