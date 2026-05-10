import { getLocale, getTranslations } from 'next-intl/server'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Card } from '@/components/molecules/card'
import { Paginator } from '@/components/molecules/paginator'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { MovementsClient } from '@/components/templates/dashboard/movements/movements-client'
import { buildMovementsPaginationLinks } from '@/components/templates/dashboard/movements/pagination'
import {
  buildCreateMovementTranslations,
  buildMovementFilterTranslations,
} from '@/components/templates/dashboard/movements/translations'
import {
  mapAccountToSelectOption,
  mapCategoryToSelectOption,
  mapMovementToListItem,
  mapMovementTypeToOption,
} from '@/components/templates/dashboard/movements/view-model'
import { Namespace } from '@/constants/common'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { FindAllUseCase as FindAllAccountsUseCase } from '@/modules/account/application/use-cases/find-all'
import { CategoryRepository } from '@/modules/category/adapters/out/category-repository'
import { FindAllUseCase as FindAllCategoriesUseCase } from '@/modules/category/application/use-cases/find-all'
import { mapMovementErrorToMessage } from '@/modules/movement/adapters/in/error-handler'
import { parseCursorStack } from '@/modules/movement/adapters/in/query-params'
import { MovementRepository } from '@/modules/movement/adapters/out/movement-repository'
import { FindAllUseCase as FindAllMovementsUseCase } from '@/modules/movement/application/use-cases/find-all'
import { MovementTypeRepository } from '@/modules/movement-type/adapters/out/movement-type-repository'
import { FindAllUseCase as FindAllMovementTypesUseCase } from '@/modules/movement-type/application/use-cases/find-all'

const movementRepository = new MovementRepository()
const movementFindAllUseCase = new FindAllMovementsUseCase(movementRepository)
const movementTypeRepository = new MovementTypeRepository()
const movementTypeFindAllUseCase = new FindAllMovementTypesUseCase(
  movementTypeRepository,
)
const categoryRepository = new CategoryRepository()
const categoryFindAllUseCase = new FindAllCategoriesUseCase(categoryRepository)
const accountRepository = new AccountRepository()
const accountFindAllUseCase = new FindAllAccountsUseCase(accountRepository)

type MovementsProps = {
  limit?: string
  afterCursor?: string | null
  beforeCursor?: string | null
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
  dateFrom?: string | null
  dateTo?: string | null
  cursorStack?: string | null
}

export async function Movements({
  limit = '12',
  afterCursor = null,
  beforeCursor = null,
  accountId = null,
  categoryId = null,
  movementTypeId = null,
  dateFrom = null,
  dateTo = null,
  cursorStack = null,
}: MovementsProps) {
  const locale = await getLocale()
  const t = await getTranslations(Namespace.Movement)
  const currentCursorStack = parseCursorStack(cursorStack)
  const createTranslations = buildCreateMovementTranslations(t)
  const filterTranslations = buildMovementFilterTranslations(t)

  try {
    const [movements, movementTypes, categories, accounts] = await Promise.all([
      movementFindAllUseCase.execute({
        limit: Number(limit),
        afterCursor,
        beforeCursor,
        accountId,
        categoryId,
        movementTypeId,
        dateFrom,
        dateTo,
      }),
      movementTypeFindAllUseCase.execute(),
      categoryFindAllUseCase.execute(100, null, null, null),
      accountFindAllUseCase.execute(100, null, null, null),
    ])

    const { previousHref, nextHref } = buildMovementsPaginationLinks({
      limit,
      currentCursorStack,
      nextCursor: movements.nextCursor,
      accountId,
      categoryId,
      movementTypeId,
      dateFrom,
      dateTo,
    })

    const movementItems = movements.items.map((movement) =>
      mapMovementToListItem(movement, locale, t),
    )
    const movementTypeOptions = movementTypes.map((movementType) =>
      mapMovementTypeToOption(movementType, t),
    )
    const categoryOptions = categories.items.map(mapCategoryToSelectOption)
    const accountOptions = accounts.items.map(mapAccountToSelectOption)

    return (
      <FlexBox
        variant='div'
        direction='column'
        alignItems='start'
        justifyContent='center'
        gap={6}
        className={styles.container}
      >
        <MovementsClient
          initialItems={movementItems}
          emptyText={t('no_movements')}
          deleteLabel={t('delete.action')}
          createTranslations={createTranslations}
          filterTranslations={filterTranslations}
          accountId={accountId}
          accounts={accountOptions}
          initialAccountNextCursor={accounts.nextCursor}
          movementTypes={movementTypeOptions}
          categories={categoryOptions}
          initialCategoryNextCursor={categories.nextCursor}
          limit={Number(limit)}
          currentFilters={{
            accountId,
            categoryId,
            movementTypeId,
            dateFrom,
            dateTo,
            afterCursor,
            beforeCursor,
          }}
        />
        <Paginator previousHref={previousHref} nextHref={nextHref} />
      </FlexBox>
    )
  } catch (error) {
    return (
      <FlexBox
        variant='div'
        direction='column'
        alignItems='start'
        justifyContent='center'
        gap={6}
        className={styles.container}
      >
        <Card className={styles.noMovementsCard}>
          <Text>
            {mapMovementErrorToMessage(error, (key: string) => t(key))}
          </Text>
        </Card>
      </FlexBox>
    )
  }
}
