import { Movements } from '@/components/templates/dashboard/movements'
import { Namespace } from '@/constants/common'
import { createGenerateMetadata } from '@/i18n/metadata'

export const generateMetadata = createGenerateMetadata({
  namespace: Namespace.Common,
})

type MovementsPageProps = {
  searchParams?: Promise<{
    limit?: string
    afterCursor?: string
    beforeCursor?: string
    accountId?: string
    categoryId?: string
    movementTypeId?: string
    dateFrom?: string
    dateTo?: string
    cursorStack?: string
  }>
}

export default async function MovementsPage({
  searchParams,
}: MovementsPageProps) {
  const params = (await searchParams) ?? {}
  const {
    limit,
    afterCursor,
    beforeCursor,
    accountId,
    categoryId,
    movementTypeId,
    dateFrom,
    dateTo,
    cursorStack,
  } = params

  return (
    <Movements
      limit={limit}
      afterCursor={afterCursor}
      beforeCursor={beforeCursor}
      accountId={accountId}
      categoryId={categoryId}
      movementTypeId={movementTypeId}
      dateFrom={dateFrom}
      dateTo={dateTo}
      cursorStack={cursorStack}
    />
  )
}
