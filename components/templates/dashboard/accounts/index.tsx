import { getTranslations } from 'next-intl/server'
import { Box } from '@/components/atoms/box'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Card } from '@/components/molecules/card'
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
      className={styles.container}
    >
      <Search
        translations={{
          searchLabel: t('search.label'),
          searchPlaceholder: t('search.placeholder'),
          searchSubmitButton: t('search.submit_button'),
        }}
      />
      <Box variant='div' className={styles.accounts}>
        {accounts.items.length > 0 &&
          accounts.items.map((account) => (
            <Card key={account.getId()}>
              <FlexBox
                variant='div'
                alignItems='center'
                justifyContent='spaceBetween'
                gap={8}
              >
                <Text
                  variant='span'
                  typographySize='normal'
                  typographyTextStyle='normal'
                  typographyWeight='medium'
                >
                  {account.getName()}
                </Text>
                <Text
                  variant='span'
                  typographySize='normal'
                  typographyTextStyle='normal'
                  typographyWeight='medium'
                >
                  {account.getBalance()}
                </Text>
              </FlexBox>
            </Card>
          ))}
      </Box>
    </FlexBox>
  )
}
