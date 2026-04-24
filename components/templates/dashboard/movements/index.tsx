import { getLocale, getTranslations } from 'next-intl/server'
import { FlexBox } from '@/components/atoms/flex-box'
import { Paginator } from '@/components/molecules/paginator'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { SwipeableMovementsList } from '@/components/templates/dashboard/movements/swipeable-movements-list'
import { type Language, Namespace } from '@/constants/common'
import {
  buildMovementsSearchParams,
  parseCursorStack,
  stringifyCursorStack,
} from '@/modules/movement/adapters/in/query-params'
import { MovementRepository } from '@/modules/movement/adapters/out/movement-repository'
import { FindAllUseCase } from '@/modules/movement/application/use-cases/find-all'
import { getCurrencyFromLanguage } from '@/utils/currency'

const movementRepository = new MovementRepository()
const findAllUseCase = new FindAllUseCase(movementRepository)

type MovementsProps = {
  limit?: string
  afterCursor?: string | null
  beforeCursor?: string | null
  accountId?: string | null
  categoryId?: string | null
  movementTypeId?: string | null
  cursorStack?: string | null
}

export async function Movements({
  limit = '12',
  afterCursor = null,
  beforeCursor = null,
  accountId = null,
  categoryId = null,
  movementTypeId = null,
  cursorStack = null,
}: MovementsProps) {
  const locale = await getLocale()
  const t = await getTranslations(Namespace.Movement)
  const currentCursorStack = parseCursorStack(cursorStack)
  const movements = await findAllUseCase.execute({
    limit: Number(limit),
    afterCursor,
    beforeCursor,
    accountId,
    categoryId,
    movementTypeId,
  })
  const previousCursorStack = currentCursorStack.slice(0, -1)
  const previousAfterCursor =
    previousCursorStack.length > 0
      ? previousCursorStack[previousCursorStack.length - 1]
      : null
  const previousHref =
    currentCursorStack.length > 0
      ? `/movements?${buildMovementsSearchParams({
          limit,
          afterCursor: previousAfterCursor,
          accountId,
          categoryId,
          movementTypeId,
          cursorStack: stringifyCursorStack(previousCursorStack),
        }).toString()}`
      : null
  const nextCursorStack = movements.nextCursor
    ? [...currentCursorStack, movements.nextCursor]
    : null
  const nextHref = movements.nextCursor
    ? `/movements?${buildMovementsSearchParams({
        limit,
        afterCursor: movements.nextCursor,
        accountId,
        categoryId,
        movementTypeId,
        cursorStack: stringifyCursorStack(nextCursorStack ?? []),
      }).toString()}`
    : null

  const getMovementTypeText = (movementTypeKey: string) => {
    switch (movementTypeKey) {
      case 'income':
        return t('movement_type.income')
      case 'expense':
        return t('movement_type.expense')
      default:
        return movementTypeKey
    }
  }

  const movementItems = movements.items.map((movement) => ({
    id: movement.getId().getValue(),
    description: movement.getDescription().getValue(),
    categoryName: movement.getCategory().getName().getValue(),
    createdAt: movement.getCreatedAt().getValue(),
    movementTypeKey: movement.getMovementType().getKey().getValue(),
    movementTypeText: getMovementTypeText(
      movement.getMovementType().getKey().getValue(),
    ),
    amount: movement
      .getAmount()
      .toCurrency(locale, getCurrencyFromLanguage(locale as Language)),
  }))

  return (
    <FlexBox
      variant='div'
      direction='column'
      alignItems='start'
      justifyContent='center'
      gap={6}
      className={styles.container}
    >
      <FlexBox
        variant='div'
        direction='column'
        alignItems='start'
        justifyContent='center'
        gap={3}
        className={styles.body}
      >
        <SwipeableMovementsList
          items={movementItems}
          emptyText={t('noMovements')}
          deleteLabel={t('delete.action')}
        />
      </FlexBox>
      <Paginator previousHref={previousHref} nextHref={nextHref} />
    </FlexBox>
  )
}
