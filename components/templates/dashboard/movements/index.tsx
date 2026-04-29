import { getLocale, getTranslations } from 'next-intl/server'
import { FlexBox } from '@/components/atoms/flex-box'
import { Text } from '@/components/atoms/text'
import { Card } from '@/components/molecules/card'
import { Paginator } from '@/components/molecules/paginator'
import { getMovementTypeText } from '@/components/templates/dashboard/movements/get-movement-type-text'
import styles from '@/components/templates/dashboard/movements/movements.module.css'
import { MovementsClient } from '@/components/templates/dashboard/movements/movements-client'
import { type Language, Namespace } from '@/constants/common'
import { AccountRepository } from '@/modules/account/adapters/out/account-repository'
import { FindAllUseCase as FindAllAccountsUseCase } from '@/modules/account/application/use-cases/find-all'
import { CategoryRepository } from '@/modules/category/adapters/out/category-repository'
import { FindAllUseCase as FindAllCategoriesUseCase } from '@/modules/category/application/use-cases/find-all'
import { mapMovementErrorToMessage } from '@/modules/movement/adapters/in/error-handler'
import {
  buildMovementsSearchParams,
  parseCursorStack,
  stringifyCursorStack,
} from '@/modules/movement/adapters/in/query-params'
import { MovementRepository } from '@/modules/movement/adapters/out/movement-repository'
import { FindAllUseCase as FindAllMovementsUseCase } from '@/modules/movement/application/use-cases/find-all'
import { MovementTypeRepository } from '@/modules/movement-type/adapters/out/movement-type-repository'
import { FindAllUseCase as FindAllMovementTypesUseCase } from '@/modules/movement-type/application/use-cases/find-all'
import { getCurrencyFromLanguage } from '@/utils/currency'

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
  try {
    const [movements, movementTypes, categories, accounts] = await Promise.all([
      movementFindAllUseCase.execute({
        limit: Number(limit),
        afterCursor,
        beforeCursor,
        accountId,
        categoryId,
        movementTypeId,
      }),
      movementTypeFindAllUseCase.execute(),
      categoryFindAllUseCase.execute(100, null, null, null),
      accountFindAllUseCase.execute(100, null, null, null),
    ])
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

    const movementItems = movements.items.map((movement) => ({
      id: movement.getId().getValue(),
      accountId: movement.getAccount().getId().getValue(),
      accountName: movement.getAccount().getName().getValue(),
      description: movement.getDescription().getValue(),
      categoryId: movement.getCategory().getId().getValue(),
      categoryName: movement.getCategory().getName().getValue(),
      createdAt: movement.getCreatedAt().getValue(),
      movementTypeId: movement.getMovementType().getId().getValue(),
      movementTypeKey: movement.getMovementType().getKey().getValue(),
      movementTypeText: getMovementTypeText(
        movement.getMovementType().getKey().getValue(),
        t,
      ),
      amount: movement
        .getAmount()
        .toCurrency(locale, getCurrencyFromLanguage(locale as Language)),
    }))

    const movementTypeOptions = movementTypes.map((movementType) => ({
      value: movementType.getId(),
      label:
        getMovementTypeText(movementType.getKey(), t) || movementType.getName(),
      key: movementType.getKey(),
    }))

    const categoryOptions = categories.items.map((category) => ({
      value: category.getId(),
      label: category.getName(),
    }))

    const accountOptions = accounts.items.map((account) => ({
      value: account.getId().getValue(),
      label: account.getName().getValue(),
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
        <MovementsClient
          initialItems={movementItems}
          emptyText={t('no_movements')}
          deleteLabel={t('delete.action')}
          createTranslations={{
            newMovement: t('new_movement'),
            accountLabel: t('form.account_label'),
            accountPlaceholder: t('form.account_placeholder'),
            amountLabel: t('form.amount_label'),
            amountPlaceholder: t('form.amount_placeholder'),
            descriptionLabel: t('form.description_label'),
            descriptionPlaceholder: t('form.description_placeholder'),
            movementTypeLabel: t('form.movement_type_label'),
            movementTypePlaceholder: t('form.movement_type_placeholder'),
            categoryLabel: t('form.category_label'),
            categoryPlaceholder: t('form.category_placeholder'),
            searchAccountPlaceholder: t('form.search_account_placeholder'),
            searchCategoryPlaceholder: t('form.search_category_placeholder'),
            createMovement: t('form.submit_button'),
            creatingMovement: t('form.submitting'),
          }}
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
