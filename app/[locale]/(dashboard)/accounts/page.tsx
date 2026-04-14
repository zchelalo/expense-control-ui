import { Accounts } from '@/components/templates/dashboard/accounts'
import { Namespace } from '@/constants/common'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Common,
})

type AccountsPageProps = {
  searchParams?: Promise<{
    limit?: string
    afterCursor?: string
    beforeCursor?: string
    search?: string
    cursorStack?: string
  }>
}

export default async function AccountsPage({
  searchParams,
}: AccountsPageProps) {
  const params = (await searchParams) ?? {}
  const { limit, afterCursor, beforeCursor, search, cursorStack } = params

  return (
    <Accounts
      limit={limit}
      afterCursor={afterCursor}
      beforeCursor={beforeCursor}
      search={search}
      cursorStack={cursorStack}
    />
  )
}
