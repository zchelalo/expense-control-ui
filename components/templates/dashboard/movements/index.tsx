import { TrendingDown, TrendingUp } from 'lucide-react'
import { getLocale, getTranslations } from 'next-intl/server'
import { FlexBox } from '@/components/atoms/flex-box'
import { LocalDateTime } from '@/components/atoms/local-date-time'
import { Text } from '@/components/atoms/text'
import { Badge } from '@/components/molecules/badge'
import { Card } from '@/components/molecules/card'
import { Paginator } from '@/components/molecules/paginator'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
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

  const getMovementTypeColor = (movementTypeKey: string) => {
    switch (movementTypeKey) {
      case 'income':
        return 'success'
      case 'expense':
        return 'error'
      default:
        return 'default'
    }
  }

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

  const getMovementTypeIcon = (movementTypeKey: string) => {
    switch (movementTypeKey) {
      case 'income':
        return <TrendingUp size={16} />
      case 'expense':
        return <TrendingDown size={16} />
      default:
        return null
    }
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
      <FlexBox
        variant='div'
        direction='column'
        alignItems='start'
        justifyContent='center'
        gap={3}
        className={styles.body}
      >
        {movements.items.length === 0 ? (
          <Card className={styles.noMovementsCard}>
            <Text>{t('noMovements')}</Text>
          </Card>
        ) : (
          movements.items.map((movement) => (
            <Card
              key={movement.getId().getValue()}
              className={styles.movementCard}
            >
              <FlexBox
                variant='div'
                alignItems='center'
                justifyContent='spaceBetween'
                gap={8}
                className={styles.accountContent}
              >
                <FlexBox
                  variant='div'
                  direction='column'
                  alignItems='start'
                  justifyContent='center'
                  gap={2}
                >
                  <Text
                    variant='span'
                    typographySize='normal'
                    typographyTextStyle='normal'
                    typographyWeight='medium'
                  >
                    {movement.getDescription().getValue()}
                  </Text>
                  <Text
                    variant='span'
                    typographySize='normal'
                    typographyTextStyle='normal'
                    typographyWeight='medium'
                  >
                    {movement.getCategory().getName().getValue()}
                  </Text>
                  <Text
                    variant='span'
                    typographySize='normal'
                    typographyTextStyle='normal'
                    typographyWeight='medium'
                  >
                    <LocalDateTime value={movement.getCreatedAt().getValue()} />
                  </Text>
                </FlexBox>
                <FlexBox
                  variant='div'
                  direction='column'
                  alignItems='end'
                  justifyContent='start'
                  gap={2}
                  className={styles.amountContainer}
                >
                  <Badge
                    variant={getMovementTypeColor(
                      movement.getMovementType().getKey().getValue(),
                    )}
                    icon={getMovementTypeIcon(
                      movement.getMovementType().getKey().getValue(),
                    )}
                  >
                    <Text
                      variant='span'
                      typographySize='small'
                      typographyTextStyle='normal'
                      typographyWeight='light'
                    >
                      {getMovementTypeText(
                        movement.getMovementType().getKey().getValue(),
                      )}
                    </Text>
                  </Badge>
                  <Text
                    variant='span'
                    typographySize='normal'
                    typographyTextStyle='normal'
                    typographyWeight='medium'
                  >
                    {movement
                      .getAmount()
                      .toCurrency(
                        locale,
                        getCurrencyFromLanguage(locale as Language),
                      )}
                  </Text>
                </FlexBox>
              </FlexBox>
            </Card>
          ))
        )}
      </FlexBox>
      <Paginator previousHref={previousHref} nextHref={nextHref} />
    </FlexBox>
  )
}
