import { getTranslations } from 'next-intl/server'
import { FlexBox } from '@/components/atoms/flex-box'
import styles from '@/components/templates/dashboard/accounts/accounts.module.css'
import { Search } from '@/components/templates/dashboard/accounts/search'
import { Namespace } from '@/constants/common'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { FindAllUseCase } from '@/modules/account/application/use-cases/find-all'

const accountRepository = new AccountRepository()
const findAllUseCase = new FindAllUseCase(accountRepository)

type AccountsProps = {
  limit?: string
  afterCursor?: string | null
  beforeCursor?: string | null
  search?: string | null
}

export async function Accounts({
  limit = '10',
  afterCursor = null,
  beforeCursor = null,
  search = null,
}: AccountsProps) {
  const t = await getTranslations(Namespace.Account)
  const accounts = await findAllUseCase.execute(
    Number(limit),
    afterCursor,
    beforeCursor,
    search,
  )

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='start'
      justifyContent='center'
      padding={12}
      gap={12}
    >
      <Search
        translations={{
          searchLabel: t('search.label'),
          searchPlaceholder: t('search.placeholder'),
          searchSubmitButton: t('search.submit_button'),
        }}
      />
      <pre>{JSON.stringify(accounts, null, 2)}</pre>
    </FlexBox>
  )
}
